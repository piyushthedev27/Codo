import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

export async function POST(request: NextRequest) {
    try {
        // Verify Auth
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const token = authHeader.split('Bearer ')[1];
        await adminAuth().verifyIdToken(token);

        // Verify API Key
        if (!genAI) {
            return NextResponse.json({ message: 'AI Hints are not configured (Missing GEMINI_API_KEY)' }, { status: 503 });
        }

        const { problemTitle, problemDescription, userCode, language } = await request.json();

        if (!problemTitle || !problemDescription || !language) {
            return NextResponse.json({ message: 'Missing problem context' }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are a helpful coding instructor helping a student. 
The student is working on a coding challenge: "${problemTitle}".
Challenge description: "${problemDescription}"

The student is writing in ${language}. Here is their current code editor content:
\`\`\`${language}
${userCode}
\`\`\`

Give the student a short, highly contextual hint (maximum 3 sentences). 
CRITICAL RULES:
1. DO NOT give them the direct answer.
2. DO NOT write the full code for them. 
3. Focus on pointing them in the right direction, identifying a specific logic error, syntax error, or conceptual misunderstanding in their current code.
4. If their code is empty or just the starter template, give them a hint on how to begin solving the problem conceptually.
5. Keep a very encouraging, friendly tone. Use emojis!`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        return NextResponse.json({ hint: text });

    } catch (error: unknown) {
        console.error('AI Hint Error:', error);
        const err = error as Error;
        return NextResponse.json({ message: err.message || 'Failed to generate hint' }, { status: 500 });
    }
}
