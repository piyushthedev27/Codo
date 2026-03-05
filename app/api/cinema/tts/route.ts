import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { textToSpeech, TTSRequest } from '@/lib/services/ttsService';
import { withRateLimit, INTENSIVE_RATE_LIMIT } from '@/lib/middleware/rateLimiter';

async function handler(request: NextRequest) {
    try {
        // 1. Authenticate user
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ 
                error: 'Unauthorized: Missing or invalid token' 
            }, { status: 401 });
        }
        
        const token = authHeader.split('Bearer ')[1];
        try {
            await adminAuth().verifyIdToken(token);
        } catch {
            return NextResponse.json({ 
                error: 'Unauthorized: Invalid token' 
            }, { status: 401 });
        }

        // User is authenticated

        // 2. Parse and validate request body
        const body = await request.json();
        const { text, voice, model } = body;

        // Validate required fields
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return NextResponse.json({ 
                error: 'Missing or invalid required field: text' 
            }, { status: 400 });
        }

        // Validate text length (OpenAI has a 4096 character limit)
        if (text.length > 4096) {
            return NextResponse.json({ 
                error: 'Text exceeds maximum length of 4096 characters' 
            }, { status: 400 });
        }

        // Validate optional voice if provided
        const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
        if (voice !== undefined && !validVoices.includes(voice)) {
            return NextResponse.json({ 
                error: `Invalid voice: ${voice}. Valid voices: ${validVoices.join(', ')}` 
            }, { status: 400 });
        }

        // Validate optional model if provided
        const validModels = ['tts-1', 'tts-1-hd'];
        if (model !== undefined && !validModels.includes(model)) {
            return NextResponse.json({ 
                error: `Invalid model: ${model}. Valid models: ${validModels.join(', ')}` 
            }, { status: 400 });
        }

        // 3. Build TTS request
        const ttsRequest: TTSRequest = {
            text: text.trim(),
            ...(voice && { voice }),
            ...(model && { model })
        };

        // 4. Generate audio
        const ttsResponse = await textToSpeech(ttsRequest);

        // 5. Return audio response
        return new NextResponse(ttsResponse.audio as unknown as BodyInit, {
            status: 200,
            headers: {
                'Content-Type': ttsResponse.contentType,
                'Content-Length': String(ttsResponse.audio.length),
                'X-Cached': String(ttsResponse.cached),
                'Cache-Control': 'public, max-age=604800' // 7 days
            }
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('TTS generation error:', error);
        
        // Handle specific error cases
        if (message.includes('Text is required')) {
            return NextResponse.json({ 
                error: 'Text is required for TTS generation',
                details: message 
            }, { status: 400 });
        }

        if (message.includes('exceeds maximum length')) {
            return NextResponse.json({ 
                error: 'Text exceeds maximum length',
                details: message 
            }, { status: 400 });
        }

        if (message.includes('OPENAI_API_KEY')) {
            return NextResponse.json({ 
                error: 'TTS service configuration error',
                details: 'OpenAI API key not configured' 
            }, { status: 500 });
        }

        // Handle OpenAI quota errors
        if (message.includes('quota') || message.includes('insufficient_quota')) {
            return NextResponse.json({ 
                error: 'TTS service temporarily unavailable',
                details: 'OpenAI API quota exceeded. Please try again later or contact support.',
                code: 'quota_exceeded'
            }, { status: 503 });
        }

        // Handle rate limit errors
        if (message.includes('rate_limit') || message.includes('429')) {
            return NextResponse.json({ 
                error: 'TTS service rate limited',
                details: 'Too many requests. Please try again in a moment.',
                code: 'rate_limited'
            }, { status: 429 });
        }

        return NextResponse.json({ 
            error: 'Failed to generate audio', 
            details: message 
        }, { status: 500 });
    }
}

// Apply rate limiting for resource-intensive TTS generation
export const POST = withRateLimit(handler, INTENSIVE_RATE_LIMIT, 'cinema-tts');
