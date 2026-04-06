'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Trash2Icon } from 'lucide-react';
import { deleteUserAccount } from '@/app/actions/deleteUser';

export default function UserManagementPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchUsers = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/login');
            return;
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            alert('Unauthorized. Admins only.');
            router.push('/');
            return;
        }

        const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (data) setUsers(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, [router]);

    const handleRoleChange = async (userId: string, newRole: string) => {
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);

        if (error) {
            alert('Failed to update role');
        } else {
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        }
    };

    const handleDeleteUser = async (userId: string, userRole: string) => {
        if (userRole === 'admin') {
            alert("Safety lock: You cannot delete another admin from the dashboard.");
            return;
        }

        const confirmDelete = window.confirm("Are you SURE you want to delete this user? They will lose all access immediately.");
        if (!confirmDelete) return;

        try {
            const result = await deleteUserAccount(userId);
            if (result.success) {
                alert("User deleted successfully.");
                setUsers(users.filter(u => u.id !== userId));
            } else {
                alert("Failed to delete user: " + result.error);
            }
        } catch (err: any) {
            alert("Error: " + err.message);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-screen text-slate-500">Loading users...</div>;

    return (
        // Enforce p-4 (16px) on mobile, sm:p-8 (32px) on desktop
        <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
            {/* space-y-4 (16px) vertical gap matching Dashboard */}
            <div className="max-w-7xl mx-auto space-y-4">

                {/* Stack header on mobile, row on desktop, gap-4 (16px) */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">User Management</h1>
                        {/* mt-1 (4px) */}
                        <p className="text-slate-500 text-sm sm:text-base mt-1">Manage access levels and roles for your team.</p>
                    </div>

                    <Link href="/" className="w-full sm:w-auto">
                        {/* h-12 (48px) touch target on mobile */}
                        <Button variant="outline" className="w-full sm:w-auto h-12 sm:h-10 cursor-pointer">
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>

                <Card className="shadow-sm">
                    {/* pb-2 (8px) gap between header and content */}
                    <CardHeader className="pb-2">
                        {/* Styled to match Dashboard KPI headings */}
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                            Active Users
                        </CardTitle>
                    </CardHeader>

                    {/* Standard Shadcn CardContent, no overrides */}
                    <CardContent>
                        {/* Horizontal scroll container for the table on mobile */}
                        <div className="overflow-x-auto custom-scrollbar">
                            <Table>
                                <TableHeader>
                                    {/* Prevent columns from squishing */}
                                    <TableRow className="whitespace-nowrap">
                                        <TableHead>Full Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((u) => (
                                        <TableRow key={u.id} className="whitespace-nowrap">
                                            <TableCell className="font-medium text-slate-900">{u.full_name || 'No Name'}</TableCell>
                                            <TableCell className="text-slate-500">{u.email}</TableCell>
                                            <TableCell>
                                                <Select value={u.role} onValueChange={(val) => handleRoleChange(u.id, val)}>
                                                    {/* h-12 for better touch targets on mobile */}
                                                    <SelectTrigger className="w-[130px] h-12 sm:h-10">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="admin">Admin</SelectItem>
                                                        <SelectItem value="viewer">Viewer</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    // Ensure the delete button is easily tappable on phones
                                                    className="h-12 w-12 sm:h-10 sm:w-10 text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                                                    onClick={() => handleDeleteUser(u.id, u.role)}
                                                    title="Delete User"
                                                >
                                                    <Trash2Icon className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}