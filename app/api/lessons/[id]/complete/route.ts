import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { completeLesson } from '@/lib/services/lessonService';

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id: lessonId } = params;

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth().verifyIdToken(token);
        const userId = decodedToken.uid;

        await completeLesson(userId, lessonId);
        return NextResponse.json({ message: 'Lesson marked as completed' });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        console.error('Complete lesson error:', error);
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
