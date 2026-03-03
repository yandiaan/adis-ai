import { useReactFlow } from '@xyflow/react';
import type { WatermarkData, WatermarkPosition, WatermarkStyle } from '../../types/node-types';

type Props = {
  nodeId: string;
  data: WatermarkData;
};

const POSITIONS: { value: WatermarkPosition; label: string }[] = [
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'top-left', label: 'Top Left' },
  { value: 'center', label: 'Center' },
];

const STYLES: { value: WatermarkStyle; label: string; desc: string }[] = [
  { value: 'text', label: 'Text', desc: 'Custom text watermark' },
  { value: 'brand-logo', label: 'Brand Logo', desc: 'Your brand identity' },
];

export function WatermarkPanel({ nodeId, data }: Props) {
  const { updateNodeData } = useReactFlow();
  const config = data.config;

  const updateConfig = (updates: Partial<typeof config>) => {
    updateNodeData(nodeId, { config: { ...config, ...updates } });
  };

  return (
    <>
      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Style</label>
        <div className="flex gap-2">
          {STYLES.map((style) => (
            <button
              key={style.value}
              onClick={() => updateConfig({ style: style.value })}
              className={`motion-lift motion-press focus-ring-orange flex-1 py-2.5 px-3 rounded-xl border text-white cursor-pointer text-xs text-left transition-colors ${
                config.style === style.value
                  ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)]'
                  : 'border-white/10 bg-white/5 hover:bg-white/7'
              }`}
            >
              <div className="font-medium">{style.label}</div>
              <div className="text-white/40 text-[11px] mt-0.5">{style.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {config.style === 'text' && (
        <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
          <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Watermark Text</label>
          <input
            type="text"
            value={config.text}
            onChange={(e) => updateConfig({ text: e.target.value })}
            placeholder="© Your Brand"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[var(--editor-accent-65)] transition-colors"
          />
        </div>
      )}

      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Position</label>
        <div className="grid grid-cols-2 gap-1.5">
          {POSITIONS.map((pos) => (
            <button
              key={pos.value}
              onClick={() => updateConfig({ position: pos.value })}
              className={`motion-lift motion-press focus-ring-orange py-2 px-3 rounded-xl border text-white cursor-pointer text-xs transition-colors ${
                config.position === pos.value
                  ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)]'
                  : 'border-white/10 bg-white/5 hover:bg-white/7'
              }`}
            >
              {pos.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Opacity</span>
          <span className="text-[11px] text-white/55 tabular-nums">{config.opacity}%</span>
        </div>
        <input
          type="range"
          min={10}
          max={100}
          step={5}
          value={config.opacity}
          onChange={(e) => updateConfig({ opacity: Number(e.target.value) })}
          className="w-full accent-[var(--editor-accent)] cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-white/30">
          <span>Subtle</span>
          <span>Solid</span>
        </div>
      </div>
    </>
  );
}
