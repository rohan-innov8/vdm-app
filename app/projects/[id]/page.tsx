'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { TaskList } from '@/components/TaskList';
import { Trash2Icon, LockIcon } from 'lucide-react';
import { EditProjectDialog } from '@/components/EditProjectDialog';
import { ProjectFiles } from '@/components/ProjectFiles';

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Pre-Production': return 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200';
        case 'Production': return 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200';
        case 'Prep / Pre-assemble': return 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200';
        case 'Installation': return 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200';
        case 'Snags': return 'bg-pink-50 text-pink-700 hover:bg-pink-100 border-pink-200';
        case 'Completed': return 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200';
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

export default function ProjectDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;

    const [project, setProject] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchProjectDetails = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
            setIsAdmin(profile?.role === 'admin');
        }

        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single();

        if (error) {
            console.error('Error fetching project:', error);
            alert('Project not found.');
            router.push('/projects');
        } else {
            setProject(data);
        }
        setLoading(false);
    }, [projectId, router]);

    useEffect(() => {
        if (projectId) fetchProjectDetails();
    }, [projectId, fetchProjectDetails]);

    const handleDeleteProject = async () => {
        if (!window.confirm('Are you ABSOLUTELY sure you want to delete this project? All tasks associated with it will also be deleted. This cannot be undone.')) {
            return;
        }

        const { error } = await supabase.from('projects').delete().eq('id', projectId);

        if (error) {
            alert('Failed to delete project: ' + error.message);
        } else {
            router.push('/projects');
        }
    };

    if (loading) return <div className="p-4 sm:p-8 flex items-center justify-center min-h-screen text-slate-500">Loading project workspace...</div>;
    if (!project) return null;

    return (
        // Enforce p-4 (16px) on mobile, sm:p-8 (32px) on desktop
        <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
            {/* space-y-4 (16px) gap on mobile, max-w-7xl to match the rest of the app */}
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">

                {/* Navigation and Actions: Stack on mobile */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                    <Link href="/projects" className="w-full sm:w-auto">
                        <Button variant="ghost" className="w-full sm:w-auto h-12 sm:h-10 text-slate-500 hover:text-slate-900 cursor-pointer justify-start sm:justify-center -ml-4 sm:ml-0">
                            ← Back to Projects
                        </Button>
                    </Link>

                    {/* Admin Actions Group */}
                    {isAdmin && (
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            {/* Edit Project Dialog with forced touch target heights */}
                            <div className="w-full sm:w-auto [&>button]:w-full [&>button]:h-12 [&>button]:sm:h-10">
                                <EditProjectDialog project={project} onProjectUpdated={fetchProjectDetails} />
                            </div>

                            <Button
                                variant="destructive"
                                onClick={handleDeleteProject}
                                className="w-full sm:w-auto h-12 sm:h-10 bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                            >
                                <Trash2Icon className="w-4 h-4 mr-2" />
                                Delete Project
                            </Button>
                        </div>
                    )}
                </div>

                {/* Project Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{project.name}</h1>
                        <p className="text-slate-500 mt-1 text-sm sm:text-base">{project.description || 'No description provided.'}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="h-6 sm:h-auto">{project.job_type}</Badge>
                        <Badge className={`${getStatusColor(project.status)} h-6 sm:h-auto`} variant="outline">
                            {project.status}
                        </Badge>
                    </div>
                </div>

                {/* TOP SECTION: Tasks and Sidebar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
                    {/* Main Column: Tasks */}
                    <div className="md:col-span-2 space-y-4 sm:space-y-6">
                        <Card className="h-full shadow-sm py-4">
                            {/* Standardized Dashboard Card Header */}
                            <CardHeader className="px-4">
                                <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Tasks</CardTitle>
                            </CardHeader>
                            <CardContent className="px-4">
                                <TaskList projectId={projectId} isAdmin={isAdmin} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar: Project Info */}
                    <div className="space-y-4 sm:space-y-6">
                        <Card className="h-full shadow-sm py-4 gap-4">
                            {/* Standardized Dashboard Card Header */}
                            <CardHeader className="px-4">
                                <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Project Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm px-4">
                                <div>
                                    <span className="text-slate-500 font-medium block mb-1">Designer / Client</span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                                            {project.client_name ? project.client_name.charAt(0).toUpperCase() : 'U'}
                                        </span>
                                        <span className="font-medium text-slate-900">{project.client_name || 'Unassigned'}</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-slate-500 font-medium block">Deadline</span>
                                    <span className="text-slate-900 font-medium">{formatDate(project.deadline)}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 font-medium block">Job Created</span>
                                    <span className="text-slate-900 font-medium">{formatDate(project.created_at)}</span>
                                </div>

                                {/* SECURE ADMIN FIELDS */}
                                {isAdmin && (
                                    <>
                                        <div className="pt-4 mt-2 border-t border-slate-100">
                                            <span className="text-slate-500 font-medium flex items-center gap-1.5">
                                                Deposit Received <span title="Admin Only"><LockIcon className="w-3 h-3 text-slate-300" /></span>
                                            </span>
                                            <span className="text-slate-900 font-medium">{formatDate(project.deposit_received_at)}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 font-medium flex items-center gap-1.5">
                                                Drawings Received <span title="Admin Only"><LockIcon className="w-3 h-3 text-slate-300" /></span>
                                            </span>
                                            <span className="text-slate-900 font-medium">{formatDate(project.drawings_received_at)}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 font-medium flex items-center gap-1.5">
                                                Install / Delivery <span title="Admin Only"><LockIcon className="w-3 h-3 text-slate-300" /></span>
                                            </span>
                                            <span className="text-slate-900 font-medium">{formatDate(project.installation_date)}</span>
                                        </div>
                                    </>
                                )}

                                {/* Gauteng Delivery Indicator */}
                                <div className="pt-2">
                                    <span className="text-slate-500 font-medium block">Delivery Location</span>
                                    <div className="mt-1">
                                        {project.delivery_gauteng ? (
                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 22h14" /><path d="M5 2h14" /><path d="M17 22V2" /><path d="M7 22V2" /><path d="M7 12h10" /><path d="m10.5 7 1.5-2 1.5 2" /><path d="m10.5 17 1.5 2 1.5-2" /></svg>
                                                Gauteng Delivery
                                            </span>
                                        ) : (
                                            <span className="text-slate-600 font-medium">Outside Gauteng</span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* BOTTOM SECTION: Digital Asset Management (Full Width) */}
                <div className="mt-4 sm:mt-6">
                    <Card className="shadow-sm py-4">
                        <CardHeader className="px-4">
                            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Digital Assets & Files</CardTitle>
                        </CardHeader>
                        <CardContent className="px-4">
                            <ProjectFiles projectId={projectId} isAdmin={isAdmin} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}