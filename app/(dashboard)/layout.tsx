'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Map, Film, Swords, Brain, TrendingUp, Search, Bell, Coins, Zap, Castle, Settings, HelpCircle, X, User, LogOut, ChevronDown, Trophy, Scroll, Star, Lightbulb, ShoppingBag, PawPrint, Diamond, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AnimatePresence, motion } from 'motion/react';

function NavItem({ href, icon, label, isCollapsed }: { href: string; icon: React.ReactNode; label: string; isCollapsed?: boolean }) {
    const pathname = usePathname();
    const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
    return (
        <Link
            href={href}
            title={isCollapsed ? label : undefined}
            className={`flex items-center py-3 rounded transition-all duration-300 overflow-hidden ${isCollapsed ? 'justify-center px-0' : 'px-4'} ${isActive
                ? 'bg-[#1a1a2e] text-[#6c63ff] border-l-2 border-[#6c63ff] glow-purple'
                : 'text-[#8888aa] hover:bg-[#22223a] hover:text-[#e8e8f0] hover:border-l-2 hover:border-[#6c63ff] border-l-2 border-transparent'
                }`}
        >
            <div className={`flex justify-center flex-shrink-0 transition-all duration-300 ${isCollapsed ? 'w-full' : 'w-6'}`}>{icon}</div>
            <AnimatePresence initial={false}>
                {!isCollapsed && (
                    <motion.div
                        key="label"
                        initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                        animate={{ width: 'auto', opacity: 1, marginLeft: 12 }}
                        exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden whitespace-nowrap flex items-center"
                    >
                        <span className="text-retro text-lg">{label}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </Link>
    );
}

/* ── Notifications data ─────────────────────────────── */
const MOCK_NOTIFICATIONS = [
    { id: '1', icon: <Scroll size={16} className="text-[#8888aa]" />, title: 'New Daily Quest available!', time: '2 min ago', read: false },
    { id: '2', icon: <Swords size={16} className="text-[#8888aa]" />, title: 'Alex challenged you to a duel!', time: '15 min ago', read: false },
    { id: '3', icon: <Star size={16} className="text-[#8888aa]" />, title: 'Achievement Unlocked: First Blood', time: '1 hr ago', read: false },
    { id: '4', icon: <Castle size={16} className="text-[#8888aa]" />, title: 'Your guild ranked up to Silver!', time: '3 hrs ago', read: true },
    { id: '5', icon: <Lightbulb size={16} className="text-[#8888aa]" />, title: 'New lesson available: Arrays Deep Dive', time: '1 day ago', read: true },
];

/* ── Search index ─────────────────────────────────── */
const SEARCH_INDEX = [
    { label: 'Dashboard', href: '/dashboard', icon: <Home size={18} /> },
    { label: 'World Map', href: '/map', icon: <Map size={18} /> },
    { label: 'AI Cinema', href: '/cinema', icon: <Film size={18} /> },
    { label: 'Code Duel', href: '/duel', icon: <Swords size={18} /> },
    { label: 'My Guild', href: '/guild', icon: <Castle size={18} /> },
    { label: 'Leaderboard', href: '/leaderboard', icon: <Trophy size={18} /> },
    { label: 'Quests', href: '/quests', icon: <Scroll size={18} /> },
    { label: 'Shop', href: '/shop', icon: <ShoppingBag size={18} /> },
    { label: 'Pet / Companion', href: '/pet', icon: <PawPrint size={18} /> },
    { label: 'Progress', href: '/progress', icon: <TrendingUp size={18} /> },
    { label: 'Knowledge Graph', href: '/progress/graph', icon: <Brain size={18} /> },
    { label: 'Mistake Analyzer', href: '/progress/mistakes', icon: <Search size={18} /> },
    { label: 'Settings', href: '/settings', icon: <Settings size={18} /> },
    { label: 'Help Center', href: '/help', icon: <HelpCircle size={18} /> },
    { label: 'Pricing / Upgrade', href: '/pricing', icon: <Diamond size={18} /> },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();
    const router = useRouter();

    /* ── Dropdown state ── */
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    /* ── Sidebar state ── */
    const [isCollapsed, setIsCollapsed] = useState(false);

    /* ── Notifications state ── */
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
    const unreadCount = notifications.filter((n) => !n.read).length;

    /* ── Search state ── */
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const searchResults = searchQuery.length >= 1
        ? SEARCH_INDEX.filter((item) =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 6)
        : [];

    /* ── Close dropdown on outside click ── */
    useEffect(() => {
        function handle(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setSearchFocused(false);
            }
        }
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, []);

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    const markAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] pixel-grid-bg">
            {/* Sidebar */}
            <aside className={`fixed left-0 top-0 bottom-0 bg-[#12121a] border-r-2 border-[#2a2a3e] z-50 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`}>
                {/* Logo & Toggle */}
                <div className="p-6 border-b border-[#2a2a3e] relative flex items-center justify-center min-h-[73px] overflow-hidden">
                    <Link href="/" className="flex items-center justify-center gap-1.5 group">
                        <span className="text-pixel text-[#6c63ff] text-xl transition-all duration-300 group-hover:-translate-x-1 group-hover:text-[#00d4ff] drop-shadow-[0_0_8px_rgba(108,99,255,0.4)]">{"{"}</span>
                        <AnimatePresence initial={false} mode="popLayout">
                            {isCollapsed ? (
                                <motion.div
                                    key="logo-c"
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: 'auto', opacity: 1 }}
                                    exit={{ width: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    className="overflow-hidden flex items-center justify-center"
                                >
                                    <span className="text-pixel text-transparent bg-clip-text bg-gradient-to-br from-[#ffffff] to-[#8888aa] text-xl">C</span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="logo-text"
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: 'auto', opacity: 1 }}
                                    exit={{ width: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    className="overflow-hidden flex items-center justify-center"
                                >
                                    <h1 className="text-pixel text-2xl tracking-widest text-transparent bg-clip-text bg-gradient-to-br from-[#ffffff] to-[#8888aa]">CODO</h1>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <span className="text-pixel text-[#6c63ff] text-xl transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#00ff88] drop-shadow-[0_0_8px_rgba(108,99,255,0.4)]">{"}"}</span>
                    </Link>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="text-[#8888aa] hover:text-[#e8e8f0] bg-[#12121a] border-2 border-[#2a2a3e] rounded-full p-1 absolute -right-3 top-5 z-50 transition-colors"
                    >
                        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-2 flex-1 overflow-y-auto overflow-x-hidden">
                    <NavItem href="/dashboard" icon={<Home size={20} />} label="Dashboard" isCollapsed={isCollapsed} />
                    <NavItem href="/map" icon={<Map size={20} />} label="World Map" isCollapsed={isCollapsed} />
                    <NavItem href="/cinema" icon={<Film size={20} />} label="AI Cinema" isCollapsed={isCollapsed} />
                    <NavItem href="/duel" icon={<Swords size={20} />} label="Code Duel" isCollapsed={isCollapsed} />
                    <NavItem href="/progress/graph" icon={<Brain size={20} />} label="Knowledge Graph" isCollapsed={isCollapsed} />
                    <NavItem href="/progress" icon={<TrendingUp size={20} />} label="Progress" isCollapsed={isCollapsed} />
                    <NavItem href="/progress/mistakes" icon={<Search size={20} />} label="Mistakes" isCollapsed={isCollapsed} />

                    <div className="border-t border-[#2a2a3e] my-2" />

                    <NavItem href="/leaderboard" icon={<Trophy size={20} />} label="Leaderboard" isCollapsed={isCollapsed} />
                    <NavItem href="/guild" icon={<Castle size={20} />} label="My Guild" isCollapsed={isCollapsed} />
                    <NavItem href="/quests" icon={<Scroll size={20} />} label="Quests" isCollapsed={isCollapsed} />
                    <NavItem href="/shop" icon={<ShoppingBag size={20} />} label="Shop" isCollapsed={isCollapsed} />

                    <div className="border-t border-[#2a2a3e] my-2" />

                    <NavItem href="/settings" icon={<Settings size={20} />} label="Settings" isCollapsed={isCollapsed} />
                    <NavItem href="/help" icon={<HelpCircle size={20} />} label="Help" isCollapsed={isCollapsed} />
                </nav>


            </aside>

            {/* Top Bar */}
            <header className={`fixed right-0 top-0 h-14 bg-[#12121a] border-b border-[#2a2a3e] z-40 flex items-center justify-between px-6 transition-all duration-300 ${isCollapsed ? 'left-20' : 'left-72'}`}>
                {/* Search */}
                <div className="flex-1 max-w-md" ref={searchRef}>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8888aa]" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setSearchFocused(true)}
                            placeholder="Search lessons, topics..."
                            className="w-full bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded px-10 py-2 text-mono text-sm text-[#e8e8f0] placeholder-[#8888aa] focus:border-[#6c63ff] focus:outline-none transition"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8888aa] hover:text-[#e8e8f0]">
                                <X size={14} />
                            </button>
                        )}
                        {/* Search Dropdown */}
                        <AnimatePresence>
                            {searchFocused && searchResults.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded shadow-xl z-50 overflow-hidden"
                                >
                                    {searchResults.map((result) => (
                                        <Link
                                            key={result.href}
                                            href={result.href}
                                            onClick={() => { setSearchQuery(''); setSearchFocused(false); }}
                                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#22223a] transition"
                                        >
                                            <span className="text-[#8888aa] flex justify-center w-6">{result.icon}</span>
                                            <span className="text-mono text-[#e8e8f0] text-sm">{result.label}</span>
                                        </Link>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Notifications Bell */}
                    <div className="relative">
                        <button
                            id="notifications-btn"
                            onClick={() => { setNotifOpen((p) => !p); setDropdownOpen(false); }}
                            className="relative p-2 hover:bg-[#22223a] rounded transition"
                        >
                            <Bell size={20} className="text-[#8888aa]" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-[#ff4d6d] rounded-full text-white text-[8px] flex items-center justify-center font-bold">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notifications Panel */}
                        <AnimatePresence>
                            {notifOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -4, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 top-full mt-2 w-80 bg-[#12121a] border-2 border-[#2a2a3e] rounded shadow-xl z-50"
                                >
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a3e]">
                                        <span className="text-pixel text-sm text-[#e8e8f0]">NOTIFICATIONS</span>
                                        <button onClick={markAllRead} className="text-mono text-[#6c63ff] text-xs hover:underline">
                                            Mark all read
                                        </button>
                                    </div>
                                    <div className="max-h-72 overflow-y-auto">
                                        {notifications.map((n) => (
                                            <div
                                                key={n.id}
                                                className={`flex items-start gap-3 px-4 py-3 border-b border-[#2a2a3e] last:border-0 hover:bg-[#1a1a2e] transition cursor-pointer ${!n.read ? 'bg-[#1a1a2e]' : ''}`}
                                                onClick={() => setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x))}
                                            >
                                                <span className="flex-shrink-0 w-8 flex justify-center text-[#8888aa] mt-0.5">{n.icon}</span>
                                                <div className="flex-1 min-w-0">
                                                    <div className={`text-mono text-sm ${n.read ? 'text-[#8888aa]' : 'text-[#e8e8f0]'}`}>{n.title}</div>
                                                    <div className="text-mono text-[#555570] text-xs mt-0.5">{n.time}</div>
                                                </div>
                                                {!n.read && <div className="w-2 h-2 bg-[#6c63ff] rounded-full flex-shrink-0 mt-1.5" />}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="px-4 py-2 border-t border-[#2a2a3e]">
                                        <Link href="/dashboard" onClick={() => setNotifOpen(false)} className="text-mono text-[#6c63ff] text-xs hover:underline">
                                            View all notifications →
                                        </Link>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Coins → Shop */}
                    <Link href="/shop" className="flex items-center gap-2 text-retro text-lg hover:opacity-80 transition">
                        <Coins size={20} className="text-[#ffd700]" />
                        <span className="text-[#ffd700]">0</span>
                    </Link>

                    {/* XP */}
                    <div className="flex items-center gap-2 text-retro text-lg">
                        <Zap size={20} className="text-[#6c63ff]" />
                        <span className="text-[#6c63ff]">0 XP</span>
                    </div>

                    {/* User Avatar Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            id="user-avatar-btn"
                            onClick={() => { setDropdownOpen((p) => !p); setNotifOpen(false); }}
                            className="flex items-center gap-1.5 hover:opacity-80 transition"
                        >
                            <div className="w-8 h-8 bg-[#6c63ff] rounded flex items-center justify-center text-white text-sm font-bold">
                                {user?.displayName?.[0]?.toUpperCase() ?? 'U'}
                            </div>
                            <ChevronDown size={14} className={`text-[#8888aa] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {dropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -4, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 top-full mt-2 w-48 bg-[#12121a] border-2 border-[#2a2a3e] rounded shadow-xl z-50 overflow-hidden"
                                >
                                    <div className="px-4 py-3 border-b border-[#2a2a3e]">
                                        <div className="text-retro text-[#e8e8f0] text-sm truncate">{user?.displayName ?? 'PLAYER'}</div>
                                        <div className="text-mono text-[#8888aa] text-xs truncate">{user?.email ?? ''}</div>
                                    </div>
                                    <Link
                                        href={`/profile/${user?.displayName ?? 'me'}`}
                                        onClick={() => setDropdownOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-[#8888aa] hover:bg-[#1a1a2e] hover:text-[#e8e8f0] transition"
                                    >
                                        <User size={16} />
                                        <span className="text-mono text-sm">View Profile</span>
                                    </Link>
                                    <Link
                                        href="/settings"
                                        onClick={() => setDropdownOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-[#8888aa] hover:bg-[#1a1a2e] hover:text-[#e8e8f0] transition"
                                    >
                                        <Settings size={16} />
                                        <span className="text-mono text-sm">Settings</span>
                                    </Link>
                                    <div className="border-t border-[#2a2a3e]">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-[#ff4d6d] hover:bg-[#ff4d6d15] transition"
                                        >
                                            <LogOut size={16} />
                                            <span className="text-mono text-sm">Log Out</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            {/* Backdrop for panels */}
            {(notifOpen || dropdownOpen) && (
                <div
                    className="fixed inset-0 z-30"
                    onClick={() => { setNotifOpen(false); setDropdownOpen(false); }}
                />
            )}

            {/* Main Content */}
            <main className={`mt-14 min-h-[calc(100vh-3.5rem)] transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-72'}`}>
                {children}
            </main>
        </div>
    );
}
