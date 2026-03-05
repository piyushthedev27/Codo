'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import { motion } from 'motion/react';

export default function SignUpPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const createUserProfile = async (uid: string, email: string, username: string) => {
        await setDoc(doc(db, 'users', uid), {
            uid,
            email,
            username,
            displayName: username,
            createdAt: serverTimestamp(),
            level: 1,
            xp: 0,
            streak: 0,
            role: 'user',
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!email || !password || !username) return;
        setIsSubmitting(true);
        setError('');
        try {
            const { user } = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(user, { displayName: username });
            await createUserProfile(user.uid, email, username);
            router.push('/onboarding/assessment');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Registration failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogle = async () => {
        setError('');
        try {
            const { user } = await signInWithPopup(auth, new GoogleAuthProvider());
            await createUserProfile(user.uid, user.email ?? '', user.displayName ?? 'Player');
            router.push('/onboarding/assessment');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Google signup failed');
        }
    };

    const handleGithub = async () => {
        setError('');
        try {
            const { user } = await signInWithPopup(auth, new GithubAuthProvider());
            await createUserProfile(user.uid, user.email ?? '', user.displayName ?? 'Player');
            router.push('/onboarding/assessment');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'GitHub signup failed');
        }
    };

    return (
        <div className="relative w-full px-6 py-12">
            <motion.div
                className="relative z-10 w-full max-w-md mx-auto"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            >
                <div className="bg-[#1a1a2e] border-2 border-[#6c63ff] rounded glow-purple p-8">
                    <motion.h1
                        className="text-pixel text-3xl text-[#6c63ff] text-center mb-2"
                        initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.3, delay: 0.2 }}
                    >
                        CODO
                    </motion.h1>
                    <h2 className="text-pixel text-lg text-[#e8e8f0] text-center mb-2">BEGIN YOUR QUEST</h2>
                    <p className="text-mono text-[#8888aa] text-center mb-8">Create your free account</p>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                            className="mb-4 px-4 py-3 bg-red-900/40 border border-red-500/50 rounded text-mono text-red-400 text-sm text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    <div className="space-y-3 mb-6">
                        <button
                            onClick={handleGoogle}
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center gap-3 bg-white text-[#12121a] border-2 border-[#2a2a3e] rounded py-3 text-retro text-lg hover:bg-gray-100 transition disabled:opacity-50"
                        >
                            <span className="font-bold text-[#4285f4]">G</span>
                            <span>Continue with Google</span>
                        </button>
                        <button
                            onClick={handleGithub}
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center gap-3 bg-[#12121a] text-[#e8e8f0] border-2 border-[#2a2a3e] rounded py-3 text-retro text-lg hover:bg-[#1a1a2e] transition disabled:opacity-50"
                        >
                            <span className="font-bold">GH</span>
                            <span>Continue with GitHub</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-[#2a2a3e]" />
                        <span className="text-mono text-[#8888aa] text-sm">or</span>
                        <div className="flex-1 h-px bg-[#2a2a3e]" />
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-retro text-[#8888aa] mb-2">Username</label>
                            <input
                                type="text"
                                placeholder="coolhero123"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                minLength={3}
                                maxLength={30}
                                pattern="[a-zA-Z0-9_]+"
                                title="Letters, numbers, and underscores only"
                                className="w-full bg-[#12121a] border-2 border-[#2a2a3e] rounded px-4 py-3 text-mono text-[#e8e8f0] focus:border-[#6c63ff] focus:outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="block text-retro text-[#8888aa] mb-2">Email</label>
                            <input
                                type="email"
                                placeholder="hero@codo.dev"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-[#12121a] border-2 border-[#2a2a3e] rounded px-4 py-3 text-mono text-[#e8e8f0] focus:border-[#6c63ff] focus:outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="block text-retro text-[#8888aa] mb-2">Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full bg-[#12121a] border-2 border-[#2a2a3e] rounded px-4 py-3 text-mono text-[#e8e8f0] focus:border-[#6c63ff] focus:outline-none transition"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="block w-full py-3 bg-[#6c63ff] text-white rounded text-retro text-xl text-center hover:bg-[#7c73ff] glow-purple transition hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'CREATING...' : 'CREATE ACCOUNT ▶'}
                        </button>
                    </form>

                    <p className="text-center text-mono text-[#8888aa] mt-6">
                        Already a hero?{' '}
                        <Link href="/login" className="text-[#6c63ff] hover:underline">Log in →</Link>
                    </p>
                </div>
                <p className="text-center text-mono text-[#8888aa] text-sm mt-6">
                    By signing up, you agree to our Terms and Privacy Policy
                </p>
            </motion.div>
        </div>
    );
}
