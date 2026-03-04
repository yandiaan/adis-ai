import { Handle, Position, useNodeId } from '@xyflow/react';
import { Fragment, type ReactNode } from 'react';
import { Check, CircleDot, RotateCw, X } from 'lucide-react';
import { renderNodeTypeIcon } from '../icons/nodeTypeIcon';
import { getCategoryForNodeType } from '../config/nodeCategories';
import { PORT_COLORS } from '../config/port-colors';
import { NODE_PORT_SCHEMAS } from '../types/node-types';
import type { CustomNodeType } from '../types/node-types';
import type { NodePortSchema, PortDefinition } from '../types/port-types';
import { useExecutionContext } from '../execution/ExecutionContext';
import type { NodeExecutionStatus } from '../execution/types';

export interface CompactNodeProps {
  nodeType: CustomNodeType;
  icon: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  selected?: boolean;
  minWidth?: number;
  width?: number;
  maxWidth?: number;
  portSchema?: NodePortSchema;
}

const STATUS_COLORS: Record<
  NodeExecutionStatus,
  { border: string; glow: string; bg: string; label: string }
> = {
  idle: { border: 'transparent', glow: 'transparent', bg: 'transparent', label: '' },
  ready: { border: '#4ade80', glow: '#4ade8040', bg: '#4ade8010', label: 'Ready' },
  running: { border: '#60a5fa', glow: '#60a5fa50', bg: '#60a5fa10', label: 'Running...' },
  done: { border: '#4ade80', glow: '#4ade8040', bg: '#4ade8010', label: 'Done' },
  error: { border: '#f87171', glow: '#f8717150', bg: '#f8717110', label: 'Failed' },
  stale: { border: '#fb923c', glow: '#fb923c40', bg: '#fb923c10', label: 'Stale' },
};

function renderFallbackIcon(fallbackIcon?: string): ReactNode {
  return <span className="text-[14px] leading-none">{fallbackIcon}</span>;
}

