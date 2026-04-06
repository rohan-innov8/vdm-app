'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  // Dashboard Stats State
  const [projectCount, setProjectCount] = useState(0);
  const [pendingTasksCount, setPendingTasksCount] = useState(0);
  const [productionVelocity, setProductionVelocity] = useState(0);

  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function getDashboardData() {
      // 1. Get User & Profile
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push('/login');
        return;
      }
      setUser(user);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (profileData) setProfile(profileData);

      // 2. Get Active Project Count (Hide completed projects)
      const { count: projCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .neq('status', 'Completed');

      // 3. Get Pending Tasks Count
      const { count: taskCount } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .neq('status', 'Done');

      setProjectCount(projCount || 0);
      setPendingTasksCount(taskCount || 0);
      setProductionVelocity(85); // Placeholder for future BI phase

      setLoading(false);
    }

    getDashboardData();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-slate-500">Loading Dashboard...</div>;
  }

  return (
    // p-4 (16px) on mobile, sm:p-8 (32px) on desktop
    <div className="p-4 sm:p-8 bg-slate-50 min-h-screen">
      <main className="max-w-7xl mx-auto">

        {/* Header: Stack on mobile, row on desktop, gap-4 (16px), mb-8 (32px) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            {/* Slightly larger avatar on mobile for touch ease */}
            <Avatar className="h-12 w-12 sm:h-10 sm:w-10">
              <AvatarFallback className="bg-orange-100 text-orange-700 font-bold">
                {profile?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-slate-500 text-sm sm:text-base">Welcome back, {profile?.full_name || 'User'}</p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleSignOut}
            // h-12 (48px) touch target on mobile, full width on mobile, auto width on desktop
            className="w-full sm:w-auto h-12 sm:h-10 cursor-pointer"
          >
            Sign Out
          </Button>
        </div>

        {/* KPI Cards: 1 col on mobile, 3 cols on desktop, gap-4 (16px) on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">

          <Link href="/projects" className="block h-full">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-l-4 border-l-orange-400">
              {/* p-6 (24px) spacing standard for Shadcn cards via pb-2 */}
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Active Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{projectCount}</div>
                <p className="text-xs text-slate-500 mt-1">Currently on the factory floor</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/projects" className="block h-full">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-l-4 border-l-indigo-400">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Open Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{pendingTasksCount}</div>
                <p className="text-xs text-slate-500 mt-1">Pending or In Progress</p>
              </CardContent>
            </Card>
          </Link>

          <Card className="h-full border-l-4 border-l-emerald-400">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Production Velocity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{productionVelocity}%</div>
              <p className="text-xs text-slate-500 mt-1">On-time delivery rate</p>
            </CardContent>
          </Card>

        </div>

        <Separator className="my-8" />

        {/* Admin Area */}
        {profile?.role === 'admin' && (
          <div className="mt-8">
            {/* mb-4 (16px) */}
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Admin Quick Actions</h3>

            {/* Use CSS Grid to allow fluid wrapping instead of fixed flex widths */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

              <Link href="/admin/tasks" className="block h-full">
                <Card className="cursor-pointer hover:bg-slate-50 transition hover:shadow-md h-full">
                  <CardHeader>
                    <CardTitle className="text-base">Master Task List</CardTitle>
                    <CardDescription>Global overview of all tasks</CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/admin/users" className="block h-full">
                <Card className="cursor-pointer hover:bg-slate-50 transition hover:shadow-md h-full">
                  <CardHeader>
                    <CardTitle className="text-base">User Management</CardTitle>
                    <CardDescription>Manage Maker & Viewer access</CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/admin/settings" className="block h-full">
                <Card className="cursor-pointer hover:bg-slate-50 transition hover:shadow-md h-full">
                  <CardHeader>
                    <CardTitle className="text-base">System Settings</CardTitle>
                    <CardDescription>Configure defaults</CardDescription>
                  </CardHeader>
                </Card>
              </Link>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}