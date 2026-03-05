'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { applyActionCode } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { motion } from 'motion/react';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const oobCode = searchParams.get('oobCode') ?? '';

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (!oobCode) {
            setStatus('error');
            return;
        }
        applyActionCode(auth, oobCode)
            .then(() => {
                setStatus('success');
            })
            .catch(() => {
                setStatus('error');
            });
    }, [oobCode]);

    useEffect(() => {
        if (status !== 'success') return;
        const interval = setInterval(() => {
            setCountdown((p) => {
                if (p <= 1) {
                    clearInterval(interval);
                    router.push('/dashboard');
                    return 0;
                }
                return p - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [status, router]);

    const handleResend = async () => {
        if (auth.currentUser) {
            const { sendEmailVerification } = await import('firebase/auth');
            await sendEmailVerification(auth.currentUser);
        }
    };

    return (
        <div className="bg-[#1a1a2e] border-2 border-[#6c63ff] rounded glow-purple p-8 text-center">
            <h1 className="text-pixel text-3xl text-[#6c63ff] mb-6">CODO</h1>

            {status === 'loading' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="w-12 h-12 border-4 border-[#6c63ff] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <div className="text-mono text-[#8888aa]">Verifying your email...</div>
                </motion.div>
            )}

            {status === 'success' && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <CheckCircle size={48} className="text-[#00ff88] mx-auto mb-4" />
                    <h2 className="text-pixel text-xl text-[#00ff88] mb-2">EMAIL VERIFIED!</h2>
                    <p className="text-mono text-[#8888aa] mb-6">
                        Welcome to CODO, hero! Your account is all set.<br />
                        Redirecting in {countdown} seconds...
                    </p>
                    <Link href="/dashboard" className="block w-full py-3 bg-[#6c63ff] text-white rounded text-retro text-xl text-center hover:bg-[#7c73ff] glow-purple transition hover:-translate-y-1">
                        START ADVENTURE ▶
                    </Link>
                </motion.div>
            )}

            {status === 'error' && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <XCircle size={48} className="text-[#ff4d6d] mx-auto mb-4" />
                    <h2 className="text-pixel text-xl text-[#ff4d6d] mb-2">LINK EXPIRED</h2>
                    <p className="text-mono text-[#8888aa] mb-6">
                        This verification link has expired or is invalid.<br />
                        Request a new one below.
                    </p>
                    <button
                        onClick={handleResend}
                        className="flex items-center gap-2 mx-auto px-6 py-3 bg-[#6c63ff] text-white rounded text-retro text-lg hover:bg-[#7c73ff] glow-purple transition hover:-translate-y-1 mb-4"
                    >
                        <RefreshCw size={18} />
                        RESEND VERIFICATION
                    </button>
                    <Link href="/login" className="text-mono text-[#8888aa] hover:text-[#6c63ff] transition text-sm">
                        Back to Login
                    </Link>
                </motion.div>
            )}
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="relative w-full px-6 py-16">
            <div className="relative z-10 w-full max-w-md mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <Suspense fallback={
                        <div className="bg-[#1a1a2e] border-2 border-[#6c63ff] rounded p-8 text-center">
                            <div className="text-mono text-[#8888aa]">Loading...</div>
                        </div>
                    }>
                        <VerifyEmailContent />
                    </Suspense>
                </motion.div>
            </div>
        </div>
    );
}
