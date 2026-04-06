'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TOP_CLIENTS = ['Design House A', 'Interiors B', 'Architects C', 'Studio D'];

export function NewProjectDialog({ onProjectCreated }: { onProjectCreated?: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [jobType, setJobType] = useState('Loose Item');
    const [deadline, setDeadline] = useState('');
    const [clientSelection, setClientSelection] = useState<string>('');
    const [customClient, setCustomClient] = useState('');
    const [deliveryGauteng, setDeliveryGauteng] = useState(false);

    // NEW: Management Dates
    const [installationDate, setInstallationDate] = useState('');
    const [depositReceived, setDepositReceived] = useState('');
    const [drawingsReceived, setDrawingsReceived] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const finalClientName = clientSelection === 'Other' ? customClient : clientSelection;

        const { error } = await supabase.from('projects').insert([
            {
                name,
                description,
                job_type: jobType,
                deadline: deadline || null,
                status: 'Pre-Production',
                client_name: finalClientName || null,
                delivery_gauteng: deliveryGauteng,
                installation_date: installationDate || null,
                deposit_received_at: depositReceived || null,
                drawings_received_at: drawingsReceived || null
            },
        ]);

        setLoading(false);

        if (error) {
            toast.error('Error creating project: ' + error.message);
        } else {
            setOpen(false);
            setName('');
            setDescription('');
            setJobType('Loose Item');
            setDeadline('');
            setClientSelection('');
            setCustomClient('');
            setDeliveryGauteng(false);
            setInstallationDate('');
            setDepositReceived('');
            setDrawingsReceived('');

            if (onProjectCreated) onProjectCreated();
        }
    };

    const isFormValid = name.trim() !== '' && (clientSelection === 'Other' ? customClient.trim() !== '' : true);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {/* h-12 on mobile for touch target */}
                <Button className="bg-orange-600 hover:bg-orange-700 text-white cursor-pointer shadow-sm h-12 sm:h-10">+ New Project</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] p-4">
                <DialogHeader>
                    <DialogTitle>New Job Card</DialogTitle>
                    <DialogDescription>Create a new project. You can add tasks, drawings, and files in the workspace immediately after creation.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
                    <div className="space-y-1.5">
                        <Label htmlFor="name">Project Name</Label>
                        {/* h-12 on mobile */}
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Smith Kitchen Island" required className="h-12 sm:h-10" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Designer</Label>
                            <Select value={clientSelection} onValueChange={setClientSelection}>
                                {/* h-12 on mobile */}
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
                                {/* h-12 on mobile */}
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
                            {/* h-12 on mobile */}
                            <Input id="customClient" value={customClient} onChange={(e) => setCustomClient(e.target.value)} placeholder="Enter designer name..." required className="h-12 sm:h-10" />
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="deadline">Prod. Deadline</Label>
                            {/* h-12 on mobile */}
                            <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="h-12 sm:h-10" />
                        </div>
                        {/* Adjusted padding on mobile to align with the taller inputs */}
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
                                {/* h-12 on mobile */}
                                <Input type="date" value={installationDate} onChange={(e) => setInstallationDate(e.target.value)} className="h-12 sm:h-10" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">Deposit Rec&apos;d</Label>
                                {/* h-12 on mobile */}
                                <Input type="date" value={depositReceived} onChange={(e) => setDepositReceived(e.target.value)} className="h-12 sm:h-10" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">Drawings Rec&apos;d</Label>
                                {/* h-12 on mobile */}
                                <Input type="date" value={drawingsReceived} onChange={(e) => setDrawingsReceived(e.target.value)} className="h-12 sm:h-10" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={loading || !isFormValid} className="bg-orange-600 text-white w-full h-12 sm:h-10">
                            {loading ? 'Saving...' : 'Save Job Card'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}