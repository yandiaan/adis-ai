import { useNodeId, useReactFlow } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import { CompactNode } from '../CompactNode';
import type { ColorFilterData } from '../../types/node-types';
import type { ImageData } from '../../types/port-types';
import { useExecutionContext } from '../../execution/ExecutionContext';
import { NodeModelSelect } from '../shared/NodeModelSelect';
import { MODEL_OPTIONS } from '../../config/modelOptions';

const FILTER_META: Record<string, { gradient: string; label: string }> = {
  none:       { gradient: 'linear-gradient(90deg, #555, #888)', label: 'No Filter' },
  warm:       { gradient: 'linear-gradient(90deg, #fb923c, #fbbf24)', label: 'Warm' },
  vintage:    { gradient: 'linear-gradient(90deg, #92400e, #d97706)', label: 'Vintage' },
  'eid-gold': { gradient: 'linear-gradient(90deg, #C9A84C, #D4AF37)', label: 'Eid Gold' },
  sahur:      { gradient: 'linear-gradient(90deg, #1e3a5f, #2563eb)', label: 'Sahur' },
  cool:       { gradient: 'linear-gradient(90deg, #3b82f6, #06b6d4)', label: 'Cool' },
  vibrant:    { gradient: 'linear-gradient(90deg, #f472b6, #fb923c)', label: 'Vibrant' },
};

export function ColorFilterNode({ id, data, selected }: NodeProps<Node<ColorFilterData>>) {
  const { config } = data;
  const nodeId = useNodeId();
  const { updateNodeData } = useReactFlow();
  const { getNodeState } = useExecutionContext();
  const execState = nodeId ? getNodeState(nodeId) : null;
  const updateConfig = (updates: Partial<typeof config>) => updateNodeData(id, { config: { ...config, ...updates } });
  const isRunning = execState?.status === 'running';
  const isDone = execState?.status === 'done';
  const outputImage = isDone ? (execState?.output?.type === 'image' ? (execState.output.data as ImageData) : null) : null;

  const meta = FILTER_META[config.preset] ?? FILTER_META.none;

  return (
    <CompactNode
      nodeType="colorFilter"
      icon=""
      title={data.label}
      selected={selected}
    >
      {/* Filter gradient preview */}
      <div
        className="w-full h-5 rounded-md mb-2"
        style={{ background: meta.gradient, opacity: 0.3 + (config.intensity / 100) * 0.7 }}
      />
      {/* Intensity bar */}
      <div className="mb-1.5">
        <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: `${config.intensity}%`, background: meta.gradient }}
          />
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[9px] font-semibold px-1.5 py-px rounded bg-[#f59e0b]/20 text-[#f59e0b]">{meta.label}</span>
        <span className="text-[9px] text-white/30 ml-auto">{config.intensity}%</span>
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
