import type { Node, NodeProps } from '@xyflow/react';
import { CompactNode } from '../CompactNode';
import type { ImageUploadData } from '../../types/node-types';
import { ImageIcon } from 'lucide-react';
import { resolveMediaUrl } from '../../../../utils/runtimeUrl';

function getImageUrl(previewUrl: string | null): string | null {
  if (!previewUrl) return null;
  return resolveMediaUrl(previewUrl);
}

export function ImageUploadNode({ data, selected }: NodeProps<Node<ImageUploadData>>) {
  const { config } = data;
  const imageUrl = getImageUrl(config.previewUrl);

  return (
    <CompactNode
      nodeType="imageUpload"
      icon=""
      title={data.label}
      selected={selected}
      minWidth={220}
    >
      {imageUrl ? (
        <div className="space-y-2">
          <div className="relative w-full overflow-hidden rounded-lg" style={{ height: 120 }}>
            <img src={imageUrl} alt="Upload preview" className="w-full h-full object-cover" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/45 truncate max-w-[140px]">
              {config.fileName}
            </span>
            <span className="text-[9px] text-white/30 shrink-0">
              {config.fileSizeMB?.toFixed(1)} MB
            </span>
          </div>
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center gap-2 py-6 rounded-lg border border-dashed"
          style={{ borderColor: 'rgba(96,165,250,0.2)', background: 'rgba(96,165,250,0.04)' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(96,165,250,0.12)' }}
          >
            <ImageIcon size={16} className="text-[#60a5fa]/60" />
          </div>
          <span className="text-[10px] text-white/30">Drop or click to upload</span>
          <span className="text-[9px] text-white/15">
            PNG · JPG · WEBP · max {config.maxSizeMB}MB
          </span>
        </div>
      )}
    </CompactNode>
  );
}
