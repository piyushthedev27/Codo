import { NextRequest, NextResponse } from 'next/server';
import { getLessonById } from '@/lib/services/lessonService';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    try {
        const lesson = await getLessonById(id);
        if (!lesson) {
            return NextResponse.json({ message: 'Lesson not found' }, { status: 404 });
        }
        return NextResponse.json({ lesson });
    } catch (error) {
        console.error('Get lesson error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
