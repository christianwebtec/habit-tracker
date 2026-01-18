'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Beer, Leaf } from 'lucide-react';

interface DailyCheckInProps {
    initialWorkedOut: boolean;
    initialDrankAlcohol: boolean;
    initialSmokedWeed: boolean;
    onUpdate: (workedOut: boolean, drankAlcohol: boolean, smokedWeed: boolean) => Promise<void>;
}

export default function DailyCheckIn({
    initialWorkedOut,
    initialDrankAlcohol,
    initialSmokedWeed,
    onUpdate,
}: DailyCheckInProps) {
    const [workedOut, setWorkedOut] = useState(initialWorkedOut);
    const [drankAlcohol, setDrankAlcohol] = useState(initialDrankAlcohol);
    const [smokedWeed, setSmokedWeed] = useState(initialSmokedWeed);
    const [isUpdating, setIsUpdating] = useState(false);

    const netPoints = (workedOut ? 1 : 0) + (drankAlcohol ? -1 : 0) + (smokedWeed ? -1 : 0);

    const handleToggle = async (type: 'workout' | 'alcohol' | 'weed') => {
        setIsUpdating(true);

        const newWorkedOut = type === 'workout' ? !workedOut : workedOut;
        const newDrankAlcohol = type === 'alcohol' ? !drankAlcohol : drankAlcohol;
        const newSmokedWeed = type === 'weed' ? !smokedWeed : smokedWeed;

        // Optimistic update
        if (type === 'workout') {
            setWorkedOut(newWorkedOut);
        } else if (type === 'alcohol') {
            setDrankAlcohol(newDrankAlcohol);
        } else {
            setSmokedWeed(newSmokedWeed);
        }

        try {
            await onUpdate(newWorkedOut, newDrankAlcohol, newSmokedWeed);
        } catch (error) {
            // Revert on error
            if (type === 'workout') {
                setWorkedOut(workedOut);
            } else if (type === 'alcohol') {
                setDrankAlcohol(drankAlcohol);
            } else {
                setSmokedWeed(smokedWeed);
            }
            console.error('Failed to update:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Today&apos;s Check-In</h2>
                <p className="text-muted-foreground">Tap to log your day</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Workout Button */}
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleToggle('workout')}
                    disabled={isUpdating}
                    className={`
            relative overflow-hidden rounded-2xl p-8 
            transition-all duration-300 ease-out
            ${workedOut
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/50'
                            : 'glass hover:glass-strong'
                        }
            ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover-lift cursor-pointer'}
          `}
                >
                    <div className="flex flex-col items-center gap-4">
                        <div className={`
              p-4 rounded-full 
              ${workedOut ? 'bg-white/20' : 'bg-green-500/20'}
            `}>
                            <Dumbbell className="w-8 h-8" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold mb-1">Worked Out</h3>
                            <p className="text-sm opacity-90">+1 point</p>
                        </div>
                    </div>

                    {workedOut && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-4 right-4 w-6 h-6 bg-white rounded-full flex items-center justify-center"
                        >
                            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </motion.div>
                    )}
                </motion.button>

                {/* Alcohol Button */}
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleToggle('alcohol')}
                    disabled={isUpdating}
                    className={`
            relative overflow-hidden rounded-2xl p-8 
            transition-all duration-300 ease-out
            ${drankAlcohol
                            ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/50'
                            : 'glass hover:glass-strong'
                        }
            ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover-lift cursor-pointer'}
          `}
                >
                    <div className="flex flex-col items-center gap-4">
                        <div className={`
              p-4 rounded-full 
              ${drankAlcohol ? 'bg-white/20' : 'bg-red-500/20'}
            `}>
                            <Beer className="w-8 h-8" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold mb-1">Drank Alcohol</h3>
                            <p className="text-sm opacity-90">-1 point</p>
                        </div>
                    </div>

                    {drankAlcohol && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-4 right-4 w-6 h-6 bg-white rounded-full flex items-center justify-center"
                        >
                            <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </motion.div>
                    )}
                </motion.button>

                {/* Weed Button */}
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleToggle('weed')}
                    disabled={isUpdating}
                    className={`
            relative overflow-hidden rounded-2xl p-8 
            transition-all duration-300 ease-out
            ${smokedWeed
                            ? 'bg-gradient-to-br from-yellow-500 to-orange-600 shadow-lg shadow-yellow-500/50'
                            : 'glass hover:glass-strong'
                        }
            ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover-lift cursor-pointer'}
          `}
                >
                    <div className="flex flex-col items-center gap-4">
                        <div className={`
              p-4 rounded-full 
              ${smokedWeed ? 'bg-white/20' : 'bg-yellow-500/20'}
            `}>
                            <Leaf className="w-8 h-8" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold mb-1">Smoked Weed</h3>
                            <p className="text-sm opacity-90">-1 point</p>
                        </div>
                    </div>

                    {smokedWeed && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-4 right-4 w-6 h-6 bg-white rounded-full flex items-center justify-center"
                        >
                            <svg className="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </motion.div>
                    )}
                </motion.button>
            </div>

            {/* Net Score Display */}
            <motion.div
                key={netPoints}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-strong rounded-xl p-6 text-center"
            >
                <p className="text-sm text-muted-foreground mb-2">Today&apos;s Net Score</p>
                <p className={`
          text-5xl font-bold
          ${netPoints > 0 ? 'text-green-400' : netPoints < 0 ? 'text-red-400' : 'text-gray-400'}
        `}>
                    {netPoints > 0 ? '+' : ''}{netPoints}
                </p>
            </motion.div>
        </div>
    );
}
