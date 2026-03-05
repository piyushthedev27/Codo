import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { addXP } from '@/lib/services/progressService';
import { FieldValue } from 'firebase-admin/firestore';

const CINEMA_XP_AWARD = 75;

async function handler(request: NextRequest) {
    try {
        // 1. Authenticate user
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 });
        }
        
        const token = authHeader.split('Bearer ')[1];
        let decodedToken;
        try {
            decodedToken = await adminAuth().verifyIdToken(token);
        } catch {
            return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
        }

        const userId = decodedToken.uid;

        // 2. Parse and validate request body
        const body = await request.json();
        const { topic } = body;

        if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
            return NextResponse.json({ 
                error: 'Missing or invalid required field: topic' 
            }, { status: 400 });
        }

        const normalizedTopic = topic.toLowerCase().trim();

        // 3. Check if user has already completed this cinema
        const completionRef = adminDb()
            .collection('cinemaCompletions')
            .doc(`${userId}_${normalizedTopic}`);

        const completionDoc = await completionRef.get();

        if (completionDoc.exists) {
            // User has already watched this cinema, no XP awarded
            return NextResponse.json({
                success: true,
                alreadyCompleted: true,
                xpAwarded: 0,
                message: 'Cinema already completed'
            }, { status: 200 });
        }

        // 4. Award XP to the user
        const xpResult = await addXP(userId, CINEMA_XP_AWARD);

        // 5. Record the cinema completion
        await completionRef.set({
            userId,
            topic: normalizedTopic,
            completedAt: FieldValue.serverTimestamp(),
            xpAwarded: CINEMA_XP_AWARD
        });

        // 6. Return success response
        return NextResponse.json({
            success: true,
            alreadyCompleted: false,
            xpAwarded: CINEMA_XP_AWARD,
            newXP: xpResult.newXP,
            newLevel: xpResult.newLevel,
            leveledUp: xpResult.leveledUp,
            message: 'Cinema completed successfully'
        }, { status: 200 });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Cinema completion error:', error);
        return NextResponse.json({ 
            error: 'Failed to complete cinema', 
            details: message 
        }, { status: 500 });
    }
}

export const POST = handler;
