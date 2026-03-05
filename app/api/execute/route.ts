import { NextRequest, NextResponse } from 'next/server';
import { executeCode, Language, TestCase } from '@/lib/services/executionEngine';
import { adminAuth } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
    try {
        // Validate authentication
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        try {
            await adminAuth().verifyIdToken(token);
        } catch {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }

        const body = await request.json();
        const { code, language, testCases } = body;

        if (!code || !language || !testCases || !Array.isArray(testCases)) {
            return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 });
        }

        const output = await executeCode({
            code,
            language: language as Language,
            testCases: testCases as TestCase[],
        });

        return NextResponse.json(output);
    } catch (error: unknown) {
        console.error('Execution Engine API Error:', error);
        const err = error as Error;
        return NextResponse.json({ message: err.message || 'Internal server error' }, { status: 500 });
    }
}
