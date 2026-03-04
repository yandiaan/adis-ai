import { useNodeId } from '@xyflow/react';
import { useReactFlow } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import { CompactNode } from '../CompactNode';
import { useExecutionContext } from '../../execution/ExecutionContext';
import type { VideoGeneratorData } from '../../types/node-types';
import type { NodePortSchema, VideoData } from '../../types/port-types';
import { Film, Settings2 } from 'lucide-react';
import { NodeModelSelect } from '../shared/NodeModelSelect';
import { MODEL_OPTIONS } from '../../config/modelOptions';

const RES_LABELS: Record<string, string> = { '480P': '480p', '720P': '720p', '1080P': '1080p' };

function buildSchema(mode: string, frameMode: string): NodePortSchema {
  const baseInputs: NodePortSchema['inputs'] = [
    { id: 'prompt', type: 'text', label: 'Prompt', required: true },
    { id: 'style', type: 'style', label: 'Style', required: false },
  ];
  if (mode === 'img2video') {
    if (frameMode === 'first' || frameMode === 'both') {
      baseInputs.push({ id: 'image', type: 'image', label: 'First Frame', required: true });
    }
    if (frameMode === 'last' || frameMode === 'both') {
      baseInputs.push({ id: 'lastFrame', type: 'image', label: 'Last Frame', required: frameMode === 'last' });
    }
  } else {
    baseInputs.push({ id: 'image', type: 'image', label: 'Reference', required: false });
  }
  return {
    inputs: baseInputs,
    outputs: [{ id: 'video', type: 'video', label: 'Video', required: true }],
  };
}

interface SegmentProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  color?: string;
}

function Segment({ options, value, onChange, color = '#f472b6' }: SegmentProps) {
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

export function VideoGeneratorNode({ id, data, selected }: NodeProps<Node<VideoGeneratorData>>) {
  const { config } = data;
  const frameMode = config.frameMode ?? 'first';
  const nodeId = useNodeId();
  const { updateNodeData } = useReactFlow();
  const { getNodeState } = useExecutionContext();
  const execState = nodeId ? getNodeState(nodeId) : null;
  const status = execState?.status ?? 'idle';
  const isRunning = status === 'running';
  const isDone = status === 'done';
  const outputVideo = isDone ? (execState?.output?.type === 'video' ? (execState.output.data as VideoData) : null) : null;

  const dynamicSchema = buildSchema(config.mode, frameMode);

  const updateConfig = (updates: Partial<typeof config>) =>
    updateNodeData(id, { config: { ...config, ...updates } });

  return (
    <CompactNode nodeType="videoGenerator" icon="" title={data.label} selected={selected} width={280} portSchema={dynamicSchema}>
      {/* Preview area */}
      <div className="relative w-full overflow-hidden rounded-lg mb-3" style={{ height: 168, background: '#0e0e16' }}>
        {outputVideo ? (
          <video src={outputVideo.url} className="w-full h-full object-cover" controls={false} muted loop autoPlay playsInline />
        ) : isRunning ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-full border-2 border-[#f472b6]/20" />
              <div className="absolute inset-0 rounded-full border-2 border-t-[#f472b6] animate-spin" />
            </div>
            <span className="text-[10px] text-white/40">Generating video...</span>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 border border-dashed border-white/8 rounded-lg">
            <Film size={22} className="text-white/15" />
            <span className="text-[10px] text-white/25">Run to generate video</span>
          </div>
        )}
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: 'rgba(0,0,0,0.65)', color: '#f472b6' }}>
          {config.duration}s
        </div>
      </div>

      {/* Output chip */}
      <div className="flex items-center gap-2 mb-2.5">
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold" style={{ background: '#f472b618', color: '#f472b6', border: '1px solid #f472b630' }}>
          <Film size={9} /> Video
        </div>
        <div className="flex-1 h-px bg-white/6" />
      </div>

      {/* Mode toggle */}
      <div className="space-y-2">
        <div>
          <span className="text-[9px] text-white/25 uppercase tracking-wider mb-1 block">Mode</span>
          <Segment
            options={[
              { value: 'text2video', label: 'Text → Video' },
              { value: 'img2video', label: 'Img → Video' },
            ]}
            value={config.mode}
            onChange={(v) => updateConfig({ mode: v as typeof config.mode })}
          />
        </div>

        {/* Frame mode — only for img2video */}
        {config.mode === 'img2video' && (
          <div>
            <span className="text-[9px] text-white/25 uppercase tracking-wider mb-1 block">Frame</span>
            <Segment
              options={[
                { value: 'first', label: 'First' },
                { value: 'last', label: 'Last' },
                { value: 'both', label: 'Both' },
              ]}
              value={frameMode}
              onChange={(v) => updateConfig({ frameMode: v as typeof frameMode })}
            />
          </div>
        )}
      </div>

      {/* Settings strip */}
      <div className="flex items-center gap-2 mt-3 pt-2.5 flex-wrap" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <Settings2 size={10} className="text-white/25 shrink-0" />
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-white/25">Model</span>
          <NodeModelSelect
            options={config.mode === 'text2video' ? MODEL_OPTIONS.textToVideo : MODEL_OPTIONS.imageToVideo}
            value={(config.mode === 'text2video' ? config.model : config.imageVideoModel) ?? (config.mode === 'text2video' ? 'wan2.1-t2v-turbo' : 'wan2.1-i2v-turbo')}
            onChange={(m) => config.mode === 'text2video' ? updateConfig({ model: m }) : updateConfig({ imageVideoModel: m })}
          />
        </div>
        <div className="w-px h-3 bg-white/10" />
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-white/25">Res</span>
          <select
            className="text-[9px] text-white/50 font-medium bg-transparent border-none outline-none cursor-pointer"
            value={config.resolution}
            onChange={(e) => updateConfig({ resolution: e.target.value as typeof config.resolution })}
          >
            <option value="480P" style={{ background: '#1a1a2e' }}>480p</option>
            <option value="720P" style={{ background: '#1a1a2e' }}>720p</option>
            <option value="1080P" style={{ background: '#1a1a2e' }}>1080p</option>
          </select>
        </div>
        <div className="w-px h-3 bg-white/10" />
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-white/25">Dur</span>
          <input
            type="number"
            min={2}
            max={15}
            value={config.duration}
            onChange={(e) => updateConfig({ duration: Math.max(2, Math.min(15, parseInt(e.target.value) || 5)) })}
            className="w-6 text-[9px] text-white/50 font-medium bg-transparent border-none outline-none text-center cursor-pointer"
          />
          <span className="text-[9px] text-white/25">s</span>
        </div>
      </div>

      {/* Shot type + prompt extend */}
      <div className="flex items-center gap-3 mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-white/25">Shot</span>
          <Segment
            options={[
              { value: 'single', label: 'Single' },
              { value: 'multi', label: 'Multi' },
            ]}
            value={config.shot_type ?? 'single'}
            onChange={(v) => updateConfig({ shot_type: v as 'single' | 'multi' })}
          />
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-[9px] text-white/25">Enhance</span>
          <button
            className="w-7 h-3.5 rounded-full transition-all duration-150 relative cursor-pointer"
            style={{ background: (config.prompt_extend ?? true) ? '#f472b6' : 'rgba(255,255,255,0.1)' }}
            onClick={() => updateConfig({ prompt_extend: !(config.prompt_extend ?? true) })}
          >
            <div
              className="absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-all duration-150"
              style={{ left: (config.prompt_extend ?? true) ? '13px' : '2px' }}
            />
          </button>
        </div>
      </div>
    </CompactNode>
  );
}
