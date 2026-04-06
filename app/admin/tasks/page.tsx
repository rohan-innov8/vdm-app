'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ExtendedTask } from '@/lib/types';
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
    const [tasks, setTasks] = useState<(ExtendedTask & { projects?: { name: string; status: string } })[]>([]);
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
            if (profile?.role !== 'admin' && profile?.role !== 'manager') {
                toast.error('Unauthorized. Top management only.');
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

    const formatDate = (dateStr: string | null | undefined) => dateStr ? new Date(dateStr).toLocaleDateString('en-GB') : 'No deadline';

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
            {/* Reduced vertical gaps between the cards to 4 (16px) */}
            <div className="max-w-7xl mx-auto space-y-4">

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Master Task Overview</h1>
                        <p className="text-slate-500 text-sm sm:text-base mt-1">All factory deliverables categorized by production stage.</p>
                    </div>

                    <Link href="/" className="w-full sm:w-auto">
                        <Button variant="outline" className="w-full sm:w-auto h-12 sm:h-10 cursor-pointer">
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>

                {Object.entries(groupedTasks).map(([stage, stageTasks]) => (
                    // Matching the exact structure of the Dashboard cards
                    <Card key={stage} className={`border-l-4 ${getStageColor(stage)}`}>

                        {/* pb-2 is the exact spacing trick used in your Dashboard KPI cards */}
                        <CardHeader className="pb-2">
                            <CardTitle className="flex justify-between items-center text-sm font-medium text-slate-500 uppercase tracking-wider">
                                <span>{stage} Phase</span>
                                <Badge variant="secondary" className="normal-case tracking-normal">{stageTasks.length} Tasks</Badge>
                            </CardTitle>
                        </CardHeader>

                        {/* No extra overrides here, letting Shadcn do its native layout */}
                        <CardContent>
                            {stageTasks.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-2">No tasks in this phase.</p>
                            ) : (
                                <div className="overflow-x-auto custom-scrollbar">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="whitespace-nowrap">
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
                                                <TableRow key={task.id} className="whitespace-nowrap">
                                                    <TableCell className="font-medium text-orange-700">
                                                        <Link href={`/projects/${task.project_id}`} className="hover:underline">
                                                            {task.projects?.name || 'Unknown'}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>{task.title}</TableCell>
                                                    <TableCell>{task.accountable_name || 'Unassigned'}</TableCell>
                                                    <TableCell className={task.deadline && new Date(task.deadline) < new Date() && task.status !== 'Done' ? 'text-red-600 font-medium' : ''}>
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
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}

            </div>
        </div>
    );
}