import { useNodeId, useReactFlow } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import { CompactNode } from '../CompactNode';
import type { PromptEnhancerData } from '../../types/node-types';
import type { TextData, PromptData } from '../../types/port-types';
import { useExecutionContext } from '../../execution/ExecutionContext';
import { NodeModelSelect } from '../shared/NodeModelSelect';
import { MODEL_OPTIONS } from '../../config/modelOptions';

const CREATIVITY_STEPS = ['precise', 'balanced', 'creative'] as const;
const TONE_COLORS: Record<string, string> = {
  formal: '#60a5fa', casual: '#4ade80', funny: '#fb923c', heartfelt: '#f472b6',
};
const LANG_CODE: Record<string, string> = { id: 'ID', en: 'EN', mixed: 'MIX' };

export function PromptEnhancerNode({ id, data, selected }: NodeProps<Node<PromptEnhancerData>>) {
  const { config } = data;
  const nodeId = useNodeId();
  const { updateNodeData } = useReactFlow();
  const { getNodeState } = useExecutionContext();
  const execState = nodeId ? getNodeState(nodeId) : null;
  const updateConfig = (updates: Partial<typeof config>) => updateNodeData(id, { config: { ...config, ...updates } });
  const isRunning = execState?.status === 'running';
  const isDone = execState?.status === 'done';
  const outputText = isDone
    ? execState?.output?.type === 'text'
      ? (execState.output.data as TextData).text
      : execState?.output?.type === 'prompt'
        ? (execState.output.data as PromptData).prompt
        : null
    : null;

  const creativeIdx = CREATIVITY_STEPS.indexOf(config.creativity as (typeof CREATIVITY_STEPS)[number]);
  const toneColor = TONE_COLORS[config.tone] ?? '#a78bfa';

  return (
    <CompactNode nodeType="promptEnhancer" icon="" title={data.label} selected={selected} maxWidth={300}>
      {/* Creativity bar */}
      <div className="mb-2.5">
        <div className="flex justify-between text-[9px] text-white/25 mb-1.5">
          <span>Precise</span><span>Balanced</span><span>Creative</span>
        </div>
        <div className="flex gap-1">
          {CREATIVITY_STEPS.map((step, i) => (
            <div
              key={step}
              className="flex-1 h-1.5 rounded-full"
              style={{ backgroundColor: i <= creativeIdx ? '#a78bfa' : 'rgba(167,139,250,0.12)' }}
            />
          ))}
        </div>
      </div>
      {/* Tag row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span
          className="text-[9px] font-semibold px-1.5 py-px rounded-full border"
          style={{ color: toneColor, borderColor: toneColor + '40', backgroundColor: toneColor + '15' }}
        >
          {config.tone}
        </span>
        <span className="text-[9px] px-1.5 py-px rounded-full text-white/40" style={{ background: 'rgba(255,255,255,0.06)' }}>
          {config.contentType}
        </span>
        <span className="text-[10px] font-bold text-white/55 tracking-wider ml-auto" title={config.language}>{LANG_CODE[config.language] ?? config.language.toUpperCase()}</span>
      </div>
    
      {/* ── Model ── */}
      <div className="mt-2.5 pt-2.5 flex items-center gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="text-[9px] text-white/25 uppercase tracking-wider shrink-0">Model</span>
        <div className="flex-1 min-w-0">
          <NodeModelSelect
            options={MODEL_OPTIONS.textGeneration}
            value={config.model ?? 'qwen-flash'}
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
              <p className="text-[10px] text-white/70 leading-relaxed line-clamp-4 break-words">{outputText}</p>
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
