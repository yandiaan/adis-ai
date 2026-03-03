import { useReactFlow } from '@xyflow/react';
import { FileText, Languages, MoonStar, PartyPopper, PawPrint, User } from 'lucide-react';
import type { TemplatePresetData, TemplateId } from '../../types/node-types';

type Props = {
  nodeId: string;
  data: TemplatePresetData;
};

const TEMPLATES: { id: TemplateId; label: string; Icon: typeof FileText; description: string }[] = [
  {
    id: 'ramadan-wishes',
    label: 'Ramadan Wishes',
    Icon: MoonStar,
    description: 'Islamic-themed greeting cards',
  },
  {
    id: 'holiday-meme',
    label: 'Holiday Meme',
    Icon: PartyPopper,
    description: 'Funny holiday meme creator',
  },
  {
    id: 'ai-pet',
    label: 'AI Pet',
    Icon: PawPrint,
    description: 'Virtual pet character design',
  },
  {
    id: 'custom-avatar',
    label: 'Custom Avatar',
    Icon: User,
    description: 'Personalized digital avatar',
  },
  { id: 'blank', label: 'Blank Canvas', Icon: FileText, description: 'Start from scratch' },
];

export function TemplatePresetPanel({ nodeId, data }: Props) {
  const { updateNodeData } = useReactFlow();
  const config = data.config;

  const updateConfig = (updates: Partial<typeof config>) => {
    updateNodeData(nodeId, { config: { ...config, ...updates } });
  };

  return (
    <>
      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Template</label>
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => updateConfig({ template: t.id })}
              className={`motion-lift motion-press focus-ring-orange rounded-xl py-3.5 px-3 cursor-pointer text-center border transition-colors ${
                config.template === t.id
                  ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)]'
                  : 'border-white/10 bg-white/5 hover:bg-white/7'
              }`}
            >
              <div className="grid place-items-center mb-2">
                <span className="grid place-items-center w-9 h-9 rounded-lg bg-white/5 border border-white/10">
                  <t.Icon size={18} className="text-white/80" />
                </span>
              </div>
              <div className="text-white text-xs font-medium">{t.label}</div>
              <div className="text-white/40 text-[10px] mt-0.5">{t.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Language</label>
        <div className="flex gap-2">
          {(['id', 'en'] as const).map((locale) => (
            <button
              key={locale}
              onClick={() => updateConfig({ locale })}
              className={`motion-lift motion-press focus-ring-orange flex-1 p-2.5 rounded-xl border text-white cursor-pointer text-[13px] transition-colors ${
                config.locale === locale
                  ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)]'
                  : 'border-white/10 bg-white/5 hover:bg-white/7'
              }`}
            >
              <span className="inline-flex items-center justify-center gap-2">
                <Languages size={14} className="text-white/70" />
                <span>{locale === 'id' ? 'Indonesian' : 'English'}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
