import { useReactFlow } from '@xyflow/react';
import type { ReactNode } from 'react';
import { Camera, FileText, Flower2, Moon, X, Zap } from 'lucide-react';
import type { FrameBorderData, FrameStyle } from '../../types/node-types';
import { ModelPicker } from './ModelPicker';
import { MODEL_OPTIONS } from '../../config/modelOptions';
import { ColorInput } from '../../ui/ColorInput';

type Props = {
  nodeId: string;
  data: FrameBorderData;
};

const FRAME_STYLES: { value: FrameStyle; label: string; icon: ReactNode }[] = [
  { value: 'none', label: 'None', icon: <X size={14} /> },
  { value: 'islamic', label: 'Islamic', icon: <Moon size={14} /> },
  { value: 'floral', label: 'Floral', icon: <Flower2 size={14} /> },
  { value: 'polaroid', label: 'Polaroid', icon: <Camera size={14} /> },
  { value: 'neon', label: 'Neon', icon: <Zap size={14} /> },
  { value: 'torn-paper', label: 'Torn Paper', icon: <FileText size={14} /> },
];

export function FrameBorderPanel({ nodeId, data }: Props) {
  const { updateNodeData } = useReactFlow();
  const config = data.config;

  const updateConfig = (updates: Partial<typeof config>) => {
    updateNodeData(nodeId, { config: { ...config, ...updates } });
  };

  return (
    <>
      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Frame Style</label>
        <div className="grid grid-cols-3 gap-1.5">
          {FRAME_STYLES.map((style) => (
            <button
              key={style.value}
              onClick={() => updateConfig({ style: style.value })}
              className={`motion-lift motion-press focus-ring-orange py-2.5 px-2 rounded-xl border text-white cursor-pointer text-xs text-center transition-colors ${
                config.style === style.value
                  ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)]'
                  : 'border-white/10 bg-white/5 hover:bg-white/7'
              }`}
            >
              <div className="flex justify-center items-center mb-1 text-white/70">{style.icon}</div>
              <div className="mt-1 text-[10px]">{style.label}</div>
            </button>
          ))}
        </div>
      </div>

      {config.style !== 'none' && (
        <>
          <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Thickness</span>
              <span className="text-[11px] text-white/55 tabular-nums">{config.thickness}px</span>
            </div>
            <input
              type="range"
              min={4}
              max={60}
              step={4}
              value={config.thickness}
              onChange={(e) => updateConfig({ thickness: Number(e.target.value) })}
              className="w-full accent-[var(--editor-accent)] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-white/30">
              <span>Thin</span>
              <span>Thick</span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Frame Color</label>
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
              <ColorInput
                value={config.color}
                onChange={(v) => updateConfig({ color: v })}
                className="w-10 h-10 rounded-lg cursor-pointer border border-white/20"
                style={{ padding: 2 }}
              />
              <span className="font-mono text-white/60 text-sm">{config.color}</span>
            </div>
          </div>
        </>
      )}

      <ModelPicker
        options={MODEL_OPTIONS.imageEditing}
        value={config.model ?? 'qwen-image-edit-plus'}
        onChange={(model) => updateConfig({ model })}
      />
    </>
  );
}
