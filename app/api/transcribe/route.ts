import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { prisma } from '@/lib/prisma'
import { AssemblyAI } from 'assemblyai'
import { GoogleGenerativeAI } from '@google/generative-ai'

const assemblyai = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY || '',
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

    if (!process.env.ASSEMBLYAI_API_KEY) {
      throw new Error('ASSEMBLYAI_API_KEY is not defined in the environment variables')
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not defined in the environment variables')
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
    console.log('Starting transcription with AssemblyAI...')

    // Transcribe audio using AssemblyAI
    const transcript = await assemblyai.transcripts.transcribe({
      audio: filePath,
    })

    if (transcript.status === 'error') {
      throw new Error(`AssemblyAI transcription failed: ${transcript.error}`)
    }

    const rawTranscript = transcript.text || ''
    console.log('Transcription completed. Length:', rawTranscript.length)

    // Analyze transcript using Google Gemini Pro (FREE & FAST!)
    console.log('🚀 Analyzing transcript with Google Gemini Pro...')
    console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY)
    
    const analysisPrompt = `You are an expert meeting assistant. Analyze the following transcript and return a JSON object with the following structure:

{
  "meetingName": "descriptive title of the meeting",
  "description": "brief 2-3 sentence summary",
  "summary": "comprehensive meeting summary (5-8 sentences covering key points, discussions, and outcomes)",
  "tasks": [{"description": "task description", "owner": "person name or Unassigned", "dueDate": "YYYY-MM-DD or null"}],
  "decisions": [{"description": "decision made", "date": "YYYY-MM-DD"}],
  "questions": [{"question": "question asked", "status": "Answered or Unanswered", "answer": "answer if available or empty"}],
  "insights": [{"insight": "key insight or important point", "reference": "Meeting transcript"}],
  "deadlines": [{"description": "deadline description", "date": "YYYY-MM-DD or null"}],
  "attendees": [{"name": "person name", "role": "their role or Participant"}],
  "followUps": [{"description": "follow-up action", "owner": "person or Unassigned"}],
  "risks": [{"risk": "identified risk", "impact": "potential impact"}],
  "agenda": ["agenda item 1", "agenda item 2"]
}

Extract ALL action items as tasks, ALL key decisions made, ALL questions asked (with answers if provided), key insights, deadlines, attendees mentioned, follow-up points, risks identified, and agenda items discussed.

Return ONLY valid JSON, no markdown formatting.

Meeting Transcript:
${rawTranscript.substring(0, 12000)}`

    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
      const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })
      
      const result = await geminiModel.generateContent([
        "You are an expert meeting analysis assistant. Return only valid JSON, no markdown formatting or explanations.",
        analysisPrompt
      ])

      const response = await result.response
      const analyzedText = response.text() || '{}'
      console.log('✅ Analysis completed successfully')
      console.log('Response preview:', analyzedText.substring(0, 200))
      
      // Clean and parse JSON
      let cleanedText = analyzedText.trim()
      // Remove markdown code blocks if present
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      // Find JSON object
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        cleanedText = jsonMatch[0]
      }
      
      const parsedData = JSON.parse(cleanedText)
      
      // Map to expected format
      const analyzedData = {
        "Meeting Name": parsedData.meetingName || `Meeting - ${new Date().toLocaleDateString()}`,
        "Description": parsedData.description || "Meeting notes",
        "Summary": parsedData.summary || parsedData.description || "Meeting transcribed successfully",
        "Tasks": parsedData.tasks || [],
        "Decisions": parsedData.decisions || [],
        "Questions": parsedData.questions || [],
        "Insights": parsedData.insights || [],
        "Deadlines": parsedData.deadlines || [],
        "Attendees": parsedData.attendees || [],
        "Follow-ups": parsedData.followUps || [],
        "Risks": parsedData.risks || [],
        "Agenda": parsedData.agenda || []
      }

      console.log('Analyzed Data:', JSON.stringify(analyzedData, null, 2))
      console.log('Saving to database...')

      // Helper function to format dates as ISO strings
      const formatDate = (date: string) => {
        const parsedDate = new Date(date)
        return !isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : null
      }

      // Extract clean meeting name from audio file (remove extension and timestamp)
      const cleanFileName = file.name.replace(/\.(mp3|mp4|wav|m4a|ogg|webm)$/i, '')
      const meetingName = analyzedData['Meeting Name'] || cleanFileName || 'Untitled Meeting'

      // Save to database with safe access
      const meeting = await prisma.meeting.create({
      data: {
        name: meetingName,
        description: analyzedData['Description'] || 'No description provided.',
        rawTranscript: rawTranscript,
        summary: analyzedData['Summary'] || '',
        tasks: {
          create: (analyzedData['Tasks'] || [])
            .filter((task: any) => task && typeof task === 'object')
            .map((task: any) => ({
              task: task.description || 'No task description',
              owner: task.owner || 'Unassigned',
              dueDate: task.dueDate || task.due_date ? formatDate(task.dueDate || task.due_date) : null,
            })),
        },
        decisions: {
          create: (analyzedData['Decisions'] || [])
            .filter((decision: any) => decision && typeof decision === 'object')
            .map((decision: any) => ({
              decision: decision.description || 'No decision description',
              date: decision.date ? (formatDate(decision.date) || new Date().toISOString()) : new Date().toISOString(),
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
      
    } catch (aiError: any) {
      console.error('❌ Gemini Analysis error:', aiError)
      console.error('Error message:', aiError.message)
      console.error('Error details:', aiError)
      
      // Extract clean meeting name from audio file (remove extension and timestamp)
      const cleanFileName = file.name.replace(/\.(mp3|mp4|wav|m4a|ogg|webm)$/i, '')
      
      // Fallback: save transcript without AI analysis but with proper filename
      const meeting = await prisma.meeting.create({
        data: {
          name: cleanFileName || `Meeting - ${new Date().toLocaleDateString()}`,
          description: rawTranscript.substring(0, 200) + '...',
          rawTranscript: rawTranscript,
          summary: rawTranscript.substring(0, 500) + '...',
        },
      })
      return NextResponse.json(meeting, { status: 200 })
    }
    
  } catch (error: any) {
    console.error('Error in /api/transcribe:', error)
    return NextResponse.json({ error: 'An error occurred during processing.' }, { status: 500 })
  }
}