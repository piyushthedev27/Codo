'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Coins } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import ConfirmModal from '@/components/ui/ConfirmModal';

type Category = 'all' | 'avatars' | 'pets' | 'powerups' | 'themes';

interface ShopItem {
    id: string;
    name: string;
    description: string;
    cost: number;
    category: Exclude<Category, 'all'>;
    emoji: string;
    color: string;
    owned?: boolean;
    popular?: boolean;
}

const SHOP_ITEMS: ShopItem[] = [
    { id: 's1', name: 'Neon Ninja Avatar', description: 'Glowing cyberpunk warrior skin', cost: 500, category: 'avatars', emoji: '🥷', color: '#6c63ff', popular: true },
    { id: 's2', name: 'Dragon Coder Avatar', description: 'Legendary dragon developer', cost: 1200, category: 'avatars', emoji: '🐉', color: '#ff4d6d' },
    { id: 's3', name: 'Pixel Wizard Avatar', description: 'Classic pixel art mage', cost: 300, category: 'avatars', emoji: '🧙', color: '#00d4ff' },
    { id: 's4', name: 'Golden ByteBear', description: 'Rare golden edition ByteBear', cost: 800, category: 'pets', emoji: '🐻', color: '#ffd700', popular: true },
    { id: 's5', name: 'Cyber Dragon Pet', description: 'Fire-breathing digital companion', cost: 1500, category: 'pets', emoji: '🐲', color: '#ff6b35' },
    { id: 's6', name: 'Crystal Bunny Pet', description: 'Sparkling magical companion', cost: 600, category: 'pets', emoji: '🐰', color: '#00ff88' },
    { id: 's7', name: 'XP Boost (x2 · 24h)', description: 'Double XP for 24 hours', cost: 200, category: 'powerups', emoji: '⚡', color: '#6c63ff', popular: true },
    { id: 's8', name: 'Streak Freeze', description: 'Protect your streak for 1 day', cost: 150, category: 'powerups', emoji: '🧊', color: '#00d4ff' },
    { id: 's9', name: 'Coin Rush (x3 · 1h)', description: 'Triple coins for 1 hour', cost: 100, category: 'powerups', emoji: '🪙', color: '#ffd700' },
    { id: 's10', name: 'Purple Matrix Theme', description: 'Futuristic purple terminal look', cost: 400, category: 'themes', emoji: '🟣', color: '#6c63ff' },
    { id: 's11', name: 'Emerald Forest Theme', description: 'Nature-inspired green theme', cost: 400, category: 'themes', emoji: '🟢', color: '#00ff88' },
    { id: 's12', name: 'Crimson Fire Theme', description: 'Intense red warrior theme', cost: 400, category: 'themes', emoji: '🔴', color: '#ff4d6d' },
];

const CATEGORY_LABELS: Record<Category, string> = {
    all: '🛍️ ALL',
    avatars: '👤 AVATARS',
    pets: '🐾 PET SKINS',
    powerups: '⚡ POWER-UPS',
    themes: '🎨 THEMES',
};

export default function ShopPage() {
    const { showSuccess, showError } = useToast();
    const [activeCategory, setActiveCategory] = useState<Category>('all');
    const [confirmItem, setConfirmItem] = useState<ShopItem | null>(null);
    const [ownedItems, setOwnedItems] = useState<Set<string>>(new Set());
    const userCoins = 750; // Mock value

    const filtered = activeCategory === 'all'
        ? SHOP_ITEMS
        : SHOP_ITEMS.filter((item) => item.category === activeCategory);

    const handleBuy = (item: ShopItem) => {
        if (ownedItems.has(item.id)) {
            showError('Already Owned', 'You already own this item!');
            return;
        }
        if (userCoins < item.cost) {
            showError('Not Enough Coins', `You need ${item.cost - userCoins} more coins.`);
            return;
        }
        setConfirmItem(item);
    };

    const confirmPurchase = () => {
        if (!confirmItem) return;
        setOwnedItems((prev) => new Set([...prev, confirmItem.id]));
        showSuccess(`${confirmItem.name} purchased! 🎉`, 'Item added to your inventory.');
        setConfirmItem(null);
    };

    return (
        <>
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-pixel text-2xl text-[#e8e8f0] mb-1">🛍️ SHOP</h1>
                        <p className="text-mono text-[#8888aa] text-sm">Spend your hard-earned coins on epic gear!</p>
                    </div>
                    <div className="flex items-center gap-2 bg-[#1a1a2e] border-2 border-[#ffd700] rounded px-4 py-2">
                        <Coins size={20} className="text-[#ffd700]" />
                        <span className="text-pixel text-[#ffd700] text-xl">{userCoins.toLocaleString()}</span>
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    {(Object.entries(CATEGORY_LABELS) as [Category, string][]).map(([cat, label]) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded text-retro text-sm transition border-2 ${activeCategory === cat
                                    ? 'bg-[#6c63ff] border-[#6c63ff] text-white'
                                    : 'border-[#2a2a3e] text-[#8888aa] hover:border-[#6c63ff] hover:text-[#e8e8f0]'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Items Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filtered.map((item, idx) => {
                        const isOwned = ownedItems.has(item.id);
                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.04 }}
                                className={`bg-[#1a1a2e] border-2 rounded p-4 flex flex-col items-center text-center transition ${isOwned
                                        ? 'border-[#00ff88] opacity-70'
                                        : 'border-[#2a2a3e] hover:border-[#6c63ff] hover:-translate-y-0.5'
                                    }`}
                                style={{ boxShadow: item.popular ? `0 0 12px ${item.color}40` : undefined, borderColor: item.popular && !isOwned ? item.color : undefined }}
                            >
                                {item.popular && (
                                    <div className="text-mono text-[8px] px-1.5 py-0.5 rounded mb-2" style={{ background: item.color + '30', color: item.color, border: `1px solid ${item.color}60` }}>
                                        ⭐ POPULAR
                                    </div>
                                )}
                                {/* Preview */}
                                <div
                                    className="w-16 h-16 rounded-lg flex items-center justify-center text-4xl mb-3 border-2"
                                    style={{ background: item.color + '20', borderColor: item.color + '60' }}
                                >
                                    {item.emoji}
                                </div>
                                <div className="text-retro text-[#e8e8f0] text-sm mb-1">{item.name}</div>
                                <div className="text-mono text-[#8888aa] text-xs mb-3">{item.description}</div>
                                <div className="flex items-center gap-1.5 mb-3">
                                    <Coins size={14} className="text-[#ffd700]" />
                                    <span className="text-pixel text-[#ffd700] text-lg">{item.cost}</span>
                                </div>
                                <button
                                    onClick={() => handleBuy(item)}
                                    disabled={isOwned}
                                    className={`w-full py-1.5 rounded text-retro text-sm transition ${isOwned
                                            ? 'bg-[#00ff88] text-[#0a0a0f] cursor-default'
                                            : 'bg-[#6c63ff] text-white hover:bg-[#7c73ff]'
                                        }`}
                                >
                                    {isOwned ? '✅ OWNED' : 'BUY NOW'}
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={!!confirmItem}
                title={`Buy ${confirmItem?.name}?`}
                message={`This will cost you ${confirmItem?.cost} coins. You currently have ${userCoins} coins.`}
                confirmLabel="CONFIRM PURCHASE"
                cancelLabel="Cancel"
                onConfirm={confirmPurchase}
                onCancel={() => setConfirmItem(null)}
            />
        </>
    );
}
