import { useReactFlow } from '@xyflow/react';
import type { ReactNode } from 'react';
import { Camera, CircleSlash, Moon, Snowflake, Sparkles, Sun, Zap } from 'lucide-react';
import type { ColorFilterData, ColorFilterPreset } from '../../types/node-types';
import { ModelPicker } from './ModelPicker';
import { MODEL_OPTIONS } from '../../config/modelOptions';

type Props = {
  nodeId: string;
  data: ColorFilterData;
};

const PRESETS: { value: ColorFilterPreset; label: string; icon: ReactNode; desc: string }[] = [
  { value: 'none', label: 'None', icon: <CircleSlash size={14} />, desc: 'No filter applied' },
  { value: 'warm', label: 'Warm', icon: <Sun size={14} />, desc: 'Golden-hour warm tones' },
  { value: 'vintage', label: 'Vintage', icon: <Camera size={14} />, desc: 'Aged, faded look' },
  { value: 'eid-gold', label: 'Eid Gold', icon: <Sparkles size={14} />, desc: 'Festive golden palette' },
  { value: 'sahur', label: 'Sahur', icon: <Moon size={14} />, desc: 'Cool pre-dawn blue tones' },
  { value: 'cool', label: 'Cool', icon: <Snowflake size={14} />, desc: 'Fresh cold-tone grading' },
  { value: 'vibrant', label: 'Vibrant', icon: <Zap size={14} />, desc: 'Boosted saturation & contrast' },
];

export function ColorFilterPanel({ nodeId, data }: Props) {
  const { updateNodeData } = useReactFlow();
  const config = data.config;

  const updateConfig = (updates: Partial<typeof config>) => {
    updateNodeData(nodeId, { config: { ...config, ...updates } });
  };

  return (
    <>
      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Filter Preset</label>
        <div className="grid grid-cols-2 gap-1.5">
          {PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => updateConfig({ preset: preset.value })}
              className={`motion-lift motion-press focus-ring-orange flex items-center gap-2 py-2.5 px-3 rounded-xl border text-white cursor-pointer text-xs text-left transition-colors ${
                config.preset === preset.value
                  ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)]'
                  : 'border-white/10 bg-white/5 hover:bg-white/7'
              }`}
            >
              <span className="flex-shrink-0 flex items-center text-white/70">{preset.icon}</span>
              <div>
                <div className="font-medium">{preset.label}</div>
                <div className="text-[10px] text-white/40">{preset.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {config.preset !== 'none' && (
        <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Intensity</span>
            <span className="text-[11px] text-white/55 tabular-nums">{config.intensity}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={config.intensity}
            onChange={(e) => updateConfig({ intensity: Number(e.target.value) })}
            className="w-full accent-[var(--editor-accent)] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-white/30">
            <span>Subtle</span>
            <span>Full</span>
          </div>
        </div>
      )}

      <ModelPicker
        options={MODEL_OPTIONS.imageEditing}
        value={config.model ?? 'qwen-image-edit-plus'}
        onChange={(model) => updateConfig({ model })}
      />
    </>
  );
}
