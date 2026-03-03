'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { TaskList } from '@/components/TaskList';

// --- NEW: Helper for Consistent Badge Colors ---
const getStatusColor = (status: string) => {
    switch (status) {
        case 'New': return 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200';
        case 'In Production': return 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200';
        case 'Completed': return 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200';
        default: return 'bg-gray-100 text-gray-800';
    }
};

// --- NEW: Helper for Consistent Dates ---
const formatDate = (dateString: string | null) => {
    if (!dateString) return 'None set';
    // Using 'en-GB' formats it nicely as "Day Month Year" (e.g., 24 Oct 2024)
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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProjectDetails() {
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

        if (projectId) {
            fetchProjectDetails();
        }
    }, [projectId, router]);

    if (loading) return <div className="p-8 flex items-center justify-center min-h-screen text-slate-500">Loading project workspace...</div>;
    if (!project) return null;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Navigation */}
                <Link href="/projects">
                    <Button variant="ghost" className="mb-4 text-slate-500 hover:text-slate-900 cursor-pointer">
                        ← Back to Projects
                    </Button>
                </Link>

                {/* Project Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
                        <p className="text-slate-500 mt-1">{project.description || 'No description provided.'}</p>
                    </div>
                    <div className="flex gap-2">
                        <Badge variant="outline">{project.job_type}</Badge>
                        {/* APPLIED: Matching Status Badge Colors */}
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
                                <TaskList projectId={projectId} />
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
                                    <span className="text-slate-500 font-medium block">Deadline</span>
                                    {/* APPLIED: Consistent Date Formatting */}
                                    <span className="text-slate-900 font-medium">{formatDate(project.deadline)}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 font-medium block">Created</span>
                                    {/* APPLIED: Consistent Date Formatting */}
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