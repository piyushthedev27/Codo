import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, username } = body;

        if (!email || !password || !username) {
            return NextResponse.json({ message: 'Email, password, and username are required' }, { status: 400 });
        }

        if (username.length < 3 || username.length > 30 || !/^[a-zA-Z0-9_]+$/.test(username)) {
            return NextResponse.json({ message: 'Username must be 3-30 characters, letters/numbers/underscores only' }, { status: 400 });
        }

        const db = adminDb();

        // Check if username is taken
        const usernameQuery = await db.collection('users').where('username', '==', username).limit(1).get();
        if (!usernameQuery.empty) {
            return NextResponse.json({ message: 'Username already taken' }, { status: 409 });
        }

        // Create Firebase Auth user
        const auth = adminAuth();
        const userRecord = await auth.createUser({ email, password, displayName: username });

        // Create Firestore user document
        await db.collection('users').doc(userRecord.uid).set({
            uid: userRecord.uid,
            email,
            username,
            displayName: username,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
            level: 1,
            xp: 0,
            streak: 0,
            role: 'user',
            isPublic: true,
        });

        // Create a custom token for immediate login
        const customToken = await auth.createCustomToken(userRecord.uid);

        return NextResponse.json(
            { message: 'User created successfully', uid: userRecord.uid, customToken },
            { status: 201 }
        );
    } catch (error: unknown) {
        const code = (error as { code?: string }).code;
        if (code === 'auth/email-already-exists') {
            return NextResponse.json({ message: 'Email already registered' }, { status: 409 });
        }
        console.error('Register error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
