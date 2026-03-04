import { useReactFlow } from '@xyflow/react';
import type { VideoRepaintingData } from '../../types/node-types';

type Props = {
  nodeId: string;
  data: VideoRepaintingData;
};

const CONTROL_OPTIONS = [
  { value: 'depth', label: 'Depth' },
  { value: 'posebodyface', label: 'Pose + Face' },
  { value: 'posebody', label: 'Pose Body' },
  { value: 'scribble', label: 'Scribble' },
] as const;

export function VideoRepaintingPanel({ nodeId, data }: Props) {
  const { updateNodeData } = useReactFlow();
  const config = data.config;

  const updateConfig = (updates: Partial<typeof config>) => {
    updateNodeData(nodeId, { config: { ...config, ...updates } });
  };

  return (
    <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
      <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Repainting Settings</label>

      {/* Control Condition */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] text-white/40 uppercase tracking-wider">Control Condition</label>
        <div className="grid grid-cols-2 gap-1">
          {CONTROL_OPTIONS.map((opt) => {
            const active = config.control_condition === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => updateConfig({ control_condition: opt.value })}
                className="py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all cursor-pointer"
                style={{
                  background: active ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.03)',
                  border: active ? '1px solid rgba(167,139,250,0.4)' : '1px solid rgba(255,255,255,0.07)',
                  color: active ? '#a78bfa' : 'rgba(255,255,255,0.4)',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Strength Slider */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <label className="text-[10px] text-white/40 uppercase tracking-wider">Strength</label>
          <span className="text-[10px] font-mono" style={{ color: '#a78bfa' }}>{Math.round(config.strength * 100)}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={config.strength}
          onChange={(e) => updateConfig({ strength: parseFloat(e.target.value) })}
          className="w-full h-1.5 rounded appearance-none cursor-pointer"
          style={{ accentColor: '#a78bfa' }}
        />
        <div className="flex justify-between text-[9px] text-white/20">
          <span>Subtle</span>
          <span>Strong</span>
        </div>
      </div>

      {/* Prompt Extend Toggle */}
      <div className="flex items-center justify-between py-1">
        <div>
          <div className="text-[11px] text-white/60">Prompt Extend</div>
          <div className="text-[10px] text-white/25">Let AI enhance the prompt automatically</div>
        </div>
        <button
          className="w-10 h-5 rounded-full transition-all duration-150 relative cursor-pointer shrink-0"
          style={{ background: config.prompt_extend ? '#a78bfa' : 'rgba(255,255,255,0.1)' }}
          onClick={() => updateConfig({ prompt_extend: !config.prompt_extend })}
        >
          <div
            className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-150"
            style={{ left: config.prompt_extend ? '22px' : '2px' }}
          />
        </button>
      </div>
    </div>
  );
}
