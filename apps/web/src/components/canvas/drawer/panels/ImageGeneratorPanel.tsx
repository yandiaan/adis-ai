import { useReactFlow } from '@xyflow/react';
import { ArrowRight, Image, Type } from 'lucide-react';

import type { ImageGeneratorData, ImageDimension } from '../../types/node-types';
import { ModelPicker } from './ModelPicker';
import { MODEL_OPTIONS } from '../../config/modelOptions';

type Props = {
  nodeId: string;
  data: ImageGeneratorData;
};

const DIMENSIONS: { value: ImageDimension; label: string }[] = [
  { value: 'square-1024', label: '1024×1024 (Square)' },
  { value: 'portrait-768x1024', label: '768×1024 (Portrait)' },
  { value: 'landscape-1024x768', label: '1024×768 (Landscape)' },
  { value: 'story-576x1024', label: '576×1024 (Story)' },
];

export function ImageGeneratorPanel({ nodeId, data }: Props) {
  const { updateNodeData } = useReactFlow();
  const config = data.config;

  const updateConfig = (updates: Partial<typeof config>) => {
    updateNodeData(nodeId, { config: { ...config, ...updates } });
  };

  return (
    <>
      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Mode</label>
        <div className="text-white/55 text-[13px] p-3 bg-white/5 rounded-xl border border-white/10">
          <div className="inline-flex items-center gap-2">
            {config.mode === 'text2img' ? (
              <>
                <Type size={14} className="text-white/70" />
                <ArrowRight size={14} className="text-white/40" />
                <Image size={14} className="text-white/70" />
                <span>Text to Image</span>
              </>
            ) : (
              <>
                <Image size={14} className="text-white/70" />
                <ArrowRight size={14} className="text-white/40" />
                <Image size={14} className="text-white/70" />
                <span>Image to Image</span>
              </>
            )}
          </div>
          <div className="text-[11px] text-white/30 mt-1">Auto-detected from connections</div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Dimensions</label>
        <div className="flex flex-col gap-1.5">
          {DIMENSIONS.map((dim) => (
            <button
              key={dim.value}
              onClick={() => updateConfig({ dimensions: dim.value })}
              className={`motion-lift motion-press focus-ring-orange py-2.5 px-3 rounded-xl border text-white cursor-pointer text-xs text-left transition-colors ${
                config.dimensions === dim.value
                  ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)]'
                  : 'border-white/10 bg-white/5 hover:bg-white/7'
              }`}
            >
              {dim.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Prompt Extend</label>
        <div className="flex gap-2">
          {([true, false] as const).map((val) => (
            <button
              key={String(val)}
              onClick={() => updateConfig({ prompt_extend: val })}
              className={`motion-lift motion-press focus-ring-orange flex-1 p-2.5 rounded-xl border cursor-pointer text-white text-xs transition-colors ${
                (config.prompt_extend ?? true) === val
                  ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)]'
                  : 'border-white/10 bg-white/5 hover:bg-white/7'
              }`}
            >
              {val ? 'On' : 'Off'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Seed (optional)</label>
        <input
          type="number"
          value={config.seed ?? ''}
          onChange={(e) => updateConfig({ seed: e.target.value ? Number(e.target.value) : null })}
          placeholder="Random"
          className="w-full p-3 bg-black/30 border border-white/10 rounded-xl text-white text-sm outline-none box-border focus:border-[var(--editor-accent-65)] transition-colors"
        />
      </div>

      {config.mode === 'text2img' ? (
        <ModelPicker
          options={MODEL_OPTIONS.imageGeneration}
          value={config.model ?? 'wan2.1-t2i-turbo'}
          onChange={(model) => updateConfig({ model })}
        />
      ) : (
        <ModelPicker
          options={MODEL_OPTIONS.imageEditing}
          value={config.imageEditModel ?? 'qwen-image-edit-plus'}
          onChange={(imageEditModel) => updateConfig({ imageEditModel })}
        />
      )}
    </>
  );
}
