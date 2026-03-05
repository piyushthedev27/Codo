import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    if (!genAI) {
      return NextResponse.json({ error: 'Missing GEMINI_API_KEY' }, { status: 503 });
    }

    const { topic } = await req.json();
    if (!topic) return NextResponse.json({ error: 'Missing topic' }, { status: 400 });

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an expert programming instructor creating an interactive, branching video lesson about "${topic}".

Generate a JSON object representing the video states. 
A state represents a scene in the video.

Rules for the JSON:
- Must have a "title" string.
- Must have a "states" array.
- Each state MUST have:
  - "id": string (unique identifier)
  - "narration": string (the exact script the AI voice will say. Keep it conversational and energetic, 2-4 sentences max per state).
  - "codeSnippet": string or null (code to show on screen while narrating).
  - "duration": number (estimated seconds to read narration).
- The state can transition in two ways:
  - Linear: specify "next" with the ID of the next state, and "choices": null.
  - Branching: specify "next": null, and "choices" as an array of objects { "label": "Text on button", "nextState": "id of next state" }.
- The first state MUST have id "intro".
- Create exactly 1 branching point with 2 choices.
- Create 1 final state for each branch that has "next": null and "choices": null.

Return ONLY raw JSON. No markdown backticks.

Example format:
{
  "title": "Topic Name",
  "states": [
    {
      "id": "intro",
      "narration": "Welcome...",
      "codeSnippet": "let x = 1;",
      "duration": 5,
      "next": "choice1",
      "choices": null
    },
    {
      ...
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    // Remove markdown formatting if the model still returns it
    if (text.startsWith('```json')) {
      text = text.substring(7, text.length - 3).trim();
    } else if (text.startsWith('```')) {
      text = text.substring(3, text.length - 3).trim();
    }

    const data = JSON.parse(text);

    // Save to Firestore
    const docRef = await adminDb().collection('cinemaVideos').add({
      userId,
      topic,
      title: data.title,
      states: data.states,
      createdAt: new Date()
    });

    return NextResponse.json({
      sessionId: docRef.id,
      title: data.title,
      states: data.states
    });

  } catch (error: unknown) {
    console.error('Cinema Generation Error:', error);
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Failed to generate cinema script' }, { status: 500 });
  }
}
