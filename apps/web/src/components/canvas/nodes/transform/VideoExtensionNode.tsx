import { useNodeId, useReactFlow } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import { CompactNode } from '../CompactNode';
import { useExecutionContext } from '../../execution/ExecutionContext';
import type { VideoExtensionData } from '../../types/node-types';
import type { VideoData } from '../../types/port-types';
import { Scissors } from 'lucide-react';

interface SegmentProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}

function Segment({ options, value, onChange }: SegmentProps) {
  return (
    <div
      className="flex rounded-lg p-0.5 gap-0.5"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            className="flex-1 rounded-md text-[9px] font-semibold py-0.5 px-1.5 transition-all duration-150 cursor-pointer"
            style={{
              background: active ? '#34d39922' : 'transparent',
              color: active ? '#34d399' : 'rgba(255,255,255,0.3)',
              border: active ? '1px solid #34d39940' : '1px solid transparent',
            }}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function VideoExtensionNode({ id, data, selected }: NodeProps<Node<VideoExtensionData>>) {
  const { config } = data;
  const nodeId = useNodeId();
  const { updateNodeData } = useReactFlow();
  const { getNodeState } = useExecutionContext();
  const execState = nodeId ? getNodeState(nodeId) : null;
  const status = execState?.status ?? 'idle';
  const isRunning = status === 'running';
  const isDone = status === 'done';
  const outputVideo = isDone ? (execState?.output?.type === 'video' ? (execState.output.data as VideoData) : null) : null;

  const updateConfig = (updates: Partial<typeof config>) =>
    updateNodeData(id, { config: { ...config, ...updates } });

  return (
    <CompactNode nodeType="videoExtension" icon="⏩" title={data.label} selected={selected} width={240}>
      {/* Preview */}
      <div className="relative w-full overflow-hidden rounded-lg mb-3" style={{ height: 120, background: '#0e0e16' }}>
        {outputVideo ? (
          <video src={outputVideo.url} className="w-full h-full object-cover" controls={false} muted loop autoPlay playsInline />
        ) : isRunning ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-full border-2 border-[#34d399]/20" />
              <div className="absolute inset-0 rounded-full border-2 border-t-[#34d399] animate-spin" />
            </div>
            <span className="text-[10px] text-white/40">Extending video...</span>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 border border-dashed border-white/8 rounded-lg">
            <Scissors size={20} className="text-white/15" />
            <span className="text-[10px] text-white/25">Run to extend (→ 5s)</span>
          </div>
        )}
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: 'rgba(0,0,0,0.65)', color: '#34d399' }}>
          5s output
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <span className="text-[9px] text-white/25 uppercase tracking-wider mb-1 block">Direction</span>
          <Segment
            options={[
              { value: 'forward', label: '→ Forward' },
              { value: 'backward', label: '← Backward' },
            ]}
            value={config.direction}
            onChange={(v) => updateConfig({ direction: v as typeof config.direction })}
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[9px] text-white/25">Prompt extend</span>
          <button
            className="w-8 h-4 rounded-full transition-all duration-150 relative cursor-pointer"
            style={{ background: config.prompt_extend ? '#34d399' : 'rgba(255,255,255,0.1)' }}
            onClick={() => updateConfig({ prompt_extend: !config.prompt_extend })}
          >
            <div
              className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all duration-150"
              style={{ left: config.prompt_extend ? '17px' : '2px' }}
            />
          </button>
        </div>
      </div>
    </CompactNode>
  );
}
