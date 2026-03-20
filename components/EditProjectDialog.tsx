'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EditIcon } from 'lucide-react';

const TOP_CLIENTS = ['Design House A', 'Interiors B', 'Architects C', 'Studio D'];

export function EditProjectDialog({ project, onProjectUpdated, customTrigger }: { project: any, onProjectUpdated: () => void, customTrigger?: React.ReactNode }) {
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
            setName(project.name || '');
            setDescription(project.description || '');
            setJobType(project.job_type || 'Loose Item');
            setDeadline(project.deadline || '');
            setDeliveryGauteng(project.delivery_gauteng || false);

            // Format timestamps for HTML date inputs (YYYY-MM-DD)
            setInstallationDate(project.installation_date || '');
            setDepositReceived(project.deposit_received_at ? project.deposit_received_at.split('T')[0] : '');
            setDrawingsReceived(project.drawings_received_at ? project.drawings_received_at.split('T')[0] : '');

            if (TOP_CLIENTS.includes(project.client_name)) {
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
            alert('Error updating project: ' + error.message);
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
                className="sm:max-w-[500px]"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <DialogHeader>
                    <DialogTitle>Edit Job Card</DialogTitle>
                    <DialogDescription>Update the details for this project.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-name" className="text-right">Project Name</Label>
                        <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-designer" className="text-right">Designer</Label>
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
                            <Label htmlFor="edit-customClient" className="text-right text-slate-400 text-xs">Custom Name</Label>
                            <Input id="edit-customClient" value={customClient} onChange={(e) => setCustomClient(e.target.value)} className="col-span-3" required />
                        </div>
                    )}

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-type" className="text-right">Job Type</Label>
                        <div className="col-span-3">
                            <Select value={jobType} onValueChange={setJobType}>
                                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Loose Item">Loose Item</SelectItem>
                                    <SelectItem value="Big Install">Big Install</SelectItem>
                                    <SelectItem value="Small Install">Small Install</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-deadline" className="text-right">Prod. Deadline</Label>
                        <Input id="edit-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="col-span-3" />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <div className="col-start-2 col-span-3 flex items-center space-x-2">
                            <input type="checkbox" id="edit-gauteng" checked={deliveryGauteng} onChange={(e) => setDeliveryGauteng(e.target.checked)} className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500 cursor-pointer" />
                            <Label htmlFor="edit-gauteng" className="text-sm font-normal cursor-pointer">Delivery in Gauteng</Label>
                        </div>
                    </div>

                    {/* NEW: Management Milestones */}
                    <div className="grid grid-cols-4 items-center gap-4 border-t pt-4 mt-2">
                        <Label className="col-span-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Management Milestones</Label>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-install-date" className="text-right text-xs">Installation Date</Label>
                        <Input id="edit-install-date" type="date" value={installationDate} onChange={(e) => setInstallationDate(e.target.value)} className="col-span-3" />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-deposit-date" className="text-right text-xs">Deposit Rec'd</Label>
                        <Input id="edit-deposit-date" type="date" value={depositReceived} onChange={(e) => setDepositReceived(e.target.value)} className="col-span-3" />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-drawings-date" className="text-right text-xs">Drawings Rec'd</Label>
                        <Input id="edit-drawings-date" type="date" value={drawingsReceived} onChange={(e) => setDrawingsReceived(e.target.value)} className="col-span-3" />
                    </div>

                    <div className="grid grid-cols-4 items-start gap-4 border-t pt-4 mt-2">
                        <Label htmlFor="edit-desc" className="text-right mt-2">Notes</Label>
                        <Textarea id="edit-desc" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" rows={3} />
                    </div>

                    <div className="flex justify-end mt-4 pt-4 border-t sticky bottom-0 bg-white">
                        <Button type="submit" disabled={loading || !isFormValid} className="bg-orange-600 text-white cursor-pointer w-full">
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}