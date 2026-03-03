import { useNodeId, useReactFlow } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import { CompactNode } from '../CompactNode';
import type { StickerLayerData } from '../../types/node-types';
import type { ImageData } from '../../types/port-types';
import { useExecutionContext } from '../../execution/ExecutionContext';
import { NodeModelSelect } from '../shared/NodeModelSelect';
import { MODEL_OPTIONS } from '../../config/modelOptions';

const PACK_EMOJIS: Record<string, string[]> = {
  ramadan:   ['🌙', '⭐', '🫔', '💎', '✨'],
  meme:      ['😂', '😤', '👀', '🔥', '👌'],
  sparkles:  ['✨', '💫', '🌟', '🦄', '🌈'],
  custom:    ['➕', '➕', '➕', '➕', '➕'],
};
const PACK_LABEL: Record<string, string> = {
  ramadan: 'Ramadan',
  meme: 'Meme',
  sparkles: 'Sparkles',
  custom: 'Custom',
};

export function StickerLayerNode({ id, data, selected }: NodeProps<Node<StickerLayerData>>) {
  const { config } = data;
  const nodeId = useNodeId();
  const { updateNodeData } = useReactFlow();
  const { getNodeState } = useExecutionContext();
  const execState = nodeId ? getNodeState(nodeId) : null;
  const updateConfig = (updates: Partial<typeof config>) => updateNodeData(id, { config: { ...config, ...updates } });
  const isRunning = execState?.status === 'running';
  const isDone = execState?.status === 'done';
  const outputImage = isDone ? (execState?.output?.type === 'image' ? (execState.output.data as ImageData) : null) : null;

  const emojis = PACK_EMOJIS[config.pack] ?? PACK_EMOJIS.sparkles;

  return (
    <CompactNode
      nodeType="stickerLayer"
      icon=""
      title={data.label}
      selected={selected}
    >
      {/* Emoji preview strip */}
      <div className="flex items-center justify-between mb-2 px-1">
        {emojis.map((e, i) => (
          <span key={i} className="text-[16px]">{e}</span>
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[9px] font-semibold px-1.5 py-px rounded bg-[#f59e0b]/20 text-[#f59e0b]">
          {PACK_LABEL[config.pack]}
        </span>
        <span className="text-[9px] text-white/30 ml-auto">
          {config.stickers.length} placed
        </span>
      </div>
    
      {/* ── Model ── */}
      <div className="mt-2.5 pt-2.5 flex items-center gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="text-[9px] text-white/25 uppercase tracking-wider shrink-0">Model</span>
        <div className="flex-1 min-w-0">
          <NodeModelSelect
            options={MODEL_OPTIONS.imageEditing}
            value={config.model ?? 'qwen-image-edit-plus'}
            onChange={(m) => updateConfig({ model: m })}
          />
        </div>
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
