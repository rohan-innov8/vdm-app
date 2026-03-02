'use client';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { NewProjectDialog } from '@/components/NewProjectDialog';
import { KanbanBoard } from '@/components/KanbanBoard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // New Input for search
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Helper for Badge Colors
const getStatusColor = (status: string) => {
    switch (status) {
        case 'New': return 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200';
        case 'In Production': return 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200';
        case 'Completed': return 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200';
        default: return 'bg-gray-100 text-gray-800';
    }
};

export default function ProjectsPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // New State for Search & Sort
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    const fetchProjects = async () => {
        // Only show loading on initial fetch, not updates
        if (projects.length === 0) setLoading(true);

        const { data, error } = await supabase.from('projects').select('*');
        if (error) console.error(error);
        else setProjects(data || []);

        setLoading(false);
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    // --- Optimistic UI Logic ---
    const handleMoveProject = async (projectId: string, newStatus: string) => {
        // 1. Snapshot the current state (in case we need to revert)
        const previousProjects = [...projects];

        // 2. Optimistically update the UI IMMEDIATELY
        setProjects((prev) =>
            prev.map((p) => (p.id === projectId ? { ...p, status: newStatus } : p))
        );

        // 3. Send request to Supabase in background
        const { error } = await supabase
            .from('projects')
            .update({ status: newStatus })
            .eq('id', projectId);

        // 4. If error, revert changes and show alert
        if (error) {
            console.error('Update failed:', error);
            alert('Failed to move project. Reverting...');
            setProjects(previousProjects);
        }
    };

    // --- Search & Sort Logic ---
    const filteredProjects = useMemo(() => {
        let processed = [...projects];

        // 1. Search Filter
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            processed = processed.filter(p =>
                p.name.toLowerCase().includes(lowerTerm) ||
                p.job_type.toLowerCase().includes(lowerTerm)
            );
        }

        // 2. Sorting
        if (sortConfig) {
            processed.sort((a, b) => {
                const aValue = a[sortConfig.key] || '';
                const bValue = b[sortConfig.key] || '';
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return processed;
    }, [projects, searchTerm, sortConfig]);

    // Sorting Handler
    const handleSort = (key: string) => {
        setSortConfig((current) => {
            if (current?.key === key && current.direction === 'asc') {
                return { key, direction: 'desc' };
            }
            return { key, direction: 'asc' };
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
                        <p className="text-slate-500">Manage manufacturing jobs and installations.</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <Link href="/">
                            <Button variant="outline">Back to Dashboard</Button>
                        </Link>
                        <NewProjectDialog onProjectCreated={fetchProjects} />
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <svg className="absolute left-3 top-3 h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <Input
                        placeholder="Search projects..."
                        className="pl-10 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Tabs & Views */}
                <Tabs defaultValue="kanban" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="kanban" className="cursor-pointer">Board View</TabsTrigger>
                        <TabsTrigger value="list" className="cursor-pointer">List View</TabsTrigger>
                    </TabsList>

                    <TabsContent value="kanban">
                        {loading ? <p>Loading board...</p> : (
                            <KanbanBoard projects={filteredProjects} onProjectMoved={handleMoveProject} />
                        )}
                    </TabsContent>

                    <TabsContent value="list">
                        <Card>
                            <CardHeader>
                                <CardTitle>All Active Jobs ({filteredProjects.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <p className="text-sm text-slate-500">Loading projects...</p>
                                ) : filteredProjects.length === 0 ? (
                                    <div className="text-center py-10 text-slate-500">
                                        No projects found matching your search.
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="cursor-pointer hover:bg-slate-50" onClick={() => handleSort('name')}>
                                                    Project Name {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                                </TableHead>
                                                <TableHead className="cursor-pointer hover:bg-slate-50" onClick={() => handleSort('job_type')}>
                                                    Type {sortConfig?.key === 'job_type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                                </TableHead>
                                                <TableHead className="cursor-pointer hover:bg-slate-50" onClick={() => handleSort('status')}>
                                                    Status {sortConfig?.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                                </TableHead>
                                                <TableHead className="cursor-pointer hover:bg-slate-50" onClick={() => handleSort('deadline')}>
                                                    Deadline {sortConfig?.key === 'deadline' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredProjects.map((project) => (
                                                <TableRow key={project.id}>
                                                    <TableCell className="font-medium">{project.name}</TableCell>
                                                    <TableCell>{project.job_type}</TableCell>
                                                    <TableCell>
                                                        <Badge className={getStatusColor(project.status)} variant="outline">
                                                            {project.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{project.deadline || '-'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}