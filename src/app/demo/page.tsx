'use client';

import { useState } from 'react';
import DailyCheckIn from '@/components/DailyCheckIn';
import StatsCard from '@/components/StatsCard';
import Leaderboard from '@/components/Leaderboard';
import {
    Trophy,
    Calendar,
    Flame,
    Dumbbell,
    LogOut,
    Users,
    Plus,
    ArrowLeft
} from 'lucide-react';
import { LeaderboardEntry, TimeFrame } from '@/lib/types';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function DemoPage() {
    const [workedOut, setWorkedOut] = useState(true);
    const [drankAlcohol, setDrankAlcohol] = useState(false);
    const [timeframe, setTimeframe] = useState<TimeFrame>('weekly');

    // Mock data
    const mockStats = {
        total_points: 42,
        weekly_points: 5,
        workout_streak: 7,
        clean_streak: 14,
    };

    const mockLeaderboard: LeaderboardEntry[] = [
        {
            rank: 1,
            user_id: '1',
            username: 'FitnessPro',
            points: 28,
            workout_streak: 12,
            clean_streak: 20,
        },
        {
            rank: 2,
            user_id: '2',
            username: 'You',
            points: 24,
            workout_streak: 8,
            clean_streak: 15,
        },
        {
            rank: 3,
            user_id: '3',
            username: 'HealthyHabits',
            points: 18,
            workout_streak: 6,
            clean_streak: 10,
        },
        {
            rank: 4,
            user_id: '4',
            username: 'GymRat',
            points: 15,
            workout_streak: 5,
            clean_streak: 8,
        },
        {
            rank: 5,
            user_id: '5',
            username: 'CleanLiving',
            points: 12,
            workout_streak: 4,
            clean_streak: 12,
        },
    ];

    const mockGroups = [
        { id: '1', name: 'Gym Buddies', invite_code: 'ABC123' },
        { id: '2', name: 'Weekend Warriors', invite_code: 'XYZ789' },
    ];

    const handleUpdate = async (worked: boolean, drank: boolean) => {
        setWorkedOut(worked);
        setDrankAlcohol(drank);
        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 500));
    };

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Demo Banner */}
                <div className="glass-strong rounded-xl p-4 border-2 border-accent/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">👁️</span>
                            </div>
                            <div>
                                <p className="font-semibold">Demo Mode</p>
                                <p className="text-sm text-muted-foreground">
                                    This is a preview of the dashboard with mock data
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/"
                            className="flex items-center gap-2 px-4 py-2 glass rounded-lg hover-lift transition-smooth text-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </Link>
                    </div>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">
                            Welcome back, <span className="text-gradient-primary">DemoUser</span>
                        </h1>
                        <p className="text-muted-foreground">Keep the momentum going!</p>
                    </div>
                    <button
                        className="glass-strong p-3 rounded-lg hover-lift transition-smooth"
                        title="Sign out"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>

                {/* Daily Check-In */}
                <DailyCheckIn
                    initialWorkedOut={workedOut}
                    initialDrankAlcohol={drankAlcohol}
                    onUpdate={handleUpdate}
                />

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard
                        title="Total Points"
                        value={mockStats.total_points}
                        icon={Trophy}
                        trend="up"
                    />
                    <StatsCard
                        title="This Week"
                        value={mockStats.weekly_points}
                        icon={Calendar}
                        trend="up"
                    />
                    <StatsCard
                        title="Workout Streak"
                        value={mockStats.workout_streak}
                        subtitle="consecutive days"
                        icon={Dumbbell}
                        variant="primary"
                    />
                    <StatsCard
                        title="Clean Streak"
                        value={mockStats.clean_streak}
                        subtitle="days without alcohol"
                        icon={Flame}
                        variant="accent"
                    />
                </div>

                {/* Groups Section */}
                <div className="glass-strong rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Users className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-bold">Your Groups</h2>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover-lift transition-smooth">
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Create Group</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {mockGroups.map((group) => (
                            <motion.div
                                key={group.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="glass rounded-xl p-4 hover-lift transition-smooth cursor-pointer"
                            >
                                <h3 className="font-semibold text-lg mb-1">{group.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                    Code: {group.invite_code}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Sample Leaderboard */}
                <div className="glass-strong rounded-2xl p-6">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-2">Group Leaderboard</h2>
                        <p className="text-muted-foreground">Gym Buddies</p>
                    </div>

                    <Leaderboard
                        entries={mockLeaderboard}
                        currentUserId="2"
                        timeframe={timeframe}
                        onTimeframeChange={setTimeframe}
                    />
                </div>
            </div>
        </div>
    );
}
