'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from '@/lib/supabaseClient';
import { ProjectFile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
    FileIcon, Trash2Icon, UploadCloudIcon, Loader2Icon,
    DownloadIcon, FileTextIcon,
    FileSpreadsheetIcon, MusicIcon
} from 'lucide-react';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB limit

export function ProjectFiles({ projectId, isAdmin }: { projectId: string; isAdmin: boolean }) {
    const [files, setFiles] = useState<ProjectFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchFiles = useCallback(async () => {
        setLoading(true);
        const { data } = await supabase
            .from('project_files')
            .select('*, profiles(full_name)')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        setFiles(data || []);
        setLoading(false);
    }, [projectId]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchFiles();
    }, [fetchFiles]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (!selectedFiles || selectedFiles.length === 0) return;

        // 1. Pre-flight Validation
        const validFiles = [];
        for (const file of Array.from(selectedFiles)) {
            if (file.size > MAX_FILE_SIZE) {
                toast.error(`File "${file.name}" exceeds the 50MB limit and will be skipped.`);
                continue;
            }
            validFiles.push(file);
        }

        if (validFiles.length === 0) {
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setUploading(true);
        const { data: { user } } = await supabase.auth.getUser();

        let successCount = 0;

        for (let i = 0; i < validFiles.length; i++) {
            const file = validFiles[i];
            setUploadProgress(`Uploading file ${i + 1} of ${validFiles.length}...`);

            const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
            const filePath = `${projectId}/${Date.now()}_${safeName}`;

            // Upload to storage
            const { error: uploadError } = await supabase.storage
                .from('project-assets')
                .upload(filePath, file);

            if (uploadError) {
                toast.error(`Failed to upload ${file.name}: ` + uploadError.message);
                continue;
            }

            // Get the URL
            const { data: { publicUrl } } = supabase.storage
                .from('project-assets')
                .getPublicUrl(filePath);

            // Insert matching your EXACT database schema
            const { error: dbError } = await supabase.from('project_files').insert([{
                project_id: projectId,
                file_name: file.name,
                file_size: file.size,
                file_url: publicUrl,
                uploaded_by: user?.id
            }]);

            if (dbError) {
                toast.error(`Uploaded ${file.name} but failed to link it. Contact support.`);
            } else {
                successCount++;
            }
        }

        setUploading(false);
        setUploadProgress('');
        if (fileInputRef.current) fileInputRef.current.value = '';

        if (successCount > 0) fetchFiles();
    };

    const handleDelete = async (fileId: string, fileUrl: string) => {
        // Safely extract the path from the URL to delete from storage
        if (fileUrl) {
            const urlParts = fileUrl.split('/project-assets/');
            if (urlParts.length === 2) {
                const path = urlParts[1];
                await supabase.storage.from('project-assets').remove([path]);
            }
        }

        await supabase.from('project_files').delete().eq('id', fileId);
        toast.success("File deleted correctly");
        fetchFiles();
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    // Helper to determine file type based strictly on the file name extension
    const getFileType = (fileName: string) => {
        if (!fileName) return 'other';
        const ext = fileName.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return 'image';
        if (['pdf'].includes(ext || '')) return 'pdf';
        if (['csv', 'xls', 'xlsx'].includes(ext || '')) return 'spreadsheet';
        if (['txt', 'doc', 'docx'].includes(ext || '')) return 'text';
        if (['mp3', 'wav', 'ogg'].includes(ext || '')) return 'audio';
        return 'other';
    };

    return (
        <div className="flex flex-col space-y-4">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <p className="text-sm text-slate-500">
                    Upload drawings, reference images, and specs. (Max 50MB)
                </p>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    onChange={handleFileUpload}
                />
                <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="bg-slate-900 hover:bg-slate-800 text-white cursor-pointer w-full sm:w-auto h-12 sm:h-10 shadow-sm"
                >
                    {uploading ? (
                        <>
                            <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                            {uploadProgress || 'Uploading...'}
                        </>
                    ) : (
                        <>
                            <UploadCloudIcon className="w-4 h-4 mr-2" />
                            Upload Files
                        </>
                    )}
                </Button>
            </div>

            <div>
                {loading ? (
                    <p className="text-sm text-slate-500">Loading files...</p>
                ) : files.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-6 border border-dashed rounded-lg">No files uploaded yet.</p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {files.map((file) => {
                            const type = getFileType(file.file_name);

                            return (
                                <div key={file.id} className="border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden group flex flex-col">

                                    <div className="aspect-square bg-slate-50 relative flex items-center justify-center border-b p-4">
                                        {type === 'image' && file.file_url ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img src={file.file_url} alt={file.file_name} className="w-full h-full object-cover" />
                                        ) : type === 'pdf' ? (
                                            <FileTextIcon className="h-10 w-10 text-red-400" />
                                        ) : type === 'spreadsheet' ? (
                                            <FileSpreadsheetIcon className="h-10 w-10 text-green-500" />
                                        ) : type === 'audio' ? (
                                            <MusicIcon className="h-10 w-10 text-purple-500" />
                                        ) : type === 'text' ? (
                                            <FileTextIcon className="h-10 w-10 text-indigo-400" />
                                        ) : (
                                            <FileIcon className="h-10 w-10 text-slate-400" />
                                        )}

                                        {/* Action Buttons Overlay: Always visible on mobile, hover on desktop */}
                                        <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                                                <Button
                                                    size="icon"
                                                    variant="secondary"
                                                    className="h-10 w-10 sm:h-8 sm:w-8 rounded-full cursor-pointer shadow-md bg-white hover:bg-slate-100"
                                                    title="Download"
                                                >
                                                    <DownloadIcon className="h-4 w-4 text-slate-700" />
                                                </Button>
                                            </a>

                                            {isAdmin && (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            size="icon"
                                                            variant="destructive"
                                                            className="h-10 w-10 sm:h-8 sm:w-8 rounded-full cursor-pointer shadow-md"
                                                            title="Delete"
                                                        >
                                                            <Trash2Icon className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete file?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete this file? This cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(file.id, file.file_url)} className="bg-red-500 hover:bg-red-600 text-white">Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-3">
                                        <p className="text-xs font-semibold text-slate-800 truncate" title={file.file_name}>
                                            {file.file_name}
                                        </p>
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-[10px] text-slate-500 font-medium">{formatBytes(file.file_size)}</p>
                                            <p className="text-[10px] text-slate-400 truncate ml-2">by {file.profiles?.full_name ? file.profiles.full_name.split(' ')[0] : 'U'}</p>
                                        </div>
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}