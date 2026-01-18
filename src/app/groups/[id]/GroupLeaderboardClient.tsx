'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DailyLog, LeaderboardEntry, TimeFrame } from '@/lib/types';
import Leaderboard from '@/components/Leaderboard';
import { ArrowLeft, Copy, Check, Users } from 'lucide-react';
import {
    calculateTotalPoints,
    calculatePointsForTimeframe,
    calculateWorkoutStreak,
    calculateCleanStreak,
} from '@/lib/calculations';
import { motion } from 'framer-motion';

interface GroupLeaderboardClientProps {
    group: any;
    members: any[];
    logs: DailyLog[];
    currentUserId: string;
}

export default function GroupLeaderboardClient({
    group,
    members,
    logs: initialLogs,
    currentUserId,
}: GroupLeaderboardClientProps) {
    const router = useRouter();
    const supabase = createClient();
    const [timeframe, setTimeframe] = useState<TimeFrame>('weekly');
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [logs, setLogs] = useState<DailyLog[]>(initialLogs);
    const [copied, setCopied] = useState(false);

    // Calculate leaderboard whenever timeframe or logs change
    useEffect(() => {
        const entries: LeaderboardEntry[] = members.map((member: any) => {
            const userLogs = logs.filter(log => log.user_id === member.user_id);

            let points = 0;
            if (timeframe === 'weekly') {
                points = calculatePointsForTimeframe(userLogs, 'weekly');
            } else if (timeframe === 'monthly') {
                points = calculatePointsForTimeframe(userLogs, 'monthly');
            } else {
                points = calculateTotalPoints(userLogs);
            }

            return {
                rank: 0, // Will be set after sorting
                user_id: member.user_id,
                username: member.users.username,
                avatar_url: member.users.avatar_url,
                points,
                workout_streak: calculateWorkoutStreak(userLogs),
                clean_streak: calculateCleanStreak(userLogs),
            };
        });

        // Sort by points and assign ranks
        entries.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            return a.username.localeCompare(b.username);
        });

        entries.forEach((entry, index) => {
            entry.rank = index + 1;
        });

        setLeaderboard(entries);
    }, [timeframe, logs, members]);

    // Subscribe to real-time updates
    useEffect(() => {
        const memberIds = members.map(m => m.user_id);

        const channel = supabase
            .channel('group-logs')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'daily_logs',
                    filter: `user_id=in.(${memberIds.join(',')})`,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setLogs(prev => [payload.new as DailyLog, ...prev]);
                    } else if (payload.eventType === 'UPDATE') {
                        setLogs(prev =>
                            prev.map(log =>
                                log.id === payload.new.id ? (payload.new as DailyLog) : log
                            )
                        );
                    } else if (payload.eventType === 'DELETE') {
                        setLogs(prev => prev.filter(log => log.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, members]);

    const handleCopyCode = () => {
        navigator.clipboard.writeText(group.invite_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <button
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-smooth"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </button>

                {/* Group Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-strong rounded-2xl p-6"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Users className="w-4 h-4" />
                                <span>{members.length} {members.length === 1 ? 'member' : 'members'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass rounded-xl p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Invite Code</p>
                            <p className="text-2xl font-bold tracking-wider">{group.invite_code}</p>
                        </div>
                        <button
                            onClick={handleCopyCode}
                            className="p-3 glass-strong rounded-lg hover-lift transition-smooth"
                            title="Copy invite code"
                        >
                            {copied ? (
                                <Check className="w-5 h-5 text-green-400" />
                            ) : (
                                <Copy className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </motion.div>

                {/* Leaderboard */}
                <Leaderboard
                    entries={leaderboard}
                    currentUserId={currentUserId}
                    timeframe={timeframe}
                    onTimeframeChange={setTimeframe}
                />
            </div>
        </div>
    );
}
