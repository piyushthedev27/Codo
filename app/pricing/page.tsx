'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Check, X } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';

type Tier = 'free' | 'pro' | 'guild';
type Cycle = 'monthly' | 'yearly';

const TIERS: Record<Tier, {
    name: string;
    emoji: string;
    color: string;
    monthlyPrice: number;
    yearlyPrice: number;
    cta: string;
    popular?: boolean;
}> = {
    free: {
        name: 'FREE HERO',
        emoji: '⚔️',
        color: '#8888aa',
        monthlyPrice: 0,
        yearlyPrice: 0,
        cta: 'CURRENT PLAN',
    },
    pro: {
        name: 'PRO WARRIOR',
        emoji: '🌟',
        color: '#6c63ff',
        monthlyPrice: 9.99,
        yearlyPrice: 6.99,
        cta: 'UPGRADE TO PRO',
        popular: true,
    },
    guild: {
        name: 'GUILD MASTER',
        emoji: '👑',
        color: '#ffd700',
        monthlyPrice: 19.99,
        yearlyPrice: 14.99,
        cta: 'BECOME GUILD MASTER',
    },
};

const FEATURES: { label: string; free: boolean | string; pro: boolean | string; guild: boolean | string }[] = [
    { label: 'Lessons access', free: '50 lessons', pro: 'All lessons', guild: 'All lessons' },
    { label: 'AI Peer companions', free: '1 (Sarah)', pro: 'All 3 peers', guild: 'All 3 + custom' },
    { label: 'Code Duels / month', free: '5 duels', pro: 'Unlimited', guild: 'Unlimited' },
    { label: 'AI Cinema episodes', free: '5 / month', pro: 'Unlimited', guild: 'Unlimited' },
    { label: 'Guild membership', free: false, pro: true, guild: true },
    { label: 'Create a guild', free: false, pro: false, guild: true },
    { label: 'XP Boosts', free: false, pro: '2x weekends', guild: '2x always' },
    { label: 'Priority support', free: false, pro: true, guild: true },
    { label: 'Custom avatar & themes', free: false, pro: true, guild: true },
    { label: 'Advanced analytics', free: false, pro: true, guild: true },
    { label: 'Team leaderboard', free: false, pro: false, guild: true },
    { label: 'Guild war events', free: false, pro: false, guild: true },
];

function FeatureValue({ value }: { value: boolean | string }) {
    if (value === true) return <Check size={16} className="text-[#00ff88] mx-auto" />;
    if (value === false) return <X size={16} className="text-[#ff4d6d] mx-auto opacity-50" />;
    return <span className="text-mono text-[#e8e8f0] text-xs">{value}</span>;
}

