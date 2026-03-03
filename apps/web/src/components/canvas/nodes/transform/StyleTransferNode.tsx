import type { Node, NodeProps } from '@xyflow/react';
import { CompactNode } from '../CompactNode';
import type { StyleTransferData } from '../../types/node-types';

const STRENGTH_COLORS: Record<string, string> = {
  subtle: '#60a5fa',
  moderate: '#a78bfa',
  strong: '#f472b6',
};

export function StyleTransferNode({ data, selected }: NodeProps<Node<StyleTransferData>>) {
  const { config } = data;
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
    </CompactNode>
  );
}
