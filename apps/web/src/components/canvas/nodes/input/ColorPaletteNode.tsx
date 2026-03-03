import type { Node, NodeProps } from '@xyflow/react';
import { CompactNode } from '../CompactNode';
import type { ColorPaletteData } from '../../types/node-types';

const MODE_LABELS: Record<string, string> = {
  preset: 'Preset',
  custom: 'Custom',
  extract: 'Extract',
};

export function ColorPaletteNode({ data, selected }: NodeProps<Node<ColorPaletteData>>) {
  const { config } = data;

  return (
    <CompactNode
      nodeType="colorPalette"
      icon=""
      title={data.label}
      selected={selected}
    >
      {/* Swatch strip */}
      <div className="flex rounded-lg overflow-hidden h-6 mb-2">
        {config.palette.map((color, i) => (
          <div
            key={i}
            className="flex-1"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
      {/* Meta row */}
      <div className="flex items-center justify-between">
        <span className="text-[9px] uppercase font-semibold px-1.5 py-0.5 rounded bg-[#f59e0b]/20 text-[#f59e0b]">
          {MODE_LABELS[config.mode]}
        </span>
        <span className="text-[10px] text-white/35">{config.presetName}</span>
        <span className="text-[9px] text-white/25">{config.palette.length} colors</span>
      </div>
    </CompactNode>
  );
}
