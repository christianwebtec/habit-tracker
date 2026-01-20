'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share, PlusSquare, MoreVertical, Download } from 'lucide-react';

interface InstallPromptProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function InstallPrompt({ isOpen, onClose }: InstallPromptProps) {
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream);
        setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
    }, []);

    // Don't show if already installed/standalone
    if (isStandalone) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-sm glass-strong rounded-2xl p-6 shadow-2xl"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Download className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Install App</h3>
                            <p className="text-sm text-muted-foreground">
                                Install Habit Tracker on your home screen for quick access and a better experience.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {isIOS ? (
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-3 p-3 glass rounded-xl">
                                        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                            <Share className="w-5 h-5" />
                                        </div>
                                        <span>1. Tap the <span className="font-bold">Share</span> button</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 glass rounded-xl">
                                        <div className="p-2 bg-gray-500/20 rounded-lg text-gray-300">
                                            <PlusSquare className="w-5 h-5" />
                                        </div>
                                        <span>2. Select <span className="font-bold">Add to Home Screen</span></span>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-3 p-3 glass rounded-xl">
                                        <div className="p-2 bg-gray-500/20 rounded-lg text-gray-300">
                                            <MoreVertical className="w-5 h-5" />
                                        </div>
                                        <span>1. Tap the <span className="font-bold">Menu</span> (three dots)</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 glass rounded-xl">
                                        <div className="p-2 bg-gray-500/20 rounded-lg text-gray-300">
                                            <Download className="w-5 h-5" />
                                        </div>
                                        <span>2. Select <span className="font-bold">Install App</span> or <span className="font-bold">Add to Home Screen</span></span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full mt-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity"
                        >
                            Got it
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
