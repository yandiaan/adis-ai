import { useNodeId, useReactFlow } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import { CompactNode } from '../CompactNode';
import type { BackgroundRemoverData } from '../../types/node-types';
import type { ImageData } from '../../types/port-types';
import { useExecutionContext } from '../../execution/ExecutionContext';
import { NodeModelSelect } from '../shared/NodeModelSelect';
import { MODEL_OPTIONS } from '../../config/modelOptions';

const OUTPUT_CONFIG = {
  transparent: { label: 'Transparent', color: '#a78bfa', desc: 'Alpha channel' },
  white: { label: 'White BG', color: '#e2e8f0', desc: 'White fill' },
  blur: { label: 'Blur BG', color: '#60a5fa', desc: 'Gaussian blur' },
} as const;

export function BackgroundRemoverNode({
  id,
  data,
  selected,
}: NodeProps<Node<BackgroundRemoverData>>) {
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

  const output = OUTPUT_CONFIG[config.outputType];

  return (
    <CompactNode nodeType="backgroundRemover" icon="" title={data.label} selected={selected}>
      <div className="flex items-center gap-2.5">
        {/* Visual output preview */}
        <div
          className="w-11 h-11 rounded-lg flex items-center justify-center border border-white/10 flex-shrink-0 overflow-hidden"
          style={{
            background:
              config.outputType === 'transparent'
                ? 'repeating-conic-gradient(#444 0% 25%, #2a2a2a 0% 50%) 0 0 / 8px 8px'
                : config.outputType === 'white'
                  ? '#e8e8e8'
                  : 'linear-gradient(135deg, #1e1e3a, #3a3a5c)',
          }}
        >
          <div className="w-6 h-7 rounded-t-full bg-[#8b6914]/50 border border-[#8b6914]/30" />
        </div>
        {/* Labels */}
        <div>
          <div className="text-[11px] font-semibold" style={{ color: output.color }}>
            {output.label}
          </div>
          <div className="text-[9px] text-white/30">{output.desc}</div>
          <div className="text-[9px] text-white/20 mt-0.5">AI Matting</div>
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
