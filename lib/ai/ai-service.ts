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
