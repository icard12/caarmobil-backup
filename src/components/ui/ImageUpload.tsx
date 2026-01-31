import { useState, useRef } from 'react';
import { Upload, X, Loader2, Camera } from 'lucide-react';
import { api } from '../../lib/api';

interface ImageUploadProps {
    onUpload: (url: string) => void;
    initialUrl?: string;
    bucket?: string;
    className?: string;
    compact?: boolean;
}

export default function ImageUpload({ onUpload, initialUrl, className = '', compact = false }: ImageUploadProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(initialUrl || null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setError(null);
            setUploading(true);

            if (!e.target.files || e.target.files.length === 0) {
                setUploading(false);
                return;
            }

            const file = e.target.files[0];
            const { url } = await api.upload(file);

            setImageUrl(url);
            onUpload(url);
        } catch (err: any) {
            console.error('Error uploading image:', err);
            setError('Erro ao carregar imagem. Tente novamente.');
        } finally {
            setUploading(false);
            // Reset inputs
            if (fileInputRef.current) fileInputRef.current.value = '';
            if (cameraInputRef.current) cameraInputRef.current.value = '';
        }
    };

    const handleRemove = () => {
        setImageUrl(null);
        onUpload('');
    };

    if (imageUrl) {
        return (
            <div className={`relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 ${compact ? 'w-24 h-24' : 'aspect-video w-full'} ${className}`}>
                <img src={imageUrl} alt="Uploaded" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                        onClick={(e) => { e.preventDefault(); handleRemove(); }}
                        className="p-2 bg-white/10 hover:bg-red-500/80 text-white rounded-full backdrop-blur-md transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-1.5 ${className}`}>
            <div className={`flex gap-2 sm:gap-3 ${compact ? 'flex-row' : 'flex-row sm:flex-row'}`}>
                {/* Standard Upload */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className={`flex-1 border-2 border-dashed border-slate-300 rounded-xl hover:bg-slate-50 transition-all group flex flex-col items-center justify-center gap-1.5 ${compact || true ? 'p-2 sm:p-3 h-20 sm:h-24' : 'p-6'}`}
                >
                    {uploading ? (
                        <Loader2 className="w-5 h-5 text-[#FF4700] animate-spin" />
                    ) : (
                        <>
                            <div className="p-1 sm:p-2 rounded-full bg-slate-100 group-hover:bg-[#FF4700]/10 transition-colors">
                                <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-[#FF4700]" />
                            </div>
                            <span className="text-[10px] sm:text-xs font-bold text-slate-500 group-hover:text-slate-700">Galeria</span>
                        </>
                    )}
                </button>

                {/* Camera Capture */}
                <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={uploading}
                    className={`flex-1 border-2 border-dashed border-slate-300 rounded-xl hover:bg-slate-50 transition-all group flex flex-col items-center justify-center gap-1.5 ${compact || true ? 'p-2 sm:p-3 h-20 sm:h-24' : 'p-6'}`}
                >
                    {uploading ? (
                        <Loader2 className="w-5 h-5 text-[#FF4700] animate-spin" />
                    ) : (
                        <>
                            <div className="p-1 sm:p-2 rounded-full bg-slate-100 group-hover:bg-[#FF4700]/10 transition-colors">
                                <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-[#FF4700]" />
                            </div>
                            <span className="text-[10px] sm:text-xs font-bold text-slate-500 group-hover:text-slate-700">Câmera</span>
                        </>
                    )}
                </button>
            </div>

            {error && (
                <div className="text-xs text-red-500 font-bold flex items-center gap-1">
                    <X className="w-3 h-3" /> {error}
                </div>
            )}

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
            />
            <input
                type="file"
                ref={cameraInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                capture="environment"
                className="hidden"
            />
        </div>
    );
}
