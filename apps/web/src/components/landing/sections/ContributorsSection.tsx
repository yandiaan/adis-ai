import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Code2, Terminal, Palette, Github, Instagram } from 'lucide-react';

const contributors = [
  {
    name: 'Sanday Azis Prayogi',
    role: 'Infrastructure & CI/CD',
    domain: 'DevOps',
    bio: 'Built and maintained the deployment pipelines, infrastructure automation, and system reliability.',
    avatar: '/sanday.png',
    color: '#4ade80',
    Icon: Terminal,
    stat: 'DevOps Engineer',
    instagram: 'https://www.instagram.com/sndyazis__?igsh=OGs0ZzV6d2I4aWd1',
    github: 'https://github.com/sandayazisp',
  },
  {
    name: 'Dian Setiawan',
    role: 'Core Engine & AI',
    domain: 'Backend',
    bio: 'Architected the AI execution pipeline, model integrations and backend infrastructure.',
    avatar: '/dian.png',
    color: '#60a5fa',
    Icon: Code2,
    stat: 'Backend Engineer',
    instagram: 'https://www.instagram.com/yandian.s?igsh=MXYyN3d5cDVhZ3J5MQ==',
    github: 'https://github.com/yandiaan',
  },
  {
    name: 'Arijaya Putra',
    role: 'Canvas & Node Editor',
    domain: 'Frontend',
    bio: 'Built the visual node editor, animation, canvas runtime and the full drag-and-drop flow experience.',
    avatar: '/arijaya.png',
    color: '#a78bfa',
    Icon: Palette,
    stat: 'Frontend Engineer',
    instagram: 'https://www.instagram.com/arijayaa?igsh=dGVndTNtYTZiMWZ1',
    github: 'https://github.com/ArijayaPutra',
  },
];

function ContributorCard({ c, index }: { c: (typeof contributors)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const glow = glowRef.current;
    const avatar = avatarRef.current;
    if (!el || !glow || !avatar) return;

    gsap.set(el, { opacity: 0, y: 60, scale: 0.8, rotateX: 15 });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gsap.to(el, {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            duration: 0.8,
            delay: 0.2 + index * 0.15,
            ease: 'back.out(1.2)',
          });

          gsap.to(glow, {
            opacity: 0.6,
            scale: 1.1,
            duration: 2,
            delay: 0.5 + index * 0.15,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
          });

          gsap.to(avatar, {
            y: -8,
            duration: 2.5,
            delay: 0.3 + index * 0.1,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
          });

          observer.unobserve(el);
        }
      },
      { threshold: 0, rootMargin: '-10px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [index]);

  const handleMouseEnter = () => {
    if (!ref.current || !glowRef.current) return;
    gsap.to(ref.current, {
      y: -6,
      filter: 'brightness(1.15)',
      duration: 0.3,
      ease: 'power2.out',
    });
    gsap.to(glowRef.current, {
      opacity: 0.8,
      blur: 30,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = () => {
    if (!ref.current || !glowRef.current) return;
    gsap.to(ref.current, {
      y: 0,
      filter: 'brightness(1)',
      duration: 0.3,
      ease: 'power2.out',
    });
    gsap.to(glowRef.current, {
      opacity: 0.4,
      blur: 20,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  return (
    <div
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative rounded-xl overflow-hidden flex flex-col border border-white/10 bg-surface-panel cursor-pointer"
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
        boxShadow: `0 0 20px ${c.color}15, 0 4px 20px rgba(0,0,0,0.3)`,
      }}
    >
      <div
        ref={glowRef}
        className="absolute inset-0 pointer-events-none opacity-40 z-0"
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${c.color}30 0%, transparent 70%)`,
          filter: 'blur(20px)',
        }}
      />

      <div
        className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase z-20 border backdrop-blur-sm"
        style={{
          backgroundColor: c.color + '20',
          borderColor: c.color + '40',
          color: c.color,
          boxShadow: `0 0 10px ${c.color}30`,
        }}
      >
        {c.domain}
      </div>

      <div className="w-full aspect-video overflow-hidden border-b border-white/5 flex items-center justify-center relative bg-surface-node">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${c.color}20 0%, transparent 72%)`,
            filter: 'blur(24px)',
          }}
        />
        <div
          className="absolute w-38 h-38 rounded-full border-2 border-dashed opacity-20 animate-spin"
          style={{
            borderColor: c.color,
            animationDuration: '20s',
          }}
        />
        <div
          ref={avatarRef}
          className="w-32 h-32 rounded-full overflow-hidden border-3 relative z-10"
          style={{
            borderColor: c.color,
            boxShadow: `0 0 30px ${c.color}60, 0 0 60px ${c.color}30`,
          }}
        >
          <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Info */}
      <div className="p-2 flex flex-col flex-1 gap-1.5 relative z-10">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-base font-bold text-white">{c.name}</h3>
            <p className="text-xs font-semibold" style={{ color: c.color }}>
              {c.role}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed flex-1 mt-4">{c.bio}</p>

        {/* Social Links */}
        <div className="flex gap-3 py-1.5">
          <a
            href={c.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg border transition-all duration-300 hover:bg-opacity-20 hover:-translate-y-1"
            style={{
              backgroundColor: c.color + '10',
              borderColor: c.color + '25',
              color: c.color,
            }}
          >
            <Instagram size={16} />
          </a>
          <a
            href={c.github}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg border transition-all duration-300 hover:bg-opacity-20 hover:-translate-y-1"
            style={{
              backgroundColor: c.color + '10',
              borderColor: c.color + '25',
              color: c.color,
            }}
          >
            <Github size={14} />
          </a>
        </div>

        <div
          className="flex items-center gap-2 p-1.5 rounded-lg border transition-all duration-300 hover:bg-opacity-30"
          style={{
            backgroundColor: c.color + '10',
            borderColor: c.color + '25',
            boxShadow: `inset 0 0 15px ${c.color}10`,
          }}
        >
          <c.Icon size={14} style={{ color: c.color }} />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
            {c.stat}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ContributorsSection() {
  const headRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = headRef.current;
    if (!el) return;
    gsap.set(el, { opacity: 0, y: -12 });
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gsap.to(el, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' });
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-surface-node">
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute top-20 left-[10%] w-2 h-2 bg-white rounded-full blur-sm" />
        <div className="absolute top-60 left-[80%] w-3 h-3 bg-white rounded-full blur-md" />
        <div className="absolute bottom-40 left-[40%] w-1 h-1 bg-white rounded-full" />
        <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-white rounded-full blur-sm" />
      </div>

      {/* Header */}
      <div ref={headRef} className="relative z-10 shrink-0 px-5 pt-4 pb-2 text-center">
        <h2 className="text-4xl font-bold text-white tracking-tight">
          Built by <span className="text-primary">Architects</span> of the Future.
        </h2>
        <div className="h-1 w-16 bg-white/20 mx-auto rounded-full mt-2" />
      </div>

      {/* Cards */}
      <div className="relative z-10 flex-1 px-8 sm:px-12 md:px-16 lg:px-20 pb-8 min-h-0 overflow-visible flex items-center justify-center">
        <div className="grid grid-cols-3 gap-6 h-fit w-full max-h-full">
          {contributors.map((c, i) => (
            <ContributorCard key={c.name} c={c} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
