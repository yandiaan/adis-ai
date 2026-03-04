import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { CustomNodeType, NodeCategory } from './types/node-types';
import { NODE_PORT_SCHEMAS } from './types/node-types';
import {
  NODE_TYPE_CONFIGS,
  NODE_CATEGORIES,
  getCategoryForNodeType,
} from './config/nodeCategories';
import { isConnectionValid } from './config/port-compatibility';
import type { PortDataType } from './types/port-types';
import { PORT_COLORS } from './config/port-colors';
import { renderNodeTypeIcon } from './icons/nodeTypeIcon';
import { renderNodeCategoryIcon } from './icons/nodeCategoryIcon';

export interface ConnectMenuState {
  visible: boolean;
  /** Client-space X where the drag ended */
  clientX: number;
  /** Client-space Y where the drag ended */
  clientY: number;
  portType: PortDataType;
  /** 'source' = dragging from output handle; 'target' = dragging from input handle */
  direction: 'source' | 'target';
  sourceNodeId: string;
  sourcePortId: string;
}

interface CompatibleNodeEntry {
  type: CustomNodeType;
  label: string;
  icon: string;
  description: string;
  /** The port on the NEW node that should be auto-connected */
  compatiblePortId: string;
}

function getCompatibleNodes(
  portType: PortDataType,
  direction: 'source' | 'target',
): CompatibleNodeEntry[] {
  return NODE_TYPE_CONFIGS.flatMap((cfg) => {
    const schema = NODE_PORT_SCHEMAS[cfg.type];
    let compatiblePort: { id: string } | undefined;

    if (direction === 'source') {
      // dragging from an output — find inputs on other nodes that can receive this type
      compatiblePort = schema.inputs.find((p) => isConnectionValid(portType, p.type));
    } else {
      // dragging from an input — find outputs on other nodes that can feed this type
      compatiblePort = schema.outputs.find((p) => isConnectionValid(p.type, portType));
    }

    if (!compatiblePort) return [];

    return [
      {
        type: cfg.type,
        label: cfg.label,
        icon: cfg.icon,
        description: cfg.description,
        compatiblePortId: compatiblePort.id,
      },
    ];
  });
}

type CategoryId = keyof typeof NODE_CATEGORIES;

function groupByCategory(
  nodes: CompatibleNodeEntry[],
): Partial<Record<CategoryId, CompatibleNodeEntry[]>> {
  const groups: Partial<Record<CategoryId, CompatibleNodeEntry[]>> = {};
  for (const node of nodes) {
    const cat = getCategoryForNodeType(node.type).id as CategoryId;
    if (!groups[cat]) groups[cat] = [];
    groups[cat]!.push(node);
  }
  return groups;
}

interface ConnectPortMenuProps {
  state: ConnectMenuState;
  onSelect: (nodeType: CustomNodeType, compatiblePortId: string) => void;
  onClose: () => void;
}

export function ConnectPortMenu({ state, onSelect, onClose }: ConnectPortMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const entries = getCompatibleNodes(state.portType, state.direction);
  const groups = groupByCategory(entries);
  const portColor = PORT_COLORS[state.portType];

  // Animate in on mount
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Close on outside click or Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const onMouse = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    window.addEventListener('keydown', onKey);
    // Delay mousedown registration by one tick so we don't capture the
    // drag-end pointer events that caused this menu to appear.
    const t = setTimeout(() => window.addEventListener('mousedown', onMouse), 150);
    return () => {
      window.removeEventListener('keydown', onKey);
      clearTimeout(t);
      window.removeEventListener('mousedown', onMouse);
    };
  }, [onClose]);

  // Smart positioning: keep menu on-screen
  const menuW = 272;
  const menuH = Math.min(entries.length * 44 + 88, 380);
  const left = Math.min(state.clientX + 12, window.innerWidth - menuW - 8);
  const top = Math.min(state.clientY - 16, window.innerHeight - menuH - 8);

  if (entries.length === 0) return null;

  const categoryOrder: CategoryId[] = ['input', 'textStyle', 'imageEdit', 'videoEdit', 'generate', 'compose', 'output'];

  const menu = (
    <div
      ref={menuRef}
      className="fixed flex flex-col overflow-hidden"
      style={{
        left,
        top,
        width: menuW,
        maxHeight: 380,
        zIndex: 99999,
        background: 'var(--editor-surface-2)',
        border: '1px solid rgba(255,255,255,0.14)',
        borderRadius: 20,
        boxShadow: `0 18px 60px rgba(0,0,0,0.62), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px ${portColor}15`,
        transition: 'opacity 0.14s ease-out, transform 0.14s ease-out',
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1) translateY(0px)' : 'scale(0.96) translateY(6px)',
        transformOrigin: 'top left',
      }}
    >
      {/* Header */}
      <div
        className="px-3 pt-3 pb-2.5 flex items-center justify-between gap-2 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="grid place-items-center w-8 h-8 rounded-xl border shrink-0"
            style={{
              backgroundColor: `${portColor}18`,
              borderColor: `${portColor}35`,
            }}
          >
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: portColor, boxShadow: `0 0 8px ${portColor}90` }}
            />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-white/40">
              {state.direction === 'source' ? 'Connect to' : 'Connect from'}
            </div>
            <div
              className="text-[13px] font-semibold leading-tight capitalize"
              style={{ color: portColor }}
            >
              {state.portType} port
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="grid place-items-center w-7 h-7 rounded-full border border-white/10 bg-white/5 text-white/50 hover:text-white/90 transition-colors cursor-pointer shrink-0"
          aria-label="Close"
        >
          <X size={13} />
        </button>
      </div>

      {/* Node list */}
      <div className="overflow-y-auto flex-1 px-2 py-2">
        {categoryOrder.map((catId) => {
          const items = groups[catId];
          if (!items?.length) return null;
          const cat = NODE_CATEGORIES[catId];
          return (
            <div key={catId}>
              {/* Category header */}
              <div className="flex items-center gap-1.5 px-2 py-1.5">
                <span
                  className="grid place-items-center w-5 h-5 rounded-lg border border-white/10 bg-white/4"
                  style={{ color: cat.color }}
                >
                  {renderNodeCategoryIcon(catId as NodeCategory, {
                    size: 11,
                    className: 'text-current',
                  })}
                </span>
                <span
                  className="text-[10px] font-semibold tracking-[0.12em] uppercase"
                  style={{ color: cat.color + '90' }}
                >
                  {cat.label}
                </span>
              </div>

              {items.map((item) => (
                <button
                  key={item.type}
                  className="group w-full flex items-center gap-2.5 px-2 py-2 rounded-xl text-left hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => {
                    onSelect(item.type, item.compatiblePortId);
                    onClose();
                  }}
                >
                  <span
                    className="grid place-items-center w-8 h-8 rounded-xl shrink-0"
                    style={{
                      color: cat.color,
                      background: 'rgba(255,255,255,0.03)',
                    }}
                  >
                    {renderNodeTypeIcon(item.type, { size: 16, className: 'text-current' }) ??
                      item.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-white/85 truncate leading-tight">
                      {item.label}
                    </div>
                    <div className="text-[11px] text-white/30 truncate leading-tight mt-0.5">
                      {item.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );

  return createPortal(menu, document.body);
}
