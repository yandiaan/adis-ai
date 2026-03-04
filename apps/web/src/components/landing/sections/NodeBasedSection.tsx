import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import {
  Type,
  Sparkles,
  Image,
  SlidersHorizontal,
  ArrowRight,
} from 'lucide-react';
import type { SectionProps } from './sectionsConfig';

// Static node data matching CompactNode exact visual (no @xyflow deps)
const previewNodes = [
  {
    type: 'textPrompt',
    title: 'Text Prompt',
    subtitle: 'Input your idea',
    Icon: Type,
    category: 'input',
    color: '#4ade80',
    bgColor: 'rgba(74, 222, 128, 0.1)',
    borderColor: 'rgba(74, 222, 128, 0.5)',
    outputColor: '#4ade80',
    fields: [
      { label: 'text', value: 'Generate a greeting card...' },
      { label: 'style', value: 'festive, warm' },
    ],
    inPort: false,
    outPort: true,
  },
  {
    type: 'promptEnhancer',
    title: 'Prompt Enhancer',
    subtitle: 'Transform & refine',
    Icon: Sparkles,
    category: 'textStyle',
    color: '#a78bfa',
    bgColor: 'rgba(167, 139, 250, 0.1)',
    borderColor: 'rgba(167, 139, 250, 0.5)',
    outputColor: '#a78bfa',
    fields: [
      { label: 'creativity', value: 'creative' },
      { label: 'mode', value: 'wishes' },
    ],
    inPort: true,
    outPort: true,
  },
  {
    type: 'imageGenerator',
    title: 'Image Generator',
    subtitle: 'Generate output',
    Icon: Image,
    category: 'generate',
    color: '#60a5fa',
    bgColor: 'rgba(96, 165, 250, 0.1)',
    borderColor: 'rgba(96, 165, 250, 0.5)',
    outputColor: '#60a5fa',
    fields: [
      { label: 'model', value: 'flux-dev' },
      { label: 'resolution', value: '1024x1024' },
    ],
    inPort: true,
    outPort: false,
  },
];

