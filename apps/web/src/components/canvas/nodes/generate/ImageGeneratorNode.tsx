import { useNodeId } from '@xyflow/react';
import { useReactFlow } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import { CompactNode } from '../CompactNode';
import { useExecutionContext } from '../../execution/ExecutionContext';
import type { ImageGeneratorData } from '../../types/node-types';
import type { ImageData } from '../../types/port-types';
import { ImageIcon, Settings2 } from 'lucide-react';
import { NodeModelSelect } from '../shared/NodeModelSelect';
import { MODEL_OPTIONS } from '../../config/modelOptions';

const DIM_LABELS: Record<string, string> = {
  'square-1024':        '1:1',
  'portrait-768x1024':  '3:4',
  'landscape-1024x768': '4:3',
  'story-576x1024':     '9:16',
};

interface SegmentProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  color?: string;
}

function Segment({ options, value, onChange, color = '#60a5fa' }: SegmentProps) {
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
              background: active ? color + '22' : 'transparent',
              color: active ? color : 'rgba(255,255,255,0.3)',
              border: active ? `1px solid ${color}40` : '1px solid transparent',
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

export function ImageGeneratorNode({ id, data, selected }: NodeProps<Node<ImageGeneratorData>>) {
  const { config } = data;
  const nodeId = useNodeId();
  const { updateNodeData } = useReactFlow();
  const { getNodeState } = useExecutionContext();
  const execState = nodeId ? getNodeState(nodeId) : null;
  const status = execState?.status ?? 'idle';
  const isRunning = status === 'running';
  const isDone = status === 'done';

  const outputImage =
    isDone && execState?.output?.type === 'image'
      ? (execState.output.data as ImageData)
      : null;

  const dimLabel = DIM_LABELS[config.dimensions] ?? config.dimensions;

  const updateConfig = (updates: Partial<typeof config>) =>
    updateNodeData(id, { config: { ...config, ...updates } });

  return (
    <CompactNode
      nodeType="imageGenerator"
      icon=""
      title={data.label}
      selected={selected}
      width={280}
    >
      {/* ── Image preview area ── */}
      <div
        className="relative w-full overflow-hidden rounded-lg mb-3"
        style={{ height: 168, background: '#0e0e16' }}
      >
        {outputImage ? (
          <img
            src={outputImage.url}
            alt="Generated"
            className="w-full h-full object-cover"
          />
        ) : isRunning ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-full border-2 border-[#60a5fa]/20" />
              <div className="absolute inset-0 rounded-full border-2 border-t-[#60a5fa] animate-spin" />
            </div>
            <span className="text-[10px] text-white/40">Generating image...</span>
            {execState && execState.progress > 0 && (
              <span className="text-[10px] text-[#60a5fa] font-mono">{execState.progress}%</span>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 border border-dashed border-white/8 rounded-lg">
            <ImageIcon size={22} className="text-white/15" />
            <span className="text-[10px] text-white/25">Run to generate image</span>
          </div>
        )}
        <div
          className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold"
          style={{ background: 'rgba(0,0,0,0.65)', color: '#60a5fa' }}
        >
          {dimLabel}
        </div>
      </div>

      {/* ── Output type chip ── */}
      <div className="flex items-center gap-2 mb-2.5">
        <div
          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold"
          style={{ background: '#60a5fa18', color: '#60a5fa', border: '1px solid #60a5fa30' }}
        >
          <ImageIcon size={9} />
          Image
        </div>
        <div className="flex-1 h-px bg-white/6" />
      </div>

      {/* ── Mode toggle ── */}
      <div className="mb-2">
        <span className="text-[9px] text-white/25 uppercase tracking-wider mb-1 block">Mode</span>
        <Segment
          options={[
            { value: 'text2img', label: 'Text → Image' },
            { value: 'img2img', label: 'Img → Image' },
          ]}
          value={config.mode}
          onChange={(v) => updateConfig({ mode: v as typeof config.mode })}
        />
      </div>

      {/* ── Settings strip ── */}
      <div
        className="flex items-center gap-2 mt-2 pt-2.5 flex-wrap"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Settings2 size={10} className="text-white/25 shrink-0" />
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-white/25">Ratio</span>
          <span className="text-[9px] text-white/50 font-medium">{dimLabel}</span>
        </div>
        <div className="w-px h-3 bg-white/10" />
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-white/25">Seed</span>
          <span className="text-[9px] text-white/50 font-medium font-mono">
            {config.seed !== null && config.seed !== undefined ? config.seed : 'random'}
          </span>
        </div>
        {config.prompt_extend && (
          <>
            <div className="w-px h-3 bg-white/10" />
            <span className="text-[9px] text-[#4ade80]">auto-extend</span>
          </>
        )}
        {/* Model selector */}
        <div className="w-full mt-1">
          <NodeModelSelect
            options={config.mode === 'text2img' ? MODEL_OPTIONS.imageGeneration : MODEL_OPTIONS.imageEditing}
            value={(config.mode === 'text2img' ? config.model : config.imageEditModel) ?? (config.mode === 'text2img' ? 'wan2.1-t2i-turbo' : 'qwen-image-edit-plus')}
            onChange={(m) => config.mode === 'text2img' ? updateConfig({ model: m }) : updateConfig({ imageEditModel: m })}
          />
        </div>
      </div>
    </CompactNode>
  );
}
