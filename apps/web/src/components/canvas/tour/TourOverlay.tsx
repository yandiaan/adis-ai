import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import type { TourStep } from './tourSteps';
import type { Node } from '@xyflow/react';

const TOOLTIP_WIDTH_MAX = 360;
const SPOTLIGHT_PADDING = 12;
const TOOLTIP_GAP = 16;

function getTooltipWidth() {
  if (typeof window === 'undefined') return TOOLTIP_WIDTH_MAX;
  return Math.min(TOOLTIP_WIDTH_MAX, window.innerWidth - 32);
}

interface SpotlightRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface TooltipPos {
  x: number;
  y: number;
}

function resolveTargetElement(step: TourStep, nodes: Node[]): Element | null {
  // Priority 1: match first canvas node by type list
  if (step.targetNodeTypes && step.targetNodeTypes.length > 0) {
    for (const nodeType of step.targetNodeTypes) {
      const match = nodes.find((n) => n.type === nodeType);
      if (match) {
        const el = document.querySelector(`.react-flow__node[data-id="${match.id}"]`);
        if (el) return el;
      }
    }
    return null;
  }
  // Priority 2: fixed CSS selector (toolbar buttons, sidebar, etc.)
  if (step.targetSelector) {
    return document.querySelector(step.targetSelector);
  }
  return null;
}

function computeLayout(
  el: Element | null,
  placement: TourStep['placement'],
  tooltipHeight: number,
  tooltipWidth: number,
): { spotlight: SpotlightRect | null; tooltip: TooltipPos } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const margin = 16;

  if (!el || placement === 'center') {
    return {
      spotlight: null,
      tooltip: { x: vw / 2 - tooltipWidth / 2, y: vh / 2 - tooltipHeight / 2 },
    };
  }

  const rect = el.getBoundingClientRect();
  const p = SPOTLIGHT_PADDING;
  const spotlight: SpotlightRect = {
    left: rect.left - p,
    top: rect.top - p,
    width: rect.width + p * 2,
    height: rect.height + p * 2,
  };

  let x = 0;
  let y = 0;

  switch (placement) {
    case 'top':
      x = rect.left + rect.width / 2 - tooltipWidth / 2;
      y = spotlight.top - TOOLTIP_GAP - tooltipHeight;
      break;
    case 'bottom':
      x = rect.left + rect.width / 2 - tooltipWidth / 2;
      y = spotlight.top + spotlight.height + TOOLTIP_GAP;
      break;
    case 'right':
      x = spotlight.left + spotlight.width + TOOLTIP_GAP;
      y = rect.top + rect.height / 2 - tooltipHeight / 2;
      break;
    case 'left':
      x = spotlight.left - TOOLTIP_GAP - tooltipWidth;
      y = rect.top + rect.height / 2 - tooltipHeight / 2;
      break;
  }

  x = Math.max(margin, Math.min(x, vw - tooltipWidth - margin));
  y = Math.max(margin, Math.min(y, vh - tooltipHeight - margin));

  return { spotlight, tooltip: { x, y } };
}

