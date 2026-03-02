'use client';
import { useState } from 'react';
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

    // Form States
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [jobType, setJobType] = useState('Loose Item');
    const [deadline, setDeadline] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.from('projects').insert([
            {
                name,
                description,
                job_type: jobType,
                deadline: deadline || null, // Handle empty dates
                status: 'New', // Default status
            },
        ]);

        setLoading(false);

        if (error) {
            alert('Error creating project: ' + error.message);
        } else {
            setOpen(false);
            setName('');
            setDescription('');
            // Trigger a refresh if the parent component asks for it
            if (onProjectCreated) onProjectCreated();
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">+ New Project</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                        Add a new manufacturing job to the system.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">

                    {/* Project Name */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3"
                            placeholder="e.g. Smith Kitchen Island"
                            required
                        />
                    </div>

                    {/* Job Type Dropdown */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">
                            Type
                        </Label>
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

                    {/* Deadline */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="deadline" className="text-right">
                            Deadline
                        </Label>
                        <Input
                            id="deadline"
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            className="col-span-3"
                        />
                    </div>

                    {/* Description */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="desc" className="text-right">
                            Notes
                        </Label>
                        <Textarea
                            id="desc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="col-span-3"
                            placeholder="Technical details..."
                        />
                    </div>

                    <Button type="submit" disabled={loading} className="ml-auto bg-blue-600 text-white">
                        {loading ? 'Saving...' : 'Create Project'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}