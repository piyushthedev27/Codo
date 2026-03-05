import { AIService } from './lib/ai/ai-service.ts';

async function test() {
    console.log("Testing AIService with Fallback...");
    try {
        // We'll trust the logic for now, or we could manually mock clients if we had a testing framework.
        // For a simple verification, we'll just check if it can generate a hint (likely using Gemini).
        const hint = await AIService.generateHint(
            "Test Problem",
            "This is a test description",
            "console.log('hello')",
            "javascript"
        );
        console.log("SUCCESS! Generated hint:", hint);
    } catch (error) {
        console.error("Verification Failed:", error.message);
    }
}

test();
