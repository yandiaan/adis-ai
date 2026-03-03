import { useReactFlow } from '@xyflow/react';
import type { ReactNode } from 'react';
import { Blend, Layers, Scissors, Square } from 'lucide-react';
import type { BackgroundRemoverData, BgOutputType } from '../../types/node-types';
import { ModelPicker } from './ModelPicker';
import { MODEL_OPTIONS } from '../../config/modelOptions';

type Props = {
  nodeId: string;
  data: BackgroundRemoverData;
};

const OUTPUT_TYPES: { value: BgOutputType; label: string; desc: string; icon: ReactNode }[] = [
  {
    value: 'transparent',
    label: 'Transparent',
    desc: 'PNG with alpha channel (ideal for stickers)',
    icon: <Layers size={14} />,
  },
  { value: 'white', label: 'White BG', desc: 'Subject on clean white background', icon: <Square size={14} /> },
  { value: 'blur', label: 'Blur BG', desc: 'Subject with blurred background (bokeh)', icon: <Blend size={14} /> },
];

export function BackgroundRemoverPanel({ nodeId, data }: Props) {
  const { updateNodeData } = useReactFlow();
  const config = data.config;

  const updateConfig = (updates: Partial<typeof config>) => {
    updateNodeData(nodeId, { config: { ...config, ...updates } });
  };

  return (
    <>
      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Output Type</label>
        <div className="flex flex-col gap-1.5">
          {OUTPUT_TYPES.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateConfig({ outputType: opt.value })}
              className={`motion-lift motion-press focus-ring-orange flex items-start gap-3 py-2.5 px-3 rounded-xl border text-white cursor-pointer text-xs text-left transition-colors ${
                config.outputType === opt.value
                  ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)]'
                  : 'border-white/10 bg-white/5 hover:bg-white/7'
              }`}
            >
              <span className="text-base mt-0.5 flex-shrink-0">{opt.icon}</span>
              <div>
                <div className="font-medium">{opt.label}</div>
                <div className="text-white/40 text-[11px] mt-0.5">{opt.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-300/80 text-xs">
        <div className="font-medium mb-1 flex items-center gap-1.5"><Scissors size={12} /> AI Matting</div>
        <div className="text-emerald-300/60">
          Automatically detects and removes the background. Best for portraits, products, and clear
          subjects.
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
