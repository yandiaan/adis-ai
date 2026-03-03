import { useReactFlow } from '@xyflow/react';
import type { StyleTransferData, StyleStrength } from '../../types/node-types';
import { ModelPicker } from './ModelPicker';
import { MODEL_OPTIONS } from '../../config/modelOptions';

type Props = {
  nodeId: string;
  data: StyleTransferData;
};

const STRENGTHS: { value: StyleStrength; label: string; desc: string }[] = [
  { value: 'subtle', label: 'Subtle', desc: 'Light style influence, preserves original content' },
  { value: 'moderate', label: 'Moderate', desc: 'Balanced blend of style and content' },
  { value: 'strong', label: 'Strong', desc: 'Heavy style application for dramatic effect' },
];

export function StyleTransferPanel({ nodeId, data }: Props) {
  const { updateNodeData } = useReactFlow();
  const config = data.config;

  const updateConfig = (updates: Partial<typeof config>) => {
    updateNodeData(nodeId, { config: { ...config, ...updates } });
  };

  return (
    <>
      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">
          Style Strength
        </label>
        <div className="flex flex-col gap-1.5">
          {STRENGTHS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateConfig({ strength: opt.value })}
              className={`motion-lift motion-press focus-ring-orange flex items-start gap-3 py-2.5 px-3 rounded-xl border text-white cursor-pointer text-xs text-left transition-colors ${
                config.strength === opt.value
                  ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)]'
                  : 'border-white/10 bg-white/5 hover:bg-white/7'
              }`}
            >
              <div>
                <div className="font-medium capitalize">{opt.label}</div>
                <div className="text-white/40 text-[11px] mt-0.5">{opt.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40">
          Style Prompt
        </label>
        <textarea
          value={config.stylePrompt}
          onChange={(e) => updateConfig({ stylePrompt: e.target.value })}
          placeholder="e.g. oil painting, anime style, watercolor..."
          rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[var(--editor-accent-65)] resize-none"
        />
      </div>

      <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-300/80 text-xs">
        💡 Connect a Style Image port for image-based style transfer
      </div>

      <ModelPicker
        options={MODEL_OPTIONS.imageEditing}
        value={config.model ?? 'qwen-image-edit-plus'}
        onChange={(model) => updateConfig({ model })}
      />
    </>
  );
}
