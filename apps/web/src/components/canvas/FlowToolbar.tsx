import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Panel } from '@xyflow/react';
import {
  NODE_CATEGORIES,
  NODE_TYPES_BY_CATEGORY,
  type NodeTypeConfig,
} from './config/nodeCategories';
import type { CustomNodeType } from './types/node-types';
import type { MouseMode } from './types';
import {
  ChevronDown,
  ChevronRight,
  Hand,
  Loader2,
  MousePointer2,
  Play,
  Plus,
  ScrollText,
  Search,
  X,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import type { NodeCategory } from './types/node-types';
import { renderNodeTypeIcon } from './icons/nodeTypeIcon';
import { renderNodeCategoryIcon } from './icons/nodeCategoryIcon';
import { NODE_PORT_SCHEMAS, RUNNABLE_NODE_TYPES } from './types/node-types';

const LOG_PANEL_HEIGHT = 280;

/** Small keyboard shortcut badge used inside toolbar buttons */
function KbdBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold tracking-wide border"
      style={{
        borderColor: 'rgba(255,255,255,0.14)',
        color: 'rgba(255,255,255,0.6)',
        background: 'rgba(255,255,255,0.04)',
      }}
    >
      {children}
    </span>
  );
}

/** Tooltip content with an inline keyboard shortcut badge */
function ShortcutTooltip({ label, shortcut }: { label: string; shortcut: string }) {
  return (
    <span className="flex items-center gap-1.5">
      {label}
      <span
        className="px-1 py-0.5 rounded text-[10px] font-mono border"
        style={{
          borderColor: 'rgba(255,255,255,0.2)',
          color: 'rgba(255,255,255,0.7)',
          background: 'rgba(255,255,255,0.1)',
        }}
      >
        {shortcut}
      </span>
    </span>
  );
}

type Props = {
  mode: MouseMode;
  onModeChange: (mode: MouseMode) => void;
  onAddNode: (type: CustomNodeType) => void;
  onRunPipeline?: () => void;
  pipelineRunning?: boolean;
  logCount?: number;
  logErrorCount?: number;
  logOpen?: boolean;
  onToggleLog?: () => void;
};

const categoryOrder: (keyof typeof NODE_CATEGORIES)[] = [
  'input',
  'textStyle',
  'imageEdit',
  'videoEdit',
  'generate',
  'compose',
  'output',
];

function normalizeQuery(q: string) {
  return q.trim().toLowerCase();
}

function extractProvidersFromDescription(description: string): string[] {
  const matches = Array.from(description.matchAll(/\(([^)]+)\)/g))
    .map((m) => m[1]?.trim())
    .filter((m): m is string => Boolean(m));

  if (matches.length === 0) return [];

  const expanded = matches
    .flatMap((m) => m.split('/'))
    .map((m) => m.trim())
    .filter(Boolean);

  return Array.from(new Set(expanded));
}

function nodeMatchesQuery(node: { label: string; description: string }, query: string) {
  if (!query) return true;
  // Match primarily on the node name and explicit provider/model tokens.
  // Avoid matching against full descriptions so generic words don't pull unrelated nodes.
  const providers = extractProvidersFromDescription(node.description);
  const haystack = `${node.label} ${providers.join(' ')}`.toLowerCase();
  return haystack.includes(query);
}

// Helper to get port type color
function getPortTypeColor(type: string): string {
  switch (type) {
    case 'text':
      return '#4ade80';
    case 'image':
      return '#60a5fa';
    case 'video':
      return '#a78bfa';
    case 'style':
      return '#f59e0b';
    case 'media':
      return '#f87171';
    default:
      return 'rgba(255,255,255,0.5)';
  }
}

