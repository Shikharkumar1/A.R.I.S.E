import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { attendeeId, attendeeName } = await request.json();
    const meetingId = params.id;

    // Fetch meeting with all related data
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        tasks: true,
        decisions: true,
        questions: true,
        insights: true,
        deadlines: true,
        attendees: true,
        followUps: true,
        risks: true,
      },
    });

    if (!meeting) {
      return NextResponse.json(
        { error: "Meeting not found" },
        { status: 404 }
      );
    }

    // Filter tasks and follow-ups for specific attendee
    const attendeeTasks = meeting.tasks.filter(
      (task) => task.owner?.toLowerCase().includes(attendeeName.toLowerCase())
    );
    const attendeeFollowUps = meeting.followUps.filter(
      (followUp) => followUp.owner?.toLowerCase().includes(attendeeName.toLowerCase())
    );

    // Create context for AI
    const context = `
Generate a professional follow-up email for ${attendeeName} based on this meeting:

Meeting: ${meeting.name}
Date: ${new Date(meeting.createdAt).toLocaleDateString()}
Summary: ${meeting.summary}

${attendeeName}'s Action Items:
${attendeeTasks.map((task, i) => `${i + 1}. ${task.task} (Due: ${task.dueDate || 'TBD'})`).join('\n') || 'No specific tasks assigned'}

${attendeeName}'s Follow-ups:
${attendeeFollowUps.map((fu, i) => `${i + 1}. ${fu.description}`).join('\n') || 'No specific follow-ups'}

Key Decisions Made:
${meeting.decisions.map((d, i) => `${i + 1}. ${d.decision}`).join('\n') || 'None'}

Upcoming Deadlines:
${meeting.deadlines.map((d, i) => `${i + 1}. ${d.description} - ${d.dueDate}`).join('\n') || 'None'}

Important Questions:
${meeting.questions.filter(q => q.status === 'Open').map((q, i) => `${i + 1}. ${q.question}`).join('\n') || 'None'}

Generate a personalized, professional email with:
1. Subject line
2. Friendly greeting
3. Brief meeting recap
4. Their specific action items with deadlines
5. Any relevant decisions or context they need
6. Professional closing

Make it concise, actionable, and professional. Format as:
SUBJECT: [subject line]

[email body]
`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    // Retry logic for API overload
    let emailContent = '';
    let retries = 3;
    
    while (retries > 0) {
      try {
        const result = await model.generateContent(context);
        emailContent = result.response.text();
        break; // Success, exit loop
      } catch (error: any) {
        retries--;
        if (error.status === 503 && retries > 0) {
          // Wait 2 seconds before retry
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        throw error; // Re-throw if not 503 or out of retries
      }
    }

    // Parse subject and body
    const subjectMatch = emailContent.match(/SUBJECT:\s*(.+)/i);
    const subject = subjectMatch ? subjectMatch[1].trim() : `Follow-up: ${meeting.name}`;
    const body = emailContent.replace(/SUBJECT:.+\n\n?/i, '').trim();

    return NextResponse.json({
      subject,
      body,
      recipient: attendeeName,
      meetingName: meeting.name,
      date: new Date(meeting.createdAt).toLocaleDateString(),
    });
  } catch (error) {
    console.error("Error generating email:", error);
    return NextResponse.json(
      { error: "Failed to generate email" },
      { status: 500 }
    );
  }
}
