import { useReactFlow } from '@xyflow/react';
import type { BackgroundReplacerData, BgReplacementType } from '../../types/node-types';
import { ColorInput } from '../../ui/ColorInput';
import { ModelPicker } from './ModelPicker';
import { MODEL_OPTIONS } from '../../config/modelOptions';

type Props = {
  nodeId: string;
  data: BackgroundReplacerData;
};

const REPLACEMENT_TYPES: { value: BgReplacementType; label: string; desc: string }[] = [
  { value: 'blur', label: 'Blur', desc: 'Apply a gaussian blur to the original background' },
  { value: 'solid-color', label: 'Solid Color', desc: 'Replace background with a flat color' },
  { value: 'ai-generated', label: 'AI Generated', desc: 'Generate a new background from a text prompt' },
];

export function BackgroundReplacerPanel({ nodeId, data }: Props) {
  const { updateNodeData } = useReactFlow();
  const config = data.config;

  const updateConfig = (updates: Partial<typeof config>) => {
    updateNodeData(nodeId, { config: { ...config, ...updates } });
  };

  return (
    <>
      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">
          Replacement Type
        </label>
        <div className="flex flex-col gap-1.5">
          {REPLACEMENT_TYPES.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateConfig({ replacementType: opt.value })}
              className={`motion-lift motion-press focus-ring-orange flex items-start gap-3 py-2.5 px-3 rounded-xl border text-white cursor-pointer text-xs text-left transition-colors ${
                config.replacementType === opt.value
                  ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)]'
                  : 'border-white/10 bg-white/5 hover:bg-white/7'
              }`}
            >
              <div>
                <div className="font-medium">{opt.label}</div>
                <div className="text-white/40 text-[11px] mt-0.5">{opt.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {config.replacementType === 'solid-color' && (
        <div className="flex flex-col gap-2 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
          <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40">
            Background Color
          </label>
          <div className="flex items-center gap-3">
            <ColorInput
              value={config.color}
              onChange={(v) => updateConfig({ color: v })}
              className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer bg-transparent"
            />
            <span className="text-sm text-white/60 font-mono">{config.color}</span>
          </div>
        </div>
      )}

      {config.replacementType === 'ai-generated' && (
        <div className="flex flex-col gap-2 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
          <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40">
            Background Prompt
          </label>
          <textarea
            value={config.backgroundPrompt}
            onChange={(e) => updateConfig({ backgroundPrompt: e.target.value })}
            placeholder="e.g. snowy mountains, sunset beach..."
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[var(--editor-accent-65)] resize-none"
          />
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
