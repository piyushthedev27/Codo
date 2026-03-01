import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'

// Initialize OpenAI client - key is validated before use below
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'placeholder',
})

// Fallback responses per peer personality used when OPENAI_API_KEY is not set
const FALLBACK_RESPONSES: Record<string, string[]> = {
    analytical: [
        "Let's break this down systematically. Check your edge cases first — what happens when the input is empty or null?",
        "The algorithm looks correct. Have you considered its time complexity? Can we optimize the inner loop?",
        "Good approach! Make sure to handle the boundary conditions before moving to the main logic.",
    ],
    curious: [
        "Ooh, interesting problem! Have you tried using array methods like .reduce() or .flatMap() here? They could simplify this a lot!",
        "I love how you approached this! What if we tried a different angle — maybe a recursive solution?",
        "That's one way to do it! I'm curious, have you seen how modern JavaScript handles this with optional chaining?",
    ],
    supportive: [
        "You're doing great! Take it one step at a time — start by making it work, then we can refactor together.",
        "Don't worry, this concept trips up a lot of people. Let's go back to basics — what does the function need to return?",
        "Really solid progress! You've got the right idea. Just double-check your variable scope and you'll be there.",
    ],
}

function getFallbackResponse(peerPersonality: string): string {
    const responses = FALLBACK_RESPONSES[peerPersonality] ?? FALLBACK_RESPONSES['supportive']
    return responses[Math.floor(Math.random() * responses.length)]
}

export async function POST(req: Request) {
    try {
        const { question, codeContext, peerPersonality } = await req.json()

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

        // Return a canned fallback response in demo/development mode (no OpenAI key)
        if (!process.env.OPENAI_API_KEY) {
            const fallback = getFallbackResponse(peerPersonality)
            return NextResponse.json({ response: fallback, demo: true })
        }

        const completion = await openai.chat.completions.create({
            // Using gpt-3.5-turbo for cost optimization per design spec
            model: "gpt-3.5-turbo",
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
