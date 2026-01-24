import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '@/components/ui/ThemeProvider'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Codo - AI-Powered Learning Platform',
  description: 'Learn programming with AI study buddies, voice coaching, and personalized learning paths. Never learn alone again with Sarah, Alex, and Jordan.',
  keywords: 'programming, learning, AI, education, coding, study buddies, voice coaching',
  authors: [{ name: 'Codo Team' }],
  openGraph: {
    title: 'Codo - AI-Powered Learning Platform',
    description: 'Learn programming with AI study buddies, voice coaching, and personalized learning paths.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Codo - AI-Powered Learning Platform',
    description: 'Learn programming with AI study buddies, voice coaching, and personalized learning paths.',
  },
  robots: 'index, follow',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            defaultTheme="system"
            storageKey="codo-ui-theme"
          >
            <Header />
            <main className="pt-16">
              {children}
            </main>
            <Footer />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}