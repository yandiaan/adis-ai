import type { NodeProps } from '@xyflow/react';
import { Video } from 'lucide-react';
import { CompactNode } from '../CompactNode';
import type { VideoGeneratorData } from '../../types/node-types';

export function VideoGeneratorNode({ data, selected }: NodeProps<VideoGeneratorData>) {
  const { config } = data;

  return (
    <CompactNode
      nodeType="videoGenerator"
      icon=""
      title={data.label}
      subtitle={`${config.mode} · ${config.duration} · ${config.resolution}`}
      selected={selected}
    >
      <div className="flex items-center gap-1.5 text-[11px] text-white/50">
        <span className="inline-flex items-center gap-1.5 text-white/30">
          <Video size={12} className="text-white/35" /> Wan · {config.duration}s · {config.resolution}
        </span>
      </div>
    </CompactNode>
  );
}
