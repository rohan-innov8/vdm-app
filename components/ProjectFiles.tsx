'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import {
    FileIcon, Trash2Icon, UploadCloudIcon, Loader2Icon,
    DownloadIcon, Image as ImageIcon, FileTextIcon,
    FileSpreadsheetIcon, MusicIcon
} from 'lucide-react';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB limit

export function ProjectFiles({ projectId, isAdmin }: { projectId: string; isAdmin: boolean }) {
    const [files, setFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchFiles();
    }, [projectId]);

    const fetchFiles = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('project_files')
            .select('*, profiles(full_name)')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        setFiles(data || []);
        setLoading(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (!selectedFiles || selectedFiles.length === 0) return;

        // 1. Pre-flight Validation
        const validFiles = [];
        for (const file of Array.from(selectedFiles)) {
            if (file.size > MAX_FILE_SIZE) {
                alert(`File "${file.name}" exceeds the 50MB limit and will be skipped.`);
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

        // 2. Upload Process with Faux Progress
        for (let i = 0; i < validFiles.length; i++) {
            const file = validFiles[i];
            setUploadProgress(`Uploading file ${i + 1} of ${validFiles.length}...`);

            const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
            const filePath = `${projectId}/${Date.now()}_${safeName}`;

            const { error: uploadError } = await supabase.storage
                .from('project-assets')
                .upload(filePath, file);

            if (uploadError) {
                alert(`Failed to upload ${file.name}: ` + uploadError.message);
                continue;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('project-assets')
                .getPublicUrl(filePath);

            await supabase.from('project_files').insert([{
                project_id: projectId,
                file_name: file.name,
                file_size: file.size,
                file_url: publicUrl,
                uploaded_by: user?.id
            }]);
        }

        setUploading(false);
        setUploadProgress('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchFiles();
    };

    const handleDelete = async (fileId: string, fileUrl: string) => {
        if (!window.confirm('Are you sure you want to delete this file? This cannot be undone.')) return;

        const urlParts = fileUrl.split('/project-assets/');
        if (urlParts.length === 2) {
            const path = urlParts[1];
            await supabase.storage.from('project-assets').remove([path]);
        }

        await supabase.from('project_files').delete().eq('id', fileId);
        fetchFiles();
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    // Helper to determine file type for icons/previews
    const getFileType = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image';
        if (['pdf'].includes(ext || '')) return 'pdf';
        if (['csv', 'xls', 'xlsx'].includes(ext || '')) return 'spreadsheet';
        if (['txt', 'doc', 'docx'].includes(ext || '')) return 'text';
        if (['mp3', 'wav', 'ogg'].includes(ext || '')) return 'audio';
        return 'other';
    };

    return (
        <div className="space-y-6 mt-2">

            {/* Upload Zone */}
            <div
                className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-indigo-50 hover:border-indigo-400 transition-colors cursor-pointer group bg-white"
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    multiple
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                />
                {uploading ? (
                    <div className="flex flex-col items-center justify-center text-slate-500 gap-3">
                        <Loader2Icon className="h-8 w-8 animate-spin text-indigo-600" />
                        <p className="text-sm font-medium text-slate-700">{uploadProgress}</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-2">
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full group-hover:scale-110 transition-transform">
                            <UploadCloudIcon className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium text-slate-700 mt-2">Click or drag files to upload</p>
                        <p className="text-xs text-slate-400">Max size: 50MB per file. Supported: Images, PDF, CSV, TXT, Audio.</p>
                    </div>
                )}
            </div>

            {/* File Grid */}
            <div>
                {loading ? (
                    <p className="text-sm text-slate-500 text-center py-8 animate-pulse">Loading assets...</p>
                ) : files.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-10 border border-dashed rounded-xl bg-white">No files or assets uploaded yet.</p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {files.map(file => {
                            const type = getFileType(file.file_name);
                            return (
                                <div key={file.id} className="group relative flex flex-col bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">

                                    {/* Preview Area */}
                                    <div className="h-32 bg-slate-50 flex items-center justify-center border-b relative">
                                        {type === 'image' ? (
                                            // eslint-disable-next-line @next/next/no-img-element
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

                                        {/* Hover Overlay Actions */}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                                                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full cursor-pointer" title="Download">
                                                    <DownloadIcon className="h-4 w-4" />
                                                </Button>
                                            </a>
                                            {isAdmin && (
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleDelete(file.id, file.file_url);
                                                    }}
                                                    className="h-8 w-8 rounded-full cursor-pointer"
                                                    title="Delete"
                                                >
                                                    <Trash2Icon className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Details Area */}
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