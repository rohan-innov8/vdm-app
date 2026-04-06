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
import { EditIcon } from 'lucide-react';
import { Project } from '@/lib/types';

const TOP_CLIENTS = ['Design House A', 'Interiors B', 'Architects C', 'Studio D'];

export function EditProjectDialog({ project, onProjectUpdated, customTrigger }: { project: Project, onProjectUpdated: () => void, customTrigger?: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [jobType, setJobType] = useState('');
    const [deadline, setDeadline] = useState('');
    const [clientSelection, setClientSelection] = useState('');
    const [customClient, setCustomClient] = useState('');
    const [deliveryGauteng, setDeliveryGauteng] = useState(false);

    // NEW: Management Dates
    const [installationDate, setInstallationDate] = useState('');
    const [depositReceived, setDepositReceived] = useState('');
    const [drawingsReceived, setDrawingsReceived] = useState('');

    useEffect(() => {
        if (project && open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setName(project.name || '');
            setDescription(project.description || '');
            setJobType(project.job_type || 'Loose Item');
            setDeadline(project.deadline || '');
            setDeliveryGauteng(project.delivery_gauteng || false);

            // Format timestamps for HTML date inputs (YYYY-MM-DD)
            setInstallationDate(project.installation_date || '');
            setDepositReceived(project.deposit_received_at ? project.deposit_received_at.split('T')[0] : '');
            setDrawingsReceived(project.drawings_received_at ? project.drawings_received_at.split('T')[0] : '');

            if (project.client_name && TOP_CLIENTS.includes(project.client_name)) {
                setClientSelection(project.client_name);
                setCustomClient('');
            } else if (project.client_name) {
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
                delivery_gauteng: deliveryGauteng,
                installation_date: installationDate || null,
                deposit_received_at: depositReceived || null,
                drawings_received_at: drawingsReceived || null
            })
            .eq('id', project.id);

        setLoading(false);

        if (error) {
            toast.error('Error updating project: ' + error.message);
        } else {
            setOpen(false);
            onProjectUpdated();
        }
    };

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
                className="sm:max-w-[500px] p-4"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <DialogHeader>
                    <DialogTitle>Edit Job Card</DialogTitle>
                    <DialogDescription>Update the details for this project.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
                    <div className="space-y-1.5">
                        <Label htmlFor="name">Project Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Smith Kitchen Island" required className="h-12 sm:h-10" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Designer</Label>
                            <Select value={clientSelection} onValueChange={setClientSelection}>
                                <SelectTrigger className="w-full h-12 sm:h-10">
                                    <SelectValue placeholder="Select designer..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {TOP_CLIENTS.map(client => (
                                        <SelectItem key={client} value={client} className="py-3 sm:py-1.5">{client}</SelectItem>
                                    ))}
                                    <SelectItem value="Other" className="py-3 sm:py-1.5">Other (Custom)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Job Type</Label>
                            <Select value={jobType} onValueChange={setJobType}>
                                <SelectTrigger className="w-full h-12 sm:h-10"><SelectValue placeholder="Select type" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Loose Item" className="py-3 sm:py-1.5">Loose Item</SelectItem>
                                    <SelectItem value="Big Install" className="py-3 sm:py-1.5">Big Install</SelectItem>
                                    <SelectItem value="Small Install" className="py-3 sm:py-1.5">Small Install</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {clientSelection === 'Other' && (
                        <div className="space-y-1.5">
                            <Label htmlFor="customClient" className="text-slate-400 text-xs">Custom Designer Name</Label>
                            <Input id="customClient" value={customClient} onChange={(e) => setCustomClient(e.target.value)} placeholder="Enter designer name..." required className="h-12 sm:h-10" />
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="deadline">Prod. Deadline</Label>
                            <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="h-12 sm:h-10" />
                        </div>
                        <div className="space-y-1.5 flex flex-col justify-center sm:justify-end pb-0 sm:pb-2 min-h-[48px] sm:min-h-0">
                            <div className="flex items-center space-x-2">
                                <input type="checkbox" id="gauteng" checked={deliveryGauteng} onChange={(e) => setDeliveryGauteng(e.target.checked)} className="w-5 h-5 sm:w-4 sm:h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500 cursor-pointer" />
                                <Label htmlFor="gauteng" className="cursor-pointer text-base sm:text-sm">Delivery in Gauteng</Label>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="desc">Notes</Label>
                        <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Technical details..." rows={2} />
                    </div>

                    {/* Milestones */}
                    <div className="pt-4 border-t mt-2">
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">Management Milestones</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs">Install Date</Label>
                                <Input type="date" value={installationDate} onChange={(e) => setInstallationDate(e.target.value)} className="h-12 sm:h-10" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">Deposit Rec&apos;d</Label>
                                <Input type="date" value={depositReceived} onChange={(e) => setDepositReceived(e.target.value)} className="h-12 sm:h-10" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">Drawings Rec&apos;d</Label>
                                <Input type="date" value={drawingsReceived} onChange={(e) => setDrawingsReceived(e.target.value)} className="h-12 sm:h-10" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={loading || !isFormValid} className="bg-orange-600 text-white w-full h-12 sm:h-10 cursor-pointer">
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}