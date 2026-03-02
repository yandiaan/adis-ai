import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Code2, Terminal, Palette } from 'lucide-react';

const contributors = [
  {
    name: 'Dian Setiawan',
    role: 'Core Engine & AI',
    domain: 'Backend',
    bio: 'Architected the AI execution pipeline, model integrations and backend infrastructure.',
    avatar:
      'https://api.dicebear.com/9.x/avataaars/svg?seed=INyomanArijayaPutra&backgroundColor=b6e3f4',
    color: '#60a5fa',
    Icon: Code2,
    stat: 'Pipeline Architect',
    rep: 998,
  },
  {
    name: 'Arijaya Putra',
    role: 'Canvas & Node Editor',
    domain: 'Frontend',
    bio: 'Built the visual node editor, canvas runtime and the full drag-and-drop flow experience.',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Yandians&backgroundColor=6366f1',
    color: '#a78bfa',
    Icon: Terminal,
    stat: 'Node System Lead',
    rep: 856,
  },
  {
    name: 'Sanday Azis PrayogiRedefine Digital Expression.',
    role: 'Design & Templates',
    domain: 'Design',
    bio: 'Crafted the visual design system, template presets and all product interaction patterns.',
    avatar:
      'https://api.dicebear.com/9.x/avataaars/svg?seed=SandayAzisPrayogi&backgroundColor=c0aede',
    color: '#4ade80',
    Icon: Palette,
    stat: 'Design Engineer',
    rep: 912,
  },
];

function ContributorCard({ c, index }: { c: (typeof contributors)[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-10px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: 0.18 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-xl overflow-hidden flex flex-col border border-white/6 bg-surface-panel hover:border-white/15 transition-all duration-300 hover:-translate-y-1"
    >
      {/* Top contributor badge */}
      <div
        className="absolute top-3 right-3 px-1.5 py-0.5 rounded text-[7px] font-bold tracking-widest uppercase z-20 border"
        style={{
          backgroundColor: c.color + '15',
          borderColor: c.color + '30',
          color: c.color,
        }}
      >
        Top Contributor
      </div>

      {/* Avatar section */}
      <div className="w-full aspect-4/3 overflow-hidden border-b border-white/5 flex items-center justify-center relative bg-surface-node">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, ' + c.color + '12 0%, transparent 72%)',
            filter: 'blur(24px)',
          }}
        />
        <div
          className="w-24 h-24 rounded-full overflow-hidden border-2 relative z-10"
          style={{ borderColor: c.color + '40' }}
        >
          <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-[14px] font-bold text-white">{c.name}</h3>
            <p className="text-[11px] font-semibold" style={{ color: c.color }}>
              {c.role}
            </p>
          </div>
          <span className="font-bold text-[12px]" style={{ color: c.color }}>
            {c.rep} Rep
          </span>
        </div>

        <p className="text-[10px] text-slate-500 leading-relaxed flex-1">{c.bio}</p>

        {/* Contribution badge */}
        <div
          className="flex items-center gap-1.5 p-2 rounded-lg border"
          style={{
            backgroundColor: c.color + '08',
            borderColor: c.color + '15',
          }}
        >
          <c.Icon size={14} style={{ color: c.color }} />
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-300">
            {c.stat}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export function ContributorsSection() {
  const headRef = useRef(null);
  const headInView = useInView(headRef, { once: true });

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
      <motion.div
        ref={headRef}
        initial={{ opacity: 0, y: -12 }}
        animate={headInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 shrink-0 px-5 pt-5 pb-3 text-center"
      >
        <h2 className="text-3xl font-bold text-white tracking-tight">
          Built by <span className="text-primary">Architects</span> of the Future.
        </h2>
        <div className="h-1 w-16 bg-white/20 mx-auto rounded-full mt-3" />
      </motion.div>

      {/* Cards */}
      <div className="relative z-10 flex-1 px-5 pb-4 min-h-0 overflow-hidden">
        <div className="grid grid-cols-3 gap-4 h-full">
          {contributors.map((c, i) => (
            <ContributorCard key={c.name} c={c} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
