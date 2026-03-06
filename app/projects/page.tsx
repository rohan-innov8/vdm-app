'use client';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { NewProjectDialog } from '@/components/NewProjectDialog';
import { KanbanBoard } from '@/components/KanbanBoard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useRouter } from 'next/navigation';
import { Trash2Icon, PencilIcon } from 'lucide-react';
import { EditProjectDialog } from '@/components/EditProjectDialog';


const getStatusColor = (status: string) => {
    switch (status) {
        case 'Pre-Production': return 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200';
        case 'Production': return 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200';
        case 'Post-Production': return 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const formatDate = (dateString: string | null) => {
    if (!dateString) return 'None set';
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

export default function ProjectsPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [activeTab, setActiveTab] = useState('kanban');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const savedView = localStorage.getItem('vdm-view-preference');
        if (savedView) setActiveTab(savedView);
        setIsMounted(true);
    }, []);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        localStorage.setItem('vdm-view-preference', value);
    };

    const fetchProjects = async () => {
        if (projects.length === 0) setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
            setIsAdmin(profile?.role === 'admin');
        }

        // NEW: Fetch projects AND the associated designer's name from the profiles table
        const { data, error } = await supabase
            .from('projects')
            .select('*');

        if (error) console.error(error);
        else setProjects(data || []);

        setLoading(false);
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleMoveProject = async (projectId: string, newStatus: string) => {
        const previousProjects = [...projects];
        setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, status: newStatus } : p)));

        const { error } = await supabase.from('projects').update({ status: newStatus }).eq('id', projectId);

        if (error) {
            console.error('Update failed:', error);
            alert('Failed to move project. Reverting...');
            setProjects(previousProjects);
        }
    };

    const handleDeleteProject = async (projectId: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!window.confirm('Are you ABSOLUTELY sure you want to delete this project? All tasks associated with it will also be deleted.')) {
            return;
        }

        const previousProjects = [...projects];
        setProjects(prev => prev.filter(p => p.id !== projectId));

        const { error } = await supabase.from('projects').delete().eq('id', projectId);

        if (error) {
            alert('Failed to delete project: ' + error.message);
            setProjects(previousProjects);
        }
    };

    const filteredProjects = useMemo(() => {
        let processed = [...projects];

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            processed = processed.filter(p =>
                p.name.toLowerCase().includes(lowerTerm) ||
                p.job_type.toLowerCase().includes(lowerTerm) ||
                (p.client_name && p.client_name.toLowerCase().includes(lowerTerm))
            );
        }

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

    const handleSort = (key: string) => {
        setSortConfig((current) => {
            if (current?.key === key && current.direction === 'asc') return { key, direction: 'desc' };
            return { key, direction: 'asc' };
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto space-y-6">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
                        <p className="text-slate-500">Manage manufacturing jobs and installations.</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <Link href="/">
                            <Button variant="outline">Back to Dashboard</Button>
                        </Link>
                        {isAdmin && <NewProjectDialog onProjectCreated={fetchProjects} />}
                    </div>
                </div>

                <div className="relative">
                    <svg className="absolute left-3 top-3 h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <Input
                        placeholder="Search projects or designers..."
                        className="pl-10 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {!isMounted ? (
                    <div className="py-10 text-center text-slate-500 animate-pulse">Loading view...</div>
                ) : (
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                        <TabsList className="mb-4">
                            <TabsTrigger value="kanban" className="cursor-pointer">Board View</TabsTrigger>
                            <TabsTrigger value="list" className="cursor-pointer">List View</TabsTrigger>
                        </TabsList>

                        <TabsContent value="kanban">
                            {loading ? <p>Loading board...</p> : (
                                <KanbanBoard
                                    projects={filteredProjects}
                                    onProjectMoved={handleMoveProject}
                                    isAdmin={isAdmin}
                                    onDeleteProject={handleDeleteProject}
                                    onProjectUpdated={fetchProjects} // <-- NEW 
                                />
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
                                                    {/* NEW: Designer Column */}
                                                    <TableHead>Designer</TableHead>
                                                    <TableHead className="cursor-pointer hover:bg-slate-50" onClick={() => handleSort('job_type')}>
                                                        Type {sortConfig?.key === 'job_type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                                    </TableHead>
                                                    <TableHead className="cursor-pointer hover:bg-slate-50" onClick={() => handleSort('status')}>
                                                        Status {sortConfig?.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                                    </TableHead>
                                                    {/* NEW: Loaded Date Column */}
                                                    <TableHead className="cursor-pointer hover:bg-slate-50" onClick={() => handleSort('created_at')}>
                                                        Loaded {sortConfig?.key === 'created_at' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                                    </TableHead>
                                                    <TableHead className="cursor-pointer hover:bg-slate-50" onClick={() => handleSort('deadline')}>
                                                        Deadline {sortConfig?.key === 'deadline' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                                    </TableHead>
                                                    <TableHead className="text-right">Action</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredProjects.map((project) => (
                                                    <TableRow
                                                        key={project.id}
                                                        className="cursor-pointer hover:bg-slate-50 transition-colors group"
                                                        onClick={() => router.push(`/projects/${project.id}`)}
                                                    >
                                                        <TableCell className="font-medium">
                                                            <span className="group-hover:text-blue-600 group-hover:underline transition-colors">
                                                                {project.name}
                                                            </span>
                                                        </TableCell>
                                                        {/* Standardized Designer Cell */}
                                                        <TableCell>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                                                                    {project.client_name ? project.client_name.charAt(0).toUpperCase() : 'U'}
                                                                </span>
                                                                <span className="font-medium text-slate-700">{project.client_name || 'Unassigned'}</span>
                                                            </div>
                                                        </TableCell>

                                                        <TableCell>
                                                            <div className="flex flex-col items-start gap-1.5">
                                                                <span>{project.job_type}</span>
                                                                {project.delivery_gauteng ? (
                                                                    <Badge variant="outline" className="text-[9px] uppercase bg-purple-50 text-purple-700 border-purple-200 px-1.5 py-0 h-4 shadow-none">
                                                                        Gauteng
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge variant="outline" className="text-[9px] uppercase bg-gray-50 text-gray-700 border-gray-200 px-1.5 py-0 h-4 shadow-none">
                                                                        Outside Gauteng
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={getStatusColor(project.status)} variant="outline">
                                                                {project.status}
                                                            </Badge>
                                                        </TableCell>

                                                        {/* NEW: Loaded Date Cell */}
                                                        <TableCell className="text-slate-500">{formatDate(project.created_at)}</TableCell>

                                                        <TableCell className="font-medium">{formatDate(project.deadline)}</TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end items-center gap-2">
                                                                <Button variant="ghost" size="sm" className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    View →
                                                                </Button>
                                                                {isAdmin && (
                                                                    <>
                                                                        <EditProjectDialog
                                                                            project={project}
                                                                            onProjectUpdated={fetchProjects}
                                                                            customTrigger={
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                    }}
                                                                                    title="Edit Project"
                                                                                >
                                                                                    <PencilIcon className="h-4 w-4" />
                                                                                </Button>
                                                                            }
                                                                        />
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                            onClick={(e) => handleDeleteProject(project.id, e)}
                                                                            title="Delete Project"
                                                                        >
                                                                            <Trash2Icon className="h-4 w-4" />
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </div>
    );
}