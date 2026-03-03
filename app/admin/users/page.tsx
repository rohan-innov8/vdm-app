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

export default function UserManagementPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function fetchUsers() {
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
        }

        fetchUsers();
    }, [router]);

    const handleRoleChange = async (userId: string, currentRole: string, newRole: string) => {
        // SAFETY CHECK: Prevent downgrading the last admin
        if (currentRole === 'admin' && newRole !== 'admin') {
            const adminCount = users.filter((u) => u.role === 'admin').length;
            if (adminCount <= 1) {
                alert('Action blocked: You cannot remove the last admin in the system.');
                return;
            }
        }

        // 1. Tell the user we are working on it (Optional: you could add a local loading state here)

        // 2. Ask the database to make the change FIRST
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);

        if (error) {
            alert('Failed to update role: ' + error.message);
        }

        // 3. Force a fresh download of the "Truth" from the database. 
        // If the database silently blocked the change, this will instantly snap the UI back to reality.
        const { data: refreshedUsers } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (refreshedUsers) {
            setUsers(refreshedUsers);
        }
    };

    // FIX 1: Centered loading state to match the dashboard
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
                        <Button variant="outline">Back to Dashboard</Button>
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
                                    {/* FIX 2: Aligned the column header to the right */}
                                    <TableHead className="text-right">Change Role</TableHead>
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
                                        {/* FIX 2: Aligned the dropdown to the right */}
                                        <TableCell className="text-right">
                                            <Select
                                                value={u.role}
                                                onValueChange={(value) => handleRoleChange(u.id, u.role, value)}
                                            >
                                                <SelectTrigger className="w-[140px] ml-auto">
                                                    <SelectValue placeholder="Select role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                    <SelectItem value="viewer">Viewer</SelectItem>
                                                </SelectContent>
                                            </Select>
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