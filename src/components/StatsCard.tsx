'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: number | string;
    subtitle?: string;
    icon?: LucideIcon;
    variant?: 'default' | 'primary' | 'accent';
    trend?: 'up' | 'down' | 'neutral';
}

export default function StatsCard({
    title,
    value,
    subtitle,
    icon: Icon,
    variant = 'default',
    trend = 'neutral',
}: StatsCardProps) {
    const variantStyles = {
        default: 'glass-strong',
        primary: 'gradient-primary',
        accent: 'gradient-accent',
    };

    const trendColors = {
        up: 'text-green-400',
        down: 'text-red-400',
        neutral: 'text-gray-400',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
        ${variantStyles[variant]}
        rounded-xl p-6 hover-lift
        transition-smooth
      `}
        >
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className={`text-sm mb-1 ${variant === 'default' ? 'text-muted-foreground' : 'text-white/90'
                        }`}>{title}</p>
                    <p className={`
            text-4xl font-bold
            ${variant === 'default' ? trendColors[trend] : 'text-white'}
          `}>
                        {typeof value === 'number' && value > 0 ? '+' : ''}{value}
                    </p>
                </div>
                {Icon && (
                    <div className={`
            p-3 rounded-lg
            ${variant === 'default' ? 'bg-primary/20' : 'bg-white/20'}
          `}>
                        <Icon className="w-6 h-6" />
                    </div>
                )}
            </div>
            {subtitle && (
                <p className={`text-sm ${variant === 'default' ? 'opacity-80' : 'text-white/70'
                    }`}>{subtitle}</p>
            )}
        </motion.div>
    );
}
