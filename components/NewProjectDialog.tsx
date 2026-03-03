'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export function NewProjectDialog({ onProjectCreated }: { onProjectCreated?: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<any[]>([]);

    // Form States
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [jobType, setJobType] = useState('Loose Item');
    const [deadline, setDeadline] = useState('');
    const [designerId, setDesignerId] = useState<string>('none');

    // Fetch team members for the Designer dropdown when dialog opens
    useEffect(() => {
        if (open) {
            const fetchUsers = async () => {
                const { data } = await supabase.from('profiles').select('id, full_name, role').order('full_name');
                if (data) setUsers(data);
            };
            fetchUsers();
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.from('projects').insert([
            {
                name,
                description,
                job_type: jobType,
                deadline: deadline || null,
                status: 'Pre-Production', // Automatically enforced!
                designer_id: designerId === 'none' ? null : designerId // Link to the user
            },
        ]);

        setLoading(false);

        if (error) {
            alert('Error creating project: ' + error.message);
        } else {
            setOpen(false);
            // Reset form
            setName('');
            setDescription('');
            setJobType('Loose Item');
            setDeadline('');
            setDesignerId('none');

            if (onProjectCreated) onProjectCreated();
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">+ New Project</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>New Job Card</DialogTitle>
                    <DialogDescription>
                        Create a new project. You can add tasks, drawings, and files in the workspace immediately after creation.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Project Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="e.g. Smith Kitchen Island" required />
                    </div>

                    {/* NEW: Designer Dropdown */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="designer" className="text-right">Designer</Label>
                        <div className="col-span-3">
                            <Select value={designerId} onValueChange={setDesignerId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select designer" />
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
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">Job Type</Label>
                        <div className="col-span-3">
                            <Select value={jobType} onValueChange={setJobType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Loose Item">Loose Item</SelectItem>
                                    <SelectItem value="Big Install">Big Install</SelectItem>
                                    <SelectItem value="Small Install">Small Install</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="deadline" className="text-right">Deadline</Label>
                        <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="col-span-3" />
                    </div>

                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="desc" className="text-right mt-2">Notes</Label>
                        <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" placeholder="Technical details, client requests..." rows={3} />
                    </div>

                    <div className="flex justify-end mt-4">
                        <Button type="submit" disabled={loading} className="bg-blue-600 text-white">
                            {loading ? 'Saving...' : 'Create Job Card'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}