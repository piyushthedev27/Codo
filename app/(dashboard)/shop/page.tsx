'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Coins, ShoppingBag, User, PawPrint, Zap, Palette, Star, CheckCircle2, Trophy, Ghost, Cat, Snowflake } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useRewards } from '@/hooks/useRewards';

type Category = 'all' | 'avatars' | 'pets' | 'powerups' | 'themes';

interface ShopItem {
    id: string;
    name: string;
    description: string;
    cost: number;
    category: Exclude<Category, 'all'>;
    icon: React.ReactNode;
    color: string;
    owned?: boolean;
    popular?: boolean;
}

const SHOP_ITEMS: ShopItem[] = [
    { id: 's1', name: 'Neon Ninja Avatar', description: 'Glowing cyberpunk warrior skin', cost: 500, category: 'avatars', icon: <Ghost />, color: '#6c63ff', popular: true },
    { id: 's2', name: 'Dragon Coder Avatar', description: 'Legendary dragon developer', cost: 1200, category: 'avatars', icon: <Trophy />, color: '#ff4d6d' },
    { id: 's3', name: 'Pixel Wizard Avatar', description: 'Classic pixel art mage', cost: 300, category: 'avatars', icon: <Star />, color: '#00d4ff' },
    { id: 's4', name: 'Golden ByteBear', description: 'Rare golden edition ByteBear', cost: 800, category: 'pets', icon: <Cat />, color: '#ffd700', popular: true },
    { id: 's5', name: 'Cyber Dragon Pet', description: 'Fire-breathing digital companion', cost: 1500, category: 'pets', icon: <Cat className="rotate-12" />, color: '#ff6b35' },
    { id: 's6', name: 'Crystal Bunny Pet', description: 'Sparkling magical companion', cost: 600, category: 'pets', icon: <Cat className="-rotate-12" />, color: '#00ff88' },
    { id: 's7', name: 'XP Boost (x2 · 24h)', description: 'Double XP for 24 hours', cost: 200, category: 'powerups', icon: <Zap />, color: '#6c63ff', popular: true },
    { id: 's8', name: 'Streak Freeze', description: 'Protect your streak for 1 day', cost: 150, category: 'powerups', icon: <Snowflake />, color: '#00d4ff' },
    { id: 's9', name: 'Coin Rush (x3 · 1h)', description: 'Triple coins for 1 hour', cost: 100, category: 'powerups', icon: <Coins />, color: '#ffd700' },
    { id: 's10', name: 'Purple Matrix Theme', description: 'Futuristic purple terminal look', cost: 400, category: 'themes', icon: <Palette />, color: '#6c63ff' },
    { id: 's11', name: 'Emerald Forest Theme', description: 'Nature-inspired green theme', cost: 400, category: 'themes', icon: <Palette />, color: '#00ff88' },
    { id: 's12', name: 'Crimson Fire Theme', description: 'Intense red warrior theme', cost: 400, category: 'themes', icon: <Palette />, color: '#ff4d6d' },
];

const CATEGORY_LABELS: Record<Category, { label: string; icon: React.ReactNode }> = {
    all: { label: 'ALL', icon: <ShoppingBag size={16} /> },
    avatars: { label: 'AVATARS', icon: <User size={16} /> },
    pets: { label: 'PET SKINS', icon: <PawPrint size={16} /> },
    powerups: { label: 'POWER-UPS', icon: <Zap size={16} /> },
    themes: { label: 'THEMES', icon: <Palette size={16} /> },
};

