'use client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PencilIcon } from 'lucide-react';
import { TEAM_MEMBERS } from '@/lib/utils';
import { ExtendedTask } from '@/lib/types';

export function EditTaskDialog({ task, onTaskUpdated }: { task: ExtendedTask, onTaskUpdated: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [deadline, setDeadline] = useState('');
    const [accountableName, setAccountableName] = useState(TEAM_MEMBERS[0]);

    // Pre-fill the form
    useEffect(() => {
        if (task && open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setTitle(task.title || '');
            setDescription(task.description || '');
            setDeadline(task.deadline || '');
            setAccountableName(task.accountable_name || TEAM_MEMBERS[0]);
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
                accountable_name: accountableName
            })
            .eq('id', task.id);

        setLoading(false);

        if (error) {
            toast.error('Failed to update task: ' + error.message);
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
                    // h-12 w-12 for safe mobile tapping, h-8 w-8 on desktop
                    className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 h-12 w-12 sm:h-8 sm:w-8 cursor-pointer"
                    title="Edit Task"
                >
                    <PencilIcon className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent
                className="sm:max-w-[450px] p-4"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <DialogHeader>
                    <DialogTitle>Edit Task</DialogTitle>
                    <DialogDescription>Update deliverable details.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
                    <div className="space-y-1.5">
                        <Label htmlFor="edit-task-title">Task Name</Label>
                        <Input id="edit-task-title" value={title} onChange={(e) => setTitle(e.target.value)} required className="h-12 sm:h-10" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Accountable</Label>
                            <Select value={accountableName} onValueChange={setAccountableName}>
                                <SelectTrigger className="w-full h-12 sm:h-10"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {TEAM_MEMBERS.map(member => (
                                        <SelectItem key={member} value={member} className="py-3 sm:py-1.5">{member}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-task-deadline">Deadline</Label>
                            <Input id="edit-task-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="h-12 sm:h-10" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="edit-task-desc">Task Details</Label>
                        <Textarea id="edit-task-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={loading || !title.trim()} className="w-full h-12 sm:h-10 bg-indigo-600 text-white cursor-pointer">
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}