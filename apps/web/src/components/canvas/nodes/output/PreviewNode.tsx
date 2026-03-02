import type { NodeProps } from '@xyflow/react';
import { useNodeId } from '@xyflow/react';
import { CompactNode } from '../CompactNode';
import type { PreviewData } from '../../types/node-types';
import { useExecutionContext } from '../../execution/ExecutionContext';
import type { ImageData, VideoData } from '../../types/port-types';

export function PreviewNode({ data, selected }: NodeProps<PreviewData>) {
  const { config } = data;
  const nodeId = useNodeId();
  const { getNodeState } = useExecutionContext();
  const execState = nodeId ? getNodeState(nodeId) : null;
  const output = execState?.output ?? null;

  const imageUrl =
    output?.type === 'image' ? (output.data as ImageData).url : null;
  const videoUrl =
    output?.type === 'video' ? (output.data as VideoData).url : null;

  return (
    <CompactNode
      nodeType="preview"
      icon=""
      title={data.label}
      subtitle={`${config.preset} · ${config.width}×${config.height}`}
      selected={selected}
    >
      <div
        className="w-full rounded overflow-hidden border border-white/10 flex items-center justify-center"
        style={{ backgroundColor: config.backgroundColor, minHeight: 50 }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Preview"
            className="w-full max-h-[120px]"
            style={{ objectFit: config.fit }}
          />
        ) : videoUrl ? (
          <video
            src={videoUrl}
            className="w-full max-h-[120px]"
            style={{ objectFit: config.fit }}
            muted
            playsInline
            controls={false}
          />
        ) : (
          <span className="text-white/30 text-[10px] py-3">{config.fit}</span>
        )}
      </div>
    </CompactNode>
  );
}
