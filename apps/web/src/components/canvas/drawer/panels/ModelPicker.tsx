import type { ModelOption } from '../../config/modelOptions';
import { Select, SelectTrigger, SelectContent, SelectRichItem } from '../../../ui/select';

const IS_DEV = import.meta.env.DEV;

type Props = {
  options: ModelOption[];
  value: string;
  onChange: (modelId: string) => void;
};

export function ModelPicker({ options, value, onChange }: Props) {
  const selected = options.find((o) => o.id === value) ?? options[0];

  return (
    <div className="flex flex-col gap-2 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
      <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40">
        AI Model
      </label>
      <div style={{ position: 'relative' }}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          {selected && (
            <>
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-base leading-none shrink-0">{selected.badge}</span>
                <div className="min-w-0 flex items-center gap-1.5">
                  <span className="font-medium text-white/85">{selected.label}</span>
                  <span className="text-white/40 ml-1.5">{selected.desc}</span>
                  {IS_DEV && selected.devDefault && (
                    <span className="text-[8px] font-mono text-amber-400/80 bg-amber-400/10 px-1.5 py-0.5 rounded">🔧 DEV</span>
                  )}
                </div>
              </div>
              <span className="text-white/35 font-mono text-[10px] shrink-0">{selected.price}</span>
            </>
          )}
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectRichItem
              key={opt.id}
              value={opt.id}
              label={`${opt.badge} ${opt.label}`}
              content={
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className="text-base leading-none shrink-0">{opt.badge}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-white/80 font-medium">{opt.label}</span>
                      {IS_DEV && opt.devDefault && (
                        <span className="text-[8px] font-mono text-amber-400/80 bg-amber-400/10 px-1 rounded">🔧 DEV</span>
                      )}
                    </div>
                    <div className="text-[10px] text-white/40">{opt.desc}</div>
                  </div>
                  <span className="text-[10px] text-white/30 font-mono shrink-0">{opt.price}</span>
                </div>
              }
            />
          ))}
        </SelectContent>
      </Select>
      </div>
    </div>
  );
}
