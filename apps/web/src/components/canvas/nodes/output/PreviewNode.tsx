import type { Node, NodeProps } from '@xyflow/react';
import { useNodeId, useEdges } from '@xyflow/react';
import { CompactNode } from '../CompactNode';
import type { PreviewData } from '../../types/node-types';
import { useExecutionContext } from '../../execution/ExecutionContext';
import type { ImageData, VideoData } from '../../types/port-types';

const PRESET_META: Record<string, { label: string; aspect: [number, number] }> = {
  'ig-square':  { label: 'IG Square',  aspect: [1, 1] },
  'ig-portrait':{ label: 'IG Portrait', aspect: [4, 5] },
  'ig-story':   { label: 'IG Story',   aspect: [9, 16] },
  'tiktok':     { label: 'TikTok',     aspect: [9, 16] },
  'youtube':    { label: 'YouTube',    aspect: [16, 9] },
  'custom':     { label: 'Custom',     aspect: [16, 9] },
};

export function PreviewNode({ data, selected }: NodeProps<Node<PreviewData>>) {
  const { config } = data;
  const nodeId = useNodeId()!;
  const edges = useEdges();
  const { getNodeState } = useExecutionContext();
  const incomingEdge = edges.find(e => e.target === nodeId);
  const upstreamState = incomingEdge ? getNodeState(incomingEdge.source) : null;
  const output = upstreamState?.output ?? null;

  const imageUrl = output?.type === 'image' ? (output.data as ImageData).url : null;
  const videoUrl = output?.type === 'video' ? (output.data as VideoData).url : null;
  const meta = PRESET_META[config.preset] ?? PRESET_META.custom;
  const [aw, ah] = meta.aspect;
  const boxW = 64; const boxH = Math.round(boxW * ah / aw);

  return (
    <CompactNode
      nodeType="preview"
      icon=""
      title={data.label}
      selected={selected}
    >
      <div className="flex items-start gap-2">
        {/* Aspect box */}
        <div
          className="rounded-md overflow-hidden border border-white/15 flex-shrink-0 flex items-center justify-center bg-white/5"
          style={{ width: boxW, height: Math.min(boxH, 72) }}
        >
          {imageUrl ? (
            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
          ) : videoUrl ? (
            <video src={videoUrl} className="w-full h-full object-cover" muted playsInline />
          ) : (
            <span className="text-white/20 text-[10px]">{aw}:{ah}</span>
          )}
        </div>
        {/* Info */}
        <div className="flex-1 pt-0.5">
          <div className="text-[9px] font-semibold text-[#f87171] mb-1">{meta.label}</div>
          <div className="text-[9px] text-white/30">{config.width}×{config.height}</div>
          <div className="text-[9px] text-white/20 capitalize mt-0.5">{config.fit}</div>
        </div>
      </div>
    </CompactNode>
  );
}
