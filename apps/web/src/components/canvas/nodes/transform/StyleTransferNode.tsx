import { useReactFlow } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import { CompactNode } from '../CompactNode';
import type { StyleTransferData } from '../../types/node-types';
import { NodeModelSelect } from '../shared/NodeModelSelect';
import { MODEL_OPTIONS } from '../../config/modelOptions';

const STRENGTH_COLORS: Record<string, string> = {
  subtle: '#60a5fa',
  moderate: '#a78bfa',
  strong: '#f472b6',
};

export function StyleTransferNode({ id, data, selected }: NodeProps<Node<StyleTransferData>>) {
  const { config } = data;
  const { updateNodeData } = useReactFlow();
  const updateConfig = (updates: Partial<typeof config>) => updateNodeData(id, { config: { ...config, ...updates } });
  const color = STRENGTH_COLORS[config.strength] ?? '#a78bfa';
  const promptLabel = config.stylePrompt
    ? config.stylePrompt.length > 22
      ? config.stylePrompt.slice(0, 22) + '…'
      : config.stylePrompt
    : 'From style image';

  return (
    <CompactNode nodeType="styleTransfer" icon="🎨" title={data.label} selected={selected}>
      <div className="flex items-center gap-2.5">
        <div
          className="w-11 h-11 rounded-lg flex items-center justify-center border border-white/10 flex-shrink-0"
          style={{ background: color + '18' }}
        >
          <span className="text-xl">🎨</span>
        </div>
        <div>
          <span
            className="text-[9px] font-semibold capitalize px-1.5 py-px rounded-full inline-block"
            style={{ color, backgroundColor: color + '20' }}
          >
            {config.strength}
          </span>
          <div className="text-[10px] text-white/50 mt-0.5">{promptLabel}</div>
          <div className="text-[9px] text-white/20 mt-0.5">Style Transfer</div>
        </div>
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
    </CompactNode>
  );
}
