'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/ToastProvider';
import { User, Shield, Bell, Globe, Key, Github, Download, Trash2 } from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { motion, AnimatePresence } from 'motion/react';

const SECTIONS = [
    { id: 'profile', label: 'PROFILE', icon: <User size={18} /> },
    { id: 'account', label: 'ACCOUNT', icon: <Shield size={18} /> },
    { id: 'notifications', label: 'ALERTS', icon: <Bell size={18} /> },
    { id: 'preferences', label: 'PREFERS', icon: <Globe size={18} /> },
] as const;

export default function SettingsPage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const { showSuccess, showInfo } = useToast();

    type Section = typeof SECTIONS[number]['id'];
    const [activeSection, setActiveSection] = useState<Section>('profile');
    const [isSaving, setIsSaving] = useState(false);

    // Toggle states
    const [toggles, setToggles] = useState({
        emailMarketing: false,
        emailActivity: true,
        pushQuests: true,
        pushGuild: true,
        twoFactor: false,
        publicProfile: true,
    });

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise((r) => setTimeout(r, 800));
        setIsSaving(false);
        showSuccess('Settings Saved', 'Your preferences have been updated successfully.');
    };

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    const toggleSetting = (key: keyof typeof toggles) => {
        setToggles((p) => ({ ...p, [key]: !p[key] }));
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-pixel text-2xl text-[#e8e8f0] mb-6">⚙️ SETTINGS</h1>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-56 flex-shrink-0">
                    <div className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded p-2 sticky top-24">
                        {SECTIONS.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setActiveSection(s.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded text-retro text-sm transition mb-1 ${activeSection === s.id
                                    ? 'bg-[#6c63ff] text-white glow-purple'
                                    : 'text-[#8888aa] hover:bg-[#22223a] hover:text-[#e8e8f0]'
                                    }`}
                            >
                                {s.icon}
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded p-6 min-h-[500px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-8"
                        >
                            {/* PROFILE SECTION */}
                            {activeSection === 'profile' && (
                                <>
                                    <div>
                                        <h2 className="text-pixel text-lg text-[#e8e8f0] mb-4">PUBLIC PROFILE</h2>
                                        <p className="text-mono text-[#8888aa] text-sm mb-6">This information will be displayed on your public profile card.</p>

                                        <div className="space-y-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-[#6c63ff] border-2 border-[#7c73ff] rounded flex items-center justify-center text-white text-2xl font-bold">
                                                    {user?.displayName?.[0]?.toUpperCase() ?? 'U'}
                                                </div>
                                                <button className="px-4 py-2 border border-[#6c63ff] text-[#6c63ff] rounded text-retro text-sm hover:bg-[#6c63ff22] transition">
                                                    CHANGE AVATAR
                                                </button>
                                            </div>

                                            <div>
                                                <label className="block text-retro text-[#8888aa] mb-2 text-sm">DISPLAY NAME</label>
                                                <input
                                                    defaultValue={user?.displayName ?? ''}
                                                    placeholder="HeroCoder99"
                                                    className="w-full bg-[#12121a] border-2 border-[#2a2a3e] rounded px-4 py-2 text-mono text-[#e8e8f0] focus:border-[#6c63ff] focus:outline-none transition max-w-md"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-retro text-[#8888aa] mb-2 text-sm">BIO</label>
                                                <textarea
                                                    rows={3}
                                                    placeholder="Tell the community about yourself... (e.g., Learning Python, love indie games)"
                                                    className="w-full bg-[#12121a] border-2 border-[#2a2a3e] rounded px-4 py-2 text-mono text-[#e8e8f0] focus:border-[#6c63ff] focus:outline-none transition max-w-md resize-none"
                                                />
                                            </div>

                                            <div className="flex items-center gap-3 bg-[#12121a] p-4 rounded border border-[#2a2a3e] max-w-md">
                                                <div className="flex-1">
                                                    <div className="text-mono text-[#e8e8f0] text-sm">Public Profile</div>
                                                    <div className="text-mono text-[#8888aa] text-xs mt-1">Allow others to see your stats & achievements.</div>
                                                </div>
                                                <button
                                                    onClick={() => toggleSetting('publicProfile')}
                                                    className={`w-12 h-6 rounded-full p-1 transition-colors ${toggles.publicProfile ? 'bg-[#00ff88]' : 'bg-[#3a3a4e]'}`}
                                                >
                                                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${toggles.publicProfile ? 'translate-x-6' : 'translate-x-0'}`} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="border-t border-[#2a2a3e] pt-6">
                                        <button onClick={handleSave} disabled={isSaving} className="px-8 py-2.5 bg-[#6c63ff] text-white rounded text-retro hover:bg-[#7c73ff] transition disabled:opacity-50">
                                            {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* ACCOUNT SECTION */}
                            {activeSection === 'account' && (
                                <>
                                    <div>
                                        <h2 className="text-pixel text-lg text-[#e8e8f0] mb-4">ACCOUNT SECURITY</h2>
                                        <p className="text-mono text-[#8888aa] text-sm mb-6">Manage your login methods and security settings.</p>

                                        <div className="space-y-6">
                                            {/* Email Address */}
                                            <div>
                                                <label className="block text-retro text-[#8888aa] mb-2 text-sm">EMAIL ADDRESS</label>
                                                <div className="flex items-center gap-2 max-w-md">
                                                    <input
                                                        value={user?.email ?? ''}
                                                        readOnly
                                                        className="flex-1 bg-[#12121a] border-2 border-[#2a2a3e] rounded px-4 py-2 text-mono text-[#e8e8f0] opacity-70 cursor-not-allowed"
                                                    />
                                                    <button className="px-4 py-2 border border-[#6c63ff] text-[#6c63ff] rounded text-retro text-sm hover:bg-[#6c63ff22] transition">
                                                        CHANGE
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Password */}
                                            <div>
                                                <label className="block text-retro text-[#8888aa] mb-2 text-sm">PASSWORD</label>
                                                <button
                                                    onClick={() => showInfo('Password Reset', 'A password reset link would be sent to your email.')}
                                                    className="flex items-center gap-2 px-4 py-2 bg-[#12121a] border-2 border-[#2a2a3e] text-[#e8e8f0] rounded text-retro text-sm hover:border-[#6c63ff] transition"
                                                >
                                                    <Key size={16} className="text-[#6c63ff]" />
                                                    CHANGE PASSWORD
                                                </button>
                                            </div>

                                            <div className="border-t border-[#2a2a3e] my-6" />

                                            <h3 className="text-retro text-[#e8e8f0] text-sm mb-4">CONNECTED ACCOUNTS</h3>
                                            <div className="space-y-3 max-w-md">
                                                <div className="flex items-center justify-between bg-[#12121a] p-3 rounded border border-[#2a2a3e]">
                                                    <div className="flex items-center gap-3">
                                                        <Github size={20} className="text-[#e8e8f0]" />
                                                        <span className="text-mono text-sm text-[#e8e8f0]">GitHub</span>
                                                    </div>
                                                    <button className="text-mono text-xs text-[#6c63ff] hover:underline">Connect</button>
                                                </div>
                                                <div className="flex items-center justify-between bg-[#12121a] p-3 rounded border border-[#2a2a3e]">
                                                    <div className="flex items-center gap-3">
                                                        <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                                        <span className="text-mono text-sm text-[#e8e8f0]">Google</span>
                                                    </div>
                                                    <button className="text-mono text-xs text-[#8888aa]">Connected</button>
                                                </div>
                                            </div>

                                            <div className="border-t border-[#2a2a3e] my-6" />

                                            {/* Data & Deletion */}
                                            <h3 className="text-retro text-[#e8e8f0] text-sm mb-4">DATA & PRIVACY</h3>
                                            <div className="space-y-3 max-w-md">
                                                <button
                                                    onClick={() => showSuccess('Export Started', 'Your data is being compiled and will be emailed to you.')}
                                                    className="w-full flex items-center justify-between bg-[#12121a] p-3 rounded border border-[#2a2a3e] hover:border-[#6c63ff] transition group"
                                                >
                                                    <span className="text-mono text-sm text-[#e8e8f0]">Export Account Data</span>
                                                    <Download size={16} className="text-[#8888aa] group-hover:text-[#6c63ff] transition" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteModalOpen(true)}
                                                    className="w-full flex items-center justify-between bg-[#ff4d6d15] p-3 rounded border border-[#ff4d6d40] hover:bg-[#ff4d6d25] transition group"
                                                >
                                                    <span className="text-mono text-sm text-[#ff4d6d]">Delete Account</span>
                                                    <Trash2 size={16} className="text-[#ff4d6d] opacity-70 group-hover:opacity-100 transition" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-[#2a2a3e] pt-6 mt-8">
                                        <button onClick={handleLogout} className="px-6 py-2.5 bg-[#2a2a3e] text-[#e8e8f0] rounded text-retro hover:bg-[#3a3a4e] transition">
                                            SIGN OUT
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* NOTIFICATIONS SECTION */}
                            {activeSection === 'notifications' && (
                                <>
                                    <div>
                                        <h2 className="text-pixel text-lg text-[#e8e8f0] mb-4">NOTIFICATION PREFERENCES</h2>
                                        <p className="text-mono text-[#8888aa] text-sm mb-6">Choose what you want to be notified about.</p>

                                        <div className="space-y-6 max-w-md">
                                            {/* Email */}
                                            <div>
                                                <h3 className="text-retro text-[#e8e8f0] text-sm mb-3">EMAIL</h3>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between bg-[#12121a] p-3 rounded border border-[#2a2a3e]">
                                                        <div className="flex-1">
                                                            <div className="text-mono text-sm text-[#e8e8f0]">Platform Activity</div>
                                                            <div className="text-mono text-xs text-[#8888aa] mt-0.5">Guild invites, duel requests, etc.</div>
                                                        </div>
                                                        <button onClick={() => toggleSetting('emailActivity')} className={`w-10 h-5 rounded-full p-1 transition-colors ${toggles.emailActivity ? 'bg-[#00ff88]' : 'bg-[#3a3a4e]'}`}>
                                                            <div className={`w-3 h-3 bg-white rounded-full transition-transform ${toggles.emailActivity ? 'translate-x-5' : 'translate-x-0'}`} />
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center justify-between bg-[#12121a] p-3 rounded border border-[#2a2a3e]">
                                                        <div className="flex-1">
                                                            <div className="text-mono text-sm text-[#e8e8f0]">Marketing & News</div>
                                                            <div className="text-mono text-xs text-[#8888aa] mt-0.5">Feature updates, offers, newsletters.</div>
                                                        </div>
                                                        <button onClick={() => toggleSetting('emailMarketing')} className={`w-10 h-5 rounded-full p-1 transition-colors ${toggles.emailMarketing ? 'bg-[#00ff88]' : 'bg-[#3a3a4e]'}`}>
                                                            <div className={`w-3 h-3 bg-white rounded-full transition-transform ${toggles.emailMarketing ? 'translate-x-5' : 'translate-x-0'}`} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Push/In-app */}
                                            <div>
                                                <h3 className="text-retro text-[#e8e8f0] text-sm mb-3">IN-APP ALERTS</h3>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between bg-[#12121a] p-3 rounded border border-[#2a2a3e]">
                                                        <div className="flex-1">
                                                            <div className="text-mono text-sm text-[#e8e8f0]">Quests & Streaks</div>
                                                            <div className="text-mono text-xs text-[#8888aa] mt-0.5">Reminders to maintain your daily streak.</div>
                                                        </div>
                                                        <button onClick={() => toggleSetting('pushQuests')} className={`w-10 h-5 rounded-full p-1 transition-colors ${toggles.pushQuests ? 'bg-[#00ff88]' : 'bg-[#3a3a4e]'}`}>
                                                            <div className={`w-3 h-3 bg-white rounded-full transition-transform ${toggles.pushQuests ? 'translate-x-5' : 'translate-x-0'}`} />
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center justify-between bg-[#12121a] p-3 rounded border border-[#2a2a3e]">
                                                        <div className="flex-1">
                                                            <div className="text-mono text-sm text-[#e8e8f0]">Guild Chat & Events</div>
                                                            <div className="text-mono text-xs text-[#8888aa] mt-0.5">Mentions and new guild events.</div>
                                                        </div>
                                                        <button onClick={() => toggleSetting('pushGuild')} className={`w-10 h-5 rounded-full p-1 transition-colors ${toggles.pushGuild ? 'bg-[#00ff88]' : 'bg-[#3a3a4e]'}`}>
                                                            <div className={`w-3 h-3 bg-white rounded-full transition-transform ${toggles.pushGuild ? 'translate-x-5' : 'translate-x-0'}`} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="border-t border-[#2a2a3e] pt-6 mt-8">
                                        <button onClick={handleSave} disabled={isSaving} className="px-8 py-2.5 bg-[#6c63ff] text-white rounded text-retro hover:bg-[#7c73ff] transition disabled:opacity-50">
                                            {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* PREFERENCES SECTION */}
                            {activeSection === 'preferences' && (
                                <>
                                    <div>
                                        <h2 className="text-pixel text-lg text-[#e8e8f0] mb-4">GLOBAL PREFERENCES</h2>
                                        <p className="text-mono text-[#8888aa] text-sm mb-6">Customize your platform experience.</p>

                                        <div className="space-y-6 max-w-md">
                                            <div>
                                                <label className="block text-retro text-[#8888aa] mb-2 text-sm">LANGUAGE</label>
                                                <div className="relative">
                                                    <select className="appearance-none w-full bg-[#12121a] border-2 border-[#2a2a3e] rounded px-4 py-3 text-mono text-[#e8e8f0] focus:border-[#6c63ff] focus:outline-none transition cursor-pointer">
                                                        <option value="en">English (US)</option>
                                                        <option value="es">Español</option>
                                                        <option value="fr">Français</option>
                                                        <option value="ja">日本語 (Japanese)</option>
                                                    </select>
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8888aa] pointer-events-none">▼</div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-retro text-[#8888aa] mb-2 text-sm">EDITOR THEME</label>
                                                <div className="relative">
                                                    <select className="appearance-none w-full bg-[#12121a] border-2 border-[#2a2a3e] rounded px-4 py-3 text-mono text-[#e8e8f0] focus:border-[#6c63ff] focus:outline-none transition cursor-pointer">
                                                        <option value="vs-dark">VS Code Dark</option>
                                                        <option value="monokai">Monokai</option>
                                                        <option value="dracula">Dracula</option>
                                                        <option value="github-dark">GitHub Dark</option>
                                                    </select>
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8888aa] pointer-events-none">▼</div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-retro text-[#8888aa] mb-2 text-sm">SOUND EFFECTS</label>
                                                <div className="flex items-center gap-3 bg-[#12121a] p-4 rounded border border-[#2a2a3e]">
                                                    <div className="flex-1">
                                                        <div className="text-mono text-[#e8e8f0] text-sm">Enable SFX</div>
                                                        <div className="text-mono text-[#8888aa] text-xs mt-1">Play sounds on level up, purchase, etc.</div>
                                                    </div>
                                                    <button className="w-12 h-6 rounded-full p-1 bg-[#00ff88] transition-colors">
                                                        <div className="w-4 h-4 bg-white rounded-full translate-x-6 transition-transform" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="border-t border-[#2a2a3e] pt-6 mt-8">
                                        <button onClick={handleSave} disabled={isSaving} className="px-8 py-2.5 bg-[#6c63ff] text-white rounded text-retro hover:bg-[#7c73ff] transition disabled:opacity-50">
                                            {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Modals */}
            <ConfirmModal
                isOpen={deleteModalOpen}
                title="DELETE ACCOUNT?"
                message="Are you completely sure? This action is irreversible. All your XP, coins, items, and progress will be lost forever."
                confirmLabel="YES, DELETE MY DATA"
                onConfirm={() => {
                    setDeleteModalOpen(false);
                    showSuccess('Account deletion requested', 'Check your email for confirmation.');
                }}
                onCancel={() => setDeleteModalOpen(false)}
            />
        </div>
    );
}
