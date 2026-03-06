import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { BlueprintNav } from './components/BlueprintNav';
import { GetStartedButton } from './components/GetStartedButton';
import { DynamicPanel } from './components/DynamicPanel';
import '@/styles/global.css';

export default function LandingPanel({ onHideLanding }: { onHideLanding?: () => void }) {
  const [hideLanding, setHideLanding] = useState(false);
  const [buttonHovered, setButtonHovered] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const svgRef = useRef<HTMLImageElement>(null);
  const svgRef2 = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    const svg2 = svgRef2.current;
    if (!svg || !svg2) return;

    if (buttonHovered) {
      gsap.to([svg, svg2], {
        opacity: 1,
        filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.6))',
        duration: 0.5,
        ease: 'power3.out',
      });
    } else {
      gsap.to([svg, svg2], {
        opacity: 0.3,
        filter: 'drop-shadow(0 0 0px rgba(255, 255, 255, 0))',
        duration: 0.5,
        ease: 'power3.out',
      });
    }
  }, [buttonHovered]);

  // Click animasi
  const handleClick = () => {
    gsap.to('#landing-root', {
      filter: 'blur(30px)',
      opacity: 0,
      duration: 1.2,
      ease: 'power2.inOut',
      onComplete: () => {
        setHideLanding(true);
        if (onHideLanding) onHideLanding();
      },
    });
  };

  if (hideLanding) return null;

  const mobileNavLabels = ['About', 'How It Works', 'Nodes', 'Templates', 'Team'];

  return (
    <div id="landing-root" className="relative w-full h-full overflow-hidden flex flex-col">
      <img
        ref={svgRef}
        src="/line-white-2.svg"
        alt="line white"
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none translate-x-110 hidden md:block"
        style={{ opacity: 0.3 }}
      />

      {/* ── Header ── */}
      <header className="flex items-center shrink-0 h-[12vh] md:h-[15vh] px-4 md:px-8 z-10">
        <img src="/logo.svg" alt="Logo" className="w-8 md:w-12 mr-3 md:mr-4" />
        <h1 className="text-3xl md:text-5xl font-bold m-0">ADIS AI</h1>
      </header>

      {/* ── Main ── */}
      <main className="flex flex-col md:flex-row px-4 md:px-8 flex-1 min-h-0 z-10">

        {/* Desktop sidebar — hidden on mobile */}
        <aside className="hidden md:flex w-80 flex-col justify-between h-full">
          <div>
            <p className="text-base mb-8">
              ADIS AI is a modular content generation engine designed to transform your ideas into
              high-quality stickers, viral memes, and personalized greetings. Leverage our
              node-based workflow to gain total control over every creative layer
            </p>
          </div>
          <div className="flex flex-col grow justify-center pt-[10%]">
            <h3 className="text-lg mb-2 text-left self-start -mt-[40%]">The Blueprint:</h3>
            <div className="flex justify-center w-full">
              {isDesktop && <BlueprintNav onIndexChange={setActiveIndex} />}
            </div>
          </div>
        </aside>

        {/* Panel + mobile nav */}
        <div className="flex-1 flex flex-col min-h-0 md:ml-24 mb-2 md:mb-8 overflow-hidden">
          {/* Mobile horizontal tab nav */}
          <div className="md:hidden flex items-center gap-1 overflow-x-auto py-2 mb-2 shrink-0"
            style={{ scrollbarWidth: 'none' }}>
            {mobileNavLabels.map((label, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  activeIndex === i
                    ? 'bg-white/15 text-white border-white/25'
                    : 'text-white/40 border-transparent hover:text-white/60 hover:border-white/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Dynamic panel */}
          <section className="flex-1 min-h-0 relative overflow-hidden rounded-lg">
            <DynamicPanel activeIndex={activeIndex} onGetStarted={handleClick} />
          </section>
        </div>

        <div className="hidden md:block w-20 bg-transparent" />
      </main>

      <img
        ref={svgRef2}
        src="/line-white-2.svg"
        alt="line white"
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none translate-x-130 hidden md:block ${activeIndex === 0 ? 'z-20' : 'z-0'}`}
        style={{ opacity: 0.3 }}
      />

      {/* ── Footer ── */}
      <footer className="shrink-0 w-full flex flex-col md:flex-row items-center justify-between py-3 md:py-4 px-4 md:px-8 bg-transparent z-10 gap-3 md:gap-0">
        {/* Powered by logos */}
        <div className="flex flex-row items-center gap-4 md:flex-col md:items-start md:justify-center md:w-80">
          <span className="text-sm text-white/60 hidden md:inline">Powered by:</span>
          <div className="flex gap-4 md:gap-6 items-center">
            <img src="/logo-alibaba.svg" alt="Alibaba Cloud" className="h-8 md:h-14" />
            <img src="/logo-qwen.svg" alt="Star" className="h-7 md:h-12" />
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center justify-center flex-1 order-first md:order-none">
          <GetStartedButton onClick={handleClick} onHoverChange={setButtonHovered} />
        </div>

        {/* Tagline */}
        <div className="hidden md:flex flex-col items-end justify-center w-80">
          <div className="text-right text-gray-400 text-sm max-w-xs">
            Powered by Wan & Qwen "Modular AI creativity on Alibaba Cloud PAI-EAS."
          </div>
        </div>
      </footer>
    </div>
  );
}
