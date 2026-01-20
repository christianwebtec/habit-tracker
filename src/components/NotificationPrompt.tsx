'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { requestNotificationPermission, markNotificationPromptShown } from '@/lib/notifications';

interface NotificationPromptProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NotificationPrompt({ isOpen, onClose }: NotificationPromptProps) {
    const handleEnable = async () => {
        const granted = await requestNotificationPermission();
        markNotificationPromptShown();
        onClose();

        if (granted) {
            // Show a test notification
            new Notification('Notifications Enabled! 🎉', {
                body: 'You\'ll now get notified when your friends log workouts',
                icon: '/icons/icon-192x192.png',
            });
        }
    };

    const handleDismiss = () => {
        markNotificationPromptShown();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleDismiss}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="glass-strong rounded-2xl p-6 max-w-md w-full pointer-events-auto"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                                        <Bell className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">Stay Motivated!</h3>
                                        <p className="text-sm text-muted-foreground">Enable notifications</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleDismiss}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-smooth"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4 mb-6">
                                <p className="text-muted-foreground">
                                    Get notified when your group members log workouts and stay accountable together!
                                </p>

                                <div className="glass rounded-lg p-4 space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        <p className="text-sm">Real-time workout updates</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        <p className="text-sm">Group accountability</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        <p className="text-sm">Stay motivated together</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleDismiss}
                                    className="flex-1 px-4 py-3 glass rounded-lg hover-lift transition-smooth"
                                >
                                    Maybe Later
                                </button>
                                <button
                                    onClick={handleEnable}
                                    className="flex-1 px-4 py-3 gradient-primary text-white font-semibold rounded-lg hover-lift transition-smooth"
                                >
                                    Enable
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
