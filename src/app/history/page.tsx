'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DailyLog } from '@/lib/types';
import { motion } from 'framer-motion';
import { Calendar, Dumbbell, Beer, ArrowLeft, Save } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

export default function HistoryPage() {
    const router = useRouter();
    const supabase = createClient();
    const [logs, setLogs] = useState<DailyLog[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [editLog, setEditLog] = useState<{ worked_out: boolean; drank_alcohol: boolean } | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/');
            return;
        }

        // Load last 30 days
        const thirtyDaysAgo = subDays(new Date(), 30).toISOString().split('T')[0];
        const { data, error } = await supabase
            .from('daily_logs')
            .select('*')
            .eq('user_id', user.id)
            .gte('date', thirtyDaysAgo)
            .order('date', { ascending: false });

        if (!error && data) {
            setLogs(data);
        }
        setLoading(false);
    };

    const handleDateClick = (date: string) => {
        const log = logs.find(l => l.date === date);
        setSelectedDate(date);
        setEditLog({
            worked_out: log?.worked_out || false,
            drank_alcohol: log?.drank_alcohol || false,
        });
    };

    const handleSave = async () => {
        if (!selectedDate || !editLog) return;

        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('daily_logs')
            .upsert({
                user_id: user.id,
                date: selectedDate,
                worked_out: editLog.worked_out,
                drank_alcohol: editLog.drank_alcohol,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'user_id,date'
            });

        if (!error) {
            await loadLogs();
            setSelectedDate(null);
            setEditLog(null);
        }
        setSaving(false);
    };

    const getLast30Days = () => {
        const days = [];
        for (let i = 29; i >= 0; i--) {
            days.push(subDays(new Date(), i));
        }
        return days;
    };

    const getLogForDate = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return logs.find(log => log.date === dateStr);
    };

    const netPoints = editLog ? (editLog.worked_out ? 1 : 0) + (editLog.drank_alcohol ? -1 : 0) : 0;

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">History</h1>
                        <p className="text-muted-foreground">View and edit your past logs</p>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="glass-strong p-3 rounded-lg hover-lift transition-smooth"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                </div>

                {/* Calendar Grid */}
                <div className="glass-strong rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Calendar className="w-6 h-6 text-primary" />
                        <h2 className="text-2xl font-bold">Last 30 Days</h2>
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-muted-foreground">Loading...</div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {getLast30Days().map((date) => {
                                const dateStr = format(date, 'yyyy-MM-dd');
                                const log = getLogForDate(date);
                                const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');
                                const isSelected = dateStr === selectedDate;

                                return (
                                    <motion.button
                                        key={dateStr}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleDateClick(dateStr)}
                                        className={`
                                            glass rounded-xl p-4 text-left transition-all
                                            ${isSelected ? 'ring-2 ring-primary' : ''}
                                            ${isToday ? 'border-2 border-accent' : ''}
                                            hover-lift
                                        `}
                                    >
                                        <div className="text-xs text-muted-foreground mb-1">
                                            {format(date, 'MMM d')}
                                        </div>
                                        <div className="text-lg font-bold">
                                            {format(date, 'EEE')}
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                            {log?.worked_out && (
                                                <div className="w-6 h-6 bg-green-500/20 rounded flex items-center justify-center">
                                                    <Dumbbell className="w-4 h-4 text-green-400" />
                                                </div>
                                            )}
                                            {log?.drank_alcohol && (
                                                <div className="w-6 h-6 bg-red-500/20 rounded flex items-center justify-center">
                                                    <Beer className="w-4 h-4 text-red-400" />
                                                </div>
                                            )}
                                        </div>
                                        {log && (
                                            <div className={`text-sm font-semibold mt-2 ${log.net_points > 0 ? 'text-green-400' :
                                                log.net_points < 0 ? 'text-red-400' : 'text-gray-400'
                                                }`}>
                                                {log.net_points > 0 ? '+' : ''}{log.net_points}
                                            </div>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Edit Panel */}
                {selectedDate && editLog && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-strong rounded-2xl p-6"
                    >
                        <h3 className="text-xl font-bold mb-4">
                            Edit {format(new Date(selectedDate), 'MMMM d, yyyy')}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {/* Workout Toggle */}
                            <button
                                onClick={() => setEditLog({ ...editLog, worked_out: !editLog.worked_out })}
                                className={`
                                    rounded-xl p-6 transition-all
                                    ${editLog.worked_out
                                        ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                                        : 'glass hover:glass-strong'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <Dumbbell className="w-6 h-6" />
                                    <div className="text-left">
                                        <div className="font-semibold">Worked Out</div>
                                        <div className="text-sm opacity-90">+1 point</div>
                                    </div>
                                </div>
                            </button>

                            {/* Alcohol Toggle */}
                            <button
                                onClick={() => setEditLog({ ...editLog, drank_alcohol: !editLog.drank_alcohol })}
                                className={`
                                    rounded-xl p-6 transition-all
                                    ${editLog.drank_alcohol
                                        ? 'bg-gradient-to-br from-red-500 to-rose-600'
                                        : 'glass hover:glass-strong'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <Beer className="w-6 h-6" />
                                    <div className="text-left">
                                        <div className="font-semibold">Drank Alcohol</div>
                                        <div className="text-sm opacity-90">-1 point</div>
                                    </div>
                                </div>
                            </button>
                        </div>

                        {/* Net Score */}
                        <div className="glass rounded-xl p-4 mb-4 text-center">
                            <div className="text-sm text-muted-foreground mb-1">Net Score</div>
                            <div className={`text-3xl font-bold ${netPoints > 0 ? 'text-green-400' :
                                netPoints < 0 ? 'text-red-400' : 'text-gray-400'
                                }`}>
                                {netPoints > 0 ? '+' : ''}{netPoints}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover-lift transition-smooth disabled:opacity-50"
                            >
                                <Save className="w-5 h-5" />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedDate(null);
                                    setEditLog(null);
                                }}
                                className="px-6 py-3 glass rounded-lg hover-lift transition-smooth"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
