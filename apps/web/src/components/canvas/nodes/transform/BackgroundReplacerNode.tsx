import type { Node, NodeProps } from '@xyflow/react';
import { CompactNode } from '../CompactNode';
import type { BackgroundReplacerData } from '../../types/node-types';

const TYPE_LABELS: Record<string, string> = {
  blur: 'Blur',
  'solid-color': 'Solid Color',
  'ai-generated': 'AI Generated',
};

export function BackgroundReplacerNode({ data, selected }: NodeProps<Node<BackgroundReplacerData>>) {
  const { config } = data;
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
    </CompactNode>
  );
}
