import type { NodeProps } from '@xyflow/react';
import { Zap } from 'lucide-react';
import { CompactNode } from '../CompactNode';
import type { ImageGeneratorData } from '../../types/node-types';

const DIMENSION_LABELS: Record<string, string> = {
  'square-1024': '1024×1024',
  'portrait-768x1024': '768×1024',
  'landscape-1024x768': '1024×768',
  'story-576x1024': '576×1024',
};

export function ImageGeneratorNode({ data, selected }: NodeProps<ImageGeneratorData>) {
  const { config } = data;
  const dimLabel = DIMENSION_LABELS[config.dimensions] ?? config.dimensions;

  return (
    <CompactNode
      nodeType="imageGenerator"
      icon=""
      title={data.label}
      subtitle={`${config.mode} · ${dimLabel}`}
      selected={selected}
    >
      <div className="flex items-center gap-1.5 text-[11px] text-white/50">
        <span className="inline-flex items-center gap-1.5 text-white/30">
          <Zap size={12} className="text-white/35" /> Wan · {config.dimensions}
        </span>
      </div>
    </CompactNode>
  );
}
