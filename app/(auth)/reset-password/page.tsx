'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { motion } from 'motion/react';
import { CheckCircle } from 'lucide-react';
import { Suspense } from 'react';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const oobCode = searchParams.get('oobCode') ?? '';

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getStrength = (pw: string): { label: string; color: string; width: string } => {
        if (pw.length === 0) return { label: '', color: '#2a2a3e', width: '0%' };
        if (pw.length < 6) return { label: 'WEAK', color: '#ff4d6d', width: '25%' };
        if (pw.length < 10) return { label: 'FAIR', color: '#ffd700', width: '50%' };
        if (!/[A-Z]/.test(pw) || !/[0-9]/.test(pw)) return { label: 'GOOD', color: '#00d4ff', width: '75%' };
        return { label: 'STRONG', color: '#00ff88', width: '100%' };
    };

    const strength = getStrength(password);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (!oobCode) {
            setError('Invalid or expired reset link. Please request a new one.');
            return;
        }
        setIsSubmitting(true);
        setError('');
        try {
            await confirmPasswordReset(auth, oobCode, password);
            setSuccess(true);
            setTimeout(() => router.push('/login'), 3000);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to reset password. The link may have expired.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-[#1a1a2e] border-2 border-[#6c63ff] rounded glow-purple p-8">
            <motion.h1
                className="text-pixel text-3xl text-[#6c63ff] text-center mb-2"
                initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.3, delay: 0.2 }}
            >
                CODO
            </motion.h1>
            <h2 className="text-pixel text-lg text-[#e8e8f0] text-center mb-2">RESET PASSWORD</h2>
            <p className="text-mono text-[#8888aa] text-center mb-8 text-sm">Choose a new password for your account.</p>

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
                        <CheckCircle size={28} className="text-[#00ff88]" />
                    </div>
                    <h3 className="text-pixel text-[#00ff88] text-lg mb-2">PASSWORD RESET!</h3>
                    <p className="text-mono text-[#8888aa] text-sm mb-2">Redirecting you to login in 3 seconds...</p>
                    <Link href="/login" className="text-mono text-[#6c63ff] hover:underline text-sm">
                        Click here if not redirected
                    </Link>
                </motion.div>
            ) : (
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-retro text-[#8888aa] mb-2">New Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-[#12121a] border-2 border-[#2a2a3e] rounded px-4 py-3 text-mono text-[#e8e8f0] focus:border-[#6c63ff] focus:outline-none transition"
                        />
                        {password && (
                            <div className="mt-2">
                                <div className="bg-[#2a2a3e] h-1.5 rounded overflow-hidden">
                                    <div
                                        className="h-full transition-all duration-300"
                                        style={{ width: strength.width, background: strength.color }}
                                    />
                                </div>
                                <div className="text-mono text-xs mt-1" style={{ color: strength.color }}>
                                    {strength.label}
                                </div>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-retro text-[#8888aa] mb-2">Confirm Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full bg-[#12121a] border-2 border-[#2a2a3e] rounded px-4 py-3 text-mono text-[#e8e8f0] focus:border-[#6c63ff] focus:outline-none transition"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="block w-full py-3 bg-[#6c63ff] text-white rounded text-retro text-xl text-center hover:bg-[#7c73ff] glow-purple transition hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'RESETTING...' : 'RESET PASSWORD ▶'}
                    </button>
                </form>
            )}

            <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-mono text-[#8888aa] hover:text-[#6c63ff] mt-6 transition text-sm"
            >
                Back to Login
            </Link>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="relative w-full px-6 py-12">
            <div className="relative z-10 w-full max-w-md mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <Suspense fallback={<div className="text-mono text-[#8888aa] text-center">Loading...</div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </motion.div>
            </div>
        </div>
    );
}
