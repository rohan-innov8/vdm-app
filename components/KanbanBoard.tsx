'use client';
import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Using the same columns, but we will pass colors dynamically now
const COLUMNS = [
    { id: 'New', title: 'New Orders', color: 'bg-gray-100' },
    { id: 'In Production', title: 'In Production', color: 'bg-blue-50' },
    { id: 'Completed', title: 'Completed', color: 'bg-green-50' },
];

// Changed props: accept 'onProjectMoved' instead of doing it internally
export function KanbanBoard({ projects, onProjectMoved }: { projects: any[], onProjectMoved: (id: string, newStatus: string) => void }) {
    const [activeId, setActiveId] = useState<string | null>(null);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const projectId = active.id as string;
        const newStatus = over.id as string;

        const project = projects.find((p) => p.id === projectId);

        // If the status is different, tell the Parent Page immediately!
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
                    />
                ))}
            </div>
            <DragOverlay>
                {activeId ? (
                    <ProjectCard project={projects.find((p) => p.id === activeId)} />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

// --- Sub-Components ---

function Column({ col, projects }: { col: any, projects: any[] }) {
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
                    <DraggableProjectCard key={project.id} project={project} />
                ))}
            </div>
        </div>
    );
}

function DraggableProjectCard({ project }: { project: any }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: project.id });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    if (isDragging) {
        return <div ref={setNodeRef} style={style} className="opacity-30"><ProjectCard project={project} /></div>;
    }
    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing hover:scale-[1.02] transition-transform">
            <ProjectCard project={project} />
        </div>
    );
}

function ProjectCard({ project }: { project: any }) {
    if (!project) return null;
    return (
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow border-gray-200 cursor-grab">
            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-sm font-semibold text-gray-900 leading-tight">{project.name}</CardTitle>
                    <Badge variant="outline" className="text-[10px] uppercase">{project.job_type}</Badge>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{project.description || 'No description provided.'}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    {/* Calendar Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                    {project.deadline || 'No Deadline'}
                </div>
            </CardContent>
        </Card>
    );
}