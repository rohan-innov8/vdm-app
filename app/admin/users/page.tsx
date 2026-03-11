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
import { deleteUserAccount } from '@/app/actions/deleteUser'; // <-- Import the secure action

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

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error(error);
        else setUsers(data || []);

        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, [router]);

    const handleRoleChange = async (userId: string, currentRole: string, newRole: string) => {
        if (currentRole === 'admin' && newRole !== 'admin') {
            const adminCount = users.filter((u) => u.role === 'admin').length;
            if (adminCount <= 1) {
                alert('Action blocked: You cannot remove the last admin in the system.');
                return;
            }
        }

        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);

        if (error) {
            alert('Failed to update role: ' + error.message);
        }

        fetchUsers(); // Refresh the data
    };

    // NEW: Handle User Deletion securely
    const handleDeleteUser = async (userId: string, currentRole: string) => {
        // Safety check 1: Don't delete the last admin
        if (currentRole === 'admin') {
            const adminCount = users.filter((u) => u.role === 'admin').length;
            if (adminCount <= 1) {
                alert('Action blocked: You cannot delete the last admin in the system.');
                return;
            }
        }

        // Safety check 2: Confirmation
        if (!window.confirm('Are you ABSOLUTELY sure you want to delete this user? Their account and access will be permanently removed.')) {
            return;
        }

        try {
            // Trigger the secure server-side deletion
            await deleteUserAccount(userId);
            // Refresh the table
            fetchUsers();
        } catch (error: any) {
            alert('Failed to delete user: ' + error.message);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-screen text-slate-500">Loading users...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-5xl mx-auto space-y-6">

                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
                        <p className="text-slate-500">Manage access levels for your team.</p>
                    </div>
                    <Link href="/">
                        <Button variant="outline" className='cursor-pointer'>Back to Dashboard</Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Team Directory</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Current Role</TableHead>
                                    <TableHead className="text-right">Change Role</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((u) => (
                                    <TableRow key={u.id}>
                                        <TableCell className="font-medium">{u.full_name || 'N/A'}</TableCell>
                                        <TableCell>{u.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                                                {u.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Select
                                                value={u.role}
                                                onValueChange={(value) => handleRoleChange(u.id, u.role, value)}
                                            >
                                                <SelectTrigger className="w-[140px] ml-auto cursor-pointer">
                                                    <SelectValue placeholder="Select role" />
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
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
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
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}