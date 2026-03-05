import { useEffect, useRef, useState, memo } from 'react';
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
    body: 'Define your concept — describe the sticker, meme, greeting, or video you want to generate.',
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

const StepNode = memo(function StepNode({
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
    gsap.set(ref.current, { opacity: 0, y: 24 });
  }, []);

  useEffect(() => {
    if (!inView || !ref.current) return;
    gsap.to(ref.current, {
      opacity: 1,
      y: 0,
      duration: 0.55,
      delay: 0.1 + index * 0.1,
      ease: 'power3.out',
    });
  }, [inView, index]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-3 group flex-1 min-w-0">
      {/* Icon node */}
      <div
        className={`relative rounded-2xl flex items-center justify-center border transition-all duration-300 ${
          step.active
            ? 'w-16 h-16 sm:w-18 sm:h-18 border-primary/60 bg-primary/10'
            : 'w-14 h-14 sm:w-16 sm:h-16 border-white/10 hover:border-white/25 bg-surface-panel'
        }`}
        style={
          step.active
            ? { boxShadow: '0 0 28px rgba(254,115,58,0.2), 0 0 0 4px rgba(254,115,58,0.08)' }
            : undefined
        }
      >
        <step.Icon
          size={step.active ? 26 : 22}
          className={step.active ? 'text-primary' : 'text-white/50'}
        />
        <div
          className={`absolute -top-2.5 -right-2.5 text-xs font-bold px-1.5 py-0.5 rounded-full leading-none ${
            step.active ? 'bg-primary text-white' : 'bg-white/10 text-white/40'
          }`}
        >
          {step.n}
        </div>
        {step.active && (
          <div className="absolute inset-0 rounded-2xl border border-primary animate-ping opacity-20" />
        )}
      </div>

      {/* Info card */}
      <div
        className={`rounded-xl text-center w-full px-3 py-3 border transition-all duration-300 ${
          step.active
            ? 'border-primary/25 bg-primary/5'
            : 'border-white/5 bg-surface-panel/50 group-hover:border-white/15'
        }`}
      >
        {step.active && (
          <p className="text-primary/80 font-bold uppercase text-[10px] tracking-widest mb-1">
            Active Process
          </p>
        )}
        <h3 className="text-white font-bold text-xs sm:text-sm mb-1 leading-tight">{step.title}</h3>
        <p className="text-slate-400 text-[10px] sm:text-xs leading-relaxed">{step.body}</p>
      </div>
    </div>
  );
});

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
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    gsap.set(headerRef.current, { opacity: 0, y: -16 });
    gsap.set(ctaRef.current, { opacity: 0, y: 12 });
  }, []);

  useEffect(() => {
    if (!inView) return;
    gsap.to(headerRef.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
    gsap.to(ctaRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      delay: 0.65,
      ease: 'power3.out',
    });
  }, [inView]);

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-surface-node">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
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

      <div ref={ref} className="relative z-10 flex flex-col h-full px-6 sm:px-10 md:px-14 py-6 sm:py-8 overflow-y-auto">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-6 sm:mb-8 shrink-0">
          <p className="text-white/30 text-xs font-bold tracking-[0.25em] uppercase mb-2">
            The Logic Engine
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight uppercase">
            How It Works
          </h2>
          <p className="text-slate-400 text-sm mt-3 max-w-sm mx-auto leading-relaxed">
            Visualize your creative process through our advanced node-based workflow.
          </p>
        </div>

        {/* Steps flow */}
        <div className="flex-1 flex flex-col justify-center min-h-0">
          <div className="relative">
            {/* Connecting line – only visible on md+ where all 5 fit in a row */}
            <div
              className="absolute left-0 right-0 h-px z-0 hidden md:block"
              style={{
                top: '32px',
                background:
                  'linear-gradient(to right, transparent, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.08) 80%, transparent)',
              }}
            />

            {/* Responsive grid: 2 col on mobile, 3 on sm, 5 on md+ */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
              {steps.map((s, i) => (
                <StepNode key={s.n} step={s} index={i} inView={inView} />
              ))}
            </div>
          </div>

          {/* CTA card */}
          <div
            ref={ctaRef}
            className="mt-6 sm:mt-8 rounded-xl border border-white/10 bg-surface-panel px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div>
              <h4 className="text-white font-bold text-sm sm:text-base">
                Ready to build your first pipeline?
              </h4>
              <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                Start with a template or build from scratch.
              </p>
            </div>
            <button
              onClick={onGetStarted}
              className="cursor-pointer shrink-0 bg-primary text-white font-bold text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              Launch Editor
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}