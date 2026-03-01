'use client'

import { motion } from 'framer-motion'
import { Brain, Menu, X } from 'lucide-react'
// Removed ThemeToggle import
import { useState } from 'react'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Link from 'next/link'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Pricing', href: '#pricing' }
  ]

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="p-2 bg-[#00D1FF] rounded-sm">
                <Brain className="w-6 h-6 text-[#020617]" />
              </div>
              <span className="text-2xl font-black text-white tracking-tighter uppercase">
                Codo
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item, index) => (
              <motion.a
                key={index}
                href={item.href}
                whileHover={{ y: -2 }}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200"
              >
                {item.name}
              </motion.a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {/* Show different content based on authentication status */}
            <SignedOut>
              <Link href="/sign-in">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200"
                >
                  Sign In
                </motion.button>
              </Link>

              <Link href="/sign-up">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#FF5C00] text-[#020617] px-6 py-2 rounded-none font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(255,92,0,0.4)] transition-all duration-300"
                >
                  Get Started
                </motion.button>
              </Link>
            </SignedOut>

            <SignedIn>
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200"
                >
                  Dashboard
                </motion.button>
              </Link>

              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-10 h-10 ring-2 ring-[#1E293B] hover:ring-[#00D1FF] transition-all',
                    userButtonPopoverCard: 'bg-[#0F172A] border border-[#1E293B] shadow-2xl rounded-none',
                    userButtonPopoverActionButton: 'hover:bg-[#1E293B] transition-colors',
                    userButtonPopoverActionButtonText: 'text-white font-bold uppercase tracking-tight',
                    userButtonPopoverActionButtonIcon: 'text-[#00D1FF]',
                    userButtonPopoverFooter: 'hidden',
                    userPreviewMainIdentifier: 'text-white font-black uppercase tracking-tight',
                    userPreviewSecondaryIdentifier: 'text-[#94A3B8] font-mono'
                  }
                }}
                afterSignOutUrl="/"
              />
            </SignedIn>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-700 dark:text-gray-300"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={false}
          animate={{
            height: isMenuOpen ? 'auto' : 0,
            opacity: isMenuOpen ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="md:hidden overflow-hidden"
        >
          <nav className="py-4 space-y-4">
            {navItems.map((item, index) => (
              <motion.a
                key={index}
                href={item.href}
                initial={{ x: -20, opacity: 0 }}
                animate={{
                  x: isMenuOpen ? 0 : -20,
                  opacity: isMenuOpen ? 1 : 0,
                }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setIsMenuOpen(false)}
                className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200"
              >
                {item.name}
              </motion.a>
            ))}

            <div className="pt-4 space-y-3">
              <SignedOut>
                <Link href="/sign-in">
                  <button className="block w-full text-left text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200">
                    Sign In
                  </button>
                </Link>

                <Link href="/sign-up">
                  <button className="block w-full bg-[#FF5C00] text-[#020617] px-6 py-3 rounded-none font-black uppercase tracking-widest text-center">
                    Get Started
                  </button>
                </Link>
              </SignedOut>

              <SignedIn>
                <Link href="/dashboard">
                  <button className="block w-full text-left text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200">
                    Dashboard
                  </button>
                </Link>

                <div className="flex items-center gap-3 pt-2">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: 'w-10 h-10 ring-2 ring-[#1E293B]',
                        userButtonPopoverCard: 'bg-[#0F172A] border border-[#1E293B] rounded-none',
                        userButtonPopoverActionButtonText: 'text-white font-bold uppercase tracking-tight',
                        userButtonPopoverActionButtonIcon: 'text-[#00D1FF]',
                        userButtonPopoverFooter: 'hidden'
                      }
                    }}
                    afterSignOutUrl="/"
                  />
                  <span className="text-gray-700 dark:text-gray-300 text-sm">Account</span>
                </div>
              </SignedIn>
            </div>
          </nav>
        </motion.div>
      </div>
    </motion.header>
  )
}