'use client';
import { useState, useEffect } from 'react';
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
import { EditIcon } from 'lucide-react';

const TOP_CLIENTS = ['Design House A', 'Interiors B', 'Architects C', 'Studio D'];

export function EditProjectDialog({ project, onProjectUpdated, customTrigger }: { project: any, onProjectUpdated: () => void, customTrigger?: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form States
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [jobType, setJobType] = useState('');
    const [deadline, setDeadline] = useState('');
    const [clientSelection, setClientSelection] = useState('');
    const [customClient, setCustomClient] = useState('');
    const [deliveryGauteng, setDeliveryGauteng] = useState(false); // <-- NEW STATE

    // Pre-fill the form when the dialog opens
    useEffect(() => {
        if (project && open) {
            setName(project.name || '');
            setDescription(project.description || '');
            setJobType(project.job_type || 'Loose Item');
            setDeadline(project.deadline || '');
            setDeliveryGauteng(project.delivery_gauteng || false); // <-- NEW PREFILL

            if (TOP_CLIENTS.includes(project.client_name)) {
                setClientSelection(project.client_name);
                setCustomClient('');
            } else if (project.client_name) {
                // If it's a custom string not in the top 4, set to Other
                setClientSelection('Other');
                setCustomClient(project.client_name);
            } else {
                setClientSelection('');
                setCustomClient('');
            }
        }
    }, [project, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const finalClientName = clientSelection === 'Other' ? customClient : clientSelection;

        const { error } = await supabase
            .from('projects')
            .update({
                name,
                description,
                job_type: jobType,
                deadline: deadline || null,
                client_name: finalClientName || null,
                delivery_gauteng: deliveryGauteng // <-- NEW FIELD
            })
            .eq('id', project.id);

        setLoading(false);

        if (error) {
            alert('Error updating project: ' + error.message);
        } else {
            setOpen(false);
            onProjectUpdated(); // Refresh the page data
        }
    };

    // Determine if the form meets the minimum requirements to be submitted
    const isFormValid = name.trim() !== '' && (clientSelection === 'Other' ? customClient.trim() !== '' : true);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {customTrigger ? customTrigger : (
                    <Button variant="outline" className="gap-2 cursor-pointer">
                        <EditIcon className="h-4 w-4" />
                        Edit Job
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent
                className="sm:max-w-[500px]"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <DialogHeader>
                    <DialogTitle>Edit Job Card</DialogTitle>
                    <DialogDescription>
                        Update the details for this project.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-name" className="text-right">Project Name</Label>
                        <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-designer" className="text-right">Designer</Label>
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

                    {clientSelection === 'Other' && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-customClient" className="text-right text-slate-400 text-xs">Custom Name</Label>
                            <Input id="edit-customClient" value={customClient} onChange={(e) => setCustomClient(e.target.value)} className="col-span-3" required />
                        </div>
                    )}

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-type" className="text-right">Job Type</Label>
                        <div className="col-span-3">
                            <Select value={jobType} onValueChange={setJobType}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Loose Item">Loose Item</SelectItem>
                                    <SelectItem value="Big Install">Big Install</SelectItem>
                                    <SelectItem value="Small Install">Small Install</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-deadline" className="text-right">Deadline</Label>
                        <Input id="edit-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="col-span-3" />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <div className="col-start-2 col-span-3 flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="edit-gauteng"
                                checked={deliveryGauteng}
                                onChange={(e) => setDeliveryGauteng(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                            />
                            <Label htmlFor="edit-gauteng" className="text-sm font-normal cursor-pointer">
                                Delivery in Gauteng
                            </Label>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="edit-desc" className="text-right mt-2">Notes</Label>
                        <Textarea id="edit-desc" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" rows={3} />
                    </div>

                    <div className="flex justify-end mt-4">
                        <Button type="submit" disabled={loading || !isFormValid} className="bg-blue-600 text-white cursor-pointer">
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}