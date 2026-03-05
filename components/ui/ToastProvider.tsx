'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'achievement';

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
}

interface ToastContextValue {
    showToast: (type: ToastType, title: string, message?: string) => void;
    showSuccess: (title: string, message?: string) => void;
    showError: (title: string, message?: string) => void;
    showInfo: (title: string, message?: string) => void;
    showAchievement: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}

const TOAST_COLORS: Record<ToastType, { border: string; icon: string; bg: string }> = {
    success: { border: '#00ff88', icon: '#00ff88', bg: '#00ff8815' },
    error: { border: '#ff4d6d', icon: '#ff4d6d', bg: '#ff4d6d15' },
    info: { border: '#6c63ff', icon: '#6c63ff', bg: '#6c63ff15' },
    achievement: { border: '#ffd700', icon: '#ffd700', bg: '#ffd70015' },
};

const TOAST_ICONS: Record<ToastType, ReactNode> = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    info: <Info size={20} />,
    achievement: <div className="text-xl">🏆</div>,
};

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback((type: ToastType, title: string, message?: string) => {
        const id = Math.random().toString(36).slice(2);
        setToasts((prev) => [...prev, { id, type, title, message }]);
        setTimeout(() => removeToast(id), 4000);
    }, [removeToast]);

    const showSuccess = useCallback((title: string, message?: string) => showToast('success', title, message), [showToast]);
    const showError = useCallback((title: string, message?: string) => showToast('error', title, message), [showToast]);
    const showInfo = useCallback((title: string, message?: string) => showToast('info', title, message), [showToast]);
    const showAchievement = useCallback((title: string, message?: string) => showToast('achievement', title, message), [showToast]);

    return (
        <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, showAchievement }}>
            {children}
            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => {
                        const colors = TOAST_COLORS[toast.type];
                        return (
                            <motion.div
                                key={toast.id}
                                initial={{ opacity: 0, x: 60, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 60, scale: 0.9 }}
                                transition={{ duration: 0.25 }}
                                className="pointer-events-auto min-w-[280px] max-w-sm rounded border-2 p-4"
                                style={{ borderColor: colors.border, background: `#12121a`, boxShadow: `0 0 16px ${colors.border}40` }}
                            >
                                <div className="flex items-start gap-3">
                                    <span style={{ color: colors.icon }} className="mt-0.5 flex-shrink-0">
                                        {TOAST_ICONS[toast.type]}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-retro text-[#e8e8f0] text-sm">{toast.title}</div>
                                        {toast.message && (
                                            <div className="text-mono text-[#8888aa] text-xs mt-1">{toast.message}</div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => removeToast(toast.id)}
                                        className="text-[#8888aa] hover:text-[#e8e8f0] transition flex-shrink-0"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}
