'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, GoogleAuthProvider, GithubAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { motion } from 'motion/react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;
        setIsSubmitting(true);
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/dashboard');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogle = async () => {
        setError('');
        try {
            await signInWithPopup(auth, new GoogleAuthProvider());
            router.push('/dashboard');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Google login failed');
        }
    };

    const handleGithub = async () => {
        setError('');
        try {
            await signInWithPopup(auth, new GithubAuthProvider());
            router.push('/dashboard');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'GitHub login failed');
        }
    };

    return (
        <div className="relative w-full px-6 py-12">
            <div className="relative z-10 w-full max-w-md mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <div className="bg-[#1a1a2e] border-2 border-[#6c63ff] rounded glow-purple p-8">
                        <motion.h1
                            className="text-pixel text-3xl text-[#6c63ff] text-center mb-2"
                            initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.3, delay: 0.2 }}
                        >
                            CODO
                        </motion.h1>
                        <h2 className="text-pixel text-lg text-[#e8e8f0] text-center mb-2">WELCOME BACK, HERO</h2>
                        <p className="text-mono text-[#8888aa] text-center mb-8">Continue your journey</p>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                                className="mb-4 px-4 py-3 bg-red-900/40 border border-red-500/50 rounded text-mono text-red-400 text-sm text-center"
                            >
                                {error}
                            </motion.div>
                        )}

                        {/* Social Login */}
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
                                    className="w-full bg-[#12121a] border-2 border-[#2a2a3e] rounded px-4 py-3 text-mono text-[#e8e8f0] focus:border-[#6c63ff] focus:outline-none transition"
                                />
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 text-mono text-[#8888aa]">
                                    <input type="checkbox" className="w-4 h-4" /> Remember me
                                </label>
                                <Link href="/forgot-password" className="text-mono text-[#6c63ff] hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="block w-full py-3 bg-[#6c63ff] text-white rounded text-retro text-xl text-center hover:bg-[#7c73ff] glow-purple transition hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'LOGGING IN...' : 'LOG IN ▶'}
                            </button>
                        </form>

                        <p className="text-center text-mono text-[#8888aa] mt-6">
                            New here?{' '}
                            <Link href="/sign-up" className="text-[#6c63ff] hover:underline">Start free →</Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
