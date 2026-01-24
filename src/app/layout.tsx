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
      <html lang="en" suppressHydrationWarning className="dark">
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                try {
                  const root = document.documentElement;
                  const body = document.body;
                  
                  // Force dark theme always
                  root.classList.add('dark');
                  root.classList.remove('light');
                  root.style.colorScheme = 'dark';
                  root.setAttribute('data-theme', 'dark');
                  
                  // Apply landing page gradient background
                  body.style.background = 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e1b4b 100%)';
                  body.style.backgroundAttachment = 'fixed';
                  body.style.color = 'hsl(210 40% 98%)';
                  body.style.minHeight = '100vh';
                } catch (e) {
                  // Fallback to dark theme
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.colorScheme = 'dark';
                  document.body.style.background = 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e1b4b 100%)';
                  document.body.style.color = 'hsl(210 40% 98%)';
                }
              `,
            }}
          />
        </head>
        <body className={`${inter.className} text-foreground transition-colors duration-300`}>
          <ThemeProvider
            defaultTheme="dark"
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