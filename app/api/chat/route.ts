import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { AIService } from '@/lib/ai/ai-service';
import { withRateLimit, STANDARD_RATE_LIMIT } from '@/lib/middleware/rateLimiter';

async function handler(req: NextRequest) {
    try {
        // 1. Authenticate user
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized route' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        let decodedToken;
        try {
            decodedToken = await adminAuth().verifyIdToken(token);
        } catch (error) {
            console.error('Token verification failed:', error);
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
        }

        // 2. Parse request
        const body = await req.json();
        const { history, peerName, currentTopic } = body;

        if (!history || !Array.isArray(history) || !peerName) {
            return NextResponse.json({ error: 'Missing history or peerName in request body' }, { status: 400 });
        }

        // 3. Generate response
        const responseText = await AIService.generateChatResponse(history, peerName, currentTopic);

        return NextResponse.json({ text: responseText });
    } catch (error: any) {
        console.error('Chat generation API error:', error);

        const message = error.message || String(error);

        if (message.includes('Too Many Requests') || message.includes('429')) {
            return NextResponse.json({
                error: 'AI Rate Limit Reached. Please wait a minute and try again.',
                details: message
            }, { status: 429 });
        }

        return NextResponse.json({
            error: 'Failed to generate chat response',
            details: message
        }, { status: 500 });
    }
}

// Apply rate limiting for chat API
export const POST = withRateLimit(handler, STANDARD_RATE_LIMIT, 'chat-api');
