import { useNodeId, useReactFlow } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import { CompactNode } from '../CompactNode';
import type { TranslateTextData } from '../../types/node-types';
import type { TextData } from '../../types/port-types';
import { useExecutionContext } from '../../execution/ExecutionContext';
import { NodeModelSelect } from '../shared/NodeModelSelect';
import { MODEL_OPTIONS } from '../../config/modelOptions';

const LANG_CODES: Record<string, string> = {
  auto: 'AUTO',
  id: 'ID',
  en: 'EN',
  ar: 'AR',
  zh: 'ZH',
};
const LANG_NAMES: Record<string, string> = {
  auto: 'Auto',
  id: 'Indonesian',
  en: 'English',
  ar: 'Arabic',
  zh: 'Chinese',
};

export function TranslateTextNode({ id, data, selected }: NodeProps<Node<TranslateTextData>>) {
  const { config } = data;
  const nodeId = useNodeId();
  const { updateNodeData } = useReactFlow();
  const { getNodeState } = useExecutionContext();
  const execState = nodeId ? getNodeState(nodeId) : null;
  const updateConfig = (updates: Partial<typeof config>) => updateNodeData(id, { config: { ...config, ...updates } });
  const isRunning = execState?.status === 'running';
  const isDone = execState?.status === 'done';
  const outputText = isDone ? (execState?.output?.type === 'text' ? (execState.output.data as TextData).text : null) : null;


  return (
    <CompactNode
      nodeType="translateText"
      icon=""
      title={data.label}
      selected={selected}
    >
      {/* Big language arrow */}
      <div className="flex items-center justify-center gap-2 py-1">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[13px] font-bold text-white/75 tracking-wide">{LANG_CODES[config.sourceLang] ?? config.sourceLang.toUpperCase()}</span>
          <span className="text-[9px] text-white/35">{LANG_NAMES[config.sourceLang]}</span>
        </div>
        <svg width="28" height="12" viewBox="0 0 28 12">
          <path d="M2 6 H20 M18 2 L25 6 L18 10" stroke="rgba(167,139,250,0.5)" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[13px] font-bold text-white/75 tracking-wide">{LANG_CODES[config.targetLang] ?? config.targetLang.toUpperCase()}</span>
          <span className="text-[9px] text-white/35">{LANG_NAMES[config.targetLang]}</span>
        </div>
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
