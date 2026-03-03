import { useNodeId, useReactFlow } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import { ScanFace } from 'lucide-react';
import { CompactNode } from '../CompactNode';
import type { FaceCropData } from '../../types/node-types';
import type { ImageData } from '../../types/port-types';
import { useExecutionContext } from '../../execution/ExecutionContext';
import { NodeModelSelect } from '../shared/NodeModelSelect';
import { MODEL_OPTIONS } from '../../config/modelOptions';

export function FaceCropNode({ id, data, selected }: NodeProps<Node<FaceCropData>>) {
  const { config } = data;
  const nodeId = useNodeId();
  const { updateNodeData } = useReactFlow();
  const { getNodeState } = useExecutionContext();
  const execState = nodeId ? getNodeState(nodeId) : null;
  const updateConfig = (updates: Partial<typeof config>) =>
    updateNodeData(id, { config: { ...config, ...updates } });
  const isRunning = execState?.status === 'running';
  const isDone = execState?.status === 'done';
  const outputImage = isDone
    ? execState?.output?.type === 'image'
      ? (execState.output.data as ImageData)
      : null
    : null;

  const isSquare = config.format === 'square';

  return (
    <CompactNode nodeType="faceCrop" icon="" title={data.label} selected={selected}>
      <div className="flex items-center gap-3">
        {/* Format diagram */}
        <div className="flex items-center justify-center w-12 flex-shrink-0">
          <div
            className="border-2 border-[#60a5fa] rounded bg-[#60a5fa]/10 flex items-center justify-center"
            style={{ width: isSquare ? 34 : 26, height: isSquare ? 34 : 40 }}
          >
            <ScanFace size={13} className="text-[#60a5fa]" />
          </div>
        </div>
        {/* Info */}
        <div className="flex-1">
          <span className="text-[9px] font-semibold px-1.5 py-px rounded bg-[#60a5fa]/20 text-[#60a5fa] capitalize">
            {config.format}
          </span>
          <div className="text-[9px] text-white/35 mt-1.5">
            Margin <span className="text-white/55 font-medium">{config.margin}px</span>
          </div>
          <div className="text-[9px] text-white/20">Face Detection</div>
        </div>
      </div>

      {/* ── Model ── */}
      <div
        className="mt-2.5 pt-2.5 flex items-center gap-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
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