export function CompactNode({
  nodeType,
  icon,
  title,
  subtitle,
  children,
  selected = false,
  minWidth = 200,
  width,
  maxWidth,
  portSchema,
}: CompactNodeProps) {
  const category = getCategoryForNodeType(nodeType);
  const schema = portSchema ?? NODE_PORT_SCHEMAS[nodeType];
  const nodeId = useNodeId();
  const { getNodeState } = useExecutionContext();
  const execState = nodeId ? getNodeState(nodeId) : null;
  const status: NodeExecutionStatus = execState?.status ?? 'idle';
  const colors = STATUS_COLORS[status];
  const hasStatus = status !== 'idle';
  const isRunning = status === 'running';
  const isError = status === 'error';

  const borderColor = isRunning
    ? colors.border
    : selected
      ? category.color
      : hasStatus && status !== 'stale'
        ? `${colors.border}80`
        : 'rgba(255,255,255,0.08)';

  const outerGlow = isRunning
    ? `0 0 0 2px ${colors.glow}, 0 0 28px ${colors.glow}`
    : selected
      ? `0 0 0 1.5px ${category.color}50, 0 0 20px ${category.color}20`
      : '0 4px 20px rgba(0,0,0,0.5)';

  return (
    <div
      className="relative flex flex-col rounded-xl overflow-visible font-[Inter,system-ui,sans-serif] cursor-default transition-[border-color,box-shadow] duration-200"
      style={{
        minWidth: width ?? minWidth,
        width: width,
        maxWidth: maxWidth,
        background: '#15151e',
        border: `1px solid ${borderColor}`,
        boxShadow: outerGlow,
      }}
    >
      {/* Top accent strip */}
      <div
        className="absolute top-0 left-3 right-3 rounded-b-sm"
        style={{ height: 2, background: category.color, opacity: selected ? 1 : 0.5 }}
      />

      {/* Selected pulse ring */}
      {selected && (
        <span
          className="pointer-events-none absolute -inset-[2px] rounded-[13px] motion-safe:animate-[glowPulse_2.2s_var(--motion-ease-inout)_infinite] motion-reduce:animate-none"
          style={{
            border: `1px solid ${category.color}30`,
            boxShadow: `0 0 16px ${category.color}18`,
          }}
        />
      )}

      {/* Input port handles + external labels */}
      {schema.inputs.map((port: PortDefinition, index: number) => {
        const topPct = getHandlePosition(index, schema.inputs.length);
        return (
          <Fragment key={`input-${port.id}`}>
            <Handle
              id={port.id}
              type="target"
              position={Position.Left}
              className="w-3! h-3! rounded-full!"
              style={{
                background: '#15151e',
                border: `2px solid ${PORT_COLORS[port.type]}`,
                boxShadow: `0 0 6px ${PORT_COLORS[port.type]}55`,
                top: `${topPct}%`,
              }}
              title={`${port.label} (${port.type})${port.required ? '' : ' -- optional'}`}
            />
            <div
              className="absolute pointer-events-none select-none flex items-center gap-1"
              style={{
                top: `${topPct}%`,
                right: 'calc(100% + 10px)',
                transform: 'translateY(-50%)',
              }}
            >
              <span
                className="text-[9px] leading-none font-medium whitespace-nowrap"
                style={{ color: PORT_COLORS[port.type] + 'b0' }}
              >
                {port.label}
              </span>
              {!port.required && (
                <span className="text-[8px] leading-none text-white/20 italic">opt</span>
              )}
            </div>
          </Fragment>
        );
      })}

      {/* Header */}
      <div className="flex items-center gap-2 px-3 pt-4 pb-2.5">
        <span
          className="grid place-items-center w-6 h-6 rounded-lg shrink-0"
          style={{ color: category.color }}
        >
          {renderNodeTypeIcon(nodeType, { size: 14, className: 'text-current' }) ??
            renderFallbackIcon(icon)}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-semibold text-white/80 truncate leading-tight">
            {title}
          </div>
          {subtitle && (
            <div className="text-[10px] text-white/35 truncate leading-tight mt-0.5">
              {subtitle}
            </div>
          )}
        </div>
        {hasStatus && (
          <div
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold shrink-0"
            style={{
              backgroundColor: `${colors.border}18`,
              color: colors.border,
              border: `1px solid ${colors.border}35`,
            }}
          >
            {isRunning ? (
              <svg
                className="animate-spin shrink-0"
                width="9"
                height="9"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
              </svg>
            ) : status === 'done' ? (
              <Check size={9} />
            ) : isError ? (
              <X size={9} />
            ) : status === 'stale' ? (
              <RotateCw size={9} />
            ) : (
              <CircleDot size={9} />
            )}
            {colors.label}
          </div>
        )}
      </div>

      {/* Content area */}
      {children && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="px-3 pt-2.5 pb-3">{children}</div>
        </div>
      )}

      {/* Running progress bar */}
      {isRunning && execState && execState.progress > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl overflow-hidden">
          <div
            className="h-full transition-all duration-300"
            style={{ width: `${execState.progress}%`, backgroundColor: colors.border }}
          />
        </div>
      )}

      {/* Error footer */}
      {isError && execState?.error && (
        <div
          className="px-3 py-1.5 text-[10px] truncate flex items-center gap-1.5"
          style={{
            borderTop: '1px solid rgba(248,113,113,0.15)',
            color: '#f87171',
            background: '#f8717108',
          }}
        >
          <X size={10} className="shrink-0" />
          {execState.error}
        </div>
      )}

      {/* Output port handles + external labels */}
      {schema.outputs.map((port: PortDefinition, index: number) => {
        const topPct = getHandlePosition(index, schema.outputs.length);
        return (
          <Fragment key={`output-${port.id}`}>
            <Handle
              id={port.id}
              type="source"
              position={Position.Right}
              className="w-3! h-3! rounded-full!"
              style={{
                background: '#15151e',
                border: `2px solid ${PORT_COLORS[port.type]}`,
                boxShadow: `0 0 6px ${PORT_COLORS[port.type]}55`,
                top: `${topPct}%`,
              }}
              title={`${port.label} (${port.type})`}
            />
            <div
              className="absolute pointer-events-none select-none flex items-center gap-1"
              style={{
                top: `${topPct}%`,
                left: 'calc(100% + 10px)',
                transform: 'translateY(-50%)',
              }}
            >
              <span
                className="text-[9px] leading-none font-medium whitespace-nowrap"
                style={{ color: PORT_COLORS[port.type] + 'b0' }}
              >
                {port.label}
              </span>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}

function getHandlePosition(index: number, total: number): number {
  if (total === 1) return 50;
  const padding = 22;
  return padding + (index / (total - 1)) * (100 - 2 * padding);
}
