'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function TaskList({ projectId }: { projectId: string }) {
    const [tasks, setTasks] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [assigneeId, setAssigneeId] = useState<string>('none');

    useEffect(() => {
        fetchTasksAndUsers();
    }, [projectId]);

    const fetchTasksAndUsers = async () => {
        setLoading(true);

        // 1. Fetch Tasks (and grab the user's name from the profiles table simultaneously!)
        const { data: tasksData } = await supabase
            .from('tasks')
            .select('*, profiles(id, full_name, role)')
            .eq('project_id', projectId)
            .order('created_at', { ascending: true });

        setTasks(tasksData || []);

        // 2. Fetch Users to populate the "Assign To" dropdown
        const { data: usersData } = await supabase
            .from('profiles')
            .select('id, full_name, role')
            .order('full_name', { ascending: true });

        setUsers(usersData || []);
        setLoading(false);
    };

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        const { error } = await supabase.from('tasks').insert([
            {
                project_id: projectId,
                title: newTaskTitle,
                assigned_to: assigneeId === 'none' ? null : assigneeId,
                status: 'Pending'
            }
        ]);

        if (error) {
            alert('Failed to add task: ' + error.message);
        } else {
            setNewTaskTitle('');
            setAssigneeId('none');
            fetchTasksAndUsers(); // Refresh the list
        }
    };

    const handleStatusChange = async (taskId: string, newStatus: string) => {
        // Optimistic UI update
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

        const { error } = await supabase
            .from('tasks')
            .update({ status: newStatus })
            .eq('id', taskId);

        if (error) {
            alert('Failed to update status');
            fetchTasksAndUsers(); // Revert on failure
        }
    };

    if (loading) return <p className="text-sm text-slate-500">Loading tasks...</p>;

    return (
        <div className="space-y-6">

            {/* Add Task Form */}
            <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Input
                    placeholder="New task (e.g. Prep materials)..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="flex-1 bg-white"
                />
                <Select value={assigneeId} onValueChange={setAssigneeId}>
                    <SelectTrigger className="w-full sm:w-[200px] bg-white">
                        <SelectValue placeholder="Assign to..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">Unassigned</SelectItem>
                        {users.map(u => (
                            <SelectItem key={u.id} value={u.id}>
                                {u.full_name || u.email || 'Unknown'} <span className="text-slate-400 text-xs capitalize">({u.role})</span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button type="submit" disabled={!newTaskTitle.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">
                    Add Task
                </Button>
            </form>

            {/* Task List */}
            <div className="space-y-3">
                {tasks.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-6 border border-dashed rounded-lg">No tasks assigned yet.</p>
                ) : (
                    tasks.map(task => (
                        <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                            <div>
                                <p className="font-semibold text-slate-900">{task.title}</p>
                                <p className="text-xs text-slate-500 mt-1">
                                    Assigned to: <span className="font-medium text-slate-700">{task.profiles?.full_name || 'Unassigned'}</span>
                                </p>
                            </div>

                            <Select value={task.status} onValueChange={(val) => handleStatusChange(task.id, val)}>
                                <SelectTrigger className={`w-[140px] h-9 text-xs font-medium ${task.status === 'Done' ? 'bg-green-50 text-green-700 border-green-200' :
                                        task.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            'bg-gray-100 text-gray-700'
                                    }`}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Done">Done</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}