interface Props {
  step: TourStep | null;
  stepIndex: number;
  totalSteps: number;
  nodes: Node[];
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

export function TourOverlay({ step, stepIndex, totalSteps, nodes, onNext, onPrev, onSkip }: Props) {
  const [mounted, setMounted] = useState(false);
  const [layout, setLayout] = useState<{
    spotlight: SpotlightRect | null;
    tooltip: TooltipPos;
  } | null>(null);
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
  const [tooltipWidth, setTooltipWidth] = useState(TOOLTIP_WIDTH_MAX);
  const [isMobile, setIsMobile] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const updateLayout = useCallback(() => {
    if (!step) return;
    const tw = getTooltipWidth();
    setTooltipWidth(tw);
    const tooltipHeight = tooltipRef.current?.offsetHeight ?? 220;
    const el = resolveTargetElement(step, nodes);

    if (step.targetNodeTypes && step.targetNodeTypes.length > 0) {
      const matched = nodes.find((n) => step.targetNodeTypes!.includes(n.type ?? ''));
      setHighlightedNodeId(matched?.id ?? null);
    } else {
      setHighlightedNodeId(null);
    }

    setLayout(computeLayout(el, step.placement, tooltipHeight, tw));
  }, [step, nodes]);

  // Double RAF: first lets React commit DOM, second measures height
  useEffect(() => {
    if (!mounted) return;
    const r1 = requestAnimationFrame(() => {
      const r2 = requestAnimationFrame(updateLayout);
      return () => cancelAnimationFrame(r2);
    });
    return () => cancelAnimationFrame(r1);
  }, [mounted, step?.id, updateLayout]);

  useEffect(() => {
    if (!mounted) return;
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, [mounted, updateLayout]);

  // Keyboard navigation
  useEffect(() => {
    if (!mounted || !step) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') onNext();
      else if (e.key === 'ArrowLeft') onPrev();
      else if (e.key === 'Escape') onSkip();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mounted, step, onNext, onPrev, onSkip]);

  if (!mounted || !step) return null;

  const { spotlight, tooltip } = layout ?? {
    spotlight: null,
    tooltip: { x: window.innerWidth / 2 - tooltipWidth / 2, y: window.innerHeight / 2 - 110 },
  };

  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;
  const isNodeStep = !!highlightedNodeId;

  return createPortal(
    <div className="fixed inset-0" style={{ zIndex: 9998 }}>
      {/* Dim overlay: 4-rect spotlight cutout or full screen */}
      {spotlight ? (
        <>
          <div
            className="absolute"
            style={{
              top: 0,
              left: 0,
              right: 0,
              height: Math.max(0, spotlight.top),
              background: 'rgba(0,0,0,0.65)',
            }}
            onClick={onSkip}
          />
          <div
            className="absolute"
            style={{
              top: spotlight.top,
              left: 0,
              width: Math.max(0, spotlight.left),
              height: spotlight.height,
              background: 'rgba(0,0,0,0.65)',
            }}
            onClick={onSkip}
          />
          <div
            className="absolute"
            style={{
              top: spotlight.top,
              left: spotlight.left + spotlight.width,
              right: 0,
              height: spotlight.height,
              background: 'rgba(0,0,0,0.65)',
            }}
            onClick={onSkip}
          />
          <div
            className="absolute"
            style={{
              top: spotlight.top + spotlight.height,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.65)',
            }}
            onClick={onSkip}
          />

          {/* Spotlight highlight ring */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: spotlight.left,
              top: spotlight.top,
              width: spotlight.width,
              height: spotlight.height,
              borderRadius: isNodeStep ? 14 : 10,
              border: '2px solid rgba(249,115,22,0.8)',
              boxShadow: isNodeStep
                ? '0 0 0 4px rgba(249,115,22,0.12), 0 0 40px rgba(249,115,22,0.3), inset 0 0 24px rgba(249,115,22,0.06)'
                : '0 0 0 2px rgba(249,115,22,0.12)',
              animation: isNodeStep ? 'tour-pulse 2s ease-in-out infinite' : 'none',
              transition: 'all 0.3s ease',
            }}
          />
        </>
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(0,0,0,0.65)' }}
          onClick={onSkip}
        />
      )}

      <style>{`
        @keyframes tour-pulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(249,115,22,0.12), 0 0 40px rgba(249,115,22,0.3); }
          50%       { box-shadow: 0 0 0 8px rgba(249,115,22,0.08), 0 0 60px rgba(249,115,22,0.45); }
        }
      `}</style>

      {/* Tooltip card */}
      <div
        ref={tooltipRef}
        className="absolute pointer-events-auto"
        style={{
          left: tooltip.x,
          top: tooltip.y,
          width: tooltipWidth,
          zIndex: 9999,
          transition: 'top 0.28s cubic-bezier(0.4,0,0.2,1), left 0.28s cubic-bezier(0.4,0,0.2,1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(14,14,18,0.98)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(28px)',
            boxShadow: '0 28px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)',
          }}
        >
          {/* Orange top accent */}
          <div
            style={{
              height: 3,
              background: 'linear-gradient(90deg, #f97316 0%, #fb923c 50%, transparent 100%)',
            }}
          />

          {/* Header */}
          <div className="flex items-start justify-between px-5 pt-4 pb-2">
            <h3 className="text-white text-[15px] font-semibold leading-snug pr-3">{step.title}</h3>
            <button
              onClick={onSkip}
              className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-white/35 hover:text-white/80 hover:bg-white/8 transition-colors"
              aria-label="Tutup tur"
            >
              <X size={14} />
            </button>
          </div>

          {/* Node indicator badge */}
          {isNodeStep && (
            <div className="px-5 pb-2">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                style={{
                  background: 'rgba(249,115,22,0.1)',
                  color: '#fb923c',
                  border: '1px solid rgba(249,115,22,0.22)',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full bg-orange-400"
                  style={{ animation: 'tour-pulse 1.5s ease-in-out infinite' }}
                />
                Node disorot di canvas
              </span>
            </div>
          )}

          {/* Description */}
          <div className="px-5 pb-4">
            <p className="text-white/58 text-[13px] leading-relaxed">{step.description}</p>
          </div>

          {/* Footer */}
          <div
            className="px-5 py-3 flex items-center justify-between gap-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
          >
            {/* Progress dots */}
            <div className="flex items-center gap-1.5 shrink-0">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <span
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === stepIndex ? 20 : 6,
                    height: 6,
                    background:
                      i === stepIndex
                        ? '#f97316'
                        : i < stepIndex
                          ? 'rgba(249,115,22,0.38)'
                          : 'rgba(255,255,255,0.14)',
                  }}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2">
              {!isFirst && (
                <button
                  onClick={onPrev}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-[12px] font-medium text-white/50 hover:text-white/80 transition-colors border border-white/10 hover:bg-white/5"
                >
                  <ChevronLeft size={13} />
                  Kembali
                </button>
              )}
              <button
                onClick={onNext}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold text-white transition-all active:scale-95"
                style={{ background: isLast ? '#16a34a' : '#f97316' }}
              >
                {isLast ? 'Selesai ✓' : 'Lanjut'}
                {!isLast && <ChevronRight size={13} />}
              </button>
            </div>
          </div>
        </div>

        {/* Keyboard hint — desktop only */}
        {!isMobile && (
          <div className="text-center mt-2">
            <span className="text-white/22 text-[11px] select-none">
              {stepIndex + 1} / {totalSteps} · Esc untuk lewati · ← → untuk navigasi
            </span>
          </div>
        )}
        {/* Mobile step counter */}
        {isMobile && (
          <div className="text-center mt-2">
            <span className="text-white/22 text-[11px] select-none">
              {stepIndex + 1} / {totalSteps}
            </span>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
