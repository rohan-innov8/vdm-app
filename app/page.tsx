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
  const [projectCount, setProjectCount] = useState(0); // <--- New State for the count
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function getUserData() {
      // 1. Get User
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // 2. Get Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // 3. Get Project Count (The new part!)
      const { count, error: countError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true }); // 'head: true' means "just count them, don't download the data"

      if (count !== null) {
        setProjectCount(count);
      }

      setLoading(false);
    }
    getUserData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading workspace...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <header className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold">
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
            <AvatarFallback className="bg-blue-100 text-blue-700">
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
          {/* Only Admins can see the 'New Project' button. Note: We removed the button here since we have it on the Projects page, but you can add it back if you like! */}
        </div>

        <Separator />

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Active Projects - Now Clickable & Live! */}
          <Link href="/projects">
            <Card className="hover:shadow-md transition cursor-pointer h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Active Projects</CardTitle>
              </CardHeader>
              <CardContent>
                {/* This is the variable that now holds the real number */}
                <div className="text-4xl font-bold text-slate-900">{projectCount}</div>
                <p className="text-xs text-slate-500 mt-1">Click to view all</p>
              </CardContent>
            </Card>
          </Link>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Pending Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900">0</div>
              <p className="text-xs text-slate-500 mt-1">0 high priority</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Production Velocity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900">0%</div>
              <p className="text-xs text-slate-500 mt-1">On schedule</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Area */}
        {profile?.role === 'admin' && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Admin Quick Actions</h3>
            <div className="flex gap-4">

              {/* Added Link to User Management */}
              <Link href="/admin/users">
                <Card className="w-64 cursor-pointer hover:bg-slate-50 transition hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-base">User Management</CardTitle>
                    <CardDescription>Manage Maker & Viewer access</CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              {/* Added Link to System Settings */}
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