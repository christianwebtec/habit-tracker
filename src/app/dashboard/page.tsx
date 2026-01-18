import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/');
    }

    // Fetch user profile
    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

    // Fetch all daily logs for the user
    const { data: logs } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

    // Fetch user's groups
    const { data: groups } = await supabase
        .from('group_memberships')
        .select(`
      group_id,
      groups (
        id,
        name,
        invite_code
      )
    `)
        .eq('user_id', user.id);

    return (
        <DashboardClient
            user={user}
            profile={profile}
            initialLogs={logs || []}
            groups={groups || []}
        />
    );
}
