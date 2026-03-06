import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface DrawerSectionProps {
  title: string;
  children: React.ReactNode;
  /** When true, section starts collapsed. Default: false */
  defaultCollapsed?: boolean;
  /** Accent color for the section header badge */
  accent?: 'default' | 'advanced';
}

/**
 * Collapsible section wrapper for NodeDetailDrawer panels.
 * Use for grouping "Basic" vs "Advanced" settings.
 */
export function DrawerSection({
  title,
  children,
  defaultCollapsed = false,
  accent = 'default',
}: DrawerSectionProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const accentStyles =
    accent === 'advanced'
      ? 'text-amber-400/70 border-amber-400/20 bg-amber-400/[0.06]'
      : 'text-white/40 border-white/10 bg-white/[0.04]';

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] overflow-hidden">
      <button
        onClick={() => setCollapsed((v) => !v)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 cursor-pointer transition-colors hover:bg-white/[0.04] ${accentStyles} border-b border-white/[0.06]`}
      >
        <span className="text-[10px] font-bold uppercase tracking-widest">{title}</span>
        {collapsed ? (
          <ChevronDown size={14} className="opacity-50" />
        ) : (
          <ChevronUp size={14} className="opacity-50" />
        )}
      </button>

      {!collapsed && <div className="flex flex-col gap-2.5 p-3.5">{children}</div>}
    </div>
  );
}