// Wire connector between two nodes — matches the color gradient of the source→target
function WireConnector({
  fromColor,
  toColor,
  delay,
  inView,
}: {
  fromColor: string;
  toColor: string;
  delay: number;
  inView: boolean;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 });
    gsap.set(dotRef.current, { x: 0, y: 35, opacity: 0 });
  }, []);

  useEffect(() => {
    const path = pathRef.current;
    const dot = dotRef.current;
    if (!inView || !path || !dot) return;

    // Draw the path
    const len = path.getTotalLength();
    gsap.to(path, { strokeDashoffset: 0, opacity: 1, duration: 0.6, delay, ease: 'power2.out' });

    // Animate the traveling dot
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.5, delay: delay + 0.4 });
    tl.set(dot, { x: 0, y: 35, opacity: 0 })
      .to(dot, { x: 20, y: 35, opacity: 1, duration: 0.6, ease: 'sine.out' })
      .to(dot, { x: 40, y: 35, opacity: 0, duration: 0.6, ease: 'sine.in' });

    return () => { tl.kill(); gsap.killTweensOf(path); gsap.killTweensOf(dot); };
  }, [inView, delay]);

  return (
    <div className="flex items-center justify-center w-10 shrink-0 relative" style={{ height: 70 }}>
      <svg
        viewBox="0 0 40 70"
        className="w-full h-full overflow-visible"
        fill="none"
      >
        <defs>
          <linearGradient id={`wire-${fromColor.replace('#', '')}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={fromColor} stopOpacity="0.7" />
            <stop offset="100%" stopColor={toColor} stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <path
          ref={pathRef}
          d="M 0 35 C 12 35, 28 35, 40 35"
          stroke={`url(#wire-${fromColor.replace('#', '')})`}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle
          ref={dotRef}
          r="3"
          fill={toColor}
          style={{ opacity: 0 }}
        />
      </svg>
    </div>
  );
}

// Static node card that exactly mirrors CompactNode's visual structure
function StaticNode({
  node,
  index,
  inView,
}: {
  node: (typeof previewNodes)[0];
  index: number;
  inView: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.set(ref.current, { opacity: 0, y: 20, scale: 0.96 });
  }, []);

  useEffect(() => {
    if (!inView || !ref.current) return;
    gsap.to(ref.current, { opacity: 1, y: 0, scale: 1, duration: 0.55, delay: 0.2 + index * 0.12, ease: 'power3.out' });
  }, [inView, index]);

  return (
    <div
      ref={ref}
      className="relative rounded-xl overflow-visible flex-1 min-w-0 shrink-0"
      style={{
        background: 'var(--color-surface-node)',
        border: `2px solid ${node.borderColor}`,
        boxShadow: '0 10px 30px rgba(0,0,0,0.34)',
        maxWidth: 200,
        minWidth: 150,
      }}
    >
      {/* Input port */}
      {node.inPort && (
        <div
          className="absolute -left-2 top-1/2 -translate-y-1/2 size-3 rounded-full"
          style={{
            background: 'var(--color-surface-node)',
            border: `2px solid ${node.borderColor}`,
            zIndex: 10,
          }}
        />
      )}

      {/* Header — matches CompactNode header exactly */}
      <div className="flex items-center gap-2.5 px-3.5 py-3" style={{ backgroundColor: node.bgColor }}>
        <span className="grid place-items-center size-7 rounded-lg bg-white/5 border border-white/10 shrink-0">
          <node.Icon size={14} className="text-white/85" />
        </span>
        <div className="flex-1 min-w-0">
          <div
            className="text-[11px] font-semibold tracking-tight whitespace-nowrap overflow-hidden text-ellipsis"
            style={{ color: node.color }}
          >
            {node.title}
          </div>
          <div className="text-white/40 text-[9px] whitespace-nowrap overflow-hidden text-ellipsis">
            {node.subtitle}
          </div>
        </div>
      </div>

      {/* Fields preview — matches CompactNode content area */}
      <div
        className="px-3.5 py-2.5 space-y-1.5"
        style={{ borderTop: `1px solid ${node.borderColor}` }}
      >
        {node.fields.map((f) => (
          <div key={f.label} className="flex items-center gap-1.5">
            <span className="text-white/35 text-[8px] font-medium capitalize w-12 shrink-0">
              {f.label}
            </span>
            <div className="flex-1 h-4 rounded bg-white/5 border border-white/5 px-1.5 flex items-center overflow-hidden">
              <span className="text-white/30 text-[7px] truncate">{f.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Output port */}
      {node.outPort && (
        <div
          className="absolute -right-2 top-1/2 -translate-y-1/2 size-3 rounded-full"
          style={{
            background: 'var(--color-surface-node)',
            border: `2px solid ${node.borderColor}`,
            zIndex: 10,
          }}
        />
      )}
    </div>
  );
}

export function NodeBasedSection({ onGetStarted }: SectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLDivElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setInView(true); observer.unobserve(el); }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    gsap.set(headerRef.current, { opacity: 0, y: -14 });
    gsap.set(legendRef.current, { opacity: 0 });
    gsap.set(pillsRef.current, { opacity: 0 });
    gsap.set(ctaRef.current, { opacity: 0, y: 8 });
  }, []);

  useEffect(() => {
    if (!inView) return;
    gsap.to(headerRef.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
    gsap.to(legendRef.current, { opacity: 1, duration: 0.5, delay: 0.8, ease: 'power2.out' });
    gsap.to(pillsRef.current, { opacity: 1, duration: 0.5, delay: 0.9, ease: 'power2.out' });
    gsap.to(ctaRef.current, { opacity: 1, y: 0, duration: 0.5, delay: 1.0, ease: 'power2.out' });
  }, [inView]);

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-surface-node">
      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Category glow accents */}
      <div className="absolute top-10 left-10 w-64 h-64 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(74,222,128,0.05) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="absolute bottom-10 right-10 w-64 h-64 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(96,165,250,0.05) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      <div ref={ref} className="relative z-10 flex flex-col h-full px-5 py-5">
        {/* Header */}
        <div
          ref={headerRef}
          className="text-center mb-5 shrink-0"
        >
          <p className="text-white/30 text-[9px] font-bold tracking-[0.2em] uppercase mb-2">Visual Programming</p>
          <h2 className="text-3xl font-black text-white leading-tight tracking-tight uppercase">Node Based System</h2>
          <p className="text-slate-500 text-[10px] mt-2 max-w-xs mx-auto">
            Connect intelligent building blocks to create powerful AI pipelines.
          </p>
        </div>

        {/* Pipeline preview */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4 min-h-0">
          {/* Node row with wires */}
          <div className="flex items-center justify-center gap-0 w-full px-2">
            {previewNodes.map((node, i) => (
              <div key={node.type} className="flex items-center">
                <StaticNode node={node} index={i} inView={inView} />
                {i < previewNodes.length - 1 && (
                  <WireConnector
                    fromColor={previewNodes[i].color}
                    toColor={previewNodes[i + 1].color}
                    delay={0.3 + i * 0.15}
                    inView={inView}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Category legend */}
          <div
            ref={legendRef}
            className="flex items-center justify-center gap-3 flex-wrap"
          >
            {[
              { label: 'Input', color: '#4ade80' },
              { label: 'Transform', color: '#a78bfa' },
              { label: 'Generate', color: '#60a5fa' },
              { label: 'Compose', color: '#f59e0b' },
              { label: 'Output', color: '#f87171' },
            ].map((cat) => (
              <div key={cat.label} className="flex items-center gap-1">
                <div className="size-1.5 rounded-full" style={{ background: cat.color }} />
                <span className="text-[8px] font-medium text-white/30">{cat.label}</span>
              </div>
            ))}
          </div>

          {/* Feature pills */}
          <div
            ref={pillsRef}
            className="flex items-center justify-center gap-2 flex-wrap"
          >
            {['Drag & Drop', 'Auto-connect', 'Type Safety', '10+ Node Types'].map((tag) => (
              <span key={tag} className="text-white/30 text-[8px] font-medium bg-white/5 rounded-full px-2.5 py-1 border border-white/5">{tag}</span>
            ))}
          </div>

          {/* CTA */}
          <div ref={ctaRef}>
            <button
              onClick={onGetStarted}
              className="cursor-pointer bg-primary text-white font-bold text-[9px] px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1"
            >
              Try the Editor
              <ArrowRight size={10} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}