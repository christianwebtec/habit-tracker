'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { Mail, Lock, User } from 'lucide-react';

export default function AuthForm() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                // Sign up
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            username: username || email.split('@')[0],
                        },
                    },
                });

                if (signUpError) throw signUpError;

                if (data.user) {
                    // Create user profile
                    const { error: profileError } = await supabase
                        .from('users')
                        .insert({
                            id: data.user.id,
                            username: username || email.split('@')[0],
                        });

                    if (profileError) throw profileError;
                }
            } else {
                // Sign in
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (signInError) throw signInError;
            }

            window.location.href = '/dashboard';
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2 text-gradient-primary">
                        Habit Tracker
                    </h1>
                    <p className="text-muted-foreground">
                        Track workouts, stay accountable, compete with friends
                    </p>
                </div>

                <div className="glass-strong rounded-2xl p-8">
                    <div className="flex gap-2 mb-6 p-1 glass rounded-xl">
                        <button
                            onClick={() => setIsSignUp(false)}
                            className={`
                flex-1 px-4 py-2 rounded-lg font-medium text-sm
                transition-all duration-200
                ${!isSignUp
                                    ? 'bg-primary text-primary-foreground shadow-lg'
                                    : 'text-muted-foreground hover:text-foreground'
                                }
              `}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setIsSignUp(true)}
                            className={`
                flex-1 px-4 py-2 rounded-lg font-medium text-sm
                transition-all duration-200
                ${isSignUp
                                    ? 'bg-primary text-primary-foreground shadow-lg'
                                    : 'text-muted-foreground hover:text-foreground'
                                }
              `}
                        >
                            Sign Up
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isSignUp && (
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Username
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="johndoe"
                                        className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                />
                            </div>
                            {!isSignUp && (
                                <div className="mt-2 text-right">
                                    <a
                                        href="/forgot-password"
                                        className="text-sm text-primary hover:underline"
                                    >
                                        Forgot password?
                                    </a>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full gradient-primary text-white font-semibold py-3 rounded-lg hover-lift transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
