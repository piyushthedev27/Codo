import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import Groq from 'groq-sdk';

// Initialize AI clients
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

export class AIService {
    /**
     * Generates a video script for the cinema feature with fallback.
     */
    static async generateVideoScript(topic: string) {
        const prompt = `You are an expert programming instructor creating an interactive, branching video lesson strictly about "${topic}". DO NOT deviate from this topic.
If the topic is NOT a valid programming, computer science, or technology concept, DO NOT generate a lesson. Instead, return a JSON object with a single property "error" containing a brief, polite message explaining that you only teach coding topics.

Otherwise, generate a JSON object representing the video states. 
A state represents a scene in the video.

Rules for the JSON:
- Must have a "title" string.
- Must have a "states" array.
- Each state MUST have:
  - "id": string (unique identifier)
  - "narration": string (the exact script the AI voice will say. Keep it conversational and energetic. STRICT RULE: MAXIMUM 2 short sentences per state. Rely on visual code to explain).
  - "codeSnippet": string or null (code to show on screen while narrating. This should do the heavy lifting of teaching).
  - "duration": number (estimated seconds to read narration. Keep most states between 5-8 seconds).
- The state can transition in three ways:
  - Linear: specify "next" with the ID of the next state, "choices": null, and "blockBuilder": null.
  - Branching: specify "next": null, "choices" as an array of objects { "label": "Text", "nextState": "id" }, and "blockBuilder": null.
  - Block Builder: specify "next": null, "choices": null, and "blockBuilder" as an object that tests the user on the code just explained.
- If using "blockBuilder", the object MUST have:
  - "shuffledBlocks": array of strings (the code sentence broken into 3-5 randomized blocks, e.g. ["=", "x", "5"])
  - "correctSequence": array of strings (the exact correct order, e.g. ["x", "=", "5"])
  - "successNextState": string (the ID of the state to go to if they build it correctly)
- The first state MUST have id "intro".
- OVERALL LENGTH: The core video path should take roughly 25-30 seconds total (sum of duration of main path).
- INTERACTIVITY: Create exactly 1 multiple-choice branch AND exactly 1-2 blockBuilder interactions throughout the video to test their understanding.
- Branches/interactive success states should provide brief feedback, then link back to the main flow to continue the lesson.
- Create 1 final state at the very end of the main flow that has "next": null, "choices": null, and "blockBuilder": null.

Return ONLY raw JSON. No markdown backticks.`;

        return this.withFallback(
            async () => {
                if (!genAI) throw new Error('Gemini not configured');
                const model = genAI.getGenerativeModel({
                    model: 'gemini-2.0-flash',
                    generationConfig: {
                        maxOutputTokens: 2000, // Cost control: cap at 2000 tokens
                    }
                });
                const result = await model.generateContent(prompt);
                return this.parseJSON(result.response.text());
            },
            async () => {
                if (!openai) throw new Error('OpenAI not configured');
                const response = await openai.chat.completions.create({
                    model: 'gpt-4o',
                    messages: [{ role: 'user', content: prompt }],
                    response_format: { type: 'json_object' },
                    max_tokens: 2000, // Cost control: cap at 2000 tokens
                });
                return JSON.parse(response.choices[0].message.content || '{}');
            },
            async () => {
                if (!groq) throw new Error('Groq not configured');
                const response = await groq.chat.completions.create({
                    model: 'llama-3.3-70b-versatile',
                    messages: [{ role: 'user', content: prompt }],
                    response_format: { type: 'json_object' },
                    max_tokens: 2000, // Cost control: cap at 2000 tokens
                });
                return JSON.parse(response.choices[0].message.content || '{}');
            }
        );
    }

