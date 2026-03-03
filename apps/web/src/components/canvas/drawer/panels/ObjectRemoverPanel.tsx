import { useReactFlow } from '@xyflow/react';
import type { ObjectRemoverData } from '../../types/node-types';
import { ModelPicker } from './ModelPicker';
import { MODEL_OPTIONS } from '../../config/modelOptions';

type Props = {
  nodeId: string;
  data: ObjectRemoverData;
};

const MODES: { value: 'auto' | 'describe'; label: string; desc: string }[] = [
  { value: 'auto', label: 'Auto Detect', desc: 'AI automatically identifies and removes the main subject' },
  { value: 'describe', label: 'Describe Target', desc: 'Specify the object you want to remove' },
];

export function ObjectRemoverPanel({ nodeId, data }: Props) {
  const { updateNodeData } = useReactFlow();
  const config = data.config;

  const updateConfig = (updates: Partial<typeof config>) => {
    updateNodeData(nodeId, { config: { ...config, ...updates } });
  };

  return (
    <>
      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">
          Removal Mode
        </label>
        <div className="flex flex-col gap-1.5">
          {MODES.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateConfig({ mode: opt.value })}
              className={`motion-lift motion-press focus-ring-orange flex items-start gap-3 py-2.5 px-3 rounded-xl border text-white cursor-pointer text-xs text-left transition-colors ${
                config.mode === opt.value
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

      {config.mode === 'describe' && (
        <div className="flex flex-col gap-2 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
          <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40">
            Target Object
          </label>
          <input
            type="text"
            value={config.target}
            onChange={(e) => updateConfig({ target: e.target.value })}
            placeholder="e.g. person, car, logo..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[var(--editor-accent-65)]"
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
