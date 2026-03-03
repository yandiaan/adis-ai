import type { ModelOption } from '../../config/modelOptions';
import { Select, SelectTrigger, SelectContent, SelectRichItem } from '../../../ui/select';

const IS_DEV = import.meta.env.DEV;

type Props = {
  options: ModelOption[];
  value: string;
  onChange: (id: string) => void;
};

/**
 * Compact model dropdown for use inside node canvas cards.
 * Shows badge + short label in trigger; full details in dropdown.
 * In dev mode, marks devDefault options with a 🔧 chip.
 */
export function NodeModelSelect({ options, value, onChange }: Props) {
  const selected = options.find((o) => o.id === value) ?? options[0];

  return (
    <div style={{ position: 'relative' }}>
      <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-[22px] text-[9px] px-1.5 py-0 gap-0.5 border-white/[0.08] bg-white/[0.03] min-w-0">
        <div className="flex items-center gap-1 min-w-0 truncate">
          <span className="text-[11px] leading-none shrink-0">{selected?.badge}</span>
          <span className="text-[9px] text-white/55 font-medium truncate">{selected?.label}</span>
          {IS_DEV && selected?.devDefault && (
            <span className="text-[7px] font-mono text-amber-400/70 shrink-0">DEV</span>
          )}
        </div>
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectRichItem
            key={opt.id}
            value={opt.id}
            label={`${opt.badge} ${opt.label}`}
            content={
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-sm leading-none shrink-0">{opt.badge}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-white/80 font-medium">{opt.label}</span>
                    {IS_DEV && opt.devDefault && (
                      <span className="text-[8px] font-mono text-amber-400/80 bg-amber-400/10 px-1 rounded">DEV</span>
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
  );
}
