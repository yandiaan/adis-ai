import { useReactFlow } from '@xyflow/react';
import { Lightbulb } from 'lucide-react';
import type { ImageToTextData, DetailLevel } from '../../types/node-types';
import { ModelPicker } from './ModelPicker';
import { MODEL_OPTIONS } from '../../config/modelOptions';

type Props = {
  nodeId: string;
  data: ImageToTextData;
};

const DETAIL_LEVELS: { value: DetailLevel; label: string; desc: string }[] = [
  { value: 'brief', label: 'Brief', desc: 'Short 1-2 sentence summary' },
  { value: 'detailed', label: 'Detailed', desc: 'Full scene description with elements' },
  { value: 'artistic', label: 'Artistic', desc: 'Focus on visual style and aesthetics' },
];

const LANGUAGES: { value: 'id' | 'en'; label: string }[] = [
  { value: 'id', label: 'Indonesian' },
  { value: 'en', label: 'English' },
];

export function ImageToTextPanel({ nodeId, data }: Props) {
  const { updateNodeData } = useReactFlow();
  const config = data.config;

  const updateConfig = (updates: Partial<typeof config>) => {
    updateNodeData(nodeId, { config: { ...config, ...updates } });
  };

  return (
    <>
      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Detail Level</label>
        <div className="flex flex-col gap-1.5">
          {DETAIL_LEVELS.map((lvl) => (
            <button
              key={lvl.value}
              onClick={() => updateConfig({ detailLevel: lvl.value })}
              className={`motion-lift motion-press focus-ring-orange py-2.5 px-3 rounded-xl border text-white cursor-pointer text-xs text-left transition-colors ${
                config.detailLevel === lvl.value
                  ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)]'
                  : 'border-white/10 bg-white/5 hover:bg-white/7'
              }`}
            >
              <div className="font-medium">{lvl.label}</div>
              <div className="text-white/40 text-[11px] mt-0.5">{lvl.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Output Language</label>
        <div className="flex gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.value}
              onClick={() => updateConfig({ language: lang.value })}
              className={`motion-lift motion-press focus-ring-orange flex-1 py-2.5 px-3 rounded-xl border text-white cursor-pointer text-xs text-center transition-colors ${
                config.language === lang.value
                  ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)]'
                  : 'border-white/10 bg-white/5 hover:bg-white/7'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-300/80 text-xs">
        <div className="font-medium mb-1 flex items-center gap-1.5"><Lightbulb size={12} /> Powered by Qwen VL</div>
        <div className="text-blue-300/60">
          Connect an ImageUpload or ImageGenerator node as input. Output text can feed into Prompt
          Enhancer.
        </div>
      </div>

      <ModelPicker
        options={MODEL_OPTIONS.vision}
        value={config.model ?? 'qwen2.5-vl-3b-instruct'}
        onChange={(model) => updateConfig({ model })}
      />
    </>
  );
}
