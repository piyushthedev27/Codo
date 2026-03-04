'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Map, Film, Swords, Brain, TrendingUp, Search, Bell, Coins, Zap, Castle, Settings, HelpCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    const pathname = usePathname();
    const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded transition-all ${isActive
                    ? 'bg-[#1a1a2e] text-[#6c63ff] border-l-2 border-[#6c63ff] glow-purple'
                    : 'text-[#8888aa] hover:bg-[#22223a] hover:text-[#e8e8f0] hover:border-l-2 hover:border-[#6c63ff]'
                }`}
        >
            {icon}
            <span className="text-retro text-lg">{label}</span>
        </Link>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] pixel-grid-bg">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 bottom-0 w-60 bg-[#12121a] border-r-2 border-[#2a2a3e] z-50">
                {/* Logo */}
                <div className="p-6 border-b border-[#2a2a3e]">
                    <Link href="/">
                        <h1 className="text-pixel text-[#6c63ff] text-xl glow-purple">CODO</h1>
                    </Link>
                </div>

                {/* User Info */}
                <div className="p-4 border-b border-[#2a2a3e]">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-[#6c63ff] rounded border-2 border-[#6c63ff] flex items-center justify-center text-white text-sm font-bold">
                            {user?.displayName?.[0]?.toUpperCase() ?? 'U'}
                        </div>
                        <div>
                            <div className="text-retro text-[#e8e8f0] text-lg">{user?.displayName ?? 'PLAYER'}</div>
                            <div className="text-retro text-[#8888aa] text-sm">Level 1</div>
                        </div>
                    </div>
                    <div className="bg-[#2a2a3e] h-3 rounded overflow-hidden">
                        <div className="bg-[#6c63ff] h-full" style={{ width: '10%' }} />
                    </div>
                    <div className="text-retro text-[#8888aa] text-xs mt-1">0 / 1,000 XP</div>
                </div>

                {/* Navigation */}
                <nav className="p-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                    <NavItem href="/dashboard" icon={<Home size={20} />} label="Dashboard" />
                    <NavItem href="/map" icon={<Map size={20} />} label="World Map" />
                    <NavItem href="/cinema" icon={<Film size={20} />} label="AI Cinema" />
                    <NavItem href="/duel" icon={<Swords size={20} />} label="Code Duel" />
                    <NavItem href="/progress/graph" icon={<Brain size={20} />} label="Knowledge Graph" />
                    <NavItem href="/progress" icon={<TrendingUp size={20} />} label="Progress" />
                    <NavItem href="/progress/mistakes" icon={<Search size={20} />} label="Mistakes" />

                    <div className="border-t border-[#2a2a3e] my-2" />

                    <NavItem href="/leaderboard" icon={<span className="text-lg">🏆</span>} label="Leaderboard" />
                    <NavItem href="/guild" icon={<Castle size={20} />} label="My Guild" />

                    <div className="border-t border-[#2a2a3e] my-2" />

                    <NavItem href="/settings" icon={<Settings size={20} />} label="Settings" />
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-[#8888aa] hover:bg-[#22223a] hover:text-[#e8e8f0] rounded transition-all"
                    >
                        <HelpCircle size={20} />
                        <span className="text-retro text-lg">Logout</span>
                    </button>
                </nav>

                {/* Bottom Stats */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#2a2a3e] bg-[#12121a]">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-[#00ff88] rounded" />
                        <div>
                            <div className="text-retro text-[#e8e8f0] text-sm">ByteBuddy</div>
                            <div className="text-retro text-[#8888aa] text-xs">😊 Happy</div>
                        </div>
                    </div>
                    <div className="text-retro text-[#ffd700] text-sm">🔥 7 day streak</div>
                </div>
            </aside>

            {/* Top Bar */}
            <header className="fixed left-60 right-0 top-0 h-14 bg-[#12121a] border-b border-[#2a2a3e] z-40 flex items-center justify-between px-6">
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8888aa]" size={18} />
                        <input
                            type="text"
                            placeholder="Search lessons, topics..."
                            className="w-full bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded px-10 py-2 text-mono text-sm text-[#e8e8f0] placeholder-[#8888aa] focus:border-[#6c63ff] focus:outline-none"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button className="relative p-2 hover:bg-[#22223a] rounded transition">
                        <Bell size={20} className="text-[#8888aa]" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-[#ff4d6d] rounded-full" />
                    </button>
                    <div className="flex items-center gap-2 text-retro text-lg">
                        <Coins size={20} className="text-[#ffd700]" />
                        <span className="text-[#ffd700]">0</span>
                    </div>
                    <div className="flex items-center gap-2 text-retro text-lg">
                        <Zap size={20} className="text-[#6c63ff]" />
                        <span className="text-[#6c63ff]">0 XP</span>
                    </div>
                    <Link href={`/profile/${user?.displayName ?? 'me'}`}>
                        <div className="w-8 h-8 bg-[#6c63ff] rounded flex items-center justify-center text-white text-sm font-bold">
                            {user?.displayName?.[0]?.toUpperCase() ?? 'U'}
                        </div>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="ml-60 mt-14 min-h-[calc(100vh-3.5rem)]">
                {children}
            </main>
        </div>
    );
}
