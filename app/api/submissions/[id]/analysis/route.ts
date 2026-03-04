import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { getMistakeAnalysisBySubmission } from '@/lib/services/mistakeAnalysisService';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id: submissionId } = params;

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const token = authHeader.split('Bearer ')[1];
        await adminAuth().verifyIdToken(token);

        const analysis = await getMistakeAnalysisBySubmission(submissionId);
        if (!analysis) {
            return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
        }
        return NextResponse.json({ analysis });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        console.error('Mistake analysis error:', error);
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
