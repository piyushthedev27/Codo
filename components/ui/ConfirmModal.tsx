'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    children?: ReactNode;
}

export default function ConfirmModal({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    danger = false,
    onConfirm,
    onCancel,
    children,
}: ConfirmModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 z-[100]"
                        onClick={onCancel}
                    />
                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div
                            className="pointer-events-auto w-full max-w-md bg-[#12121a] border-2 rounded p-6"
                            style={{ borderColor: danger ? '#ff4d6d' : '#6c63ff' }}
                        >
                            {/* Header */}
                            <div className="flex items-start gap-3 mb-4">
                                {danger && (
                                    <div className="w-10 h-10 bg-red-900/40 border border-red-500/50 rounded flex items-center justify-center flex-shrink-0">
                                        <AlertTriangle size={20} className="text-red-400" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h2 className="text-pixel text-[#e8e8f0] text-lg">{title}</h2>
                                    <p className="text-mono text-[#8888aa] text-sm mt-2">{message}</p>
                                </div>
                                <button onClick={onCancel} className="text-[#8888aa] hover:text-[#e8e8f0] transition">
                                    <X size={18} />
                                </button>
                            </div>

                            {children && <div className="mb-4">{children}</div>}

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={onCancel}
                                    className="flex-1 py-2 border-2 border-[#2a2a3e] text-[#8888aa] rounded text-retro hover:border-[#3a3a4e] hover:text-[#e8e8f0] transition"
                                >
                                    {cancelLabel}
                                </button>
                                <button
                                    onClick={onConfirm}
                                    className="flex-1 py-2 rounded text-retro transition"
                                    style={
                                        danger
                                            ? { background: '#ff4d6d', color: 'white' }
                                            : { background: '#6c63ff', color: 'white' }
                                    }
                                >
                                    {confirmLabel}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
