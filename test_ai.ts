
import { AIService } from './lib/ai/ai-service';

async function main() {
    try {
        console.log("Testing generateVideoScript with topic 'python variable'...");
        const result = await AIService.generateVideoScript("python variable");
        console.log("SUCCESS:");
        console.log(JSON.stringify(result, null, 2));
    } catch (e) {
        console.error("FAILED:");
        console.error(e);
    }
}

main();


