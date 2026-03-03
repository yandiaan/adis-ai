import { useReactFlow } from '@xyflow/react';
import { Circle, CircleCheck } from 'lucide-react';
import type { ImageUpscalerData, UpscaleScale } from '../../types/node-types';
import { ModelPicker } from './ModelPicker';
import { MODEL_OPTIONS } from '../../config/modelOptions';

type Props = {
  nodeId: string;
  data: ImageUpscalerData;
};

const SCALES: { value: UpscaleScale; label: string; desc: string }[] = [
  { value: 2, label: '2× Upscale', desc: 'Double resolution (faster)' },
  { value: 4, label: '4× Upscale', desc: 'Quadruple resolution (HD quality)' },
];

export function ImageUpscalerPanel({ nodeId, data }: Props) {
  const { updateNodeData } = useReactFlow();
  const config = data.config;

  const updateConfig = (updates: Partial<typeof config>) => {
    updateNodeData(nodeId, { config: { ...config, ...updates } });
  };

  return (
    <>
      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Scale Factor</label>
        <div className="flex gap-2">
          {SCALES.map((scale) => (
            <button
              key={scale.value}
              onClick={() => updateConfig({ scale: scale.value })}
              className={`motion-lift motion-press focus-ring-orange flex-1 py-2.5 px-3 rounded-xl border text-white cursor-pointer text-xs text-left transition-colors ${
                config.scale === scale.value
                  ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)]'
                  : 'border-white/10 bg-white/5 hover:bg-white/7'
              }`}
            >
              <div className="font-semibold text-sm">{scale.label}</div>
              <div className="text-white/40 text-[11px] mt-0.5">{scale.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Face Enhancement</label>
        <div className="flex gap-2">
          {([true, false] as const).map((val) => (
            <button
              key={String(val)}
              onClick={() => updateConfig({ enhanceFaces: val })}
              className={`motion-lift motion-press focus-ring-orange flex-1 p-2.5 rounded-xl border cursor-pointer text-white text-xs transition-colors ${
                config.enhanceFaces === val
                  ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)]'
                  : 'border-white/10 bg-white/5 hover:bg-white/7'
              }`}
            >
              {val ? (
                <span className="inline-flex items-center justify-center gap-1"><CircleCheck size={12} /> On</span>
              ) : (
                <span className="inline-flex items-center justify-center gap-1 opacity-60"><Circle size={12} /> Off</span>
              )}
            </button>
          ))}
        </div>
        <div className="text-[11px] text-white/40">
          Applies additional face-specific enhancement for portrait photos.
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
