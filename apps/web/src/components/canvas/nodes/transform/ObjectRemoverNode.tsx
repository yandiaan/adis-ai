import type { Node, NodeProps } from '@xyflow/react';
import { CompactNode } from '../CompactNode';
import type { ObjectRemoverData } from '../../types/node-types';

export function ObjectRemoverNode({ data, selected }: NodeProps<Node<ObjectRemoverData>>) {
  const { config } = data;
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
    </CompactNode>
  );
}
