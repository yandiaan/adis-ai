import type { Node, NodeProps } from '@xyflow/react';
import { CompactNode } from '../CompactNode';
import type { VideoUploadData } from '../../types/node-types';
import { Film } from 'lucide-react';

const SERVER_URL = 'http://localhost:3000';

function getVideoUrl(previewUrl: string | null): string | null {
  if (!previewUrl) return null;
  if (previewUrl.startsWith('/uploads/')) return SERVER_URL + previewUrl;
  return previewUrl;
}

export function VideoUploadNode({ data, selected }: NodeProps<Node<VideoUploadData>>) {
  const { config } = data;
  const videoUrl = getVideoUrl(config.previewUrl);

  return (
    <CompactNode nodeType="videoUpload" icon="🎥" title={data.label} selected={selected} minWidth={220}>
      {videoUrl ? (
        <div className="space-y-2">
          <div className="relative w-full overflow-hidden rounded-lg" style={{ height: 120 }}>
            <video
              src={videoUrl}
              className="w-full h-full object-cover"
              muted
              loop
              autoPlay
              playsInline
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/45 truncate max-w-[140px]">{config.fileName}</span>
            <span className="text-[9px] text-white/30 shrink-0">{config.fileSizeMB?.toFixed(1)} MB</span>
          </div>
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center gap-2 py-6 rounded-lg border border-dashed"
          style={{ borderColor: 'rgba(244,114,182,0.2)', background: 'rgba(244,114,182,0.04)' }}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(244,114,182,0.12)' }}>
            <Film size={16} className="text-[#f472b6]/60" />
          </div>
          <span className="text-[10px] text-white/30">Drop or click to upload</span>
          <span className="text-[9px] text-white/15">MP4 · MOV · WEBM · max {config.maxSizeMB}MB</span>
        </div>
      )}
    </CompactNode>
  );
}
