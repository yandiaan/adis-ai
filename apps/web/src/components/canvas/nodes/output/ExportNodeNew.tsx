import type { Node, NodeProps } from '@xyflow/react';
import { useNodeId } from '@xyflow/react';
import type { ReactNode } from 'react';
import { ArrowDown, Clipboard, Download, MessageCircle } from 'lucide-react';
import { CompactNode } from '../CompactNode';
import type { ExportData } from '../../types/node-types';
import { useExecutionContext } from '../../execution/ExecutionContext';
import type { ImageData, VideoData } from '../../types/port-types';

const FORMAT_COLOR: Record<string, string> = {
  png: '#60a5fa', jpg: '#34d399', webp: '#a78bfa', mp4: '#f472b6', gif: '#fbbf24',
};
const SHARE_ICONS: Record<string, ReactNode> = {
  download: <ArrowDown size={9} />,
  whatsapp: <MessageCircle size={9} />,
  clipboard: <Clipboard size={9} />,
};

export function ExportNode({ data, selected }: NodeProps<Node<ExportData>>) {
  const { config } = data;
  const nodeId = useNodeId();
  const { getNodeState } = useExecutionContext();
  const execState = nodeId ? getNodeState(nodeId) : null;
  const output = execState?.output ?? null;

  const mediaUrl =
    output?.type === 'image' ? (output.data as ImageData).url
    : output?.type === 'video' ? (output.data as VideoData).url
    : null;

  const fmtColor = FORMAT_COLOR[config.format] ?? '#f87171';

  return (
    <CompactNode
      nodeType="export"
      icon=""
      title={data.label}
      selected={selected}
    >
      <div className="flex items-center gap-2 mb-2">
        {/* Format badge — big and prominent */}
        <div
          className="flex-shrink-0 w-12 h-10 rounded-lg flex items-center justify-center text-[13px] font-black"
          style={{ backgroundColor: `${fmtColor}22`, color: fmtColor, border: `1px solid ${fmtColor}44` }}
        >
          {config.format.toUpperCase()}
        </div>
        <div className="flex-1">
          {/* Quality bar */}
          <div className="h-1.5 rounded-full bg-white/8 overflow-hidden mb-1">
            <div
              className="h-full rounded-full"
              style={{ width: `${config.quality}%`, backgroundColor: fmtColor, opacity: 0.7 }}
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-white/30">Quality {config.quality}%</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-px rounded bg-[#f87171]/20 text-[#f87171]">
          {SHARE_ICONS[config.shareTarget] ?? <ArrowDown size={9} />}
          <span>{config.shareTarget}</span>
        </span>
        {mediaUrl && (
          <a
            href={mediaUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/8 text-white/50 text-[9px] hover:bg-white/15 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Download size={9} /> Save
          </a>
        )}
      </div>
    </CompactNode>
  );
}
