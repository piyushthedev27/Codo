import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'

// Initialize OpenAI client (or Gemini)
// Note: In a production app, use env variables
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy_key_for_demo',
})

export async function POST(req: Request) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { question, codeContext, peerPersonality, _userId } = await req.json()

        // Determine the system prompt based on peer personality
        let systemPrompt = "You are an AI coding coach inside Codo, a peer learning platform."

        if (peerPersonality === 'analytical') {
            systemPrompt += " Your name is Alex. You are methodical, focused on edge cases, and like to explain the 'why' behind optimizations."
        } else if (peerPersonality === 'curious') {
            systemPrompt += " Your name is Sarah. You are enthusiastic, love exploring different approaches, and often suggest using modern JS features like array methods."
        } else if (peerPersonality === 'supportive') {
            systemPrompt += " Your name is Jordan. You are encouraging, patient, and focus on helping the user build confidence and understand basics."
        }

        systemPrompt += ` The user is currently working on: \n${codeContext}\nRespond as if you are a peer developer. Keep responses concise (under 3 sentences) as they will be spoken aloud.`

        // In a production app, the OpenAI API key should be required.
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: 'OpenAI API key not configured. Mock responses have been disabled as per cleanup requirements.' },
                { status: 503 }
            )
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: question }
            ],
            max_tokens: 150,
            temperature: 0.7,
        })

        const aiResponse = completion.choices[0].message.content

        return NextResponse.json({ response: aiResponse })
    } catch (error) {
        console.error('[AI Coach API Error]:', error)
        return NextResponse.json(
            { error: 'Failed to generate coaching response' },
            { status: 500 }
        )
    }
}
