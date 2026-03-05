'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { motion } from 'motion/react';
import { ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setIsSubmitting(true);
        setError('');
        try {
            await sendPasswordResetEmail(auth, email);
            setSuccess(true);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to send reset email');
        } finally {
            setIsSubmitting(false);
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
                        <h2 className="text-pixel text-lg text-[#e8e8f0] text-center mb-2">FORGOT PASSWORD?</h2>
                        <p className="text-mono text-[#8888aa] text-center mb-8 text-sm">
                            No worries, hero. We&apos;ll send a reset link to your email.
                        </p>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                                className="mb-4 px-4 py-3 bg-red-900/40 border border-red-500/50 rounded text-mono text-red-400 text-sm text-center"
                            >
                                {error}
                            </motion.div>
                        )}

                        {success ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className="text-center"
                            >
                                <div className="w-16 h-16 bg-[#00ff88]/20 border-2 border-[#00ff88] rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Mail size={28} className="text-[#00ff88]" />
                                </div>
                                <h3 className="text-pixel text-[#00ff88] text-lg mb-2">CHECK YOUR INBOX!</h3>
                                <p className="text-mono text-[#8888aa] text-sm mb-6">
                                    We sent a password reset link to <span className="text-[#6c63ff]">{email}</span>.<br />
                                    Check your spam folder if you don&apos;t see it.
                                </p>
                                <Link
                                    href="/login"
                                    className="block w-full py-3 bg-[#6c63ff] text-white rounded text-retro text-lg text-center hover:bg-[#7c73ff] glow-purple transition hover:-translate-y-1"
                                >
                                    BACK TO LOGIN ▶
                                </Link>
                            </motion.div>
                        ) : (
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div>
                                    <label className="block text-retro text-[#8888aa] mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        placeholder="hero@codo.dev"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full bg-[#12121a] border-2 border-[#2a2a3e] rounded px-4 py-3 text-mono text-[#e8e8f0] focus:border-[#6c63ff] focus:outline-none transition"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="block w-full py-3 bg-[#6c63ff] text-white rounded text-retro text-xl text-center hover:bg-[#7c73ff] glow-purple transition hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'SENDING...' : 'SEND RESET LINK ▶'}
                                </button>
                            </form>
                        )}

                        <Link
                            href="/login"
                            className="flex items-center justify-center gap-2 text-mono text-[#8888aa] hover:text-[#6c63ff] mt-6 transition"
                        >
                            <ArrowLeft size={16} />
                            Back to Login
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
