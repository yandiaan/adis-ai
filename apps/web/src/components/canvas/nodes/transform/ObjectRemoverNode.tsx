import { useReactFlow } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import { CompactNode } from '../CompactNode';
import type { ObjectRemoverData } from '../../types/node-types';
import { NodeModelSelect } from '../shared/NodeModelSelect';
import { MODEL_OPTIONS } from '../../config/modelOptions';

export function ObjectRemoverNode({ id, data, selected }: NodeProps<Node<ObjectRemoverData>>) {
  const { config } = data;
  const { updateNodeData } = useReactFlow();
  const updateConfig = (updates: Partial<typeof config>) => updateNodeData(id, { config: { ...config, ...updates } });
  const badgeLabel = config.mode === 'auto' ? 'Auto detect' : config.target || 'Describe target';

  return (
    <CompactNode nodeType="objectRemover" icon="🗑️" title={data.label} selected={selected}>
      <div className="flex items-center gap-2.5">
        <div
          className="w-11 h-11 rounded-lg flex items-center justify-center border border-white/10 flex-shrink-0"
          style={{ background: 'rgba(248, 113, 113, 0.1)' }}
        >
          <span className="text-xl">🗑️</span>
        </div>
        <div>
          <div className="text-[11px] font-semibold text-red-300">{badgeLabel}</div>
          <div className="text-[9px] text-white/30 mt-0.5">
            {config.mode === 'auto' ? 'AI auto-detection' : 'Custom target'}
          </div>
          <div className="text-[9px] text-white/20 mt-0.5">Object Removal</div>
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
