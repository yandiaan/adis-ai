import type { Node, NodeProps } from '@xyflow/react';
import { useNodeId, useEdges, useNodesData } from '@xyflow/react';
import type { ReactNode } from 'react';
import { ArrowDown, Clipboard, Download, MessageCircle } from 'lucide-react';
import { CompactNode } from '../CompactNode';
import type { ExportData } from '../../types/node-types';
import { useExecutionContext } from '../../execution/ExecutionContext';
import type { ImageData, VideoData } from '../../types/port-types';

const FORMAT_COLOR: Record<string, string> = {
  png: '#60a5fa', jpg: '#34d399', webp: '#a78bfa', mp4: '#f472b6',
};
const SHARE_ICONS: Record<string, ReactNode> = {
  download: <ArrowDown size={9} />,
  whatsapp: <MessageCircle size={9} />,
  clipboard: <Clipboard size={9} />,
};

export function ExportNode({ data, selected }: NodeProps<Node<ExportData>>) {
  const { config } = data;
  const nodeId = useNodeId()!;
  const edges = useEdges();
  const { getNodeState } = useExecutionContext();
  const incomingEdge = edges.find(e => e.target === nodeId);
  const upstreamState = incomingEdge ? getNodeState(incomingEdge.source) : null;
  const output = upstreamState?.output ?? null;

  // Also check upstream node's exportDataUrl (for live preview from ManualEditor)
  const upstreamNodesData = useNodesData(incomingEdge?.source ? [incomingEdge.source] : []);
  const upstreamData = upstreamNodesData?.[0]?.data as Record<string, unknown> | undefined;
  const upstreamExportUrl = upstreamData?.exportDataUrl as string | null | undefined;

  const mediaUrl =
    output?.type === 'image' ? (output.data as ImageData).url
    : output?.type === 'video' ? (output.data as VideoData).url
    : upstreamExportUrl ?? null;

  const fmtColor = FORMAT_COLOR[config.format] ?? '#f87171';

  return (
    <CompactNode
      nodeType="export"
      icon=""
      title={data.label}
      selected={selected}
    >
      <div className="flex items-center gap-2 mb-2">
        {/* Preview thumbnail or format badge */}
        {mediaUrl ? (
          <div className="w-16 h-12 rounded-lg overflow-hidden border border-white/15 flex-shrink-0 bg-black/30">
            <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div
            className="flex-shrink-0 w-12 h-10 rounded-lg flex items-center justify-center text-[13px] font-black"
            style={{ backgroundColor: `${fmtColor}22`, color: fmtColor, border: `1px solid ${fmtColor}44` }}
          >
            {config.format.toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-px rounded bg-[#f87171]/20 text-[#f87171]">
          {SHARE_ICONS[config.shareTarget] ?? <ArrowDown size={9} />}
          <span>{config.shareTarget}</span>
        </span>
        {mediaUrl && (
          <a
            href="#"
            className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/8 text-white/50 text-[9px] hover:bg-white/15 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Handle both data URLs and remote URLs
              if (mediaUrl.startsWith('data:')) {
                fetch(mediaUrl)
                  .then((r) => r.blob())
                  .then((blob) => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `export.${config.format}`;
                    a.click();
                    URL.revokeObjectURL(url);
                  });
              } else {
                const a = document.createElement('a');
                a.href = mediaUrl;
                a.download = `export.${config.format}`;
                a.target = '_blank';
                a.click();
              }
            }}
          >
            <Download size={9} /> Save
          </a>
        )}
      </div>
    </CompactNode>
  );
}