export default function ShopPage() {
    const { showSuccess, showError } = useToast();
    const { coins, addCoins } = useRewards();
    const [activeCategory, setActiveCategory] = useState<Category>('all');
    const [confirmItem, setConfirmItem] = useState<ShopItem | null>(null);
    const [ownedItems, setOwnedItems] = useState<Set<string>>(new Set());

    const filtered = activeCategory === 'all'
        ? SHOP_ITEMS
        : SHOP_ITEMS.filter((item) => item.category === activeCategory);

    const handleBuy = (item: ShopItem) => {
        if (ownedItems.has(item.id)) {
            showError('Already Owned', 'You already own this item!');
            return;
        }
        if (coins < item.cost) {
            showError('Not Enough Coins', `You need ${item.cost - coins} more coins.`);
            return;
        }
        setConfirmItem(item);
    };

    const confirmPurchase = () => {
        if (!confirmItem) return;
        addCoins(-confirmItem.cost);
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
                        <h1 className="text-pixel text-2xl text-[#e8e8f0] mb-1 flex items-center gap-2">
                            <ShoppingBag className="text-[#6c63ff]" /> SHOP
                        </h1>
                        <p className="text-mono text-[#8888aa] text-sm">Spend your hard-earned coins on epic gear!</p>
                    </div>
                    <div className="flex items-center gap-2 bg-[#1a1a2e] border-2 border-[#ffd700] rounded px-4 py-2">
                        <Coins size={20} className="text-[#ffd700]" />
                        <span className="text-pixel text-[#ffd700] text-xl">{coins.toLocaleString()}</span>
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded text-retro text-sm transition border-2 ${activeCategory === cat
                                ? 'bg-[#6c63ff] border-[#6c63ff] text-white'
                                : 'border-[#2a2a3e] text-[#8888aa] hover:border-[#6c63ff] hover:text-[#e8e8f0]'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                {CATEGORY_LABELS[cat].icon}
                                {CATEGORY_LABELS[cat].label}
                            </div>
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
                                className={`bg-[#1a1a2e] border-2 rounded p-4 flex flex-col items-center text-center transition h-full ${isOwned
                                    ? 'border-[#00ff88] opacity-70'
                                    : 'border-[#2a2a3e] hover:border-[#6c63ff] hover:-translate-y-0.5'
                                    }`}
                                style={{ boxShadow: item.popular ? `0 0 12px ${item.color}40` : undefined, borderColor: item.popular && !isOwned ? item.color : undefined }}
                            >
                                {/* Tag Space - reserved to keep alignment consistent */}
                                <div className="h-6 mb-2 flex items-center justify-center">
                                    {item.popular && (
                                        <div className="text-mono text-[8px] px-1.5 py-0.5 rounded flex items-center gap-1" style={{ background: item.color + '30', color: item.color, border: `1px solid ${item.color}60` }}>
                                            <Star size={8} fill="currentColor" /> POPULAR
                                        </div>
                                    )}
                                </div>

                                {/* Main Content Wrapper - grows to push button down */}
                                <div className="flex-1 flex flex-col items-center w-full">
                                    {/* Preview */}
                                    <div
                                        className="w-16 h-16 rounded-lg flex items-center justify-center text-4xl mb-3 border-2 shrink-0"
                                        style={{ background: item.color + '20', borderColor: item.color + '60' }}
                                    >
                                        <div className="text-[#8888aa]">
                                            {item.icon}
                                        </div>
                                    </div>
                                    <div className="text-retro text-[#e8e8f0] text-sm mb-1">{item.name}</div>
                                    <div className="text-mono text-[#8888aa] text-xs mb-3 line-clamp-2 min-h-[2.5rem]">{item.description}</div>
                                    <div className="flex items-center gap-1.5 mb-4">
                                        <Coins size={14} className="text-[#ffd700]" />
                                        <span className="text-pixel text-[#ffd700] text-lg">{item.cost}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleBuy(item)}
                                    disabled={isOwned}
                                    className={`w-full py-1.5 rounded text-retro text-sm transition mt-auto ${isOwned
                                        ? 'bg-[#00ff88] text-[#0a0a0f] cursor-default'
                                        : 'bg-[#6c63ff] text-white hover:bg-[#7c73ff]'
                                        }`}
                                >
                                    {isOwned ? <span className="flex items-center justify-center gap-1">OWNED <CheckCircle2 size={14} /></span> : 'BUY NOW'}
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
                message={`This will cost you ${confirmItem?.cost} coins. You currently have ${coins} coins.`}
                confirmLabel="CONFIRM PURCHASE"
                cancelLabel="Cancel"
                onConfirm={confirmPurchase}
                onCancel={() => setConfirmItem(null)}
            />
        </>
    );
}
