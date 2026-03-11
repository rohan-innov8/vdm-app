'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2Icon, CalendarIcon } from 'lucide-react';
import { EditTaskDialog } from '@/components/EditTaskDialog';

const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No deadline';
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

export function TaskList({ projectId, isAdmin }: { projectId: string; isAdmin: boolean }) {
    const [tasks, setTasks] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Dialog & Form State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDesc, setNewTaskDesc] = useState('');
    const [newTaskDeadline, setNewTaskDeadline] = useState('');
    const [assigneeId, setAssigneeId] = useState<string>('none');

    useEffect(() => {
        fetchTasksAndUsers();
    }, [projectId]);

    const fetchTasksAndUsers = async () => {
        setLoading(true);

        const { data: tasksData } = await supabase
            .from('tasks')
            .select('*, profiles(id, full_name, role)')
            .eq('project_id', projectId)
            .order('created_at', { ascending: true });

        setTasks(tasksData || []);

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
                description: newTaskDesc,
                deadline: newTaskDeadline || null,
                assigned_to: assigneeId === 'none' ? null : assigneeId,
                status: 'Pending'
            }
        ]);

        if (error) {
            alert('Failed to add task: ' + error.message);
        } else {
            // Reset form and close dialog
            setNewTaskTitle('');
            setNewTaskDesc('');
            setNewTaskDeadline('');
            setAssigneeId('none');
            setIsDialogOpen(false);
            fetchTasksAndUsers();
        }
    };

    const handleStatusChange = async (taskId: string, newStatus: string) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

        const { error } = await supabase
            .from('tasks')
            .update({ status: newStatus })
            .eq('id', taskId);

        if (error) {
            alert('Failed to update status');
            fetchTasksAndUsers();
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        const { error } = await supabase.from('tasks').delete().eq('id', taskId);
        if (error) alert('Failed to delete task: ' + error.message);
        else fetchTasksAndUsers();
    };

    if (loading) return <p className="text-sm text-slate-500">Loading tasks...</p>;

    return (
        <div className="space-y-6">

            {/* Header & Add Button */}
            <div className="flex justify-between items-center">
                <h3 className="font-medium text-slate-900">Project Deliverables</h3>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm cursor-pointer">+ New Task</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[450px]">
                        <DialogHeader>
                            <DialogTitle>Add New Task</DialogTitle>
                            <DialogDescription>Create a specific deliverable for this project.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddTask} className="grid gap-4 py-4">

                            <div className="space-y-1.5">
                                <Label htmlFor="title">Task Name</Label>
                                <Input id="title" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} placeholder="e.g. Prep materials" required />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label>Accountable</Label>
                                    <Select value={assigneeId} onValueChange={setAssigneeId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Assign to..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Unassigned</SelectItem>
                                            {users.map(u => (
                                                <SelectItem key={u.id} value={u.id}>
                                                    {u.full_name || 'Unknown'}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="deadline">Deadline</Label>
                                    <Input id="deadline" type="date" value={newTaskDeadline} onChange={(e) => setNewTaskDeadline(e.target.value)} />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="desc">Task Details</Label>
                                <Textarea id="desc" value={newTaskDesc} onChange={(e) => setNewTaskDesc(e.target.value)} placeholder="Provide detailed instructions..." rows={3} />
                            </div>

                            <Button type="submit" disabled={!newTaskTitle.trim()} className="w-full mt-2 bg-blue-600 text-white">
                                Save Task
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Task List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tasks.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-6 border border-dashed rounded-lg md:col-span-2">No tasks assigned yet.</p>
                ) : (
                    tasks.map(task => {
                        const isDone = task.status === 'Done';
                        return (
                            <div key={task.id} className={`flex flex-col justify-between gap-4 p-4 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow ${isDone ? 'opacity-70 bg-slate-50' : ''}`}>

                                {/* Task Content */}
                                <div>
                                    <div className="flex justify-between items-start gap-2 mb-1">
                                        <p className={`font-semibold text-slate-900 ${isDone ? 'line-through text-slate-500' : ''}`}>
                                            {task.title}
                                        </p>
                                        <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400 whitespace-nowrap">
                                            <CalendarIcon className="w-3 h-3" />
                                            {formatDate(task.deadline)}
                                        </span>
                                    </div>

                                    {task.description && (
                                        <p className={`text-xs mt-2 line-clamp-2 ${isDone ? 'text-slate-400' : 'text-slate-600'}`}>
                                            {task.description}
                                        </p>
                                    )}

                                    <div className="mt-3 flex items-center gap-1.5">
                                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                                            {task.profiles?.full_name ? task.profiles.full_name.charAt(0).toUpperCase() : 'U'}
                                        </span>
                                        <span className="text-xs font-medium text-slate-700">{task.profiles?.full_name || 'Unassigned'}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-between gap-2 pt-2 border-t">
                                    <Select value={task.status} onValueChange={(val) => handleStatusChange(task.id, val)}>
                                        <SelectTrigger className={`w-[130px] h-8 text-xs font-medium cursor-pointer ${task.status === 'Done' ? 'bg-green-50 text-green-700 border-green-200' :
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

                                    {isAdmin && (
                                        <div className="flex items-center gap-1">
                                            <EditTaskDialog task={task} users={users} onTaskUpdated={fetchTasksAndUsers} />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteTask(task.id)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 cursor-pointer"
                                                title="Delete Task"
                                            >
                                                <Trash2Icon className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>

                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}