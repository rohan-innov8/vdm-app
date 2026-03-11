'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PencilIcon } from 'lucide-react';

export function EditTaskDialog({ task, users, onTaskUpdated }: { task: any, users: any[], onTaskUpdated: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [deadline, setDeadline] = useState('');
    const [assigneeId, setAssigneeId] = useState('none');

    // Pre-fill the form
    useEffect(() => {
        if (task && open) {
            setTitle(task.title || '');
            setDescription(task.description || '');
            setDeadline(task.deadline || '');
            setAssigneeId(task.assigned_to || 'none');
        }
    }, [task, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase
            .from('tasks')
            .update({
                title,
                description,
                deadline: deadline || null,
                assigned_to: assigneeId === 'none' ? null : assigneeId
            })
            .eq('id', task.id);

        setLoading(false);

        if (error) {
            alert('Failed to update task: ' + error.message);
        } else {
            setOpen(false);
            onTaskUpdated();
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 h-8 w-8 cursor-pointer"
                    title="Edit Task"
                >
                    <PencilIcon className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent
                className="sm:max-w-[450px]"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <DialogHeader>
                    <DialogTitle>Edit Task</DialogTitle>
                    <DialogDescription>Update deliverable details.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="edit-task-title">Task Name</Label>
                        <Input id="edit-task-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Accountable</Label>
                            <Select value={assigneeId} onValueChange={setAssigneeId}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Unassigned</SelectItem>
                                    {users.map(u => (
                                        <SelectItem key={u.id} value={u.id}>{u.full_name || 'Unknown'}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-task-deadline">Deadline</Label>
                            <Input id="edit-task-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="edit-task-desc">Task Details</Label>
                        <Textarea id="edit-task-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                    </div>

                    <Button type="submit" disabled={loading || !title.trim()} className="w-full mt-2 bg-blue-600 text-white">
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}