import type { Node, NodeProps } from '@xyflow/react';
import { useNodeId, useEdges } from '@xyflow/react';
import { CompactNode } from '../CompactNode';
import type { ManualEditorData } from '../../types/node-types';
import { useExecutionContext } from '../../execution/ExecutionContext';
import type { ImageData, VideoData } from '../../types/port-types';
import { Pencil, Type, MousePointer } from 'lucide-react';

const TOOL_ICONS = {
  draw: Pencil,
  text: Type,
  select: MousePointer,
};

export function ManualEditorNode({ data, selected }: NodeProps<Node<ManualEditorData>>) {
  const { config } = data;
  const nodeId = useNodeId()!;
  const edges = useEdges();
  const { getNodeState } = useExecutionContext();
  const incomingEdge = edges.find((e) => e.target === nodeId);
  const upstreamState = incomingEdge ? getNodeState(incomingEdge.source) : null;
  const output = upstreamState?.output ?? null;

  const imageUrl = output?.type === 'image' ? (output.data as ImageData).url : null;
  const videoUrl = output?.type === 'video' ? (output.data as VideoData).url : null;
  const mediaUrl = imageUrl ?? videoUrl;

  const ToolIcon = TOOL_ICONS[config.activeTool];
  const drawingCount = config.drawings.length;
  const textCount = config.textLayers.length;

  return (
    <CompactNode nodeType="manualEditor" icon="" title={data.label} selected={selected}>
      <div className="flex items-start gap-2">
        {/* Preview box */}
        <div
          className="w-16 h-16 rounded-md overflow-hidden border border-white/15 flex-shrink-0 flex items-center justify-center bg-white/5"
        >
          {mediaUrl ? (
            <img src={mediaUrl} alt="Source" className="w-full h-full object-cover" />
          ) : (
            <span className="text-white/20 text-[10px]">No input</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 pt-0.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span
              className="flex items-center gap-1 text-[9px] px-1.5 py-px rounded"
              style={{
                backgroundColor: `${config.brushColor}20`,
                color: config.brushColor,
              }}
            >
              <ToolIcon size={9} />
              {config.activeTool}
            </span>
          </div>
          <div className="text-[9px] text-white/40">
            {drawingCount > 0 && (
              <span className="mr-2">{drawingCount} drawing{drawingCount > 1 ? 's' : ''}</span>
            )}
            {textCount > 0 && (
              <span>{textCount} text{textCount > 1 ? 's' : ''}</span>
            )}
            {drawingCount === 0 && textCount === 0 && (
              <span className="text-white/25">No edits yet</span>
            )}
          </div>
          <div className="text-[9px] text-white/20 mt-0.5">
            Brush: {config.brushSize}px
          </div>
        </div>
      </div>
    </CompactNode>
  );
}
