import { useNodeId, useReactFlow } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import { CompactNode } from '../CompactNode';
import type { ImageToTextData } from '../../types/node-types';
import type { TextData } from '../../types/port-types';
import { useExecutionContext } from '../../execution/ExecutionContext';
import { NodeModelSelect } from '../shared/NodeModelSelect';
import { MODEL_OPTIONS } from '../../config/modelOptions';

const DETAIL_BARS: Record<string, number> = { brief: 1, detailed: 2, artistic: 3 };
const LANG_LABEL: Record<string, string> = { id: 'ID', en: 'EN' };

export function ImageToTextNode({ id, data, selected }: NodeProps<Node<ImageToTextData>>) {
  const { config } = data;
  const nodeId = useNodeId();
  const { updateNodeData } = useReactFlow();
  const { getNodeState } = useExecutionContext();
  const execState = nodeId ? getNodeState(nodeId) : null;
  const updateConfig = (updates: Partial<typeof config>) => updateNodeData(id, { config: { ...config, ...updates } });
  const isRunning = execState?.status === 'running';
  const isDone = execState?.status === 'done';
  const outputText = isDone ? (execState?.output?.type === 'text' ? (execState.output.data as TextData).text : null) : null;

  const bars = DETAIL_BARS[config.detailLevel] ?? 2;

  return (
    <CompactNode
      nodeType="imageToText"
      icon=""
      title={data.label}
      selected={selected}
    >
      {/* Port flow: image → text */}
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#60a5fa]/15 text-[#60a5fa] font-semibold">IMG</span>
        <svg width="20" height="8" viewBox="0 0 20 8">
          <path d="M0 4 H14 M14 1 L19 4 L14 7" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#4ade80]/15 text-[#4ade80] font-semibold">TEXT</span>
        <span className="ml-auto text-[9px] font-semibold px-1.5 py-px rounded bg-[#60a5fa]/10 text-[#60a5fa]">
          {LANG_LABEL[config.language]}
        </span>
      </div>
      {/* Detail level */}
      <div className="flex items-center gap-1.5">
        <span className="text-[9px] text-white/30 w-12">Detail</span>
        <div className="flex gap-1">
          {[1, 2, 3].map((b) => (
            <div
              key={b}
              className="w-5 h-1.5 rounded-full"
              style={{ backgroundColor: b <= bars ? '#a78bfa' : 'rgba(167,139,250,0.15)' }}
            />
          ))}
        </div>
        <span className="text-[9px] text-white/35 ml-1">{config.detailLevel}</span>
      </div>
    
      {/* ── Model ── */}
      <div className="mt-2.5 pt-2.5 flex items-center gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="text-[9px] text-white/25 uppercase tracking-wider shrink-0">Model</span>
        <div className="flex-1 min-w-0">
          <NodeModelSelect
            options={MODEL_OPTIONS.vision}
            value={config.model ?? 'qwen2.5-vl-3b-instruct'}
            onChange={(m) => updateConfig({ model: m })}
          />
        </div>
      </div>

      {/* ── Output preview ──────────────────────────────── */}
      {(isRunning || isDone) && (
        <div className="mt-2.5 pt-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="text-[9px] text-white/25 uppercase tracking-wider">Output</span>
          <div
            className="w-full min-h-[44px] rounded-lg p-2 mt-1.5"
            style={{ background: '#0e0e16', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {outputText ? (
              <p className="text-[10px] text-white/70 leading-relaxed line-clamp-4">{outputText}</p>
            ) : (
              <div className="flex items-center justify-center py-2">
                <div className="relative w-5 h-5">
                  <div className="absolute inset-0 rounded-full border-2 border-[#4ade80]/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-t-[#4ade80] animate-spin" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      </CompactNode>
  );
}
