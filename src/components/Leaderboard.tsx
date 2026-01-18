'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp, Flame } from 'lucide-react';
import { LeaderboardEntry, TimeFrame } from '@/lib/types';

interface LeaderboardProps {
    entries: LeaderboardEntry[];
    currentUserId?: string;
    timeframe: TimeFrame;
    onTimeframeChange: (timeframe: TimeFrame) => void;
}

export default function Leaderboard({
    entries,
    currentUserId,
    timeframe,
    onTimeframeChange,
}: LeaderboardProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const timeframes: { value: TimeFrame; label: string }[] = [
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'all-time', label: 'All-Time' },
    ];

    const getRankColor = (rank: number) => {
        if (rank === 1) return 'text-yellow-400';
        if (rank === 2) return 'text-gray-300';
        if (rank === 3) return 'text-amber-600';
        return 'text-muted-foreground';
    };

    const getRankIcon = (rank: number) => {
        if (rank <= 3) {
            return <Trophy className={`w-5 h-5 ${getRankColor(rank)}`} />;
        }
        return <span className="text-muted-foreground font-semibold">#{rank}</span>;
    };

    if (!mounted) return null;

    return (
        <div className="space-y-6">
            {/* Timeframe Tabs */}
            <div className="flex gap-2 p-1 glass-strong rounded-xl">
                {timeframes.map(({ value, label }) => (
                    <button
                        key={value}
                        onClick={() => onTimeframeChange(value)}
                        className={`
              flex-1 px-4 py-2 rounded-lg font-medium text-sm
              transition-all duration-200
              ${timeframe === value
                                ? 'bg-primary text-primary-foreground shadow-lg'
                                : 'text-muted-foreground hover:text-foreground'
                            }
            `}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Leaderboard List */}
            <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                    {entries.map((entry, index) => {
                        const isCurrentUser = entry.user_id === currentUserId;

                        return (
                            <motion.div
                                key={entry.user_id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: index * 0.05 }}
                                className={`
                  glass-strong rounded-xl p-4
                  transition-all duration-200
                  ${isCurrentUser
                                        ? 'ring-2 ring-primary shadow-lg shadow-primary/20'
                                        : 'hover:glass'
                                    }
                `}
                            >
                                <div className="flex items-center gap-4">
                                    {/* Rank */}
                                    <div className="flex items-center justify-center w-10">
                                        {getRankIcon(entry.rank)}
                                    </div>

                                    {/* Avatar */}
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
                                        {entry.username.charAt(0).toUpperCase()}
                                    </div>

                                    {/* User Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-semibold truncate ${isCurrentUser ? 'text-primary' : ''}`}>
                                            {entry.username}
                                            {isCurrentUser && (
                                                <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                                            )}
                                        </p>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <TrendingUp className="w-3 h-3" />
                                                {entry.workout_streak}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Flame className="w-3 h-3" />
                                                {entry.clean_streak}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Points */}
                                    <div className="text-right">
                                        <p className={`
                      text-2xl font-bold
                      ${entry.points > 0 ? 'text-green-400' : entry.points < 0 ? 'text-red-400' : 'text-gray-400'}
                    `}>
                                            {entry.points > 0 ? '+' : ''}{entry.points}
                                        </p>
                                        <p className="text-xs text-muted-foreground">points</p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {entries.length === 0 && (
                    <div className="glass-strong rounded-xl p-12 text-center">
                        <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">No entries yet</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Start logging to appear on the leaderboard!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
