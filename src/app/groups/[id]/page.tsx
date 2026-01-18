import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import GroupLeaderboardClient from './GroupLeaderboardClient';

export default async function GroupPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/');
    }

    const { id } = await params;

    // Fetch group details
    const { data: group } = await supabase
        .from('groups')
        .select('*')
        .eq('id', id)
        .single();

    if (!group) {
        redirect('/dashboard');
    }

    // Fetch all members
    const { data: members } = await supabase
        .from('group_memberships')
        .select(`
      user_id,
      users (
        id,
        username,
        avatar_url
      )
    `)
        .eq('group_id', id);

    // Fetch logs for all members
    const memberIds = members?.map(m => m.user_id) || [];
    const { data: logs } = await supabase
        .from('daily_logs')
        .select('*')
        .in('user_id', memberIds)
        .order('date', { ascending: false });

    return (
        <GroupLeaderboardClient
            group={group}
            members={members || []}
            logs={logs || []}
            currentUserId={user.id}
        />
    );
}