    /**
     * Generates a coding hint with fallback.
     */
    static async generateHint(problemTitle: string, problemDescription: string, userCode: string, language: string) {
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

        return this.withFallback(
            async () => {
                if (!genAI) throw new Error('Gemini not configured');
                const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
                const result = await model.generateContent(prompt);
                return result.response.text();
            },
            async () => {
                if (!openai) throw new Error('OpenAI not configured');
                const response = await openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'user', content: prompt }],
                });
                return response.choices[0].message.content;
            },
            async () => {
                if (!groq) throw new Error('Groq not configured');
                const response = await groq.chat.completions.create({
                    model: 'llama-3.3-70b-versatile',
                    messages: [{ role: 'user', content: prompt }],
                });
                return response.choices[0].message.content;
            }
        );
    }
    /**
     * Generates a conversational response from a squad peer (Sarah, Alex, Jordan) with their distinct personality.
     */
    static async generateChatResponse(history: { role: 'user' | 'peer', text: string }[], peerName: string, currentTopic: string = "coding") {
        let systemPersonality = `You are ${peerName}, a coding tutor.`;

        if (peerName === 'SARAH') {
            systemPersonality = `You are SARAH, a brilliant coding tutor with a slightly flirty, very stylish, and playful personality. You use terms of endearment (like 'babe', 'hero', 'cutie') and emojis (like 💅, ✨, 😘) subtly. You are extremely smart but explain complex coding topics in a fun, breezy, conversational way. Do not be overly robotic. Never break character.`;
        } else if (peerName === 'ALEX') {
            systemPersonality = `You are ALEX, a coding tutor and the ultimate hype 'bro'. You use slang (like 'bro', 'dude', 'let's go', 'crushed it') and emphasize competing, winning, and hyping the user up like they are at the gym or playing an intense video game. You use emojis like 🔥, 🚀, 💪. You explain coding topics with high energy and sports/gaming analogies. Never break character.`;
        } else if (peerName === 'JORDAN') {
            systemPersonality = `You are JORDAN, a coding tutor and the user's supportive, warm best friend. You are extremely encouraging, patient, and use casual, friendly language. You use emojis like 💛, 😊, 👋. You explain coding topics gently and always make sure the user feels confident and safe to ask questions. Never break character.`;
        }

        const historyContext = history.map(h => `${h.role === 'user' ? 'User' : peerName}: ${h.text}`).join('\n');

        const prompt = `${systemPersonality}
The current learning context/topic is: ${currentTopic}.

Here is the recent conversation history:
${historyContext}

Write a short, engaging response to the User's last message. Keep it under 3 sentences. Stay entirely in character. Do NOT include thought processing, XML tags, or markdown headers. Just return the raw text of what ${peerName} says.`;

        return this.withFallback(
            async () => {
                if (!genAI) throw new Error('Gemini not configured');
                const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
                const result = await model.generateContent(prompt);
                return result.response.text().trim();
            },
            async () => {
                if (!openai) throw new Error('OpenAI not configured');
                const response = await openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'user', content: prompt }],
                });
                return response.choices[0].message.content?.trim() || "Hmm, let me think about that.";
            },
            async () => {
                if (!groq) throw new Error('Groq not configured');
                const response = await groq.chat.completions.create({
                    model: 'llama-3.3-70b-versatile',
                    messages: [{ role: 'user', content: prompt }],
                });
                return response.choices[0].message.content?.trim() || "Hmm, let me think about that.";
            }
        );
    }

    /**
     * Helper to execute functions with fallback.
     */
    private static async withFallback<T>(...actions: (() => Promise<T>)[]): Promise<T> {
        let lastError: Error | null = null;
        for (const action of actions) {
            try {
                return await action();
            } catch (error) {
                console.warn(`AI Provider failed, trying next... Error:`, error);
                lastError = error as Error;
            }
        }
        throw lastError || new Error('All AI providers failed');
    }

    /**
     * Clean and parse JSON from AI strings.
     */
    private static parseJSON(text: string) {
        let cleaned = text.trim();
        if (cleaned.startsWith('```json')) {
            cleaned = cleaned.substring(7, cleaned.length - 3).trim();
        } else if (cleaned.startsWith('```')) {
            cleaned = cleaned.substring(3, cleaned.length - 3).trim();
        }
        return JSON.parse(cleaned);
    }
}
