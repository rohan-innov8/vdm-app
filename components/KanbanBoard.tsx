'use client';
import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2Icon, PencilIcon } from 'lucide-react';
import Link from 'next/link';
import { EditProjectDialog } from '@/components/EditProjectDialog';

const COLUMNS = [
    { id: 'Pre-Production', title: 'Pre-Production', color: 'bg-gray-100' },
    { id: 'Production', title: 'Production', color: 'bg-blue-50' },
    { id: 'Post-Production', title: 'Post-Production', color: 'bg-green-50' },
];

const formatDate = (dateString: string | null) => {
    if (!dateString) return 'None set';
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

export function KanbanBoard({
    projects,
    onProjectMoved,
    isAdmin,
    onDeleteProject,
    onProjectUpdated // <-- ADDED
}: {
    projects: any[],
    onProjectMoved: (id: string, newStatus: string) => void,
    isAdmin: boolean,
    onDeleteProject: (id: string) => void,
    onProjectUpdated: () => void // <-- ADDED
}) {
    const [activeId, setActiveId] = useState<string | null>(null);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const projectId = active.id as string;
        const newStatus = over.id as string;

        const project = projects.find((p) => p.id === projectId);

        if (project && project.status !== newStatus) {
            onProjectMoved(projectId, newStatus);
        }

        setActiveId(null);
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    return (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-[500px]">
                {COLUMNS.map((col) => (
                    <Column
                        key={col.id}
                        col={col}
                        projects={projects.filter((p) => p.status === col.id)}
                        isAdmin={isAdmin}
                        onDeleteProject={onDeleteProject}
                        onProjectUpdated={onProjectUpdated} // <-- ADDED
                    />
                ))}
            </div>
            <DragOverlay>
                {activeId ? (
                    <ProjectCard
                        project={projects.find((p) => p.id === activeId)}
                        isAdmin={isAdmin}
                        onDeleteProject={onDeleteProject}
                        onProjectUpdated={onProjectUpdated} // <-- ADDED
                    />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

function Column({ col, projects, isAdmin, onDeleteProject, onProjectUpdated }: { col: any, projects: any[], isAdmin: boolean, onDeleteProject: (id: string) => void, onProjectUpdated: () => void }) {
    const { setNodeRef, isOver } = useDroppable({ id: col.id });

    return (
        <div
            ref={setNodeRef}
            className={`p-4 rounded-xl border transition-colors duration-200 flex flex-col gap-4 
        ${isOver ? 'bg-green-100 border-green-300 ring-2 ring-green-200' : `${col.color} border-gray-200`}
      `}
        >
            <h3 className="font-bold text-gray-700 flex justify-between">
                {col.title}
                <span className="bg-white px-2 py-0.5 rounded-full text-xs border text-gray-500 shadow-sm">
                    {projects.length}
                </span>
            </h3>
            <div className="flex flex-col gap-3 min-h-[200px]">
                {projects.map((project) => (
                    <DraggableProjectCard
                        key={project.id}
                        project={project}
                        isAdmin={isAdmin}
                        onDeleteProject={onDeleteProject}
                        onProjectUpdated={onProjectUpdated} // <-- ADDED
                    />
                ))}
            </div>
        </div>
    );
}

function DraggableProjectCard({ project, isAdmin, onDeleteProject, onProjectUpdated }: { project: any, isAdmin: boolean, onDeleteProject: (id: string) => void, onProjectUpdated: () => void }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: project.id });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    if (isDragging) {
        return <div ref={setNodeRef} style={style} className="opacity-30">
            <ProjectCard project={project} isAdmin={isAdmin} onDeleteProject={onDeleteProject} onProjectUpdated={onProjectUpdated} />
        </div>;
    }
    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing hover:scale-[1.02] transition-transform">
            <ProjectCard project={project} isAdmin={isAdmin} onDeleteProject={onDeleteProject} onProjectUpdated={onProjectUpdated} />
        </div>
    );
}

function ProjectCard({ project, isAdmin, onDeleteProject, onProjectUpdated }: { project: any, isAdmin: boolean, onDeleteProject: (id: string) => void, onProjectUpdated: () => void }) {
    if (!project) return null;
    return (
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow border-gray-200 cursor-grab relative group">
            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-sm font-semibold text-gray-900 leading-tight pr-6">
                        <Link
                            href={`/projects/${project.id}`}
                            className="hover:text-blue-600 hover:underline transition-colors"
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            {project.name}
                        </Link>
                    </CardTitle>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <Badge variant="outline" className="text-[10px] uppercase">{project.job_type}</Badge>
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
                </div>
                {/* Standardized Designer Avatar */}
                <div className="flex items-center gap-1.5 mt-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                        {project.client_name ? project.client_name.charAt(0).toUpperCase() : 'U'}
                    </span>
                    <span className="text-xs font-medium text-slate-700">{project.client_name || 'Unassigned'}</span>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-1">
                <p className="text-xs text-slate-500 line-clamp-2 mb-3 pr-8">
                    {project.description || 'No notes provided.'}
                </p>
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500">

                    {/* NEW: Loaded Date & Deadline Date grouped together */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5" title="Loaded (Created) Date">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M8 2v4" /><path d="M16 2v4" /><path d="M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8" /><path d="M3 10h18" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>
                            {formatDate(project.created_at)}
                        </div>
                        <div className="flex items-center gap-1.5 font-medium text-slate-700" title="Deadline Date">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                            {formatDate(project.deadline)}
                        </div>
                    </div>

                    <div className="flex items-center gap-1 self-end">
                        {isAdmin && (
                            <>
                                <EditProjectDialog
                                    project={project}
                                    onProjectUpdated={onProjectUpdated}
                                    customTrigger={
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-slate-400 hover:text-blue-600 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onPointerDown={(e) => e.stopPropagation()}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                            }}
                                            title="Edit Project"
                                        >
                                            <PencilIcon className="h-3 w-3" />
                                        </Button>
                                    }
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onPointerDown={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onDeleteProject(project.id);
                                    }}
                                    title="Delete Project"
                                >
                                    <Trash2Icon className="h-3 w-3" />
                                </Button>
                            </>
                        )}
                        <Link
                            href={`/projects/${project.id}`}
                            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
                            onPointerDown={(e) => e.stopPropagation()}
                            title="View Project Workspace"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                        </Link>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}