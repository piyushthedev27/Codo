import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { getSubmission } from '@/lib/services/submissionService';

function extractIdFromUrl(url: string): string | null {
    const parts = url.split('/');
    const index = parts.indexOf('submissions');
    if (index !== -1 && index + 1 < parts.length) {
        return parts[index + 1].split('?')[0];
    }
    return null;
}

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        try {
            await adminAuth().verifyIdToken(token);
        } catch {
            return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
        }

        const submissionId = extractIdFromUrl(request.url);
        if (!submissionId) return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 });

        const submission = await getSubmission(submissionId);
        if (!submission) {
            return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
        }

        // Ideally, either the user requesting it is the owner of the submission, or an admin
        // if (submission.userId !== decodedToken.uid && !decodedToken.admin) {
        //     return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        // }

        return NextResponse.json(submission);
    } catch (error: unknown) {
        console.error('Get submission error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
