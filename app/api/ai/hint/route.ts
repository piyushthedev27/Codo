import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { generateHint, HintRequest } from '@/lib/services/aiHintService';
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
        let decodedToken;
        try {
            decodedToken = await adminAuth().verifyIdToken(token);
        } catch {
            return NextResponse.json({ 
                error: 'Unauthorized: Invalid token' 
            }, { status: 401 });
        }

        const userId = decodedToken.uid;

        // 2. Parse and validate request body
        const body = await request.json();
        const { challengeId, currentCode, language } = body;

        // Validate required fields
        if (!challengeId || typeof challengeId !== 'string' || challengeId.trim().length === 0) {
            return NextResponse.json({ 
                error: 'Missing or invalid required field: challengeId' 
            }, { status: 400 });
        }

        if (!currentCode || typeof currentCode !== 'string') {
            return NextResponse.json({ 
                error: 'Missing or invalid required field: currentCode' 
            }, { status: 400 });
        }

        if (!language || typeof language !== 'string' || language.trim().length === 0) {
            return NextResponse.json({ 
                error: 'Missing or invalid required field: language' 
            }, { status: 400 });
        }

        // Validate language is supported
        const supportedLanguages = ['javascript', 'python', 'java', 'cpp'];
        if (!supportedLanguages.includes(language.toLowerCase())) {
            return NextResponse.json({ 
                error: `Unsupported language: ${language}. Supported languages: ${supportedLanguages.join(', ')}` 
            }, { status: 400 });
        }

        // 3. Build hint request
        const hintRequest: HintRequest = {
            userId,
            challengeId: challengeId.trim(),
            currentCode,
            language: language.toLowerCase()
        };

        // 4. Generate hint
        const hintResponse = await generateHint(hintRequest);

        // 5. Return success response
        return NextResponse.json({
            success: true,
            hint: hintResponse.hint,
            cached: hintResponse.cached,
            mistakeContext: hintResponse.mistakeContext
        }, { status: 200 });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('AI hint generation error:', error);
        
        // Handle specific error cases
        if (message.includes('Challenge not found')) {
            return NextResponse.json({ 
                error: 'Challenge not found',
                details: message 
            }, { status: 404 });
        }

        if (message.includes('Failed to generate hint')) {
            return NextResponse.json({ 
                error: 'Failed to generate hint',
                details: message 
            }, { status: 500 });
        }

        return NextResponse.json({ 
            error: 'Failed to generate hint', 
            details: message 
        }, { status: 500 });
    }
}

// Apply rate limiting for resource-intensive AI hint generation
export const POST = withRateLimit(handler, INTENSIVE_RATE_LIMIT, 'ai-hint');
