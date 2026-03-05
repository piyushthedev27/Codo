'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronDown, ChevronUp, Search } from 'lucide-react';

const FAQ_DATA = [
    {
        category: 'Getting Started',
        emoji: '🚀',
        items: [
            { q: 'How do I begin my learning journey?', a: 'Start with the World Map (/map) to explore available topics. Each zone contains lessons, from beginner to advanced. Click any zone to see available lessons and start one!' },
            { q: 'What is XP and how do I earn it?', a: 'XP (Experience Points) represent your progress. Earn XP by completing lessons (+150 base), winning duels (+300), completing quests (+100–500), and logging in daily (+50).' },
            { q: 'What is ByteBear / ByteBuddy?', a: 'ByteBear is your companion pet that grows alongside you. It gains XP when you do, and its mood changes based on how active you are. Feed and play with it to keep it happy!' },
        ],
    },
    {
        category: 'Lessons',
        emoji: '📚',
        items: [
            { q: 'How do I run my code?', a: 'In any lesson, write your code in the editor and click the "RUN CODE ▶" button. Results appear in the output panel below. Errors will be highlighted inline.' },
            { q: 'What happens if I use a hint?', a: 'Hints cost 50 XP each, deducted immediately. The XP is refunded if you still complete the lesson successfully with a perfect score.' },
            { q: 'Can I redo a completed lesson?', a: 'Yes! Completed lessons show a ✅ badge on the world map. Click them to replay at any time for reduced XP rewards.' },
        ],
    },
    {
        category: 'AI Peers',
        emoji: '🤖',
        items: [
            { q: 'Who are Sarah, Alex, and Jordan?', a: 'They are your AI-powered learning companions specializing in different areas: Sarah (Python), Alex (JavaScript), Jordan (System Design). Chat with them for guidance.' },
            { q: 'Can AI peers help me debug?', a: 'Absolutely! Paste your code and describe the issue in the chat. Your peer will analyze it and suggest fixes, step by step.' },
            { q: 'How do I switch between peers?', a: 'Go to Settings → AI Peers to configure which peers are active. Each has unique personalities and teaching styles.' },
        ],
    },
    {
        category: 'Code Duels',
        emoji: '⚔️',
        items: [
            { q: 'How do Code Duels work?', a: 'You and an opponent solve the same coding challenge. Whoever submits faster with a correct solution wins. Duels award XP and coins.' },
            { q: 'What if my opponent doesn\'t respond?', a: 'Duel requests expire after 5 minutes. If not accepted, you get a small consolation reward for the challenge attempt.' },
            { q: 'How is the winner determined?', a: 'Winner is based on: correct solution (required), then shortest time. Partial solutions don\'t count.' },
        ],
    },
    {
        category: 'Billing & Subscription',
        emoji: '💳',
        items: [
            { q: 'What\'s included in the Free plan?', a: 'Free users get access to 50+ lessons, 1 AI peer (Sarah), 5 duels/month, and the World Map. No credit card required.' },
            { q: 'How do I upgrade to Pro?', a: 'Visit the Pricing page (/pricing) and click "Upgrade to Pro". Supports monthly and yearly billing with a 30% yearly discount.' },
            { q: 'Can I cancel anytime?', a: 'Yes! Cancel anytime from Settings → Subscription. Your access continues until the end of the current billing period.' },
        ],
    },
];

interface AccordionItemProps {
    q: string;
    a: string;
    isOpen: boolean;
    onToggle: () => void;
}

