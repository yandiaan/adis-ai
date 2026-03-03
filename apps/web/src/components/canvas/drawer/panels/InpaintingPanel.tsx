import { useReactFlow } from '@xyflow/react';
import { Pen } from 'lucide-react';
import type { InpaintingData, InpaintingMode } from '../../types/node-types';
import { ModelPicker } from './ModelPicker';
import { MODEL_OPTIONS } from '../../config/modelOptions';

type Props = {
  nodeId: string;
  data: InpaintingData;
};

const MODES: { value: InpaintingMode; label: string; desc: string }[] = [
  { value: 'auto', label: 'Auto', desc: 'AI selects the region to edit automatically' },
  { value: 'manual', label: 'Manual', desc: 'Draw a mask on the image to specify region' },
];

export function InpaintingPanel({ nodeId, data }: Props) {
  const { updateNodeData } = useReactFlow();
  const config = data.config;

  const updateConfig = (updates: Partial<typeof config>) => {
    updateNodeData(nodeId, { config: { ...config, ...updates } });
  };

  return (
    <>
      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Inpainting Mode</label>
        <div className="flex flex-col gap-1.5">
          {MODES.map((mode) => (
            <button
              key={mode.value}
              onClick={() => updateConfig({ mode: mode.value })}
              className={`motion-lift motion-press focus-ring-orange py-2.5 px-3 rounded-xl border text-white cursor-pointer text-xs text-left transition-colors ${
                config.mode === mode.value
                  ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)]'
                  : 'border-white/10 bg-white/5 hover:bg-white/7'
              }`}
            >
              <div className="font-medium">{mode.label}</div>
              <div className="text-white/40 text-[11px] mt-0.5">{mode.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Strength</span>
          <span className="text-[11px] text-white/55 tabular-nums">{config.strength}%</span>
        </div>
        <input
          type="range"
          min={10}
          max={100}
          step={5}
          value={config.strength}
          onChange={(e) => updateConfig({ strength: Number(e.target.value) })}
          className="w-full accent-[var(--editor-accent)] cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-white/30">
          <span>Subtle</span>
          <span>Strong</span>
        </div>
      </div>

      <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-300/80 text-xs">
        <div className="font-medium mb-1 flex items-center gap-1.5"><Pen size={12} /> How it works</div>
        <div className="text-blue-300/60">
          Connect an Image and a Prompt node. The AI will edit the masked region to match the
          prompt.
        </div>
      </div>

      <ModelPicker
        options={MODEL_OPTIONS.imageEditing}
        value={config.model ?? 'qwen-image-edit-plus'}
        onChange={(model) => updateConfig({ model })}
      />
    </>
  );
}
