import { useEffect, useRef, useState } from 'react';
import { Panel } from '@xyflow/react';
import { NODE_CATEGORIES, NODE_TYPES_BY_CATEGORY } from './config/nodeCategories';
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
  Search,
  X,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import type { NodeCategory } from './types/node-types';
import { renderNodeTypeIcon } from './icons/nodeTypeIcon';
import { renderNodeCategoryIcon } from './icons/nodeCategoryIcon';

type Props = {
  mode: MouseMode;
  onModeChange: (mode: MouseMode) => void;
  onAddNode: (type: CustomNodeType) => void;
  onRunPipeline?: () => void;
  pipelineRunning?: boolean;
};

const categoryOrder: (keyof typeof NODE_CATEGORIES)[] = [
  'input',
  'transform',
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

export function FlowToolbar({
  mode,
  onModeChange,
  onAddNode,
  onRunPipeline,
  pipelineRunning = false,
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

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  const query = normalizeQuery(searchQuery);
  const isSearching = query.length > 0;

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
          className="animate-dock-in pointer-events-auto mb-4 px-2 py-2 rounded-2xl shadow-[0_14px_44px_rgba(0,0,0,0.55)] glass-surface"
          style={{
            marginBottom: 'calc(env(safe-area-inset-bottom) + 16px)',
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
                <TooltipContent side="top">New node</TooltipContent>
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
                        className="addnode-scroll max-h-[460px] overflow-auto"
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
                            className="addnode-scroll max-h-[460px] overflow-auto px-2 py-2"
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
                          className="absolute left-full ml-2 w-[300px] rounded-2xl border border-white/10 overflow-hidden"
                          ref={submenuPopoverRef}
                          style={{
                            background: 'var(--editor-surface-1)',
                            boxShadow:
                              '0 18px 60px rgba(0,0,0,0.52), inset 0 1px 0 rgba(255,255,255,0.05)',
                            top: submenuTop ?? 8,
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
                            className="addnode-scroll max-h-[460px] overflow-auto px-2 pb-2"
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
                  className="motion-lift motion-press focus-ring-orange grid place-items-center w-10 h-10 rounded-xl border"
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
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Select</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onModeChange('pan')}
                  aria-label="Pan mode"
                  className="motion-lift motion-press focus-ring-orange grid place-items-center w-10 h-10 rounded-xl border"
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
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Pan</TooltipContent>
            </Tooltip>

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
                    className="motion-lift motion-press focus-ring-orange grid place-items-center w-11 h-11 rounded-2xl border"
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
                    {pipelineRunning ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Play size={18} />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {pipelineRunning ? 'Running…' : 'Run Pipeline'}
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
    </Panel>
  );
}
