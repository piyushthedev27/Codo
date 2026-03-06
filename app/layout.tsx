import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from 'sonner';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { RewardsProvider } from '@/hooks/useRewards';
import GlobalLevelUp from '@/components/ui/GlobalLevelUp';

export const metadata: Metadata = {
    title: {
        default: 'CODO – Competitive Coding Platform',
        template: '%s | CODO',
    },
    description:
        'CODO is a gamified competitive coding platform. Learn to code through challenges, duels, lessons, and guild battles.',
    keywords: ['coding', 'competitive programming', 'learn to code', 'coding challenges', 'programming'],
    authors: [{ name: 'CODO Team' }],
    openGraph: {
        title: 'CODO – Competitive Coding Platform',
        description: 'Learn to code through competitive challenges, battles, and gamified lessons.',
        type: 'website',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="icon" href="/favicon.ico" />
            </head>
            <body>
                <AuthProvider>
                    <RewardsProvider>
                        <ToastProvider>
                            {children}
                            <GlobalLevelUp />
                        </ToastProvider>
                        <Toaster
                            position="bottom-right"
                            toastOptions={{
                                style: {
                                    background: '#12121a',
                                    border: '1px solid #2a2a3e',
                                    color: '#e8e8f0',
                                    fontFamily: 'VT323, monospace',
                                    fontSize: '18px',
                                },
                            }}
                        />
                    </RewardsProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
