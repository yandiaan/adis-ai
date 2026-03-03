import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import {
  Wand2,
  Smile,
  Sparkles,
  User2,
  Plus,
  Type,
  ImageUp,
  LayoutTemplate,
  SlidersHorizontal,
  Image,
  TextCursorInput,
  Eye,
  Download,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import type { SectionProps } from './sectionsConfig';

// Node type metadata (mirrors nodeCategories + nodeTypeIcon)
const NODE_META: Record<string, { label: string; Icon: React.ComponentType<{ size?: number; className?: string }>; color: string }> = {
  templatePreset: { label: 'Preset', Icon: LayoutTemplate, color: '#4ade80' },
  textPrompt:     { label: 'Prompt', Icon: Type,           color: '#4ade80' },
  imageUpload:    { label: 'Image',  Icon: ImageUp,         color: '#4ade80' },
  promptEnhancer: { label: 'Enhance',Icon: Sparkles,        color: '#a78bfa' },
  styleConfig:    { label: 'Style',  Icon: SlidersHorizontal, color: '#a78bfa' },
  imageGenerator: { label: 'Gen',    Icon: Image,           color: '#60a5fa' },
  textOverlay:    { label: 'Overlay',Icon: TextCursorInput, color: '#f59e0b' },
  preview:        { label: 'Preview',Icon: Eye,             color: '#f87171' },
  export:         { label: 'Export', Icon: Download,        color: '#f87171' },
};

const templates = [
  {
    id: 'ramadan-wishes',
    name: 'Ramadan Wishes',
    description: 'Generate beautiful Islamic-themed Ramadan greeting cards',
    Icon: Wand2,
    accent: '#34d399',
    category: 'Seasonal',
    pipeline: ['templatePreset', 'textPrompt', 'promptEnhancer', 'imageGenerator', 'textOverlay', 'export'],
  },
  {
    id: 'holiday-meme',
    name: 'Holiday Meme',
    description: 'Create festive memes with customizable text overlays',
    Icon: Smile,
    accent: '#f59e0b',
    category: 'Seasonal',
    pipeline: ['textPrompt', 'promptEnhancer', 'styleConfig', 'imageGenerator', 'textOverlay', 'export'],
  },
  {
    id: 'ai-pet',
    name: 'AI Pet Portrait',
    description: 'Turn pet photos into stunning artistic portraits',
    Icon: Sparkles,
    accent: '#f472b6',
    category: 'Character',
    pipeline: ['imageUpload', 'promptEnhancer', 'styleConfig', 'imageGenerator', 'preview'],
  },
  {
    id: 'custom-avatar',
    name: 'Custom Avatar',
    description: 'Generate unique personal avatars with AI',
    Icon: User2,
    accent: '#a78bfa',
    category: 'Character',
    pipeline: ['imageUpload', 'textPrompt', 'promptEnhancer', 'imageGenerator', 'preview'],
  },
];

function PipelineChip({ nodeType }: { nodeType: string }) {
  const meta = NODE_META[nodeType];
  if (!meta) return null;
  return (
    <div
      className="flex items-center gap-1 px-1.5 py-0.5 rounded"
      style={{ background: `${meta.color}12`, border: `1px solid ${meta.color}25` }}
      title={meta.label}
    >
      <meta.Icon size={8} style={{ color: meta.color }} />
      <span style={{ color: meta.color }} className="text-[7px] font-semibold">{meta.label}</span>
    </div>
  );
}

function TemplateCard({
  t,
  index,
  inView,
  onGetStarted,
}: {
  t: (typeof templates)[0];
  index: number;
  inView: boolean;
  onGetStarted?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.set(ref.current, { opacity: 0, x: index % 2 === 0 ? -16 : 16, y: 8 });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!inView || !ref.current) return;
    gsap.to(ref.current, { opacity: 1, x: 0, y: 0, duration: 0.55, delay: 0.15 + index * 0.08, ease: 'power3.out' });
  }, [inView, index]);

  return (
    <div
      ref={ref}
      className="group rounded-xl border border-white/8 bg-surface-panel overflow-hidden hover:border-white/15 transition-all flex"
    >
      {/* Left accent strip */}
      <div
        className="w-1 shrink-0"
        style={{ background: `linear-gradient(to bottom, ${t.accent}, ${t.accent}40)` }}
      />

      {/* Content */}
      <div className="flex-1 p-3 flex flex-col gap-2 min-w-0">
        {/* Top row */}
        <div className="flex items-start gap-2">
          <div
            className="size-7 rounded-lg flex items-center justify-center shrink-0 border"
            style={{ background: `${t.accent}12`, borderColor: `${t.accent}25` }}
          >
            <t.Icon size={14} style={{ color: t.accent }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-white font-bold text-[10px] truncate">{t.name}</h3>
              <span
                className="shrink-0 text-[7px] font-bold uppercase tracking-wider px-1 py-0.5 rounded"
                style={{ color: t.accent, background: `${t.accent}12` }}
              >
                {t.category}
              </span>
            </div>
            <p className="text-slate-500 text-[8px] leading-relaxed mt-0.5 truncate">{t.description}</p>
          </div>
        </div>

        {/* Pipeline chips row */}
        <div className="flex items-center gap-0.5 flex-wrap">
          {t.pipeline.map((nodeType, i) => (
            <div key={nodeType} className="flex items-center gap-0.5">
              <PipelineChip nodeType={nodeType} />
              {i < t.pipeline.length - 1 && (
                <ChevronRight size={8} className="text-white/15 shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-1 border-t border-white/5">
          <span className="text-white/20 text-[7px] font-medium">{t.pipeline.length} nodes</span>
          <button
            onClick={onGetStarted}
            className="cursor-pointer flex items-center gap-0.5 text-[8px] font-bold transition-opacity hover:opacity-80"
            style={{ color: t.accent }}
          >
            Open <ArrowRight size={8} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function TemplatesSection({ onGetStarted }: SectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

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
    gsap.set(btnRef.current, { opacity: 0, y: 10 });
  }, []);

  useEffect(() => {
    if (!inView) return;
    gsap.to(headerRef.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
    gsap.to(btnRef.current, { opacity: 1, y: 0, duration: 0.5, delay: 0.55, ease: 'power2.out' });
  }, [inView]);

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-surface-node">
      {/* Background dot grid */}
      <div
        className="absolute inset-0 opacity-30"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />

      <div
        className="absolute top-0 right-0 w-72 h-72 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)', filter: 'blur(40px)' }}
      />

      <div ref={ref} className="relative z-10 flex flex-col h-full px-5 py-5">
        {/* Header */}
        <div
          ref={headerRef}
          className="text-center mb-4 shrink-0"
        >
          <p className="text-white/30 text-[9px] font-bold tracking-[0.2em] uppercase mb-2">Quick Start</p>
          <h2 className="text-3xl font-black text-white leading-tight tracking-tight uppercase">Templates</h2>
          <p className="text-slate-500 text-[10px] mt-2 max-w-xs mx-auto">
            Pre-built AI pipelines. Each template is a complete node graph ready to run.
          </p>
        </div>

        <div className="flex-1 flex flex-col justify-center min-h-0 gap-3">
          {/* 2x2 template grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {templates.map((t, i) => (
              <TemplateCard key={t.id} t={t} index={i} inView={inView} onGetStarted={onGetStarted} />
            ))}
          </div>

          {/* Blank canvas card — full width */}
          <button
            ref={btnRef}
            onClick={onGetStarted}
            className="cursor-pointer w-full rounded-xl border-2 border-dashed border-white/10 hover:border-primary/40 bg-white/2 hover:bg-primary/5 transition-all p-3 flex items-center gap-3 group"
          >
            <div className="size-7 rounded-lg border-2 border-dashed border-white/15 group-hover:border-primary/40 flex items-center justify-center transition-colors">
              <Plus size={14} className="text-white/30 group-hover:text-primary transition-colors" />
            </div>
            <div className="text-left flex-1">
              <p className="text-white/50 group-hover:text-white font-bold text-[10px] transition-colors">Start from Scratch</p>
              <p className="text-white/25 text-[8px]">Empty canvas — drag in nodes and build your own pipeline</p>
            </div>
            <ArrowRight size={12} className="text-white/20 group-hover:text-primary transition-colors shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}