function AccordionItem({ q, a, isOpen, onToggle }: AccordionItemProps) {
    return (
        <div className="border border-[#2a2a3e] rounded overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#1a1a2e] transition"
            >
                <span className="text-mono text-[#e8e8f0] text-sm pr-4">{q}</span>
                {isOpen ? <ChevronUp size={16} className="text-[#6c63ff] flex-shrink-0" /> : <ChevronDown size={16} className="text-[#8888aa] flex-shrink-0" />}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 pt-2 bg-[#0f0f1a] border-t border-[#2a2a3e]">
                            <p className="text-mono text-[#8888aa] text-sm leading-relaxed">{a}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function HelpPage() {
    const [openItem, setOpenItem] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [contactForm, setContactForm] = useState({ subject: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const normalizedSearch = search.toLowerCase();
    const filteredFaqs = FAQ_DATA.map((cat) => ({
        ...cat,
        items: cat.items.filter(
            (item) =>
                !search ||
                item.q.toLowerCase().includes(normalizedSearch) ||
                item.a.toLowerCase().includes(normalizedSearch)
        ),
    })).filter((cat) => cat.items.length > 0);

    const SHORTCUTS = [
        { key: '/', action: 'Focus search bar' },
        { key: 'Esc', action: 'Close modals / drawers' },
        { key: 'Ctrl + Enter', action: 'Run code in editor' },
        { key: 'Ctrl + Shift + Enter', action: 'Submit solution' },
        { key: 'Ctrl + H', action: 'Show / hide hints' },
        { key: '?', action: 'Show this keyboard shortcuts list' },
    ];

    return (
        <div className="p-6 max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-pixel text-2xl text-[#e8e8f0] mb-2">HELP CENTER</h1>
                <p className="text-mono text-[#8888aa]">Find answers to common questions or contact support.</p>
            </div>

            {/* Search */}
            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8888aa]" size={18} />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search help topics..."
                    className="w-full bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded px-12 py-3 text-mono text-sm text-[#e8e8f0] placeholder-[#8888aa] focus:border-[#6c63ff] focus:outline-none transition"
                />
                {search && (
                    <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8888aa] hover:text-[#e8e8f0]">
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* FAQs */}
            {filteredFaqs.length === 0 ? (
                <div className="text-center py-12 text-mono text-[#8888aa]">
                    No results for &quot;{search}&quot;. Try different keywords.
                </div>
            ) : (
                <div className="space-y-6 mb-12">
                    {filteredFaqs.map((cat) => (
                        <div key={cat.category}>
                            <h2 className="text-pixel text-sm text-[#6c63ff] mb-3">
                                {cat.emoji} {cat.category.toUpperCase()}
                            </h2>
                            <div className="space-y-2">
                                {cat.items.map((item) => {
                                    const id = `${cat.category}-${item.q}`;
                                    return (
                                        <AccordionItem
                                            key={id}
                                            q={item.q}
                                            a={item.a}
                                            isOpen={openItem === id}
                                            onToggle={() => setOpenItem(openItem === id ? null : id)}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Keyboard Shortcuts */}
            <div className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded p-6 mb-8">
                <h2 className="text-pixel text-sm text-[#e8e8f0] mb-4">⌨️ KEYBOARD SHORTCUTS</h2>
                <div className="grid grid-cols-2 gap-2">
                    {SHORTCUTS.map((s) => (
                        <div key={s.key} className="flex items-center gap-3">
                            <kbd className="px-2 py-1 bg-[#2a2a3e] border border-[#3a3a4e] rounded text-mono text-[#6c63ff] text-xs font-bold min-w-[2.5rem] text-center">
                                {s.key}
                            </kbd>
                            <span className="text-mono text-[#8888aa] text-xs">{s.action}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Contact Support */}
            <div className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded p-6">
                <h2 className="text-pixel text-sm text-[#e8e8f0] mb-2">📬 CONTACT SUPPORT</h2>
                <p className="text-mono text-[#8888aa] text-sm mb-4">Can&apos;t find an answer? Send us a message and we&apos;ll get back within 24h.</p>

                {submitted ? (
                    <div className="text-center py-6">
                        <div className="text-4xl mb-2">✅</div>
                        <div className="text-pixel text-[#00ff88] mb-2">Message Sent!</div>
                        <div className="text-mono text-[#8888aa] text-sm">We&apos;ll respond to your email within 24 hours.</div>
                    </div>
                ) : (
                    <form
                        onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
                        className="space-y-4"
                    >
                        <div>
                            <label className="block text-retro text-[#8888aa] mb-2 text-sm">Subject</label>
                            <input
                                type="text"
                                value={contactForm.subject}
                                onChange={(e) => setContactForm((p) => ({ ...p, subject: e.target.value }))}
                                required
                                placeholder="Briefly describe your issue..."
                                className="w-full bg-[#12121a] border-2 border-[#2a2a3e] rounded px-4 py-2 text-mono text-sm text-[#e8e8f0] placeholder-[#8888aa] focus:border-[#6c63ff] focus:outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="block text-retro text-[#8888aa] mb-2 text-sm">Message</label>
                            <textarea
                                value={contactForm.message}
                                onChange={(e) => setContactForm((p) => ({ ...p, message: e.target.value }))}
                                required
                                rows={4}
                                placeholder="Describe your issue in detail..."
                                className="w-full bg-[#12121a] border-2 border-[#2a2a3e] rounded px-4 py-2 text-mono text-sm text-[#e8e8f0] placeholder-[#8888aa] focus:border-[#6c63ff] focus:outline-none transition resize-none"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-[#6c63ff] text-white rounded text-retro hover:bg-[#7c73ff] glow-purple transition hover:-translate-y-0.5"
                        >
                            SEND MESSAGE ▶
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
