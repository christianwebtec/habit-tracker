'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { DailyLog, UserStats } from '@/lib/types';
import DailyCheckIn from '@/components/DailyCheckIn';
import StatsCard from '@/components/StatsCard';
import {
    Trophy,
    TrendingUp,
    Calendar,
    Flame,
    Dumbbell,
    LogOut,
    Users,
    Plus,
    Download
} from 'lucide-react';
import {
    calculateTotalPoints,
    calculatePointsForTimeframe,
    calculateWorkoutStreak,
    calculateCleanStreak,
    getTodayLog,
} from '@/lib/calculations';
import { motion } from 'framer-motion';
import InstallPrompt from '@/components/InstallPrompt';
import NotificationPrompt from '@/components/NotificationPrompt';
import { hasShownNotificationPrompt, hasNotificationPermission, showNotification } from '@/lib/notifications';

interface DashboardClientProps {
    user: User;
    profile: any;
    initialLogs: DailyLog[];
    groups: any[];
}

export default function DashboardClient({
    user,
    profile,
    initialLogs,
    groups,
}: DashboardClientProps) {
    const router = useRouter();
    const supabase = createClient();
    const [logs, setLogs] = useState<DailyLog[]>(initialLogs);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

    // Calculate stats whenever logs change
    useEffect(() => {
        const newStats: UserStats = {
            user_id: user.id,
            username: profile?.username || 'User',
            avatar_url: profile?.avatar_url,
            total_points: calculateTotalPoints(logs),
            weekly_points: calculatePointsForTimeframe(logs, 'weekly'),
            monthly_points: calculatePointsForTimeframe(logs, 'monthly'),
            workout_streak: calculateWorkoutStreak(logs),
            clean_streak: calculateCleanStreak(logs),
        };
        setStats(newStats);
    }, [logs, user.id, profile]);

    const handleLogUpdate = async (workedOut: boolean, drankAlcohol: boolean, smokedWeed: boolean, ateJunkFood: boolean) => {
        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('daily_logs')
            .upsert({
                user_id: user.id,
                date: today,
                worked_out: workedOut,
                drank_alcohol: drankAlcohol,
                smoked_weed: smokedWeed,
                ate_junk_food: ateJunkFood,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'user_id,date'
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase error details:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
                fullError: error
            });
            throw error;
        }

        // Update local state
        setLogs(prevLogs => {
            const existingIndex = prevLogs.findIndex(log => log.date === today);
            if (existingIndex >= 0) {
                const newLogs = [...prevLogs];
                newLogs[existingIndex] = data;
                return newLogs;
            } else {
                return [data, ...prevLogs];
            }
        });
    });
};

// Fetch member counts
useEffect(() => {
    const fetchMemberCounts = async () => {
        const counts: Record<string, number> = {};

        for (const group of groups) {
            const { count, error } = await supabase
                .from('group_memberships')
                .select('id', { count: 'exact', head: true })
                .eq('group_id', group.group_id);

            if (!error && count !== null) {
                counts[group.group_id] = count;
            }
        }
        setMemberCounts(counts);
    };

    if (groups.length > 0) {
        fetchMemberCounts();
    }
}, [groups]);

// Show notification prompt on first visit (if in a group)
useEffect(() => {
    if (groups.length > 0 && !hasShownNotificationPrompt() && !hasNotificationPermission()) {
        // Show prompt after 3 seconds
        const timer = setTimeout(() => {
            setShowNotificationPrompt(true);
        }, 3000);
        return () => clearTimeout(timer);
    }
}, [groups]);

// Subscribe to realtime updates for group workout notifications
useEffect(() => {
    if (groups.length === 0 || !hasNotificationPermission()) return;

    const groupIds = groups.map(g => g.id);

    // Subscribe to daily_logs changes
    const channel = supabase
        .channel('workout-notifications')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'daily_logs',
                filter: `worked_out=eq.true`,
            },
            async (payload) => {
                const newLog = payload.new as DailyLog;

                // Don't notify for own workouts
                if (newLog.user_id === user.id) return;

                // For UPDATE events, ensure we only notify if worked_out changed to true
                if (payload.eventType === 'UPDATE') {
                    const oldLog = payload.old as any;
                    // If it was already true in the old record, skip
                    // Note: Requires REPLICA IDENTITY FULL on daily_logs table
                    if (oldLog && oldLog.worked_out === true) return;
                }

                // Check if this user is in any of our groups
                const { data: memberships } = await supabase
                    .from('group_memberships')
                    .select('group_id, users!inner(username)')
                    .eq('user_id', newLog.user_id);

                if (!memberships || memberships.length === 0) return;

                // Check if we share a group
                const sharedGroup = memberships.find((m: any) =>
                    groupIds.includes(m.group_id)
                );

                if (sharedGroup) {
                    const username = (sharedGroup as any).users.username;
                    showNotification(`${username} just logged a workout! 💪`, {
                        body: 'Keep the momentum going!',
                        tag: 'workout-notification',
                    });
                }
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}, [groups, user.id]);

