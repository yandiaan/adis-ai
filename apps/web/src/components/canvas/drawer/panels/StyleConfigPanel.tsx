import { useRef, useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import {
  Ban,
  Brush,
  Camera,
  Cherry,
  Gamepad2,
  Globe2,
  Landmark,
  MoonStar,
  Palette,
  PartyPopper,
  Plus,
  Square,
  TreePine,
  Zap,
} from 'lucide-react';
import type { StyleConfigData, ArtStyle, MoodType, CulturalTheme } from '../../types/node-types';
import { ColorInput } from '../../ui/ColorInput';

type Props = {
  nodeId: string;
  data: StyleConfigData;
};

const ART_STYLES: { value: ArtStyle; Icon: typeof Camera }[] = [
  { value: 'realistic', Icon: Camera },
  { value: 'cartoon', Icon: Palette },
  { value: 'anime', Icon: Landmark },
  { value: 'watercolor', Icon: Brush },
  { value: 'pixel-art', Icon: Gamepad2 },
  { value: 'islamic-art', Icon: MoonStar },
  { value: 'pop-art', Icon: Zap },
  { value: 'minimalist', Icon: Square },
];

const MOODS: MoodType[] = ['warm', 'cool', 'playful', 'elegant', 'spiritual', 'funny', 'cute'];

const CULTURAL_THEMES: {
  value: CulturalTheme;
  label: string;
  Icon: typeof Globe2;
}[] = [
  { value: 'ramadan', label: 'Ramadan', Icon: MoonStar },
  { value: 'lebaran', label: 'Lebaran', Icon: PartyPopper },
  { value: 'natal', label: 'Natal', Icon: TreePine },
  { value: 'imlek', label: 'Imlek', Icon: Cherry },
  { value: 'general', label: 'General', Icon: Globe2 },
  { value: null, label: 'None', Icon: Ban },
];

export function StyleConfigPanel({ nodeId, data }: Props) {
  const { updateNodeData } = useReactFlow();
  const config = data.config;

  const configRef = useRef(config);
  configRef.current = config;
  const updateNodeDataRef = useRef(updateNodeData);
  updateNodeDataRef.current = updateNodeData;

  const updateConfig = useCallback((updates: Partial<typeof config>) => {
    updateNodeDataRef.current(nodeId, { config: { ...configRef.current, ...updates } });
  }, [nodeId]);

  return (
    <>
      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Art Style</label>
        <div className="grid grid-cols-4 gap-1.5">
          {ART_STYLES.map((s) => (
            <button
              key={s.value}
              onClick={() => updateConfig({ artStyle: s.value })}
              className={`motion-lift motion-press focus-ring-orange px-1 py-2.5 rounded-xl border text-white cursor-pointer text-[11px] text-center transition-colors ${
                config.artStyle === s.value
                  ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)]'
                  : 'border-white/10 bg-white/5 hover:bg-white/7'
              }`}
            >
              <div className="grid place-items-center">
                <s.Icon size={16} className="text-white/80" />
              </div>
              <div className="mt-1">{s.value}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Mood</label>
        <div className="flex flex-wrap gap-1.5">
          {MOODS.map((mood) => (
            <button
              key={mood}
              onClick={() => updateConfig({ mood })}
              className={`motion-lift motion-press focus-ring-orange px-3 py-1.5 rounded-full border text-white cursor-pointer text-xs transition-colors ${
                config.mood === mood
                  ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)]'
                  : 'border-white/10 bg-white/5 hover:bg-white/7'
              }`}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Cultural Theme</label>
        <div className="flex flex-wrap gap-1.5">
          {CULTURAL_THEMES.map((ct) => (
            <button
              key={String(ct.value)}
              onClick={() => updateConfig({ culturalTheme: ct.value })}
              className={`motion-lift motion-press focus-ring-orange px-3 py-1.5 rounded-full border text-white cursor-pointer text-xs transition-colors ${
                config.culturalTheme === ct.value
                  ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)]'
                  : 'border-white/10 bg-white/5 hover:bg-white/7'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <ct.Icon size={14} className="text-white/70" />
                <span>{ct.label}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Color Palette</label>
        <div className="flex flex-wrap gap-1.5 items-center">
          {config.colorPalette.map((color, i) => (
            <ColorInput
              key={i}
              value={color}
              onChange={(v) => {
                const newPalette = [...configRef.current.colorPalette];
                newPalette[i] = v;
                updateConfig({ colorPalette: newPalette });
              }}
              className="w-8 h-8 border-none cursor-pointer rounded-md"
            />
          ))}
          <button
            onClick={() => updateConfig({ colorPalette: [...config.colorPalette, '#ffffff'] })}
            className="motion-lift motion-press focus-ring-orange w-8 h-8 rounded-md border border-dashed border-white/30 bg-transparent text-white/50 cursor-pointer grid place-items-center"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
