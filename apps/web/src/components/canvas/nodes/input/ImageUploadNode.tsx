import type { NodeProps } from '@xyflow/react';
import { CompactNode } from '../CompactNode';
import type { ImageUploadNode } from '../../types/node-types';

const SERVER_URL = 'http://localhost:3000';

function getImageUrl(previewUrl: string | null): string | null {
  if (!previewUrl) return null;
  if (previewUrl.startsWith('/uploads/')) {
    return `${SERVER_URL}${previewUrl}`;
  }
  return previewUrl;
}

export function ImageUploadNode({ data, selected }: NodeProps<ImageUploadNode>) {
  const { config } = data;
  const hasImage = config.previewUrl !== null;
  const imageUrl = getImageUrl(config.previewUrl);

  return (
    <CompactNode
      nodeType="imageUpload"
      icon=""
      title={data.label}
      subtitle={hasImage ? `${config.fileName} (${config.fileSizeMB?.toFixed(1)}MB)` : undefined}
      selected={selected}
    >
      {hasImage && imageUrl ? (
        <img
          src={imageUrl}
          alt="Upload preview"
          className="w-full h-[60px] object-cover rounded-md"
        />
      ) : (
        <div className="text-white/30 text-[11px] text-center py-3 border border-dashed border-white/20 rounded-md">
          Drop image here
        </div>
      )}
    </CompactNode>
  );
}