const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
};

const todayLog = getTodayLog(logs);

return (
    <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        Welcome back, <span className="text-gradient-primary">{profile?.username}</span>
                    </h1>
                    <p className="text-muted-foreground">Keep the momentum going!</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowInstallPrompt(true)}
                        className="glass-strong px-4 py-3 rounded-lg hover-lift transition-smooth flex items-center gap-2"
                        title="Install App"
                    >
                        <Download className="w-5 h-5" />
                        <span className="hidden sm:inline">Install</span>
                    </button>
                    <button
                        onClick={() => router.push('/history')}
                        className="glass-strong px-4 py-3 rounded-lg hover-lift transition-smooth flex items-center gap-2"
                        title="View history"
                    >
                        <Calendar className="w-5 h-5" />
                        <span className="hidden sm:inline">History</span>
                    </button>
                    <button
                        onClick={handleSignOut}
                        className="glass-strong p-3 rounded-lg hover-lift transition-smooth"
                        title="Sign out"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Daily Check-In */}
            <DailyCheckIn
                initialWorkedOut={todayLog?.worked_out || false}
                initialDrankAlcohol={todayLog?.drank_alcohol || false}
                initialSmokedWeed={todayLog?.smoked_weed || false}
                initialAteJunkFood={todayLog?.ate_junk_food || false}
                onUpdate={handleLogUpdate}
            />

            {/* Stats Grid */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard
                        title="Total Points"
                        value={stats.total_points}
                        icon={Trophy}
                        trend={stats.total_points > 0 ? 'up' : stats.total_points < 0 ? 'down' : 'neutral'}
                    />
                    <StatsCard
                        title="This Week"
                        value={stats.weekly_points}
                        icon={Calendar}
                        trend={stats.weekly_points > 0 ? 'up' : stats.weekly_points < 0 ? 'down' : 'neutral'}
                    />
                    <StatsCard
                        title="Workout Streak"
                        value={stats.workout_streak}
                        subtitle="consecutive days"
                        icon={Dumbbell}
                        variant="primary"
                    />
                    <StatsCard
                        title="Clean Streak"
                        value={stats.clean_streak}
                        subtitle="days without alcohol"
                        icon={Flame}
                        variant="accent"
                    />
                </div>
            )}

            {/* Groups Section */}
            <div className="glass-strong rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Users className="w-6 h-6 text-primary" />
                        <h2 className="text-2xl font-bold">Your Groups</h2>
                    </div>
                    <button
                        onClick={() => router.push('/groups/new')}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover-lift transition-smooth"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Create Group</span>
                    </button>
                </div>

                {groups.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {groups.map((membership: any) => (
                            <motion.button
                                key={membership.group_id}
                                onClick={() => router.push(`/groups/${membership.group_id}`)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="glass rounded-xl p-4 text-left hover-lift transition-smooth"
                            >
                                <h3 className="font-semibold text-lg mb-1">
                                    {membership.groups.name}
                                </h3>
                                <p className="text-sm text-muted-foreground flex items-center justify-between">
                                    <span>Code: {membership.groups.invite_code}</span>
                                    <span className="flex items-center gap-1 text-xs bg-secondary/10 px-2 py-1 rounded-full">
                                        <Users className="w-3 h-3" />
                                        {memberCounts[membership.group_id] || 1} members
                                    </span>
                                </p>
                            </motion.button>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground mb-4">
                            You haven&apos;t joined any groups yet
                        </p>
                        <button
                            onClick={() => router.push('/groups/new')}
                            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover-lift transition-smooth"
                        >
                            Create Your First Group
                        </button>
                    </div>
                )}
            </div>
        </div>
        <InstallPrompt
            isOpen={showInstallPrompt}
            onClose={() => setShowInstallPrompt(false)}
        />
        {/* Notification Prompt */}
        <NotificationPrompt
            isOpen={showNotificationPrompt}
            onClose={() => setShowNotificationPrompt(false)}
        />
    </div>
);
}
