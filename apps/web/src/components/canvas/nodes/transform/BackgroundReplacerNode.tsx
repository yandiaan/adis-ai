import { useReactFlow } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import { CompactNode } from '../CompactNode';
import type { BackgroundReplacerData } from '../../types/node-types';
import { NodeModelSelect } from '../shared/NodeModelSelect';
import { MODEL_OPTIONS } from '../../config/modelOptions';

const TYPE_LABELS: Record<string, string> = {
  blur: 'Blur',
  'solid-color': 'Solid Color',
  'ai-generated': 'AI Generated',
};

export function BackgroundReplacerNode({ id, data, selected }: NodeProps<Node<BackgroundReplacerData>>) {
  const { config } = data;
  const { updateNodeData } = useReactFlow();
  const updateConfig = (updates: Partial<typeof config>) => updateNodeData(id, { config: { ...config, ...updates } });
  const label = TYPE_LABELS[config.replacementType] ?? config.replacementType;

  return (
    <CompactNode nodeType="backgroundReplacer" icon="🖼️" title={data.label} selected={selected}>
      <div className="flex items-center gap-2.5">
        <div
          className="w-11 h-11 rounded-lg flex items-center justify-center border border-white/10 flex-shrink-0 overflow-hidden"
          style={{
            background:
              config.replacementType === 'blur'
                ? 'linear-gradient(135deg, #1e1e3a, #3a3a5c)'
                : config.replacementType === 'solid-color'
                  ? config.color
                  : 'linear-gradient(135deg, #1a3a1a, #3a5c1e)',
          }}
        />
        <div>
          <div className="text-[11px] font-semibold text-blue-300">{label}</div>
          <div className="text-[9px] text-white/30 mt-0.5">
            {config.replacementType === 'ai-generated'
              ? config.backgroundPrompt || 'No prompt set'
              : config.replacementType === 'solid-color'
                ? config.color
                : 'Gaussian blur'}
          </div>
          <div className="text-[9px] text-white/20 mt-0.5">BG Replacer</div>
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
