import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const POST = async (request: NextRequest) => {
  try {
    console.log('Received POST request to /api/transcribe')
    const formData = await request.formData()
    const file = formData.get('audio') as File
    const fullPath = formData.get('fullPath') as string

    console.log('Received file:', file?.name)
    console.log('Full path:', fullPath)

    if (!file) {
      console.error('No audio file provided')
      return NextResponse.json({ error: 'No audio file provided.' }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not defined in the environment variables')
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Define directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')

    // Ensure directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    // Save the file
    const fileName = `${Date.now()}-${file.name}`
    const filePath = path.join(uploadsDir, fileName)
    fs.writeFileSync(filePath, buffer)

    console.log('File saved at:', filePath)
    console.log('Starting transcription with OpenAI Whisper...')

    // Transcribe audio using OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-1",
    })

    const rawTranscript = transcription.text
    console.log('Transcription completed. Length:', rawTranscript.length)

    // Now analyze the transcript using GPT to extract structured information
    console.log('Analyzing transcript with GPT-4...')
    
    const analysisPrompt = `Analyze the following meeting transcript and extract structured information in JSON format. Include:
- Meeting Name (create a descriptive title)
- Description (brief summary)
- Summary (detailed summary of the meeting)
- Tasks (array of {description, owner, due_date})
- Decisions (array of {description, date})
- Questions (array of {question, status, answer})
- Insights (array of {insight, reference})
- Deadlines (array of {description, date})
- Attendees (array of {name, role})
- Follow-ups (array of {description, owner})
- Risks (array of {risk, impact})
- Agenda (array of strings)

Return ONLY valid JSON, no markdown or code blocks.

Transcript:
${rawTranscript}`

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: analysisPrompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    })

    const analyzedText = completion.choices[0].message.content
    console.log('Analysis completed')

    // Parse JSON response
    let analyzedData
    try {
      analyzedData = JSON.parse(analyzedText || '{}')
    } catch (parseError) {
      throw new Error('Failed to parse analyzed transcript JSON.')
    }

    console.log('Analyzed Data:', JSON.stringify(analyzedData, null, 2))
    console.log('Saving to database...')

    // Helper function to format dates as ISO strings
    const formatDate = (date: string) => {
      const parsedDate = new Date(date)
      return !isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : null
    }

    // Save to database with safe access
    const meeting = await prisma.meeting.create({
      data: {
        name: analyzedData['Meeting Name'] || 'Untitled Meeting',
        description: analyzedData['Description'] || 'No description provided.',
        rawTranscript: rawTranscript,
        summary: analyzedData['Summary'] || '',
        tasks: {
          create: (analyzedData['Tasks'] || [])
            .filter((task: any) => task && typeof task === 'object')
            .map((task: any) => ({
              task: task.description || 'No task description',
              owner: task.owner || 'Unassigned',
              dueDate: task.due_date ? formatDate(task.due_date) : null,
            })),
        },
        decisions: {
          create: (analyzedData['Decisions'] || [])
            .filter((decision: any) => decision && typeof decision === 'object')
            .map((decision: any) => ({
              decision: decision.description || 'No decision description',
              date: decision.date ? formatDate(decision.date) : new Date().toISOString(),
            })),
        },
        questions: {
          create: (analyzedData['Questions'] || [])
            .filter((question: any) => question && typeof question === 'object')
            .map((question: any) => ({
              question: question.question || 'No question',
              status: question.status || 'Unanswered',
              answer: question.answer || '',
            })),
        },
        insights: {
          create: (analyzedData['Insights'] || [])
            .filter((insight: any) => insight && typeof insight === 'object')
            .map((insight: any) => ({
              insight: insight.insight || 'No insight',
              reference: insight.reference || '',
            })),
        },
        deadlines: {
          create: (analyzedData['Deadlines'] || [])
            .filter((deadline: any) => deadline && typeof deadline === 'object')
            .map((deadline: any) => ({
              description: deadline.description || 'No deadline description',
              dueDate: deadline.date ? formatDate(deadline.date) : null,
            })),
        },
        attendees: {
          create: (analyzedData['Attendees'] || [])
            .filter((attendee: any) => attendee && typeof attendee === 'object')
            .map((attendee: any) => ({
              name: attendee.name || 'Unnamed Attendee',
              role: attendee.role || 'No role specified',
            })),
        },
        followUps: {
          create: (analyzedData['Follow-ups'] || [])
            .filter((followUp: any) => followUp && typeof followUp === 'object')
            .map((followUp: any) => ({
              description: followUp.description || 'No follow-up description',
              owner: followUp.owner || 'Unassigned',
            })),
        },
        risks: {
          create: (analyzedData['Risks'] || [])
            .filter((risk: any) => risk && typeof risk === 'object')
            .map((risk: any) => ({
              risk: risk.risk || 'No risk description',
              impact: risk.impact || 'No impact specified',
            })),
        },
        agenda: {
          create: (analyzedData['Agenda'] || [])
            .filter((item: any) => item && typeof item === 'string')
            .map((item: string) => ({
              item: item,
            })),
        },
      },
      include: {
        tasks: true,
        decisions: true,
        questions: true,
        insights: true,
        deadlines: true,
        attendees: true,
        followUps: true,
        risks: true,
        agenda: true,
      },
    })

    console.log('Meeting saved successfully:', meeting.id)

    return NextResponse.json(meeting, { status: 200 })
  } catch (error: any) {
    console.error('Error in /api/transcribe:', error)
    return NextResponse.json({ error: 'An error occurred during processing.' }, { status: 500 })
  }
}