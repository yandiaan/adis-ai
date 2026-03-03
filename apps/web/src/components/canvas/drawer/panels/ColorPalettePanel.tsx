import { useReactFlow } from '@xyflow/react';
import { X } from 'lucide-react';
import type {
  ColorPaletteData,
  ColorPaletteMode,
  ColorPalettePreset,
} from '../../types/node-types';

type Props = {
  nodeId: string;
  data: ColorPaletteData;
};

const MODES: { value: ColorPaletteMode; label: string; desc: string }[] = [
  { value: 'preset', label: 'Preset', desc: 'Choose from curated palettes' },
  { value: 'custom', label: 'Custom', desc: 'Pick your own colors' },
  { value: 'extract', label: 'Extract', desc: 'Auto-extract from connected image' },
];

const PRESETS: { value: ColorPalettePreset; label: string; colors: string[] }[] = [
  {
    value: 'ramadan',
    label: 'Ramadan Gold',
    colors: ['#C9A84C', '#8B6914', '#F5DEB3', '#2C1810', '#D4AF37'],
  },
  {
    value: 'lebaran',
    label: 'Lebaran Festive',
    colors: ['#E8B4B8', '#DB7093', '#FFD700', '#228B22', '#8B0000'],
  },
  {
    value: 'pastel',
    label: 'Pastel Soft',
    colors: ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF'],
  },
  {
    value: 'neon',
    label: 'Neon Glow',
    colors: ['#FF00FF', '#00FFFF', '#00FF00', '#FF6600', '#FF0066'],
  },
  {
    value: 'monochrome',
    label: 'Monochrome',
    colors: ['#FFFFFF', '#AAAAAA', '#666666', '#333333', '#000000'],
  },
  {
    value: 'earth',
    label: 'Earth Tones',
    colors: ['#8B4513', '#A0522D', '#D2691E', '#DEB887', '#F4A460'],
  },
];

export function ColorPalettePanel({ nodeId, data }: Props) {
  const { updateNodeData } = useReactFlow();
  const config = data.config;

  const updateConfig = (updates: Partial<typeof config>) => {
    updateNodeData(nodeId, { config: { ...config, ...updates } });
  };

  const selectPreset = (preset: (typeof PRESETS)[0]) => {
    updateConfig({ presetName: preset.value, palette: preset.colors });
  };

  return (
    <>
      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Mode</label>
        <div className="flex flex-col gap-1.5">
          {MODES.map((mode) => (
            <button
              key={mode.value}
              onClick={() => updateConfig({ mode: mode.value })}
              className={`motion-lift motion-press focus-ring-orange py-2.5 px-3 rounded-xl border text-white cursor-pointer text-xs text-left transition-colors ${
                config.mode === mode.value
                  ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)]'
                  : 'border-white/10 bg-white/5 hover:bg-white/7'
              }`}
            >
              <div className="font-medium">{mode.label}</div>
              <div className="text-white/40 text-[11px] mt-0.5">{mode.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {config.mode === 'preset' && (
        <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
          <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Palette Presets</label>
          <div className="flex flex-col gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => selectPreset(preset)}
                className={`motion-lift motion-press focus-ring-orange flex items-center gap-3 py-2.5 px-3 rounded-xl border cursor-pointer transition-colors ${
                  config.presetName === preset.value
                    ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)]'
                    : 'border-white/10 bg-white/5 hover:bg-white/7'
                }`}
              >
                <div className="flex gap-1">
                  {preset.colors.map((c, i) => (
                    <span
                      key={i}
                      className="w-5 h-5 rounded-full border border-white/20"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <span className="text-white text-xs flex-1 text-left">{preset.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {config.mode === 'custom' && (
        <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
          <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">
            Custom Colors ({config.palette.length})
          </label>
          <div className="flex flex-wrap gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
            {config.palette.map((color, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => {
                    const newPalette = [...config.palette];
                    newPalette[i] = e.target.value;
                    updateConfig({ palette: newPalette });
                  }}
                  className="w-8 h-8 rounded-full cursor-pointer border border-white/20"
                  style={{ padding: 0 }}
                />
                <button
                  onClick={() =>
                    updateConfig({ palette: config.palette.filter((_, idx) => idx !== i) })
                  }
                  className="text-[9px] text-red-400/70 hover:text-red-400 transition-colors flex items-center"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
            {config.palette.length < 8 && (
              <button
                onClick={() => updateConfig({ palette: [...config.palette, '#ffffff'] })}
                className="w-8 h-8 rounded-full border border-dashed border-white/30 text-white/40 hover:text-white/70 flex items-center justify-center text-lg transition-colors"
              >
                +
              </button>
            )}
          </div>
        </div>
      )}

      {config.mode === 'extract' && (
        <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-white/50 text-xs text-center">
          Connect an Image Upload node to auto-extract palette
        </div>
      )}

      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Current Palette</label>
        <div className="flex gap-2 p-3 bg-white/5 rounded-xl border border-white/10 flex-wrap">
          {config.palette.length > 0 ? (
            config.palette.map((color, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span
                  className="w-8 h-8 rounded-lg border border-white/20"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[9px] text-white/40 font-mono">{color}</span>
              </div>
            ))
          ) : (
            <span className="text-white/30 text-xs">No colors selected</span>
          )}
        </div>
      </div>
    </>
  );
}
