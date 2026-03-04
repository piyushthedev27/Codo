import { NextRequest, NextResponse } from 'next/server';
import { getLessonChallenges } from '@/lib/services/lessonService';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    try {
        const challenges = await getLessonChallenges(id);
        return NextResponse.json({ challenges });
    } catch (error) {
        console.error('Get lesson challenges error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
