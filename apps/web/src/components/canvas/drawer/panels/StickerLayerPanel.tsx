import { useReactFlow } from '@xyflow/react';
import { X } from 'lucide-react';
import type { StickerLayerData, StickerPack } from '../../types/node-types';
import { ModelPicker } from './ModelPicker';
import { MODEL_OPTIONS } from '../../config/modelOptions';

type Props = {
  nodeId: string;
  data: StickerLayerData;
};

const PACKS: { value: StickerPack; label: string; stickers: string[] }[] = [
  { value: 'ramadan', label: 'Ramadan', stickers: ['🌙', '⭐', '🕌', '🫲', '📿', '🌟'] },
  { value: 'meme', label: 'Meme', stickers: ['😂', '💀', '🔥', '👀', '💯', '🪡'] },
  { value: 'sparkles', label: 'Sparkles', stickers: ['✨', '💫', '⚡', '🌈', '💎', '🎉'] },
  { value: 'custom', label: 'Custom', stickers: [] },
];

export function StickerLayerPanel({ nodeId, data }: Props) {
  const { updateNodeData } = useReactFlow();
  const config = data.config;

  const updateConfig = (updates: Partial<typeof config>) => {
    updateNodeData(nodeId, { config: { ...config, ...updates } });
  };

  const activePack = PACKS.find((p) => p.value === config.pack);
  const addSticker = (emoji: string) => {
    const newSticker = { emoji, x: 50, y: 50, size: 48 };
    updateConfig({ stickers: [...config.stickers, newSticker] });
  };
  const removeSticker = (index: number) => {
    updateConfig({ stickers: config.stickers.filter((_, i) => i !== index) });
  };

  return (
    <>
      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Sticker Pack</label>
        <div className="grid grid-cols-2 gap-1.5">
          {PACKS.map((pack) => (
            <button
              key={pack.value}
              onClick={() => updateConfig({ pack: pack.value })}
              className={`motion-lift motion-press focus-ring-orange py-2.5 px-3 rounded-xl border text-white cursor-pointer text-xs text-left transition-colors ${
                config.pack === pack.value
                  ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)]'
                  : 'border-white/10 bg-white/5 hover:bg-white/7'
              }`}
            >
              {pack.label}
            </button>
          ))}
        </div>
      </div>

      {activePack && activePack.stickers.length > 0 && (
        <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
          <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Tap to Add Sticker</label>
          <div className="flex flex-wrap gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
            {activePack.stickers.map((emoji) => (
              <button
                key={emoji}
                onClick={() => addSticker(emoji)}
                className="w-10 h-10 text-2xl rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {config.stickers.length > 0 && (
        <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
          <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">
            Active Stickers ({config.stickers.length})
          </label>
          <div className="flex flex-wrap gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
            {config.stickers.map((sticker, i) => (
              <div key={i} className="relative group">
                <span className="text-2xl">{sticker.emoji}</span>
                <button
                  onClick={() => removeSticker(i)}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <X size={9} />
                </button>
              </div>
            ))}
          </div>
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
