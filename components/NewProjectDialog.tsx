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

// Define your top clients here (Bram can change these names later!)
const TOP_CLIENTS = ['Design House A', 'Interiors B', 'Architects C', 'Studio D'];

export function NewProjectDialog({ onProjectCreated }: { onProjectCreated?: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form States
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [jobType, setJobType] = useState('Loose Item');
    const [deadline, setDeadline] = useState('');

    // NEW: Client/Designer States
    const [clientSelection, setClientSelection] = useState<string>('');
    const [customClient, setCustomClient] = useState('');
    const [deliveryGauteng, setDeliveryGauteng] = useState(false); // <-- NEW STATE

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Determine which name to save
        const finalClientName = clientSelection === 'Other' ? customClient : clientSelection;

        const { error } = await supabase.from('projects').insert([
            {
                name,
                description,
                job_type: jobType,
                deadline: deadline || null,
                status: 'Pre-Production',
                client_name: finalClientName || null,
                delivery_gauteng: deliveryGauteng // <-- NEW FIELD
            },
        ]);

        setLoading(false);
        setDeliveryGauteng(false);

        if (error) {
            alert('Error creating project: ' + error.message);
        } else {
            setOpen(false);
            // Reset form
            setName('');
            setDescription('');
            setJobType('Loose Item');
            setDeadline('');
            setClientSelection('');
            setCustomClient('');

            if (onProjectCreated) onProjectCreated();
        }
    };

    // Determine if the form meets the minimum requirements to be submitted
    const isFormValid = name.trim() !== '' && (clientSelection === 'Other' ? customClient.trim() !== '' : true);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white cursor-pointer shadow-sm">+ New Project</Button>
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

                    {/* NEW: Designer / Client Dropdown */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="designer" className="text-right">Designer</Label>
                        <div className="col-span-3">
                            <Select value={clientSelection} onValueChange={setClientSelection}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a designer or client" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TOP_CLIENTS.map(client => (
                                        <SelectItem key={client} value={client}>{client}</SelectItem>
                                    ))}
                                    <SelectItem value="Other">Other (Type custom name)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* NEW: Conditionally render the custom text input if 'Other' is selected */}
                    {clientSelection === 'Other' && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="customClient" className="text-right text-slate-400 text-xs">Custom Name</Label>
                            <Input
                                id="customClient"
                                value={customClient}
                                onChange={(e) => setCustomClient(e.target.value)}
                                className="col-span-3"
                                placeholder="Enter designer name..."
                                required
                            />
                        </div>
                    )}

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

                    <div className="grid grid-cols-4 items-center gap-4">
                        <div className="col-start-2 col-span-3 flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="gauteng"
                                checked={deliveryGauteng}
                                onChange={(e) => setDeliveryGauteng(e.target.checked)}
                                className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500 cursor-pointer"
                            />
                            <Label htmlFor="gauteng" className="text-sm font-normal cursor-pointer">
                                Delivery in Gauteng
                            </Label>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="desc" className="text-right mt-2">Notes</Label>
                        <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" placeholder="Technical details, client requests..." rows={3} />
                    </div>

                    <div className="flex justify-end mt-4">
                        <Button type="submit" disabled={loading || !isFormValid} className="bg-orange-600 text-white cursor-pointer">
                            {loading ? 'Saving...' : 'Create Job Card'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}