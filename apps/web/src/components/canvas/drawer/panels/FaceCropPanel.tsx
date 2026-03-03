import { useReactFlow } from '@xyflow/react';
import { Smartphone } from 'lucide-react';
import type { FaceCropData, FaceCropFormat } from '../../types/node-types';
import { ModelPicker } from './ModelPicker';
import { MODEL_OPTIONS } from '../../config/modelOptions';

type Props = {
  nodeId: string;
  data: FaceCropData;
};

const FORMATS: { value: FaceCropFormat; label: string; desc: string }[] = [
  { value: 'square', label: 'Square', desc: '1:1 ratio, good for avatars' },
  { value: 'portrait', label: 'Portrait', desc: '3:4 ratio, closer framing' },
];

export function FaceCropPanel({ nodeId, data }: Props) {
  const { updateNodeData } = useReactFlow();
  const config = data.config;

  const updateConfig = (updates: Partial<typeof config>) => {
    updateNodeData(nodeId, { config: { ...config, ...updates } });
  };

  return (
    <>
      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Crop Format</label>
        <div className="flex gap-2">
          {FORMATS.map((fmt) => (
            <button
              key={fmt.value}
              onClick={() => updateConfig({ format: fmt.value })}
              className={`motion-lift motion-press focus-ring-orange flex-1 py-2.5 px-3 rounded-xl border text-white cursor-pointer text-xs text-left transition-colors ${
                config.format === fmt.value
                  ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)]'
                  : 'border-white/10 bg-white/5 hover:bg-white/7'
              }`}
            >
              <div className="font-medium">{fmt.label}</div>
              <div className="text-white/40 text-[11px] mt-0.5">{fmt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Margin</span>
          <span className="text-[11px] text-white/55 tabular-nums">{config.margin}px</span>
        </div>
        <input
          type="range"
          min={0}
          max={80}
          step={4}
          value={config.margin}
          onChange={(e) => updateConfig({ margin: Number(e.target.value) })}
          className="w-full accent-[var(--editor-accent)] cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-white/30">
          <span>Tight (0px)</span>
          <span>Loose (80px)</span>
        </div>
      </div>

      <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-300/80 text-xs">
        <div className="font-medium mb-1 flex items-center gap-1.5"><Smartphone size={12} /> V2 Feature</div>
        <div className="text-amber-300/60">
          Detects the largest face in the image and crops around it. Useful for avatar and profile
          pic pipelines.
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
