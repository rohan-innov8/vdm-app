'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

      // 2. Get Active Project Count
      const { count: projCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .neq('status', 'Post-Production'); // Only count active/pre-prod

      if (projCount !== null) setProjectCount(projCount);

      // 3. Get Task Stats for Pending Count & Velocity
      const { data: allTasks } = await supabase
        .from('tasks')
        .select('status');

      if (allTasks && allTasks.length > 0) {
        // Count tasks that are NOT done
        const pending = allTasks.filter(t => t.status !== 'Done').length;
        setPendingTasksCount(pending);

        // Calculate Velocity (% of tasks completed)
        const done = allTasks.filter(t => t.status === 'Done').length;
        const velocity = Math.round((done / allTasks.length) * 100);
        setProductionVelocity(velocity);
      }

      setLoading(false);
    }

    getDashboardData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (loading) return <div className="flex items-center justify-center h-screen text-slate-500">Loading workspace...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <header className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-orange-600 w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold">
            B
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">VDM App</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-900">{profile?.full_name || user.email}</p>
            <p className="text-xs text-slate-500 capitalize">{profile?.role}</p>
          </div>
          <Avatar>
            <AvatarImage src="" />
            <AvatarFallback className="bg-orange-100 text-orange-700 font-bold text-xs">
              {getInitials(profile?.full_name || profile?.email)}
            </AvatarFallback>
          </Avatar>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8 max-w-7xl mx-auto space-y-8">

        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
            <p className="text-slate-500 mt-1">Overview of factory production and timelines.</p>
          </div>
        </div>

        <Separator />

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <Link href="/projects">
            <Card className="hover:shadow-md transition cursor-pointer h-full border-orange-100 bg-orange-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-orange-800">Active Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-orange-900">{projectCount}</div>
                <p className="text-xs text-orange-600/80 mt-1">Currently in pipeline</p>
              </CardContent>
            </Card>
          </Link>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Pending Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900">{pendingTasksCount}</div>
              <p className="text-xs text-slate-500 mt-1">Across all projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Production Velocity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900">{productionVelocity}%</div>
              <p className="text-xs text-slate-500 mt-1">Total tasks completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Area */}
        {profile?.role === 'admin' && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Admin Quick Actions</h3>
            <div className="flex gap-4">

              <Link href="/admin/users">
                <Card className="w-64 cursor-pointer hover:bg-slate-50 transition hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-base">User Management</CardTitle>
                    <CardDescription>Manage Maker & Viewer access</CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/admin/settings">
                <Card className="w-64 cursor-pointer hover:bg-slate-50 transition hover:shadow-md">
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