'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const getStageColor = (stage: string) => {
    switch (stage) {
        case 'Pre-Production': return 'border-l-slate-300';
        case 'Production': return 'border-l-orange-400';
        case 'Prep / Pre-assemble': return 'border-l-yellow-400';
        case 'Installation': return 'border-l-indigo-400';
        case 'Snags': return 'border-l-pink-500';
        case 'Completed': return 'border-l-emerald-500';
        default: return 'border-l-slate-200';
    }
};

export default function GlobalTasksPage() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function fetchGlobalTasks() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
            if (profile?.role !== 'admin') {
                alert('Unauthorized. Top management only.');
                router.push('/');
                return;
            }

            const { data } = await supabase
                .from('tasks')
                .select(`*, projects (name, status)`)
                .order('deadline', { ascending: true });

            setTasks(data || []);
            setLoading(false);
        }
        fetchGlobalTasks();
    }, [router]);

    if (loading) return <div className="flex items-center justify-center h-screen text-slate-500">Loading master task list...</div>;

    const groupedTasks = {
        'Pre-Production': tasks.filter(t => t.projects?.status === 'Pre-Production'),
        'Production': tasks.filter(t => t.projects?.status === 'Production'),
        'Prep / Pre-assemble': tasks.filter(t => t.projects?.status === 'Prep / Pre-assemble'),
        'Installation': tasks.filter(t => t.projects?.status === 'Installation'),
        'Snags': tasks.filter(t => t.projects?.status === 'Snags'),
        'Completed': tasks.filter(t => t.projects?.status === 'Completed')
    };

    const formatDate = (dateStr: string) => dateStr ? new Date(dateStr).toLocaleDateString('en-GB') : 'No deadline';

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto space-y-6">

                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Master Task Overview</h1>
                        <p className="text-slate-500">All factory deliverables categorized by production stage.</p>
                    </div>
                    <Link href="/">
                        <Button variant="outline" className="cursor-pointer">Back to Dashboard</Button>
                    </Link>
                </div>

                {Object.entries(groupedTasks).map(([stage, stageTasks]) => (
                    // NEW: Sleek left-border styling dynamically matched to the Kanban colors
                    <Card key={stage} className={`border-l-4 ${getStageColor(stage)}`}>
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center text-lg">
                                <span>{stage} Phase</span>
                                <Badge variant="secondary">{stageTasks.length} Tasks</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {stageTasks.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-4">No tasks in this phase.</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Project</TableHead>
                                            <TableHead>Task Name</TableHead>
                                            <TableHead>Accountable</TableHead>
                                            <TableHead>Deadline</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Audit Trail</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {stageTasks.map((task) => (
                                            <TableRow key={task.id}>
                                                <TableCell className="font-medium text-orange-700">
                                                    <Link href={`/projects/${task.project_id}`} className="hover:underline">
                                                        {task.projects?.name || 'Unknown'}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>{task.title}</TableCell>
                                                <TableCell>{task.accountable_name || 'Unassigned'}</TableCell>
                                                <TableCell className={new Date(task.deadline) < new Date() && task.status !== 'Done' ? 'text-red-600 font-medium' : ''}>
                                                    {formatDate(task.deadline)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={task.status === 'Done' ? 'bg-green-50 text-green-700' : ''}>
                                                        {task.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right text-xs text-slate-500">
                                                    {task.status === 'Done' && task.completed_at ? (
                                                        <span className="text-green-600">Done by {task.completed_by_name}</span>
                                                    ) : '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                ))}

            </div>
        </div>
    );
}