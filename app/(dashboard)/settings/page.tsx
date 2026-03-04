'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function SettingsPage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [activeSection, setActiveSection] = useState('profile');

    const sections = ['profile', 'account', 'notifications', 'appearance'];

    const handleLogout = async () => {
        await logout();
        router.push('/');
        toast.success('Logged out successfully!');
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-pixel text-2xl text-[#6c63ff] mb-6">⚙️ SETTINGS</h1>
            <div className="flex gap-4">
                {/* Sidebar */}
                <div className="w-48 flex-shrink-0">
                    <div className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded p-2">
                        {sections.map((s) => (
                            <button
                                key={s}
                                onClick={() => setActiveSection(s)}
                                className={`w-full text-left px-3 py-2 rounded text-retro text-lg transition mb-1 ${activeSection === s ? 'bg-[#6c63ff] text-white' : 'text-[#8888aa] hover:bg-[#22223a] hover:text-[#e8e8f0]'}`}
                            >
                                {s.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded p-6">
                    {activeSection === 'profile' && (
                        <div className="space-y-4">
                            <h2 className="text-pixel text-sm mb-4">PROFILE SETTINGS</h2>
                            {[
                                { label: 'Display Name', value: user?.displayName ?? '', placeholder: 'Your display name' },
                                { label: 'Email', value: user?.email ?? '', placeholder: 'your@email.com', readOnly: true },
                                { label: 'Bio', value: '', placeholder: 'Tell the world about yourself...' },
                            ].map((field, i) => (
                                <div key={i}>
                                    <label className="block text-retro text-[#8888aa] mb-2">{field.label}</label>
                                    <input
                                        defaultValue={field.value}
                                        readOnly={field.readOnly}
                                        placeholder={field.placeholder}
                                        className={`w-full bg-[#12121a] border-2 border-[#2a2a3e] rounded px-4 py-3 text-mono text-[#e8e8f0] focus:border-[#6c63ff] focus:outline-none transition ${field.readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    />
                                </div>
                            ))}
                            <button className="px-6 py-2 bg-[#6c63ff] text-white rounded text-retro hover:bg-[#7c73ff] transition">SAVE CHANGES</button>
                        </div>
                    )}

                    {activeSection === 'account' && (
                        <div className="space-y-4">
                            <h2 className="text-pixel text-sm mb-4">ACCOUNT SETTINGS</h2>
                            <div className="bg-[#ff4d6d22] border border-[#ff4d6d] rounded p-4">
                                <h3 className="text-retro text-[#ff4d6d] text-lg mb-2">DANGER ZONE</h3>
                                <p className="text-mono text-[#8888aa] text-sm mb-4">Logging out will end your current session.</p>
                                <button onClick={handleLogout} className="px-6 py-2 bg-[#ff4d6d] text-white rounded text-retro hover:bg-[#ff6d8d] transition">
                                    LOGOUT
                                </button>
                            </div>
                        </div>
                    )}

                    {(activeSection === 'notifications' || activeSection === 'appearance') && (
                        <div className="text-center py-12 text-mono text-[#8888aa]">
                            <div className="text-4xl mb-3">🚧</div>
                            <div className="text-retro text-xl">{activeSection.toUpperCase()} SETTINGS</div>
                            <div className="text-sm mt-2">Coming soon in the next update!</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
