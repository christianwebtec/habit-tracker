'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { Users, Plus, ArrowLeft, Copy, Check } from 'lucide-react';

export default function NewGroupPage() {
    const router = useRouter();
    const supabase = createClient();

    const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
    const [groupName, setGroupName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [createdCode, setCreatedCode] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const generateInviteCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Check if user profile exists
            const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('id')
                .eq('id', user.id)
                .maybeSingle();

            if (profileError) {
                console.error('Profile check error:', profileError);
                throw new Error('Failed to verify user profile');
            }

            if (!profile) {
                throw new Error('User profile not found. Please refresh the page and try again.');
            }

            const code = generateInviteCode();

            const { data, error: createError } = await supabase
                .from('groups')
                .insert({
                    name: groupName,
                    invite_code: code,
                    created_by: user.id,
                })
                .select()
                .single();

            if (createError) {
                console.error('Group creation error:', createError);
                throw createError;
            }

            // Auto-join the group as creator
            const { error: joinError } = await supabase
                .from('group_memberships')
                .insert({
                    group_id: data.id,
                    user_id: user.id,
                });

            if (joinError) {
                console.error('Auto-join error:', joinError);
                // Don't fail if auto-join fails, user can join manually
            }

            setCreatedCode(code);
        } catch (err: any) {
            console.error('Create group error:', err);
            setError(err.message || 'Failed to create group');
        } finally {
            setLoading(false);
        }
    };

    const handleJoinGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Check if user profile exists
            const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('id')
                .eq('id', user.id)
                .maybeSingle();

            if (profileError) {
                console.error('Profile check error:', profileError);
                throw new Error('Failed to verify user profile');
            }

            if (!profile) {
                throw new Error('User profile not found. Please refresh the page and try again.');
            }

            // Find group by invite code
            const { data: group, error: findError } = await supabase
                .from('groups')
                .select('id')
                .eq('invite_code', inviteCode.toUpperCase())
                .single();

            if (findError || !group) {
                console.error('Group find error:', findError);
                throw new Error('Invalid invite code');
            }

            // Join the group
            const { error: joinError } = await supabase
                .from('group_memberships')
                .insert({
                    group_id: group.id,
                    user_id: user.id,
                });

            if (joinError) {
                console.error('Join error:', joinError);
                if (joinError.code === '23505') {
                    throw new Error('You are already a member of this group');
                }
                throw joinError;
            }

            router.push(`/groups/${group.id}`);
        } catch (err: any) {
            console.error('Join group error:', err);
            setError(err.message || 'Failed to join group');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyCode = () => {
        if (createdCode) {
            navigator.clipboard.writeText(createdCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (createdCode) {
        return (
            <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md"
                >
                    <div className="glass-strong rounded-2xl p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                            <Check className="w-8 h-8 text-white" />
                        </div>

                        <h2 className="text-2xl font-bold mb-2">Group Created!</h2>
                        <p className="text-muted-foreground mb-6">
                            Share this code with your friends to invite them
                        </p>

                        <div className="glass rounded-xl p-6 mb-6">
                            <p className="text-sm text-muted-foreground mb-2">Invite Code</p>
                            <div className="flex items-center justify-center gap-3">
                                <p className="text-4xl font-bold tracking-wider">{createdCode}</p>
                                <button
                                    onClick={handleCopyCode}
                                    className="p-2 glass-strong rounded-lg hover-lift transition-smooth"
                                    title="Copy code"
                                >
                                    {copied ? (
                                        <Check className="w-5 h-5 text-green-400" />
                                    ) : (
                                        <Copy className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => router.push('/dashboard')}
                            className="w-full gradient-primary text-white font-semibold py-3 rounded-lg hover-lift transition-smooth"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => mode === 'choose' ? router.push('/dashboard') : setMode('choose')}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-smooth"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>

                {mode === 'choose' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold mb-2">Groups</h1>
                            <p className="text-muted-foreground">
                                Compete with friends and stay accountable together
                            </p>
                        </div>

                        <button
                            onClick={() => setMode('create')}
                            className="w-full glass-strong rounded-xl p-6 hover-lift transition-smooth text-left"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-primary/20 rounded-lg">
                                    <Plus className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">Create New Group</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Start a new group and invite your friends
                                    </p>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => setMode('join')}
                            className="w-full glass-strong rounded-xl p-6 hover-lift transition-smooth text-left"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-secondary/20 rounded-lg">
                                    <Users className="w-6 h-6 text-secondary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">Join Existing Group</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Enter an invite code to join a group
                                    </p>
                                </div>
                            </div>
                        </button>
                    </motion.div>
                )}

                {mode === 'create' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-strong rounded-2xl p-8"
                    >
                        <h2 className="text-2xl font-bold mb-6">Create New Group</h2>

                        <form onSubmit={handleCreateGroup} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Group Name
                                </label>
                                <input
                                    type="text"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    placeholder="e.g., Gym Buddies, Weekend Warriors"
                                    required
                                    className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                />
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
                                {loading ? 'Creating...' : 'Create Group'}
                            </button>
                        </form>
                    </motion.div>
                )}

                {mode === 'join' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-strong rounded-2xl p-8"
                    >
                        <h2 className="text-2xl font-bold mb-6">Join Group</h2>

                        <form onSubmit={handleJoinGroup} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Invite Code
                                </label>
                                <input
                                    type="text"
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                    placeholder="Enter 6-character code"
                                    required
                                    maxLength={6}
                                    className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all text-center text-2xl font-bold tracking-wider uppercase"
                                />
                            </div>

                            {error && (
                                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || inviteCode.length !== 6}
                                className="w-full gradient-primary text-white font-semibold py-3 rounded-lg hover-lift transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Joining...' : 'Join Group'}
                            </button>
                        </form>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
