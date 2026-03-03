import { useNodeId, useReactFlow } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import type { ReactNode } from 'react';
import { Camera, FileText, Flower2, Frame, Square, Star, Zap } from 'lucide-react';
import { CompactNode } from '../CompactNode';
import type { FrameBorderData } from '../../types/node-types';
import type { ImageData } from '../../types/port-types';
import { useExecutionContext } from '../../execution/ExecutionContext';
import { NodeModelSelect } from '../shared/NodeModelSelect';
import { MODEL_OPTIONS } from '../../config/modelOptions';

const STYLE_ICONS: Record<string, ReactNode> = {
  islamic: <Star size={18} />,
  floral: <Flower2 size={18} />,
  polaroid: <Camera size={18} />,
  neon: <Zap size={18} />,
  'torn-paper': <FileText size={18} />,
  none: <Square size={18} />,
};

export function FrameBorderNode({ id, data, selected }: NodeProps<Node<FrameBorderData>>) {
  const { config } = data;
  const nodeId = useNodeId();
  const { updateNodeData } = useReactFlow();
  const { getNodeState } = useExecutionContext();
  const execState = nodeId ? getNodeState(nodeId) : null;
  const updateConfig = (updates: Partial<typeof config>) => updateNodeData(id, { config: { ...config, ...updates } });
  const isRunning = execState?.status === 'running';
  const isDone = execState?.status === 'done';
  const outputImage = isDone ? (execState?.output?.type === 'image' ? (execState.output.data as ImageData) : null) : null;

  const icon = STYLE_ICONS[config.style] ?? <Frame size={18} />;

  return (
    <CompactNode
      nodeType="frameBorder"
      icon=""
      title={data.label}
      selected={selected}
    >
      {/* Frame preview */}
      <div
        className="relative w-full h-12 rounded-md overflow-hidden flex items-center justify-center mb-2"
        style={{ border: `${Math.min(config.thickness, 8)}px solid ${config.color}`, backgroundColor: `${config.color}15` }}
      >
        <span className="text-[18px]">{icon}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[9px] font-semibold px-1.5 py-px rounded bg-[#f59e0b]/20 text-[#f59e0b] capitalize">
          {config.style}
        </span>
        <span className="text-[9px] text-white/30">{config.thickness}px thick</span>
        <div className="w-3.5 h-3.5 rounded-full border border-white/20 ml-auto flex-shrink-0" style={{ backgroundColor: config.color }} />
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

      {/* ── Output preview ──────────────────────────────── */}
      {(isRunning || isDone) && (
        <div className="mt-2.5 pt-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="text-[9px] text-white/25 uppercase tracking-wider">Output</span>
          <div
            className="relative w-full overflow-hidden rounded-lg mt-1.5"
            style={{ height: 120, background: '#0e0e16' }}
          >
            {outputImage ? (
              <img src={outputImage.url} alt="Output" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="relative w-6 h-6">
                  <div className="absolute inset-0 rounded-full border-2 border-[#60a5fa]/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-t-[#60a5fa] animate-spin" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      </CompactNode>
  );
}
