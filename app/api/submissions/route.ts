import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { executeCode, ExecutionInput } from '@/lib/services/executionEngine';
import { saveSubmission, SubmissionData } from '@/lib/services/submissionService';
import { invalidateLeaderboardCache } from '@/lib/services/leaderboardService';
import { invalidateGuildLeaderboardCache } from '@/lib/services/guildLeaderboardService';
import { updateUserStats } from '@/lib/services/progressService';
import { analyzeSubmission } from '@/lib/services/mistakeAnalysisService';

export async function POST(req: NextRequest) {
    try {
        // 1. Authenticate user
        const authHeader = req.headers.get('Authorization');
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

        // 2. Parse request body
        const body = await req.json();
        const { challengeId, code, language } = body;

        if (!challengeId || !code || !language) {
            return NextResponse.json({ error: 'Missing required fields: challengeId, code, language' }, { status: 400 });
        }

        // 3. Fetch challenge test cases (hidden from user)
        const challengeDoc = await adminDb().collection('challenges').doc(challengeId).get();
        if (!challengeDoc.exists) {
            return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
        }

        const challengeData = challengeDoc.data();
        const testCases = challengeData?.testCases || [];
        const timeLimit = challengeData?.timeLimit || 5;
        const memoryLimit = challengeData?.memoryLimit || 256;

        if (testCases.length === 0) {
            return NextResponse.json({ error: 'Challenge has no test cases configured' }, { status: 500 });
        }

        // 4. Execute Code
        const executionInput: ExecutionInput = {
            code,
            language,
            testCases,
            timeLimit,
            memoryLimit
        };

        const executionOutput = await executeCode(executionInput);

        // 5. Save the Submission
        const submissionData: SubmissionData = {
            userId,
            challengeId,
            code,
            language,
            status: executionOutput.status,
            executionTime: executionOutput.executionTime,
            memoryUsed: executionOutput.memoryUsed,
            testResults: executionOutput.results,
            errorMessage: executionOutput.compilationError || null
        };

        const submissionId = await saveSubmission(submissionData);

        // 6. Invalidate leaderboard caches so rankings are up-to-date
        invalidateLeaderboardCache();
        invalidateGuildLeaderboardCache();

        // 7. Process background updates (async but don't обязательно wait for them to block response if they take time)
        // Note: For absolute reliability we should await, but Next.js might kill the process if we don't.
        const isSuccess = executionOutput.status === 'success';

        // Update user stats (XP, Level, etc.)
        await updateUserStats(userId, isSuccess, executionOutput.executionTime);

        // If failed, perform mistake analysis
        if (!isSuccess) {
            await analyzeSubmission(
                submissionId,
                userId,
                challengeId,
                executionOutput.status,
                executionOutput.compilationError || null
            );
        }

        // 8. Return response
        return NextResponse.json({
            submissionId,
            status: executionOutput.status,
            executionTime: executionOutput.executionTime,
            memoryUsed: executionOutput.memoryUsed,
            results: executionOutput.results,
            compilationError: executionOutput.compilationError
        }, { status: 201 });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Submission execution error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: message }, { status: 500 });
    }
}
