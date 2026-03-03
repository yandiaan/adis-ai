import { useReactFlow } from '@xyflow/react';
import type { ReactNode } from 'react';
import { Columns2, Grid2X2, LayoutDashboard, LayoutGrid, Rows2 } from 'lucide-react';
import type { CollageLayoutData, CollageLayoutStyle } from '../../types/node-types';
import { ModelPicker } from './ModelPicker';
import { MODEL_OPTIONS } from '../../config/modelOptions';

type Props = {
  nodeId: string;
  data: CollageLayoutData;
};

const LAYOUTS: { value: CollageLayoutStyle; label: string; icon: ReactNode; desc: string }[] = [
  { value: '2-horizontal', label: 'Side-by-side', icon: <Columns2 size={16} />, desc: '2 images left / right' },
  { value: '2-vertical', label: 'Stacked', icon: <Rows2 size={16} />, desc: '2 images top / bottom' },
  { value: '3-grid', label: '3 Grid', icon: <LayoutGrid size={16} />, desc: '1 large + 2 small' },
  { value: '4-grid', label: '4 Grid', icon: <Grid2X2 size={16} />, desc: '4 equal quadrants' },
  { value: 'mosaic', label: 'Mosaic', icon: <LayoutDashboard size={16} />, desc: 'Varied-size mosaic' },
];

export function CollageLayoutPanel({ nodeId, data }: Props) {
  const { updateNodeData } = useReactFlow();
  const config = data.config;

  const updateConfig = (updates: Partial<typeof config>) => {
    updateNodeData(nodeId, { config: { ...config, ...updates } });
  };

  return (
    <>
      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Layout</label>
        <div className="flex flex-col gap-1.5">
          {LAYOUTS.map((layout) => (
            <button
              key={layout.value}
              onClick={() => updateConfig({ layout: layout.value })}
              className={`motion-lift motion-press focus-ring-orange flex items-center gap-3 py-2.5 px-3 rounded-xl border text-white cursor-pointer text-xs text-left transition-colors ${
                config.layout === layout.value
                  ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)]'
                  : 'border-white/10 bg-white/5 hover:bg-white/7'
              }`}
            >
              <span className="flex-shrink-0 flex items-center text-white/70">{layout.icon}</span>
              <div>
                <div className="font-medium">{layout.label}</div>
                <div className="text-white/40 text-[11px]">{layout.desc}</div>
              </div>
            </button>
          ))}
        </div>
        {config.layout === '4-grid' && (
          <p className="text-[10px] text-yellow-400/70 mt-1">⚠ API supports max 3 images — 4th image will be ignored</p>
        )}
      </div>

      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Gap</span>
          <span className="text-[11px] text-white/55 tabular-nums">{config.gap}px</span>
        </div>
        <input
          type="range"
          min={0}
          max={32}
          step={2}
          value={config.gap}
          onChange={(e) => updateConfig({ gap: Number(e.target.value) })}
          className="w-full accent-[var(--editor-accent)] cursor-pointer"
        />
      </div>

      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Border Radius</span>
          <span className="text-[11px] text-white/55 tabular-nums">{config.borderRadius}px</span>
        </div>
        <input
          type="range"
          min={0}
          max={32}
          step={2}
          value={config.borderRadius}
          onChange={(e) => updateConfig({ borderRadius: Number(e.target.value) })}
          className="w-full accent-[var(--editor-accent)] cursor-pointer"
        />
      </div>

      <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-300/80 text-xs">
        <div className="font-medium mb-1 flex items-center gap-1.5"><LayoutGrid size={12} /> V2 Feature</div>
        <div className="text-amber-300/60">
          Connect two Image nodes (Image A + Image B inputs) to create a collage.
        </div>
      </div>

      <ModelPicker
        options={MODEL_OPTIONS.imageEditing}
        value={config.model ?? 'qwen-image-edit-plus'}
        onChange={(model) => updateConfig({ model })}
      />
    </>
  );
}
