import { useReactFlow } from '@xyflow/react';
import { Languages, Palette, Scale, Shuffle, Target } from 'lucide-react';
import type {
  PromptEnhancerData,
  CreativityLevel,
  ContentType,
  ToneType,
} from '../../types/node-types';
import { ModelPicker } from './ModelPicker';
import { MODEL_OPTIONS } from '../../config/modelOptions';

type Props = {
  nodeId: string;
  data: PromptEnhancerData;
};

const CREATIVITY_OPTIONS: {
  value: CreativityLevel;
  label: string;
  Icon: typeof Target;
}[] = [
  { value: 'precise', label: 'Precise', Icon: Target },
  { value: 'balanced', label: 'Balanced', Icon: Scale },
  { value: 'creative', label: 'Creative', Icon: Palette },
];

const CONTENT_TYPES: ContentType[] = ['wishes', 'meme', 'character', 'avatar', 'general'];
const TONES: ToneType[] = ['formal', 'casual', 'funny', 'heartfelt'];

export function PromptEnhancerPanel({ nodeId, data }: Props) {
  const { updateNodeData } = useReactFlow();
  const config = data.config;

  const updateConfig = (updates: Partial<typeof config>) => {
    updateNodeData(nodeId, { config: { ...config, ...updates } });
  };

  return (
    <>
      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Creativity</label>
        <div className="flex gap-2">
          {CREATIVITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateConfig({ creativity: opt.value })}
              className={`motion-lift motion-press focus-ring-orange flex-1 p-3 rounded-xl border cursor-pointer text-xs text-center text-white transition-colors ${
                config.creativity === opt.value
                  ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)]'
                  : 'border-white/10 bg-white/5 hover:bg-white/7'
              }`}
            >
              <div className="grid place-items-center">
                <opt.Icon size={16} className="text-white/80" />
              </div>
              <div className="mt-1">{opt.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Content Type</label>
        <div className="flex flex-wrap gap-1.5">
          {CONTENT_TYPES.map((ct) => (
            <button
              key={ct}
              onClick={() => updateConfig({ contentType: ct })}
              className={`motion-lift motion-press focus-ring-orange px-3 py-1.5 rounded-full border cursor-pointer text-xs text-white transition-colors ${
                config.contentType === ct
                  ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)]'
                  : 'border-white/10 bg-white/5 hover:bg-white/7'
              }`}
            >
              {ct}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Tone</label>
        <div className="flex flex-wrap gap-1.5">
          {TONES.map((tone) => (
            <button
              key={tone}
              onClick={() => updateConfig({ tone })}
              className={`motion-lift motion-press focus-ring-orange px-3 py-1.5 rounded-full border cursor-pointer text-xs text-white transition-colors ${
                config.tone === tone
                  ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)]'
                  : 'border-white/10 bg-white/5 hover:bg-white/7'
              }`}
            >
              {tone}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Language</label>
        <div className="flex gap-2">
          {(['id', 'en', 'mixed'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => updateConfig({ language: lang })}
              className={`motion-lift motion-press focus-ring-orange flex-1 p-2.5 rounded-xl border cursor-pointer text-xs text-white transition-colors ${
                config.language === lang
                  ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)]'
                  : 'border-white/10 bg-white/5 hover:bg-white/7'
              }`}
            >
              <span className="inline-flex items-center justify-center gap-2">
                {lang === 'mixed' ? (
                  <Shuffle size={14} className="text-white/70" />
                ) : (
                  <Languages size={14} className="text-white/70" />
                )}
                <span>{lang === 'id' ? 'ID' : lang === 'en' ? 'EN' : 'Mix'}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <ModelPicker
        options={MODEL_OPTIONS.textGeneration}
        value={config.model ?? 'qwen-flash'}
        onChange={(model) => updateConfig({ model })}
      />
    </>
  );
}
