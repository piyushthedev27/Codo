import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { getUserLessonProgress } from '@/lib/services/lessonService';

export async function GET(
    req: NextRequest,
    { params }: { params: { userId: string } }
) {
    const { userId } = params;

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth().verifyIdToken(token);

        // Only allow user to see their own progress or if they are admin
        if (decodedToken.uid !== userId && !decodedToken.admin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const progress = await getUserLessonProgress(userId);
        return NextResponse.json({ progress });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        console.error('User lesson progress error:', error);
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
