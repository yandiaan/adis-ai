import { useNodeId, useEdges } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import { CompactNode } from '../CompactNode';
import type { TextOverlayData } from '../../types/node-types';
import type { ImageData } from '../../types/port-types';
import { useExecutionContext } from '../../execution/ExecutionContext';

const POSITION_MAP: Record<
  string,
  { top?: string; bottom?: string; left: string; transform: string }
> = {
  top: { top: '8%', bottom: undefined, left: '50%', transform: 'translateX(-50%)' },
  center: { top: '50%', bottom: undefined, left: '50%', transform: 'translate(-50%,-50%)' },
  bottom: { top: undefined, bottom: '8%', left: '50%', transform: 'translateX(-50%)' },
  custom: { top: '50%', bottom: undefined, left: '50%', transform: 'translate(-50%,-50%)' },
};

export function TextOverlayNode({ data, selected }: NodeProps<Node<TextOverlayData>>) {
  const { config } = data;
  const nodeId = useNodeId();
  const edges = useEdges();
  const { getNodeState } = useExecutionContext();
  const execState = nodeId ? getNodeState(nodeId) : null;
  const isRunning = execState?.status === 'running';
  const isDone = execState?.status === 'done';
  const outputImage = isDone
    ? execState?.output?.type === 'image'
      ? (execState.output.data as ImageData)
      : null
    : null;

  const textPortConnected = nodeId
    ? edges.some((e) => e.target === nodeId && e.targetHandle === 'text')
    : false;

  // Resolve actual text from the upstream node's execution output
  const textEdge = nodeId
    ? edges.find((e) => e.target === nodeId && e.targetHandle === 'text')
    : null;
  const upstreamState = textEdge ? getNodeState(textEdge.source) : null;
  const upstreamText =
    upstreamState?.status === 'done' && upstreamState.output
      ? upstreamState.output.type === 'text'
        ? (upstreamState.output.data as { text: string }).text
        : upstreamState.output.type === 'prompt'
          ? (upstreamState.output.data as { prompt: string }).prompt
          : null
      : null;

  const displayText = textPortConnected
    ? upstreamText
      ? upstreamText.length > 24
        ? `${upstreamText.slice(0, 24)}…`
        : upstreamText
      : '↳ pending…'
    : config.text
      ? config.text.length > 24
        ? `${config.text.slice(0, 24)}…`
        : config.text
      : '—';
  const pos = POSITION_MAP[config.position] ?? POSITION_MAP.bottom;

  return (
    <CompactNode nodeType="textOverlay" icon="" title={data.label} selected={selected}>
      {/* Miniature position preview */}
      <div className="relative w-full h-14 rounded-md bg-white/5 border border-white/10 overflow-hidden mb-2">
        <div className="absolute inset-2 rounded bg-white/5" />
        <div
          className="absolute text-[8px] font-bold px-1 py-px rounded"
          style={{
            ...pos,
            backgroundColor: textPortConnected ? 'rgba(74,222,128,0.15)' : `${config.fontColor}80`,
            color: textPortConnected ? '#4ade80' : config.fontColor,
            whiteSpace: 'nowrap',
            maxWidth: '90%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {displayText}
        </div>
      </div>
      {/* Meta */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[9px] px-1.5 py-px rounded bg-[#f59e0b]/20 text-[#f59e0b]">
          {config.position}
        </span>
        <span className="text-[9px] text-white/30">{config.font}</span>
        {config.effect !== 'none' && (
          <span className="text-[9px] px-1.5 py-px rounded bg-white/8 text-white/40">
            {config.effect}
          </span>
        )}
      </div>

      {/* ── Output preview ──────────────────────────────── */}
      {(isRunning || isDone) && (
        <div className="mt-2.5 pt-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="text-[9px] text-white/25 uppercase tracking-wider">Output</span>
          <div
            className="relative w-full overflow-hidden rounded-lg mt-1.5"
            style={{ height: 120, background: '#0e0e16' }}
          >
            {outputImage ? (
              <img src={outputImage.url} alt="Output" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="relative w-6 h-6">
                  <div className="absolute inset-0 rounded-full border-2 border-[#60a5fa]/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-t-[#60a5fa] animate-spin" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </CompactNode>
  );
}
