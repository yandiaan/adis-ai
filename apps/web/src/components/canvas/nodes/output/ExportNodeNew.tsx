import type { NodeProps } from '@xyflow/react';
import { useNodeId } from '@xyflow/react';
import { Download } from 'lucide-react';
import { CompactNode } from '../CompactNode';
import type { ExportData } from '../../types/node-types';
import { useExecutionContext } from '../../execution/ExecutionContext';
import type { ImageData, VideoData } from '../../types/port-types';

export function ExportNode({ data, selected }: NodeProps<ExportData>) {
  const { config } = data;
  const nodeId = useNodeId();
  const { getNodeState } = useExecutionContext();
  const execState = nodeId ? getNodeState(nodeId) : null;
  const output = execState?.output ?? null;

  const mediaUrl =
    output?.type === 'image'
      ? (output.data as ImageData).url
      : output?.type === 'video'
        ? (output.data as VideoData).url
        : null;

  return (
    <CompactNode
      nodeType="export"
      icon=""
      title={data.label}
      subtitle={`${config.format.toUpperCase()} · ${config.quality}%`}
      selected={selected}
    >
      <div className="flex gap-1.5 items-center text-[11px]">
        <span className="px-2 py-0.5 rounded bg-[rgba(248,113,113,0.15)] text-[#f87171] text-[10px]">
          {config.shareTarget}
        </span>
        {mediaUrl && (
          <a
            href={mediaUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 text-white/60 text-[10px] hover:bg-white/20 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Download size={10} /> Save
          </a>
        )}
      </div>
    </CompactNode>
  );
}
