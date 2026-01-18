import { DailyLog } from './types';
import { startOfWeek, startOfMonth, parseISO, isAfter, isBefore, subDays } from 'date-fns';

/**
 * Calculate total points from daily logs
 */
export function calculateTotalPoints(logs: DailyLog[]): number {
    return logs.reduce((sum, log) => sum + log.net_points, 0);
}

/**
 * Calculate points for a specific timeframe
 */
export function calculatePointsForTimeframe(
    logs: DailyLog[],
    timeframe: 'weekly' | 'monthly'
): number {
    const now = new Date();
    const startDate = timeframe === 'weekly'
        ? startOfWeek(now, { weekStartsOn: 1 }) // Monday
        : startOfMonth(now);

    return logs
        .filter(log => {
            const logDate = parseISO(log.date);
            return isAfter(logDate, startDate) || logDate.getTime() === startDate.getTime();
        })
        .reduce((sum, log) => sum + log.net_points, 0);
}

/**
 * Calculate workout streak (consecutive days with workouts)
 */
export function calculateWorkoutStreak(logs: DailyLog[]): number {
    const sortedLogs = [...logs].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let streak = 0;
    let expectedDate = new Date();
    expectedDate.setHours(0, 0, 0, 0);

    for (const log of sortedLogs) {
        const logDate = parseISO(log.date);
        logDate.setHours(0, 0, 0, 0);

        // Check if this log is for the expected date
        if (logDate.getTime() === expectedDate.getTime()) {
            if (log.worked_out) {
                streak++;
                expectedDate = subDays(expectedDate, 1);
            } else {
                break; // Streak broken
            }
        } else if (isBefore(logDate, expectedDate)) {
            // Gap in logs, streak broken
            break;
        }
    }

    return streak;
}

/**
 * Calculate clean streak (consecutive days without alcohol)
 */
export function calculateCleanStreak(logs: DailyLog[]): number {
    const sortedLogs = [...logs].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let streak = 0;
    let expectedDate = new Date();
    expectedDate.setHours(0, 0, 0, 0);

    for (const log of sortedLogs) {
        const logDate = parseISO(log.date);
        logDate.setHours(0, 0, 0, 0);

        // Check if this log is for the expected date
        if (logDate.getTime() === expectedDate.getTime()) {
            if (!log.drank_alcohol) {
                streak++;
                expectedDate = subDays(expectedDate, 1);
            } else {
                break; // Streak broken
            }
        } else if (isBefore(logDate, expectedDate)) {
            // Gap in logs, streak broken
            break;
        }
    }

    return streak;
}

/**
 * Get today's log from a list of logs
 */
export function getTodayLog(logs: DailyLog[]): DailyLog | null {
    const today = new Date().toISOString().split('T')[0];
    return logs.find(log => log.date === today) || null;
}
