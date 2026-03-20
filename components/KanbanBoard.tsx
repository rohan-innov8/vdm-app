'use client';
import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { Trash2Icon, PencilIcon, CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import { EditProjectDialog } from '@/components/EditProjectDialog';

const COLUMNS = [
    { id: 'Pre-Production', title: 'Pre-Production', color: 'border-l-slate-300' },
    { id: 'Production', title: 'Production', color: 'border-l-orange-400' },
    { id: 'Prep / Pre-assemble', title: 'Prep / Pre-assemble', color: 'border-l-yellow-400' },
    { id: 'Installation', title: 'Installation', color: 'border-l-indigo-400' },
    { id: 'Snags', title: 'Snags', color: 'border-l-pink-500' },
    { id: 'Completed', title: 'Completed', color: 'border-l-emerald-500' },
];

const formatDate = (dateString: string | null) => {
    if (!dateString) return 'None set';
    return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

export function KanbanBoard({ projects, onProjectMoved, isAdmin, onDeleteProject, onProjectUpdated }: any) {
    const [activeId, setActiveId] = useState<string | null>(null);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;
        const project = projects.find((p: any) => p.id === active.id);
        if (project && project.status !== over.id) onProjectMoved(active.id, over.id as string);
        setActiveId(null);
    };

    return (
        <DndContext onDragStart={(e) => setActiveId(e.active.id as string)} onDragEnd={handleDragEnd}>
            {/* NEW: Horizontal Scroll Layout */}
            <div className="flex gap-4 md:gap-6 h-full min-h-[500px] overflow-x-auto pb-4 snap-x px-1 custom-scrollbar">
                {COLUMNS.map((col) => (
                    <Column key={col.id} col={col} projects={projects.filter((p: any) => p.status === col.id)} isAdmin={isAdmin} onDeleteProject={onDeleteProject} onProjectUpdated={onProjectUpdated} />
                ))}
            </div>
            <DragOverlay>
                {activeId ? <ProjectCard project={projects.find((p: any) => p.id === activeId)} isAdmin={isAdmin} onDeleteProject={onDeleteProject} onProjectUpdated={onProjectUpdated} colColor="border-l-slate-400" /> : null}
            </DragOverlay>
        </DndContext>
    );
}

function Column({ col, projects, isAdmin, onDeleteProject, onProjectUpdated }: any) {
    const { setNodeRef, isOver } = useDroppable({ id: col.id });
    return (
        <div ref={setNodeRef} className={`w-[320px] shrink-0 p-4 rounded-xl border transition-colors duration-200 flex flex-col gap-4 snap-center ${isOver ? 'bg-slate-200 border-slate-300' : 'bg-slate-100/50 border-slate-200'}`}>
            <h3 className="font-bold text-slate-700 flex justify-between items-center">
                {col.title}
                <span className="bg-white px-2 py-0.5 rounded-md text-xs font-bold text-slate-500 shadow-sm border border-slate-100">{projects.length}</span>
            </h3>
            <div className="flex flex-col gap-3 min-h-[200px]">
                {projects.map((project: any) => (
                    <DraggableProjectCard key={project.id} project={project} isAdmin={isAdmin} onDeleteProject={onDeleteProject} onProjectUpdated={onProjectUpdated} colColor={col.color} />
                ))}
            </div>
        </div>
    );
}

function DraggableProjectCard({ project, isAdmin, onDeleteProject, onProjectUpdated, colColor }: any) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: project.id });
    const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

    if (isDragging) return <div ref={setNodeRef} style={style} className="opacity-30"><ProjectCard project={project} colColor={colColor} /></div>;

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing hover:-translate-y-1 transition-transform">
            <ProjectCard project={project} isAdmin={isAdmin} onDeleteProject={onDeleteProject} onProjectUpdated={onProjectUpdated} colColor={colColor} />
        </div>
    );
}

function ProjectCard({ project, isAdmin, onDeleteProject, onProjectUpdated, colColor }: any) {
    if (!project) return null;
    return (
        <div className={`bg-white p-4 rounded-lg shadow-sm border-y border-r border-slate-200 relative group border-l-4 ${colColor} hover:shadow-md transition-all`}>
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-slate-800 group-hover:text-orange-600 transition-colors line-clamp-1 pr-2">
                    <Link href={`/projects/${project.id}`} onPointerDown={(e) => e.stopPropagation()}>
                        {project.name}
                    </Link>
                </h4>
                {isAdmin && (
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white pl-2">
                        <EditProjectDialog project={project} onProjectUpdated={onProjectUpdated} customTrigger={
                            <button className="text-slate-400 hover:text-indigo-600" onPointerDown={(e) => e.stopPropagation()}><PencilIcon className="h-3.5 w-3.5" /></button>
                        } />
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDeleteProject(project.id); }} className="text-red-400 hover:text-red-600" onPointerDown={(e) => e.stopPropagation()}><Trash2Icon className="h-3.5 w-3.5" /></button>
                    </div>
                )}
            </div>
            <p className="text-xs text-slate-500 mb-3 line-clamp-2">{project.description || "No notes provided."}</p>
            <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                        {project.client_name ? project.client_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-xs text-slate-500 truncate max-w-[80px]">{project.client_name || 'Unassigned'}</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" /> {formatDate(project.deadline)}
                    </span>
                    {project.delivery_gauteng && (
                        <span className="text-[9px] uppercase bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded-sm font-semibold">Gauteng</span>
                    )}
                </div>
            </div>
        </div>
    );
}