import { NextRequest, NextResponse } from 'next/server';
import { getLessons } from '@/lib/services/lessonService';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const difficulty = searchParams.get('difficulty') || undefined;

    try {
        const lessons = await getLessons({ category, difficulty });
        return NextResponse.json({ lessons });
    } catch (error) {
        console.error('List lessons error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