// Helper to format port type label
function formatPortType(type: string): string {
  switch (type) {
    case 'text':
      return 'Text';
    case 'image':
      return 'Image';
    case 'video':
      return 'Video';
    case 'style':
      return 'Style';
    case 'media':
      return 'Media';
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
}

// Node Detail Popover Component
interface NodeDetailPopoverProps {
  node: NodeTypeConfig | null;
  category: NodeCategory | null;
  visible: boolean;
  position: { x: number; y: number };
}

function NodeDetailPopover({ node, category, visible, position }: NodeDetailPopoverProps) {
  if (!node || !category || !visible) return null;

  const categoryConfig = NODE_CATEGORIES[category];
  const portSchema = NODE_PORT_SCHEMAS[node.type];
  const isRunnable = RUNNABLE_NODE_TYPES.includes(node.type);

  const inputCount = portSchema?.inputs?.length || 0;
  const outputCount = portSchema?.outputs?.length || 0;

  // Get output type for badge
  const outputType = portSchema?.outputs?.[0]?.type || null;
  const outputColor = outputType ? getPortTypeColor(outputType) : null;

  return (
    <div
      className="fixed z-[300] w-[320px] ml-2 rounded-2xl border border-white/15 overflow-hidden pointer-events-none"
      style={{
        left: position.x,
        bottom: position.y, // Use bottom positioning so popover grows upward
        background: 'rgba(20, 20, 24, 0.95)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0) scale(1)' : 'translateX(-8px) scale(0.98)',
        transition: 'opacity 0.15s ease, transform 0.15s ease',
      }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
              style={{
                backgroundColor: categoryConfig.bgColor,
                borderColor: categoryConfig.borderColor,
              }}
            >
              <div style={{ color: categoryConfig.color }}>
                {renderNodeTypeIcon(node.type, { size: 20, className: 'text-current' })}
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-[15px] font-semibold text-white/90 truncate">{node.label}</div>
              <div
                className="text-[11px] font-medium uppercase tracking-wider truncate"
                style={{ color: categoryConfig.color }}
              >
                {categoryConfig.label}
              </div>
            </div>
          </div>
          {outputType && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full border border-white/10 bg-white/5 shrink-0">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: outputColor || '#fff' }}
              />
              <span className="text-[10px] font-medium text-white/60">
                {formatPortType(outputType)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="px-4 pb-3">
        <p className="text-[13px] text-white/70 leading-relaxed">{node.description}</p>
      </div>

      {/* Stats Grid */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-2">
          {/* Inputs */}
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/8">
            <ArrowLeft size={14} className="text-white/40" />
            <div>
              <div className="text-[10px] text-white/40 uppercase tracking-wider">Inputs</div>
              <div className="text-[12px] font-medium text-white/80">
                {inputCount === 0 ? 'None' : `${inputCount} port${inputCount > 1 ? 's' : ''}`}
              </div>
            </div>
          </div>

          {/* Outputs */}
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/8">
            <ArrowRight size={14} className="text-white/40" />
            <div>
              <div className="text-[10px] text-white/40 uppercase tracking-wider">Outputs</div>
              <div className="text-[12px] font-medium text-white/80">
                {outputCount === 0 ? 'None' : `${outputCount} port${outputCount > 1 ? 's' : ''}`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Port Details */}
      {(inputCount > 0 || outputCount > 0) && (
        <div
          className="px-4 py-3 border-t border-white/8"
          style={{ background: 'rgba(255,255,255,0.02)' }}
        >
          {/* Input Ports */}
          {inputCount > 0 && (
            <div className="mb-2">
              <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5">
                Input Ports
              </div>
              <div className="flex flex-wrap gap-1.5">
                {portSchema.inputs.map((input) => (
                  <div
                    key={input.id}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-white/8 bg-white/[0.04]"
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: getPortTypeColor(input.type) }}
                    />
                    <span className="text-[11px] text-white/70">{input.label}</span>
                    {!input.required && <span className="text-[9px] text-white/40">opt</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Output Ports */}
          {outputCount > 0 && (
            <div>
              <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5">
                Output Ports
              </div>
              <div className="flex flex-wrap gap-1.5">
                {portSchema.outputs.map((output) => (
                  <div
                    key={output.id}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-white/8 bg-white/[0.04]"
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: getPortTypeColor(output.type) }}
                    />
                    <span className="text-[11px] text-white/70">{output.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Runnable Badge */}
      {isRunnable && (
        <div className="px-4 py-2 border-t border-white/8 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-white/50">Can be run independently</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function FlowToolbar({
  mode,
  onModeChange,
  onAddNode,
  onRunPipeline,
  pipelineRunning = false,
  logCount = 0,
  logErrorCount = 0,
  logOpen = false,
  onToggleLog,
}: Props) {
  const [menuMounted, setMenuMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<NodeCategory | null>(null);
  const [submenuTop, setSubmenuTop] = useState<number | null>(null);
  const [submenuAnchorTop, setSubmenuAnchorTop] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const closeTimerRef = useRef<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const submenuWrapRef = useRef<HTMLDivElement | null>(null);
  const submenuPopoverRef = useRef<HTMLDivElement | null>(null);
  const mainListScrollRef = useRef<HTMLDivElement | null>(null);
  const searchResultsRef = useRef<HTMLDivElement | null>(null);

  // Node detail popover state
  const [hoveredNode, setHoveredNode] = useState<NodeTypeConfig | null>(null);
  const [hoveredNodeCategory, setHoveredNodeCategory] = useState<NodeCategory | null>(null);
  const [nodeDetailPosition, setNodeDetailPosition] = useState({ x: 0, y: 0 });
  const [showNodeDetail, setShowNodeDetail] = useState(false);
  const nodeDetailTimerRef = useRef<number | null>(null);

  const openMenu = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setMenuMounted(true);
    // next frame so CSS transitions apply
    requestAnimationFrame(() => {
      setMenuOpen(true);
      // focus search a tick later so it exists
      window.setTimeout(() => searchInputRef.current?.focus(), 0);
    });
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setShowNodeDetail(false);
    setHoveredNode(null);
    setHoveredNodeCategory(null);
    if (nodeDetailTimerRef.current) {
      window.clearTimeout(nodeDetailTimerRef.current);
      nodeDetailTimerRef.current = null;
    }
    closeTimerRef.current = window.setTimeout(() => {
      setMenuMounted(false);
      setSearchQuery('');
      setActiveCategory(null);
      setSubmenuTop(null);
      setSubmenuAnchorTop(null);
    }, 140);
  };

  const toggleMenu = () => {
    if (menuMounted && menuOpen) closeMenu();
    else openMenu();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'n' || e.key === 'N') {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) {
          return;
        }
        e.preventDefault();
        toggleMenu();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuMounted, menuOpen]);

  // Shortcuts: V = select, H = pan, ` = toggle log, Ctrl/⌘+Enter = run
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const isEditable =
        tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable;
      if (isEditable) return;

      if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        onModeChange('select');
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        onModeChange('pan');
      } else if (e.key === '`') {
        e.preventDefault();
        onToggleLog?.();
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (!pipelineRunning) onRunPipeline?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onModeChange, onRunPipeline, onToggleLog, pipelineRunning]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
      if (nodeDetailTimerRef.current) window.clearTimeout(nodeDetailTimerRef.current);
    };
  }, []);

  // Handle node item hover for detail popover
  const handleNodeItemHover = (node: NodeTypeConfig | null, element?: HTMLElement) => {
    if (nodeDetailTimerRef.current) {
      window.clearTimeout(nodeDetailTimerRef.current);
      nodeDetailTimerRef.current = null;
    }

    if (!node || !element) {
      setShowNodeDetail(false);
      nodeDetailTimerRef.current = window.setTimeout(() => {
        setHoveredNode(null);
        setHoveredNodeCategory(null);
      }, 150);
      return;
    }

    const rect = element.getBoundingClientRect();
    const popoverWidth = 320;
    const offset = 12;
    const screenMargin = 20;

    // Position to the right of the element
    let x = rect.right + offset;

    // Find the container to align BOTTOM with it (submenu or search results)
    const submenuEl = submenuPopoverRef.current;
    const searchEl = searchResultsRef.current;

    // Default: use bottom positioning from element bottom
    let bottomY = window.innerHeight - rect.bottom;

    if (submenuEl) {
      // When submenu is visible (category view), align with submenu bottom
      const submenuRect = submenuEl.getBoundingClientRect();
      bottomY = window.innerHeight - submenuRect.bottom;
    } else if (searchEl) {
      // When searching, align with search results container bottom
      const searchRect = searchEl.getBoundingClientRect();
      bottomY = window.innerHeight - searchRect.bottom;
    }

    // Horizontal: Adjust if going off screen to the right
    if (x + popoverWidth > window.innerWidth - screenMargin) {
      x = rect.left - popoverWidth - offset;
    }

    // Ensure x doesn't go off screen to the left
    if (x < screenMargin) {
      x = screenMargin;
    }

    // Ensure bottom doesn't go below the screen (minimum margin from bottom)
    if (bottomY < screenMargin) {
      bottomY = screenMargin;
    }

    setHoveredNode(node);
    setHoveredNodeCategory(node.category);
    setNodeDetailPosition({ x, y: bottomY }); // y now represents bottom offset
    setShowNodeDetail(true);
  };

  const query = normalizeQuery(searchQuery);
  const isSearching = query.length > 0;

  // Close detail popover when search query changes
  useEffect(() => {
    setShowNodeDetail(false);
    setHoveredNode(null);
    setHoveredNodeCategory(null);
  }, [searchQuery]);

  const dropdownWidthClass = 'w-[420px]';

  const nodesByCategory = categoryOrder.map((categoryId) => {
    const nodes = NODE_TYPES_BY_CATEGORY[categoryId] || [];
    const filtered = nodes.filter((n) => nodeMatchesQuery(n, query));
    return {
      categoryId,
      category: NODE_CATEGORIES[categoryId],
      nodes,
      filtered,
    };
  });

  const hoveredCategoryId = activeCategory;
  const hoveredCategory = hoveredCategoryId ? NODE_CATEGORIES[hoveredCategoryId] : null;
  const hoveredNodes = hoveredCategoryId ? NODE_TYPES_BY_CATEGORY[hoveredCategoryId] || [] : [];

  const openSubmenuFromTarget = (categoryId: NodeCategory, target: HTMLElement) => {
    setActiveCategory(categoryId);
    const wrapEl = submenuWrapRef.current;
    if (!wrapEl) {
      setSubmenuAnchorTop(8);
      return;
    }

    const wrapRect = wrapEl.getBoundingClientRect();
    const itemRect = target.getBoundingClientRect();
    const anchorTop = itemRect.top - wrapRect.top;
    setSubmenuAnchorTop(anchorTop);
  };

  useEffect(() => {
    if (!activeCategory || submenuAnchorTop === null) return;
    const wrapEl = submenuWrapRef.current;
    const popoverEl = submenuPopoverRef.current;
    if (!wrapEl || !popoverEl) return;

    const margin = 8;
    const wrapHeight = wrapEl.clientHeight;
    const popoverHeight = popoverEl.offsetHeight;
    const minTop = margin;
    const maxTop = Math.max(minTop, wrapHeight - popoverHeight - margin);
    const clampedTop = Math.min(Math.max(submenuAnchorTop, minTop), maxTop);
    setSubmenuTop(clampedTop);
  }, [activeCategory, submenuAnchorTop, hoveredNodes.length]);

  return (
    <Panel position="bottom-center">
      <TooltipProvider delayDuration={200}>
        <div
          className="animate-dock-in pointer-events-auto px-2 py-2 rounded-2xl shadow-[0_14px_44px_rgba(0,0,0,0.55)] glass-surface"
          style={{
            marginBottom: `calc(env(safe-area-inset-bottom) + 16px + ${logOpen ? LOG_PANEL_HEIGHT : 0}px)`,
            transition: 'margin-bottom 0.22s ease-in-out',
            borderColor:
              'color-mix(in srgb, var(--editor-accent) 22%, var(--editor-border-subtle))',
            boxShadow:
              '0 14px 44px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 0 1px var(--editor-accent-12)',
          }}
        >
          <div className="flex items-center gap-1.5">
            {/* New Node (single dropdown) */}
            <div className="relative">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleMenu}
                    className="motion-lift motion-press focus-ring-orange group flex items-center gap-2 pl-2 pr-2 py-1.5 rounded-xl border text-white/80 hover:text-white"
                    style={{
                      borderColor: menuOpen
                        ? 'var(--editor-accent-65)'
                        : 'var(--editor-border-subtle)',
                      background: menuOpen
                        ? 'color-mix(in srgb, var(--editor-accent) 10%, rgba(255,255,255,0.05))'
                        : 'rgba(255,255,255,0.03)',
                    }}
                  >
                    <span
                      className="grid place-items-center w-9 h-9 rounded-xl border"
                      style={{
                        borderColor: menuOpen ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.14)',
                        background: menuOpen ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
                      }}
                    >
                      <Plus size={18} className="text-white/85" />
                    </span>
                    <span className="text-[13px] font-medium font-[system-ui,sans-serif]">
                      New Node
                    </span>
                    <span
                      className="ml-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold tracking-wide border"
                      style={{
                        borderColor: 'rgba(255,255,255,0.14)',
                        color: 'rgba(255,255,255,0.6)',
                        background: 'rgba(255,255,255,0.04)',
                      }}
                    >
                      N
                    </span>
                    <ChevronDown
                      size={14}
                      className="ml-0.5 text-white/50 transition-transform"
                      style={{ transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <ShortcutTooltip label="New node" shortcut="N" />
                </TooltipContent>
              </Tooltip>

              {/* Dropdown */}
              {menuMounted && (
                <div
                  className={`absolute bottom-full left-1/2 mb-2 rounded-3xl p-3 ${dropdownWidthClass} max-w-[calc(100vw-32px)] z-[200] shadow-[0_18px_60px_rgba(0,0,0,0.62)] transition-all glass-surface-strong overflow-visible`}
                  style={{
                    background: 'var(--editor-surface-2)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    boxShadow: '0 18px 60px rgba(0,0,0,0.62), inset 0 1px 0 rgba(255,255,255,0.06)',
                    transformOrigin: 'bottom center',
                    opacity: menuOpen ? 1 : 0,
                    transform: menuOpen
                      ? 'translate(-50%, 0px) scale(1)'
                      : 'translate(-50%, 8px) scale(0.98)',
                    pointerEvents: menuOpen ? 'auto' : 'none',
                  }}
                >
                  {/* Header + Search */}
                  <div className="flex items-start justify-between gap-2 px-2 pt-0.5 pb-3">
                    <div>
                      <div className="text-[12px] font-semibold tracking-[0.16em] uppercase text-white/50 font-[system-ui,sans-serif]">
                        Add Node
                      </div>
                      <div className="text-[12px] text-white/30 mt-1">Search and pick a node</div>
                    </div>
                    <button
                      onClick={closeMenu}
                      className="motion-press focus-ring-orange grid place-items-center w-9 h-9 rounded-full border border-white/10 bg-white/5 text-white/60 hover:text-white/90 transition-colors cursor-pointer"
                      title="Close"
                      aria-label="Close node menu"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="px-2 pb-3">
                    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5">
                      <Search size={16} className="text-white/40" />
                      <input
                        ref={searchInputRef}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search nodes or models…"
                        className="flex-1 bg-transparent outline-none text-[14px] text-white/80 placeholder:text-white/25"
                      />
                      {searchQuery.length > 0 && (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            searchInputRef.current?.focus();
                          }}
                          className="motion-press focus-ring-orange grid place-items-center w-8 h-8 rounded-xl border border-white/10 bg-white/5 text-white/55 hover:text-white transition-colors cursor-pointer"
                          aria-label="Clear search"
                          title="Clear"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="px-2 pb-2">
                    {isSearching ? (
                      <div
                        ref={searchResultsRef}
                        className="addnode-scroll max-h-[320px] overflow-auto"
                        style={{
                          borderTop: '1px solid rgba(255,255,255,0.08)',
                          paddingTop: 10,
                        }}
                      >
                        <div className="flex flex-col gap-3">
                          {nodesByCategory
                            .filter((c) => c.filtered.length > 0)
                            .map(({ categoryId, category, filtered }) => (
                              <div key={categoryId}>
                                <div className="flex items-center gap-2 px-2 py-1 text-[12px] text-white/35">
                                  <span
                                    className="grid place-items-center w-6 h-6 rounded-lg border border-white/10 bg-white/4"
                                    style={{ color: category.color }}
                                  >
                                    {renderNodeCategoryIcon(categoryId as NodeCategory, {
                                      size: 14,
                                      className: 'text-current',
                                    })}
                                  </span>
                                  <span className="font-medium">{category.label}</span>
                                </div>

                                <div className="flex flex-col">
                                  {filtered.map((node) => {
                                    const providers = extractProvidersFromDescription(
                                      node.description,
                                    );
                                    const providerLabel = providers[0] ?? null;

                                    return (
                                      <button
                                        key={node.type}
                                        onClick={() => {
                                          onAddNode(node.type);
                                          closeMenu();
                                        }}
                                        onMouseEnter={(e) =>
                                          handleNodeItemHover(
                                            node as NodeTypeConfig,
                                            e.currentTarget,
                                          )
                                        }
                                        onMouseLeave={() => handleNodeItemHover(null)}
                                        onFocus={(e) =>
                                          handleNodeItemHover(
                                            node as NodeTypeConfig,
                                            e.currentTarget,
                                          )
                                        }
                                        onBlur={() => handleNodeItemHover(null)}
                                        className="motion-press focus-ring-orange group w-full flex items-center justify-between gap-3 px-2 py-2 rounded-xl text-left hover:bg-white/5 transition-colors cursor-pointer"
                                      >
                                        <span className="flex items-center gap-2.5 min-w-0">
                                          <span
                                            className="grid place-items-center w-8 h-8 rounded-xl"
                                            style={{
                                              color: category.color,
                                              background: 'rgba(255,255,255,0.03)',
                                            }}
                                          >
                                            {renderNodeTypeIcon(node.type as CustomNodeType, {
                                              size: 16,
                                              className: 'text-current',
                                            }) ?? <Plus size={16} className="text-current" />}
                                          </span>
                                          <span className="min-w-0">
                                            <span className="block text-[15px] font-medium text-white/90 truncate">
                                              {node.label}
                                            </span>
                                          </span>
                                        </span>

                                        <span className="flex items-center gap-2 shrink-0">
                                          {providerLabel && (
                                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border border-white/10 bg-white/5 text-white/50">
                                              {providerLabel}
                                            </span>
                                          )}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}

                          {nodesByCategory.every((c) => c.filtered.length === 0) && (
                            <div className="px-3 py-10 text-center">
                              <div className="text-white/50 text-[13px] font-medium">
                                No matches
                              </div>
                              <div className="text-white/30 text-[11px] mt-1">
                                Try a different keyword.
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div
                        className="relative"
                        ref={submenuWrapRef}
                        onMouseLeave={() => {
                          setActiveCategory(null);
                          setSubmenuTop(null);
                          setSubmenuAnchorTop(null);
                        }}
                      >
                        {/* Main menu list */}
                        <div
                          className="w-full rounded-2xl border border-white/10 overflow-hidden"
                          style={{
                            background: 'var(--editor-surface-1)',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                          }}
                        >
                          <div
                            ref={mainListScrollRef}
                            className="addnode-scroll max-h-[360px] overflow-auto px-2 py-2"
                          >
                            {nodesByCategory.map(({ categoryId, category, nodes }) => {
                              const isActive = categoryId === activeCategory;
                              const count = nodes.length;

                              return (
                                <button
                                  key={categoryId}
                                  type="button"
                                  onMouseEnter={(e) =>
                                    openSubmenuFromTarget(
                                      categoryId as NodeCategory,
                                      e.currentTarget,
                                    )
                                  }
                                  onFocus={(e) =>
                                    openSubmenuFromTarget(
                                      categoryId as NodeCategory,
                                      e.currentTarget,
                                    )
                                  }
                                  onClick={(e) =>
                                    openSubmenuFromTarget(
                                      categoryId as NodeCategory,
                                      e.currentTarget,
                                    )
                                  }
                                  className={`focus-ring-orange group w-full flex items-center justify-between gap-3 px-2 py-2 rounded-xl text-left transition-colors border cursor-pointer ${
                                    isActive
                                      ? 'bg-white/5 border-white/10'
                                      : 'bg-transparent border-transparent hover:bg-white/4'
                                  }`}
                                  aria-haspopup="menu"
                                  aria-expanded={isActive}
                                >
                                  <span className="flex items-center gap-2.5 min-w-0">
                                    <span
                                      className="grid place-items-center w-8 h-8 rounded-xl border border-white/10 bg-white/4"
                                      style={{ color: category.color }}
                                    >
                                      {renderNodeCategoryIcon(categoryId as NodeCategory, {
                                        size: 16,
                                        className: 'text-current',
                                      })}
                                    </span>
                                    <span className="min-w-0">
                                      <span className="block text-[14px] font-semibold text-white/90 truncate">
                                        {category.label}
                                      </span>
                                      <span className="block text-[11px] text-white/35 truncate">
                                        {count} node{count === 1 ? '' : 's'}
                                      </span>
                                    </span>
                                  </span>
                                  <ChevronRight
                                    size={16}
                                    className={`text-white/20 transition-transform ${
                                      isActive ? 'translate-x-0.5' : 'group-hover:translate-x-0.5'
                                    }`}
                                  />
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Detached submenu popover */}
                        <div
                          className="absolute left-full ml-0 w-[300px] rounded-2xl border border-white/10 overflow-hidden"
                          ref={submenuPopoverRef}
                          style={{
                            background: 'var(--editor-surface-1)',
                            boxShadow:
                              '0 18px 60px rgba(0,0,0,0.52), inset 0 1px 0 rgba(255,255,255,0.05)',
                            top: submenuTop ?? 8,
                            maxHeight: '315px',
                            opacity: hoveredCategoryId ? 1 : 0,
                            transform: hoveredCategoryId ? 'translateX(0px)' : 'translateX(-6px)',
                            transitionProperty: 'opacity, transform',
                            transitionDuration: 'var(--motion-fast)',
                            transitionTimingFunction: 'var(--motion-ease-out)',
                            pointerEvents: hoveredCategoryId ? 'auto' : 'none',
                          }}
                          role="menu"
                          aria-label="Node options"
                        >
                          <div className="px-3 pt-3 pb-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <div className="text-[11px] font-medium tracking-[0.12em] uppercase text-white/35">
                                  {hoveredCategoryId ? 'Select node' : '—'}
                                </div>
                                <div className="text-[14px] font-semibold text-white/90 mt-1 truncate">
                                  {hoveredCategory ? hoveredCategory.label : 'Hover a category'}
                                </div>
                              </div>
                              {hoveredCategoryId && hoveredCategory && (
                                <span
                                  className="grid place-items-center w-8 h-8 rounded-xl border border-white/10 bg-white/4 shrink-0"
                                  style={{ color: hoveredCategory.color }}
                                >
                                  {renderNodeCategoryIcon(hoveredCategoryId, {
                                    size: 16,
                                    className: 'text-current',
                                  })}
                                </span>
                              )}
                            </div>
                          </div>

                          <div
                            className="addnode-scroll max-h-[250px] overflow-auto px-2 pb-2"
                            style={{
                              borderTop: '1px solid rgba(255,255,255,0.08)',
                              background: 'var(--editor-surface-0)',
                            }}
                          >
                            {hoveredCategoryId && (
                              <div className="py-2">
                                <div className="flex flex-col">
                                  {hoveredNodes.map((node) => (
                                    <button
                                      key={node.type}
                                      onClick={() => {
                                        onAddNode(node.type);
                                        closeMenu();
                                      }}
                                      onMouseEnter={(e) =>
                                        handleNodeItemHover(node as NodeTypeConfig, e.currentTarget)
                                      }
                                      onMouseLeave={() => handleNodeItemHover(null)}
                                      onFocus={(e) =>
                                        handleNodeItemHover(node as NodeTypeConfig, e.currentTarget)
                                      }
                                      onBlur={() => handleNodeItemHover(null)}
                                      className="motion-press focus-ring-orange group w-full flex items-center justify-between gap-3 px-2 py-2 rounded-xl text-left hover:bg-white/5 transition-colors cursor-pointer"
                                    >
                                      <span className="flex items-center gap-2.5 min-w-0">
                                        <span
                                          className="grid place-items-center w-8 h-8 rounded-xl border border-white/10 bg-white/4"
                                          style={{
                                            color:
                                              hoveredCategory?.color || 'rgba(255,255,255,0.75)',
                                          }}
                                        >
                                          {renderNodeTypeIcon(node.type as CustomNodeType, {
                                            size: 16,
                                            className: 'text-current',
                                          }) ?? <Plus size={16} className="text-current" />}
                                        </span>
                                        <span className="min-w-0">
                                          <span className="block text-[15px] font-medium text-white/90 truncate">
                                            {node.label}
                                          </span>
                                        </span>
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-7 bg-white/10 mx-1" />

            {/* Mode icons */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onModeChange('select')}
                  aria-label="Select mode"
                  className="motion-lift motion-press focus-ring-orange grid place-items-center w-10 h-10 rounded-xl border relative"
                  style={{
                    borderColor:
                      mode === 'select' ? 'var(--editor-accent-65)' : 'rgba(255,255,255,0.16)',
                    background:
                      mode === 'select' ? 'var(--editor-accent-14)' : 'rgba(255,255,255,0.03)',
                    color: mode === 'select' ? 'var(--editor-accent)' : 'rgba(255,255,255,0.65)',
                    boxShadow:
                      mode === 'select'
                        ? '0 0 0 2px var(--editor-accent-12)'
                        : '0 0 0 0 rgba(0,0,0,0)',
                  }}
                >
                  <MousePointer2 size={18} />
                  <span className="absolute -bottom-1 -right-1 text-[8px] font-bold leading-none px-1 py-px rounded bg-[rgba(0,0,0,0.55)] border border-white/10 text-white/50">
                    V
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <ShortcutTooltip label="Select" shortcut="V" />
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onModeChange('pan')}
                  aria-label="Pan mode"
                  className="motion-lift motion-press focus-ring-orange grid place-items-center w-10 h-10 rounded-xl border relative"
                  style={{
                    borderColor:
                      mode === 'pan' ? 'var(--editor-accent-65)' : 'rgba(255,255,255,0.16)',
                    background:
                      mode === 'pan' ? 'var(--editor-accent-14)' : 'rgba(255,255,255,0.03)',
                    color: mode === 'pan' ? 'var(--editor-accent)' : 'rgba(255,255,255,0.65)',
                    boxShadow:
                      mode === 'pan'
                        ? '0 0 0 2px var(--editor-accent-12)'
                        : '0 0 0 0 rgba(0,0,0,0)',
                  }}
                >
                  <Hand size={18} />
                  <span className="absolute -bottom-1 -right-1 text-[8px] font-bold leading-none px-1 py-px rounded bg-[rgba(0,0,0,0.55)] border border-white/10 text-white/50">
                    H
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <ShortcutTooltip label="Pan" shortcut="H" />
              </TooltipContent>
            </Tooltip>

            {/* Log toggle */}
            {onToggleLog && (
              <>
                <div className="w-px h-7 bg-white/10 mx-1" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={onToggleLog}
                      aria-label="Toggle log panel"
                      className="motion-lift motion-press focus-ring-orange flex items-center gap-2 pl-2.5 pr-3.5 py-1.5 rounded-xl border"
                      style={{
                        borderColor: logOpen
                          ? 'rgba(139, 92, 246, 0.65)'
                          : 'rgba(255,255,255,0.16)',
                        background: logOpen ? 'rgba(139, 92, 246, 0.14)' : 'rgba(255,255,255,0.03)',
                        color: logOpen ? 'rgba(139, 92, 246, 1)' : 'rgba(255,255,255,0.65)',
                        boxShadow: logOpen
                          ? '0 0 0 2px rgba(139, 92, 246, 0.12)'
                          : '0 0 0 0 rgba(0,0,0,0)',
                        cursor: 'pointer',
                      }}
                    >
                      <span
                        className="relative grid place-items-center w-7 h-7 rounded-lg border"
                        style={{
                          borderColor: logOpen
                            ? 'rgba(139, 92, 246, 0.45)'
                            : 'rgba(255,255,255,0.12)',
                          background: logOpen
                            ? 'rgba(139, 92, 246, 0.12)'
                            : 'rgba(255,255,255,0.03)',
                        }}
                      >
                        <ScrollText size={14} />
                        {logCount > 0 && (
                          <span
                            className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center"
                            style={{
                              background:
                                logErrorCount > 0 ? 'rgb(239, 68, 68)' : 'rgba(139, 92, 246, 0.9)',
                              color: 'white',
                            }}
                          >
                            {logCount > 99 ? '99+' : logCount}
                          </span>
                        )}
                      </span>
                      <span className="text-[13px] font-semibold font-[system-ui,sans-serif]">
                        Logs
                        {logCount > 0 && !logOpen ? ` (${logCount > 99 ? '99+' : logCount})` : ''}
                      </span>
                      <KbdBadge>` </KbdBadge>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <ShortcutTooltip label="Toggle logs" shortcut="`" />
                  </TooltipContent>
                </Tooltip>
              </>
            )}

            {/* Spacer — pushes Run + Log to the far right */}
            {onRunPipeline && <div className="flex-1" />}

            {/* Divider */}
            {onRunPipeline && <div className="w-px h-7 bg-white/10 mx-1" />}

            {/* Run */}
            {onRunPipeline && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onRunPipeline}
                    disabled={pipelineRunning}
                    aria-label="Run pipeline"
                    className="motion-lift motion-press focus-ring-orange flex items-center gap-2 pl-2.5 pr-3.5 py-1.5 rounded-xl border"
                    style={{
                      borderColor: pipelineRunning
                        ? 'rgba(255,255,255,0.14)'
                        : 'var(--editor-accent-75)',
                      background: pipelineRunning
                        ? 'rgba(255,255,255,0.03)'
                        : 'var(--editor-accent-16)',
                      color: pipelineRunning ? 'rgba(255,255,255,0.55)' : 'var(--editor-accent)',
                      cursor: pipelineRunning ? 'not-allowed' : 'pointer',
                      boxShadow: pipelineRunning ? 'none' : '0 10px 26px rgba(0,0,0,0.25)',
                    }}
                  >
                    <span
                      className="grid place-items-center w-7 h-7 rounded-lg border"
                      style={{
                        borderColor: pipelineRunning
                          ? 'rgba(255,255,255,0.10)'
                          : 'var(--editor-accent-45)',
                        background: pipelineRunning
                          ? 'rgba(255,255,255,0.03)'
                          : 'var(--editor-accent-12)',
                      }}
                    >
                      {pipelineRunning ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Play size={14} />
                      )}
                    </span>
                    <span className="text-[13px] font-semibold font-[system-ui,sans-serif]">
                      {pipelineRunning ? 'Running…' : 'Run'}
                    </span>
                    {!pipelineRunning && <KbdBadge>⌘↵</KbdBadge>}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <ShortcutTooltip label="Run pipeline" shortcut="⌘↵" />
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </TooltipProvider>

      {/* Click outside to close */}
      {menuMounted && (
        <div
          className="fixed inset-0 z-50"
          onClick={closeMenu}
          style={{
            background: 'transparent',
            pointerEvents: menuOpen ? 'auto' : 'none',
          }}
        />
      )}

      {/* Node Detail Popover - Rendered via Portal */}
      {createPortal(
        <NodeDetailPopover
          node={hoveredNode}
          category={hoveredNodeCategory}
          visible={showNodeDetail}
          position={nodeDetailPosition}
        />,
        document.body,
      )}
    </Panel>
  );
}
