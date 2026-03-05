import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const token = authHeader.split('Bearer ')[1];
        await adminAuth().verifyIdToken(token);

        if (!openai) {
            return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 503 });
        }

        const { text } = await req.json();
        if (!text) return NextResponse.json({ error: 'Missing text for TTS' }, { status: 400 });

        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: "alloy",
            input: text,
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': buffer.length.toString(),
            },
        });

    } catch (error: unknown) {
        console.error('TTS Error:', error);
        const err = error as Error;
        return NextResponse.json({ error: err.message || 'Failed to generate audio' }, { status: 500 });
    }
}
