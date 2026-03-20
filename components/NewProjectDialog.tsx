'use client';
import { useState } from 'react';
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
            alert('Error creating project: ' + error.message);
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
                <Button className="bg-orange-600 hover:bg-orange-700 text-white cursor-pointer shadow-sm">+ New Project</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>New Job Card</DialogTitle>
                    <DialogDescription>Create a new project. You can add tasks, drawings, and files in the workspace immediately after creation.</DialogDescription>
                </DialogHeader>

                {/* Added max-height and scrolling so the taller form doesn't clip on small screens */}
                <form onSubmit={handleSubmit} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Project Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="e.g. Smith Kitchen Island" required />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="designer" className="text-right">Designer</Label>
                        <div className="col-span-3">
                            <Select value={clientSelection} onValueChange={setClientSelection}>
                                <SelectTrigger className="w-full">
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
                            <Label htmlFor="customClient" className="text-right text-slate-400 text-xs">Custom Name</Label>
                            <Input id="customClient" value={customClient} onChange={(e) => setCustomClient(e.target.value)} className="col-span-3" placeholder="Enter designer name..." required />
                        </div>
                    )}

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">Job Type</Label>
                        <div className="col-span-3">
                            <Select value={jobType} onValueChange={setJobType}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="Select type" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Loose Item">Loose Item</SelectItem>
                                    <SelectItem value="Big Install">Big Install</SelectItem>
                                    <SelectItem value="Small Install">Small Install</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="deadline" className="text-right">Prod. Deadline</Label>
                        <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="col-span-3" />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <div className="col-start-2 col-span-3 flex items-center space-x-2">
                            <input type="checkbox" id="gauteng" checked={deliveryGauteng} onChange={(e) => setDeliveryGauteng(e.target.checked)} className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500 cursor-pointer" />
                            <Label htmlFor="gauteng" className="text-sm font-normal cursor-pointer">Delivery in Gauteng</Label>
                        </div>
                    </div>

                    {/* NEW: Management Milestones (Admin Only by nature of the form) */}
                    <div className="grid grid-cols-4 items-center gap-4 border-t pt-4 mt-2">
                        <Label className="col-span-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Management Milestones</Label>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="install-date" className="text-right text-xs">Installation Date</Label>
                        <Input id="install-date" type="date" value={installationDate} onChange={(e) => setInstallationDate(e.target.value)} className="col-span-3" />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="deposit-date" className="text-right text-xs">Deposit Rec'd</Label>
                        <Input id="deposit-date" type="date" value={depositReceived} onChange={(e) => setDepositReceived(e.target.value)} className="col-span-3" />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="drawings-date" className="text-right text-xs">Drawings Rec'd</Label>
                        <Input id="drawings-date" type="date" value={drawingsReceived} onChange={(e) => setDrawingsReceived(e.target.value)} className="col-span-3" />
                    </div>

                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="desc" className="text-right mt-2">Notes</Label>
                        <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" placeholder="Technical details, client requests..." rows={3} />
                    </div>

                    <div className="flex justify-end mt-4 pt-4 border-t sticky bottom-0 bg-white">
                        <Button type="submit" disabled={loading || !isFormValid} className="bg-orange-600 text-white cursor-pointer w-full">
                            {loading ? 'Saving...' : 'Create Job Card'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}