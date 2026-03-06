'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { TaskList } from '@/components/TaskList';
import { Trash2Icon } from 'lucide-react'; // <-- New icon for deleting

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

export default function ProjectDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;

    const [project, setProject] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false); // <-- NEW: State to track if user is Admin
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            // 1. Fetch current user's role to check if Admin
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
                setIsAdmin(profile?.role === 'admin');
            }

            // 2. Fetch Project Details
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
        }

        if (projectId) fetchData();
    }, [projectId, router]);

    // --- NEW: Handle Project Deletion ---
    const handleDeleteProject = async () => {
        if (!window.confirm('Are you ABSOLUTELY sure you want to delete this project? All tasks associated with it will also be deleted. This cannot be undone.')) {
            return; // Exit if they click "Cancel"
        }

        const { error } = await supabase.from('projects').delete().eq('id', projectId);

        if (error) {
            alert('Failed to delete project: ' + error.message);
        } else {
            // Redirect back to the projects list upon success
            router.push('/projects');
        }
    };

    if (loading) return <div className="p-8 flex items-center justify-center min-h-screen text-slate-500">Loading project workspace...</div>;
    if (!project) return null;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Navigation and Actions */}
                <div className="flex justify-between items-center mb-4">
                    <Link href="/projects">
                        <Button variant="ghost" className="text-slate-500 hover:text-slate-900 cursor-pointer">
                            ← Back to Projects
                        </Button>
                    </Link>

                    {/* NEW: Delete Project Button (Admins Only) */}
                    {isAdmin && (
                        <Button
                            variant="destructive"
                            onClick={handleDeleteProject}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            <Trash2Icon className="w-4 h-4 mr-2" />
                            Delete Project
                        </Button>
                    )}
                </div>

                {/* Project Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
                        <p className="text-slate-500 mt-1">{project.description || 'No description provided.'}</p>
                    </div>
                    <div className="flex gap-2">
                        <Badge variant="outline">{project.job_type}</Badge>
                        <Badge className={getStatusColor(project.status)} variant="outline">
                            {project.status}
                        </Badge>
                    </div>
                </div>

                {/* Layout Grid for Tasks and Files */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">

                    {/* Main Column */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Tasks</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {/* Pass the isAdmin boolean to the TaskList */}
                                <TaskList projectId={projectId} isAdmin={isAdmin} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Project Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div>
                                    <span className="text-slate-500 font-medium block mb-1">Designer</span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
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
                                    <span className="text-slate-500 font-medium block">Created</span>
                                    <span className="text-slate-900 font-medium">{formatDate(project.created_at)}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Files & Assets</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-500">File uploads coming soon...</p>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    );
}