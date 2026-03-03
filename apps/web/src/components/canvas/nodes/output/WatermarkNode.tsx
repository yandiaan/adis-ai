import type { Node, NodeProps } from '@xyflow/react';
import { CompactNode } from '../CompactNode';
import type { WatermarkData } from '../../types/node-types';

const POSITIONS = [
  ['top-left', 'top-center', 'top-right'],
  ['center-left', 'center', 'center-right'],
  ['bottom-left', 'bottom-center', 'bottom-right'],
];

export function WatermarkNode({ data, selected }: NodeProps<Node<WatermarkData>>) {
  const { config } = data;
  const preview = config.text
    ? config.text.length > 18
      ? `${config.text.slice(0, 18)}…`
      : config.text
    : '© Brand';

  return (
    <CompactNode nodeType="watermark" icon="" title={data.label} selected={selected}>
      {/* 3×3 position grid */}
      <div className="grid grid-cols-3 gap-0.5 w-full mb-2">
        {POSITIONS.flat().map((pos) => (
          <div
            key={pos}
            className="h-4 rounded-sm flex items-center justify-center"
            style={{
              backgroundColor:
                pos === config.position ? 'rgba(248,113,113,0.4)' : 'rgba(255,255,255,0.04)',
              border:
                pos === config.position
                  ? '1px solid rgba(248,113,113,0.7)'
                  : '1px solid transparent',
            }}
          >
            {pos === config.position && (
              <span className="text-[7px] text-[#f87171] font-bold leading-none">{'©'}</span>
            )}
          </div>
        ))}
      </div>
      {/* Opacity bar */}
      <div className="mb-1.5">
        <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#f87171]/60"
            style={{ width: `${config.opacity}%` }}
          />
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[9px] text-white/40 italic truncate flex-1">{preview}</span>
        <span className="text-[9px] text-white/30">{config.opacity}%</span>
      </div>
    </CompactNode>
  );
}
