import * as React from 'react';
import { ChevronDown, Check } from 'lucide-react';

function cx(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(' ');
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface SelectOption {
  value: string;
  label: string;
  /** Optional rich React content for the dropdown list (not shown in trigger) */
  content?: React.ReactNode;
}

interface SelectContextValue {
  value: string;
  onValueChange: (v: string) => void;
  open: boolean;
  setOpen: (o: boolean) => void;
  options: SelectOption[];
}

// ── Context ──────────────────────────────────────────────────────────────────

const SelectContext = React.createContext<SelectContextValue | null>(null);
function useSelect() {
  const ctx = React.useContext(SelectContext);
  if (!ctx) throw new Error('useSelect must be used inside Select');
  return ctx;
}

// ── Root ─────────────────────────────────────────────────────────────────────

interface SelectProps {
  value: string;
  onValueChange: (v: string) => void;
  children: React.ReactNode;
}

export function Select({ value, onValueChange, children }: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const options = React.useMemo<SelectOption[]>(() => [], []);
  const ctx = React.useMemo(
    () => ({ value, onValueChange, open, setOpen, options }),
    [value, onValueChange, open, options],
  );
  return <SelectContext.Provider value={ctx}>{children}</SelectContext.Provider>;
}

// ── Trigger ──────────────────────────────────────────────────────────────────

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, onClick, ...props }, ref) => {
  const { open, setOpen } = useSelect();
  return (
    <button
      ref={ref}
      type="button"
      className={cx(
        'flex w-full items-center justify-between gap-1.5 rounded-lg border border-white/10',
        'bg-white/[0.04] px-2.5 py-1.5 text-xs text-white/70 outline-none transition-colors',
        'hover:bg-white/[0.07] focus:border-[var(--editor-accent-65)] cursor-pointer',
        className,
      )}
      onClick={(e) => {
        setOpen(!open);
        onClick?.(e);
      }}
      {...props}
    >
      {children}
      <ChevronDown
        size={12}
        className={cx('shrink-0 text-white/30 transition-transform', open && 'rotate-180')}
      />
    </button>
  );
});
SelectTrigger.displayName = 'SelectTrigger';

// ── Value display (just a span) ───────────────────────────────────────────────

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value, options } = useSelect();
  const opt = options.find((o) => o.value === value);
  return (
    <span className={cx('truncate', !opt && 'text-white/30')}>
      {opt?.label ?? placeholder ?? ''}
    </span>
  );
}

// ── Content (dropdown list) ───────────────────────────────────────────────────

export const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen } = useSelect();
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (!open) return;
      const handler = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, [open, setOpen]);

    if (!open) return null;

    return (
      <div
        ref={containerRef}
        style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 9999, marginTop: 4 }}
      >
        <div
          ref={ref}
          className={cx(
            'glass-surface-strong overflow-hidden rounded-xl border border-white/10',
            'shadow-[0_20px_50px_rgba(0,0,0,0.6)]',
            'animate-in fade-in-0 zoom-in-95',
            className,
          )}
          {...props}
        >
          <div className="p-1.5">{children}</div>
        </div>
      </div>
    );
  },
);
SelectContent.displayName = 'SelectContent';

// ── Item ──────────────────────────────────────────────────────────────────────

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function SelectItem({ value, children, className, disabled }: SelectItemProps) {
  const { value: selected, onValueChange, setOpen } = useSelect();
  const isSelected = selected === value;
  return (
    <button
      type="button"
      disabled={disabled}
      className={cx(
        'relative flex w-full cursor-pointer items-center rounded-lg py-1.5 pl-7 pr-2.5',
        'text-xs outline-none text-left text-white/60',
        'hover:text-white hover:bg-white/[0.07]',
        isSelected && 'text-white bg-[var(--editor-accent-14)]',
        disabled && 'opacity-50 pointer-events-none',
        className,
      )}
      onClick={() => {
        onValueChange(value);
        setOpen(false);
      }}
    >
      {isSelected && (
        <span className="absolute left-2 flex items-center justify-center">
          <Check size={10} className="text-[var(--editor-accent)]" />
        </span>
      )}
      {children}
    </button>
  );
}

// ── Rich Item (for model pickers) ─────────────────────────────────────────────

export interface SelectRichItemProps {
  value: string;
  label: string;
  content?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function SelectRichItem({
  value,
  label,
  content,
  className,
  disabled,
}: SelectRichItemProps) {
  const { value: selected, onValueChange, setOpen } = useSelect();
  const isSelected = selected === value;
  return (
    <button
      type="button"
      disabled={disabled}
      title={label}
      className={cx(
        'relative flex w-full cursor-pointer items-center gap-2.5 rounded-lg py-2 pl-7 pr-2.5',
        'outline-none text-left text-white/60',
        'hover:text-white hover:bg-white/[0.07]',
        isSelected && 'text-white bg-[var(--editor-accent-14)]',
        disabled && 'opacity-50 pointer-events-none',
        className,
      )}
      onClick={() => {
        onValueChange(value);
        setOpen(false);
      }}
    >
      {isSelected && (
        <span className="absolute left-2 flex items-center justify-center">
          <Check size={10} className="text-[var(--editor-accent)]" />
        </span>
      )}
      {content ?? <span className="text-xs text-white/80">{label}</span>}
    </button>
  );
}