export default function PricingPage() {
    const { showInfo } = useToast();
    const [cycle, setCycle] = useState<Cycle>('monthly');
    const currentPlan: Tier = 'free';

    const getPrice = (tier: typeof TIERS[Tier]) =>
        cycle === 'yearly' ? tier.yearlyPrice : tier.monthlyPrice;

    return (
        <div className="min-h-screen bg-[#0a0a0f] pixel-grid-bg px-6 py-12">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-pixel text-3xl text-[#e8e8f0] mb-3">💎 CHOOSE YOUR PLAN</h1>
                    <p className="text-mono text-[#8888aa] mb-6">Level up your coding journey with the right tier.</p>

                    {/* Billing Toggle */}
                    <div className="inline-flex items-center gap-3 bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded p-1">
                        <button
                            onClick={() => setCycle('monthly')}
                            className={`px-4 py-2 rounded text-retro text-sm transition ${cycle === 'monthly' ? 'bg-[#6c63ff] text-white' : 'text-[#8888aa] hover:text-[#e8e8f0]'}`}
                        >
                            MONTHLY
                        </button>
                        <button
                            onClick={() => setCycle('yearly')}
                            className={`px-4 py-2 rounded text-retro text-sm transition ${cycle === 'yearly' ? 'bg-[#6c63ff] text-white' : 'text-[#8888aa] hover:text-[#e8e8f0]'}`}
                        >
                            YEARLY
                            <span className="ml-2 text-mono text-[8px] bg-[#00ff88] text-[#0a0a0f] px-1 rounded">-30%</span>
                        </button>
                    </div>
                </div>

                {/* Tier Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {(Object.entries(TIERS) as [Tier, typeof TIERS[Tier]][]).map(([key, tier]) => {
                        const price = getPrice(tier);
                        const isCurrent = currentPlan === key;
                        return (
                            <motion.div
                                key={key}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`relative bg-[#1a1a2e] border-2 rounded p-6 flex flex-col ${tier.popular ? 'border-[#6c63ff] shadow-[0_0_24px_#6c63ff40]' : 'border-[#2a2a3e]'
                                    }`}
                            >
                                {tier.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#6c63ff] rounded text-mono text-[#e8e8f0] text-xs font-bold">
                                        ⭐ MOST POPULAR
                                    </div>
                                )}
                                <div className="text-center mb-6">
                                    <div className="text-4xl mb-2">{tier.emoji}</div>
                                    <div className="text-pixel text-lg mb-3" style={{ color: tier.color }}>{tier.name}</div>
                                    {price === 0 ? (
                                        <div className="text-pixel text-4xl" style={{ color: tier.color }}>FREE</div>
                                    ) : (
                                        <>
                                            <div className="text-pixel text-4xl" style={{ color: tier.color }}>
                                                ${price.toFixed(2)}
                                            </div>
                                            <div className="text-mono text-[#8888aa] text-xs">/ month{cycle === 'yearly' ? ', billed yearly' : ''}</div>
                                        </>
                                    )}
                                </div>

                                <button
                                    onClick={() => !isCurrent && showInfo('Coming Soon! 🚀', 'Payment integration is being set up. Check back soon!')}
                                    disabled={isCurrent}
                                    className={`w-full py-3 rounded text-retro text-lg mb-6 transition ${isCurrent
                                            ? 'bg-[#2a2a3e] text-[#8888aa] cursor-default'
                                            : 'hover:-translate-y-0.5 hover:opacity-90'
                                        }`}
                                    style={!isCurrent ? { background: tier.color, color: '#0a0a0f' } : {}}
                                >
                                    {isCurrent ? '✅ CURRENT PLAN' : tier.cta + ' ▶'}
                                </button>

                                <ul className="space-y-2">
                                    {FEATURES.slice(0, 6).map((f) => {
                                        const val = f[key as Tier];
                                        return (
                                            <li key={f.label} className="flex items-center gap-2 text-mono text-xs text-[#8888aa]">
                                                {val === false
                                                    ? <X size={12} className="text-[#ff4d6d] opacity-50 flex-shrink-0" />
                                                    : <Check size={12} className="text-[#00ff88] flex-shrink-0" />}
                                                <span>{f.label}{typeof val === 'string' ? `: ${val}` : ''}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Feature Comparison Table */}
                <div className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded overflow-hidden mb-10">
                    <div className="grid grid-cols-4 bg-[#12121a] border-b border-[#2a2a3e]">
                        <div className="p-4 text-pixel text-xs text-[#8888aa]">FEATURE</div>
                        {(Object.values(TIERS)).map((tier) => (
                            <div key={tier.name} className="p-4 text-center text-pixel text-xs" style={{ color: tier.color }}>
                                {tier.emoji} {tier.name.split(' ')[0]}
                            </div>
                        ))}
                    </div>
                    {FEATURES.map((f, i) => (
                        <div key={f.label} className={`grid grid-cols-4 border-b border-[#2a2a3e] last:border-0 ${i % 2 === 0 ? 'bg-[#1a1a2e]' : 'bg-[#161625]'}`}>
                            <div className="p-3 text-mono text-[#8888aa] text-xs">{f.label}</div>
                            {(['free', 'pro', 'guild'] as Tier[]).map((tier) => (
                                <div key={tier} className="p-3 text-center">
                                    <FeatureValue value={f[tier]} />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                {/* FAQ */}
                <div className="text-center">
                    <p className="text-mono text-[#8888aa] text-sm mb-2">Questions about pricing?</p>
                    <Link href="/help" className="text-mono text-[#6c63ff] hover:underline text-sm">Visit our Help Center →</Link>
                </div>
            </div>
        </div>
    );
}
