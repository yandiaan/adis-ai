import { useEffect, useRef, useState } from 'react';
import {
  ScrollText,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Loader2,
} from 'lucide-react';
import type { LogEntry, LogLevel } from './execution/logStore';

interface LogPanelProps {
  logs: LogEntry[];
  isOpen: boolean;
  onToggle: () => void;
  onClear: () => void;
  pipelineRunning?: boolean;
  drawerOpen?: boolean;
}

const LEVEL_CONFIG: Record<
  LogLevel,
  { icon: typeof Info; color: string; bg: string; border: string; label: string }
> = {
  info: {
    icon: Info,
    color: 'text-blue-400/80',
    bg: 'bg-blue-500/8',
    border: 'border-blue-500/15',
    label: 'INFO',
  },
  success: {
    icon: CheckCircle2,
    color: 'text-emerald-400/80',
    bg: 'bg-emerald-500/8',
    border: 'border-emerald-500/15',
    label: 'OK',
  },
  warn: {
    icon: AlertTriangle,
    color: 'text-amber-400/80',
    bg: 'bg-amber-500/8',
    border: 'border-amber-500/15',
    label: 'WARN',
  },
  error: {
    icon: XCircle,
    color: 'text-red-400/80',
    bg: 'bg-red-500/8',
    border: 'border-red-500/15',
    label: 'ERR',
  },
};

const BORDER_STYLE = '1px solid rgba(255, 255, 255, 0.10)';
const BUTTON_CLASS =
  'motion-press grid place-items-center w-6 h-6 rounded-md text-white/25 hover:text-white/55 hover:bg-white/6 transition-colors';

const formatTime = (ts: number) =>
  new Date(ts).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

const formatDuration = (ms: number) => (ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`);

interface CountSummaryProps {
  total: number;
  successCount: number;
  errorCount: number;
}

function CountSummary({ total, successCount, errorCount }: CountSummaryProps) {
  return (
    <span className="flex items-center gap-1.5 ml-1">
      <span className="text-[11px] text-white/25">{total} entries</span>
      {successCount > 0 && (
        <span className="flex items-center gap-0.5 text-[10px] text-emerald-400/60">
          <CheckCircle2 size={10} />
          {successCount}
        </span>
      )}
      {errorCount > 0 && (
        <span className="flex items-center gap-0.5 text-[10px] text-red-400/60">
          <XCircle size={10} />
          {errorCount}
        </span>
      )}
    </span>
  );
}

function LogEntryRow({ entry }: { entry: LogEntry }) {
  const [expanded, setExpanded] = useState(false);
  const { color, bg, border, icon: Icon, label } = LEVEL_CONFIG[entry.level];

  return (
    <div className="group flex flex-col border-b border-white/4 hover:bg-white/2.5 transition-colors">
      <div
        className="flex items-start gap-2 px-3 py-2 cursor-pointer select-none"
        onClick={() => entry.details && setExpanded(!expanded)}
      >
        <span className="text-[11px] font-mono text-white/25 shrink-0 pt-0.5 w-15.5">
          {formatTime(entry.timestamp)}
        </span>

        <span
          className={`shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider border ${bg} ${border} ${color}`}
        >
          <Icon size={10} />
          {label}
        </span>

        {entry.nodeLabel && (
          <span className="shrink-0 px-1.5 py-0.5 rounded text-[11px] font-medium bg-white/4 border border-white/7 text-white/50">
            {entry.nodeLabel}
          </span>
        )}

        <span className="flex-1 text-[12px] text-white/60 min-w-0 truncate">{entry.message}</span>

        {entry.durationMs != null && (
          <span className="shrink-0 text-[11px] font-mono text-white/30">
            {formatDuration(entry.durationMs)}
          </span>
        )}

        {entry.details && (
          <span className="shrink-0 text-white/15 group-hover:text-white/35 transition-colors">
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </span>
        )}
      </div>

      {expanded && entry.details && (
        <div className="px-3 pb-2 pl-20.5">
          <pre className="text-[11px] font-mono text-white/40 bg-black/20 border border-white/5 rounded-lg p-2 overflow-x-auto max-h-50 overflow-y-auto">
            {JSON.stringify(entry.details, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export function LogPanel({
  logs,
  isOpen,
  onToggle,
  onClear,
  pipelineRunning,
  drawerOpen = false,
}: LogPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);

    if (isOpen) {
      setMounted(true);
      setClosing(false);
    } else if (mounted) {
      setClosing(true);
      timerRef.current = window.setTimeout(() => {
        setMounted(false);
        setClosing(false);
      }, 220);
    }

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [isOpen, mounted]);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs.length, autoScroll]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollHeight, scrollTop, clientHeight } = scrollRef.current;
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 40);
  };

  if (!mounted) return null;

  const errorCount = logs.filter((l) => l.level === 'error').length;
  const successCount = logs.filter((l) => l.level === 'success').length;

  return (
    <div
      className={`absolute bottom-0 z-30 flex flex-col ${
        closing ? 'animate-panel-out-bottom' : 'animate-panel-in-bottom'
      }`}
      style={{
        height: '280px',
        left: 'calc(var(--sidebar-width, 64px) - 64px)',
        right: drawerOpen ? 'clamp(320px, 34vw, 420px)' : '0',
        transition: 'left 0.3s ease-in-out, right 0.3s ease-in-out',
      }}
    >
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          background: '#121212',
          borderTop: BORDER_STYLE,
          borderLeft: BORDER_STYLE,
          borderRight: BORDER_STYLE,
          boxShadow: '0 -8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      />

      <div
        className="relative flex items-center justify-between h-9 px-3 shrink-0 cursor-pointer select-none"
        style={{ borderBottom: BORDER_STYLE }}
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <ScrollText size={14} className="text-white/35" />
          <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-white/40">
            Pipeline Log
          </span>

          {pipelineRunning && (
            <span
              className="flex items-center gap-1 text-[11px]"
              style={{ color: 'var(--editor-accent)' }}
            >
              <Loader2 size={10} className="animate-spin" />
              Running
            </span>
          )}

          {logs.length > 0 && (
            <CountSummary total={logs.length} successCount={successCount} errorCount={errorCount} />
          )}
        </div>

        <div className="flex items-center gap-1">
          {logs.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className={BUTTON_CLASS}
              title="Clear logs"
            >
              <Trash2 size={12} />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className={BUTTON_CLASS}
            title="Close"
          >
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="relative flex-1 overflow-y-auto overflow-x-hidden addnode-scroll"
      >
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-white/15 text-[13px]">
            No logs yet. Run the pipeline to see activity.
          </div>
        ) : (
          logs.map((entry) => <LogEntryRow key={entry.id} entry={entry} />)
        )}
      </div>
    </div>
  );
}
