import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import {
  Lightbulb,
  GitBranch,
  SlidersHorizontal,
  Sparkles,
  Download,
  ArrowRight,
} from 'lucide-react';
import type { SectionProps } from './sectionsConfig';

const steps = [
  {
    n: '01',
    Icon: Lightbulb,
    title: 'Input Your Idea',
    body: 'Define your concept \u2014 describe the sticker, meme, greeting, or video you want to generate.',
    active: false,
  },
  {
    n: '02',
    Icon: GitBranch,
    title: 'Select Template',
    body: 'Choose from pre-built AI pipeline templates or start from a blank canvas.',
    active: false,
  },
  {
    n: '03',
    Icon: SlidersHorizontal,
    title: 'Customize Pipeline',
    body: 'Wire nodes, tune parameters, pick models. Full control over every processing step.',
    active: true,
  },
  {
    n: '04',
    Icon: Sparkles,
    title: 'Generate',
    body: 'AI-powered content creation engine processes your pipeline with live status updates.',
    active: false,
  },
  {
    n: '05',
    Icon: Download,
    title: 'Export',
    body: 'Download production-ready stickers, memes, videos the moment the pipeline finishes.',
    active: false,
  },
];

function StepNode({
  step,
  index,
  inView,
}: {
  step: (typeof steps)[0];
  index: number;
  inView: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.set(ref.current, { opacity: 0, y: 20 });
  }, []);

  useEffect(() => {
    if (!inView || !ref.current) return;
    gsap.to(ref.current, { opacity: 1, y: 0, duration: 0.5, delay: 0.15 + index * 0.08, ease: 'power3.out' });
  }, [inView, index]);

  return (
    <div
      ref={ref}
      className="flex flex-col items-center gap-3 group flex-1 min-w-0"
    >
      {/* Icon node */}
      <div
        className={`relative rounded-2xl flex items-center justify-center border transition-all ${
          step.active
            ? 'size-16 border-primary/60 bg-primary/10'
            : 'size-14 border-white/10 hover:border-white/20 bg-surface-panel'
        }`}
        style={
          step.active
            ? { boxShadow: '0 0 24px rgba(254,115,58,0.15), 0 0 0 4px rgba(254,115,58,0.08)' }
            : undefined
        }
      >
        <step.Icon
          size={step.active ? 24 : 20}
          className={step.active ? 'text-primary' : 'text-white/40'}
        />
        <div
          className={`absolute -top-2 -right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
            step.active ? 'bg-primary text-white' : 'bg-white/10 text-white/40'
          }`}
        >
          {step.n}
        </div>
        {step.active && (
          <div className="absolute inset-0 rounded-2xl border border-primary animate-ping opacity-15" />
        )}
      </div>

      {/* Info card */}
      <div
        className={`rounded-xl text-center w-full px-2.5 py-2 border transition-all ${
          step.active
            ? 'border-primary/20 bg-primary/5'
            : 'border-white/5 bg-surface-panel/50 group-hover:border-white/10'
        }`}
      >
        {step.active && (
          <p className="text-primary/80 font-bold uppercase text-[8px] tracking-wider mb-0.5">
            Active Process
          </p>
        )}
        <h3 className="text-white font-bold text-[11px] mb-0.5">{step.title}</h3>
        <p className="text-slate-400 text-[9px] leading-relaxed">{step.body}</p>
      </div>
    </div>
  );
}

export function HowItWorksSection({ onGetStarted }: SectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
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
    gsap.set(ctaRef.current, { opacity: 0, y: 10 });
  }, []);

  useEffect(() => {
    if (!inView) return;
    gsap.to(headerRef.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
    gsap.to(ctaRef.current, { opacity: 1, y: 0, duration: 0.5, delay: 0.6, ease: 'power3.out' });
  }, [inView]);

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-surface-node">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Atmospheric blobs */}
      <div
        className="absolute -top-20 -right-20 w-96 h-96 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 68%)',
          filter: 'blur(48px)',
        }}
      />
      <div
        className="absolute -bottom-16 -left-16 w-72 h-72 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(96,165,250,0.06) 0%, transparent 68%)',
          filter: 'blur(40px)',
        }}
      />

      <div ref={ref} className="relative z-10 flex flex-col h-full px-5 py-5">
        {/* Header */}
        <div
          ref={headerRef}
          className="text-center mb-5 shrink-0"
        >
          <p className="text-white/30 text-[9px] font-bold tracking-[0.2em] uppercase mb-2">
            The Logic Engine
          </p>
          <h2 className="text-3xl font-black text-white leading-tight tracking-tight uppercase">
            How It Works
          </h2>
          <p className="text-slate-500 text-[10px] mt-2 max-w-xs mx-auto">
            Visualize your creative process through our advanced node-based workflow.
          </p>
        </div>

        {/* Horizontal flow */}
        <div className="flex-1 flex flex-col justify-center min-h-0">
          <div className="relative">
            {/* Connecting line */}
            <div
              className="absolute left-0 right-0 h-0.5 z-0"
              style={{
                top: '28px',
                background:
                  'linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)',
              }}
            />
            {/* Steps grid */}
            <div className="relative z-10 grid grid-cols-5 gap-2">
              {steps.map((s, i) => (
                <StepNode key={s.n} step={s} index={i} inView={inView} />
              ))}
            </div>
          </div>

          {/* CTA card */}
          <div
            ref={ctaRef}
            className="mt-5 rounded-xl border border-white/10 bg-surface-panel p-3 flex items-center justify-between gap-3"
          >
            <div>
              <h4 className="text-white font-bold text-[11px]">
                Ready to build your first pipeline?
              </h4>
              <p className="text-slate-500 text-[9px]">
                Start with a template or build from scratch.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={onGetStarted}
                className="cursor-pointer bg-primary text-white font-bold text-[9px] px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1"
              >
                Launch Editor
                <ArrowRight size={10} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}