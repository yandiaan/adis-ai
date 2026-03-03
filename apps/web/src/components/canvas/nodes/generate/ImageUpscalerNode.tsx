import { useNodeId, useReactFlow } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import { CompactNode } from '../CompactNode';
import type { ImageUpscalerData } from '../../types/node-types';
import type { ImageData } from '../../types/port-types';
import { useExecutionContext } from '../../execution/ExecutionContext';
import { NodeModelSelect } from '../shared/NodeModelSelect';
import { MODEL_OPTIONS } from '../../config/modelOptions';

export function ImageUpscalerNode({ id, data, selected }: NodeProps<Node<ImageUpscalerData>>) {
  const { config } = data;
  const nodeId = useNodeId();
  const { updateNodeData } = useReactFlow();
  const { getNodeState } = useExecutionContext();
  const execState = nodeId ? getNodeState(nodeId) : null;
  const updateConfig = (updates: Partial<typeof config>) => updateNodeData(id, { config: { ...config, ...updates } });
  const isRunning = execState?.status === 'running';
  const isDone = execState?.status === 'done';
  const outputImage = isDone ? (execState?.output?.type === 'image' ? (execState.output.data as ImageData) : null) : null;


  return (
    <CompactNode
      nodeType="imageUpscaler"
      icon=""
      title={data.label}
      selected={selected}
    >
      <div className="flex items-center gap-3">
        {/* Scale indicator */}
        <div className="w-12 h-12 rounded-lg bg-[#4ade80]/10 border border-[#4ade80]/25 flex flex-col items-center justify-center flex-shrink-0">
          <span className="text-[20px] font-black leading-none" style={{ color: '#4ade80' }}>
            ×{config.scale}
          </span>
          <span className="text-[8px] text-[#4ade80]/60">HD</span>
        </div>
        {/* Info */}
        <div className="flex-1">
          <div className="text-[10px] text-white/50 mb-1">
            {config.scale === 2 ? '2× → 2048px' : '4× → 4096px'}
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: config.enhanceFaces ? '#f472b6' : 'rgba(255,255,255,0.15)' }}
            />
            <span className="text-[9px]" style={{ color: config.enhanceFaces ? '#f472b6' : 'rgba(255,255,255,0.25)' }}>
              Face enhance {config.enhanceFaces ? 'on' : 'off'}
            </span>
          </div>
        </div>
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
