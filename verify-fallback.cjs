const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
const Groq = require('groq-sdk');

const geminiKey = process.env.GEMINI_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;
const groqKey = process.env.GROQ_API_KEY;

async function testFallback() {
    console.log("--- Testing AI Fallback Chain ---");

    // Test Gemini
    try {
        console.log("1. Testing Gemini...");
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent("Respond with 'GEMINI_OK'");
        console.log("Result:", result.response.text().trim());
    } catch (e) {
        console.warn("Gemini Failed:", e.message);
    }

    // Test OpenAI
    try {
        console.log("\n2. Testing OpenAI...");
        const openai = new OpenAI({ apiKey: openaiKey });
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: "Respond with 'OPENAI_OK'" }],
        });
        console.log("Result:", response.choices[0].message.content.trim());
    } catch (e) {
        console.warn("OpenAI Failed:", e.message);
    }

    // Test Groq
    try {
        console.log("\n3. Testing Groq...");
        const groq = new Groq({ apiKey: groqKey });
        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: "Respond with 'GROQ_OK'" }],
        });
        console.log("Result:", response.choices[0].message.content.trim());
    } catch (e) {
        console.warn("Groq Failed:", e.message);
    }
}

testFallback();
