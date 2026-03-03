import { useReactFlow } from '@xyflow/react';
import { Check, FolderOpen, Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { ImageUploadData } from '../../types/node-types';

const API_BASE = 'http://localhost:3000/api';
const SERVER_URL = 'http://localhost:3000';

type Props = {
  nodeId: string;
  data: ImageUploadData;
};

export function ImageUploadPanel({ nodeId, data }: Props) {
  const { updateNodeData } = useReactFlow();
  const config = data.config;
  const [isUploading, setIsUploading] = useState(false);

  const updateConfig = (updates: Partial<typeof config>) => {
    updateNodeData(nodeId, { config: { ...config, ...updates } });
  };

  const uploadFile = async (file: File): Promise<string> => {
    const response = await fetch(`${API_BASE}/upload/image`, {
      method: 'POST',
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: file,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Upload failed: ${error}`);
    }

    const data = await response.json();
    return data.url; // Returns "/uploads/{filename}"
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size / 1024 / 1024 > config.maxSizeMB) {
      alert(`File exceeds ${config.maxSizeMB}MB limit`);
      return;
    }

    // Create a local preview URL for immediate display
    const previewUrl = URL.createObjectURL(file);
    updateConfig({
      previewUrl,
      fileName: file.name,
      fileSizeMB: file.size / 1024 / 1024,
    });

    // Upload the file to server
    setIsUploading(true);
    try {
      const serverUrl = await uploadFile(file);
      // Update with the server URL that can be used by other nodes
      updateConfig({
        previewUrl: serverUrl,
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed');
      // Keep the preview URL for display, but mark as not uploaded
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    updateConfig({ previewUrl: null, fileName: null, fileSizeMB: null });
  };

  return (
    <>
      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Image Upload</label>
        {config.previewUrl ? (
          <div>
            <img
              src={config.previewUrl.startsWith('/uploads/') ? `${SERVER_URL}${config.previewUrl}` : config.previewUrl}
              alt="Preview"
              className="w-full max-h-[200px] object-contain rounded-lg mb-2"
              onError={(e) => console.error('[ImageUploadPanel] Image failed to load:', e.currentTarget.src)}
              onLoad={() => console.log('[ImageUploadPanel] Image loaded successfully')}
            />
            <div className="flex justify-between items-center text-xs text-white/50">
              <span>
                {config.fileName} ({config.fileSizeMB?.toFixed(1)}MB)
                {isUploading && (
                  <span className="ml-2 inline-flex items-center gap-1 text-blue-400">
                    <Loader2 size={12} className="animate-spin" />
                    Uploading...
                  </span>
                )}
                {!isUploading && config.previewUrl.startsWith('/uploads/') && (
                  <span className="ml-2 inline-flex items-center gap-1 text-green-400"><Check size={12} /> Uploaded</span>
                )}
              </span>
              <button
                onClick={handleClear}
                disabled={isUploading}
                className="motion-lift motion-press focus-ring-orange bg-red-400/10 border border-red-400/30 text-red-300 px-2.5 py-1 rounded-md cursor-pointer text-[11px] hover:bg-red-400/15 transition-colors disabled:opacity-50"
              >
                Clear
              </button>
            </div>
          </div>
        ) : (
          <div
            className="motion-lift motion-press focus-ring-orange border-2 border-dashed border-white/20 rounded-xl py-[30px] text-center cursor-pointer bg-white/3 hover:bg-white/5 transition-colors"
            onClick={() => document.getElementById(`upload-${nodeId}`)?.click()}
          >
            <div className="grid place-items-center mb-2">
              <span className="grid place-items-center w-12 h-12 rounded-xl bg-white/5 border border-white/10">
                <FolderOpen size={22} className="text-white/75" />
              </span>
            </div>
            <div className="text-white/50 text-[13px]">Click or drop image here</div>
            <div className="text-white/30 text-[11px] mt-1">Max {config.maxSizeMB}MB</div>
          </div>
        )}
        <input
          id={`upload-${nodeId}`}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </>
  );
}
