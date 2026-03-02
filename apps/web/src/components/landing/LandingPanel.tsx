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
  const svgRef = useRef<HTMLImageElement>(null);
  const svgRef2 = useRef<HTMLImageElement>(null);

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

  return (
    <div id="landing-root" className="relative w-full h-full overflow-hidden">
      <img
        ref={svgRef}
        src="/line-white-2.svg"
        alt="line white"
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none translate-x-110"
        style={{ opacity: 0.3 }}
      />
      <header className="flex items-center h-[15vh] px-8">
        <img src="/logo.svg" alt="Logo" className="w-12 mr-4" />
        <h1 className="text-5xl font-bold m-0">ADIS AI</h1>
      </header>
      <main className="flex flex-row px-8 h-[75vh]">
        <aside className="w-80 flex flex-col justify-between h-full">
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
              <BlueprintNav onIndexChange={setActiveIndex} />
            </div>
          </div>
        </aside>
        <section className="flex-1 flex items-center ml-24 mb-8 justify-end relative overflow-hidden">
          <DynamicPanel activeIndex={activeIndex} onGetStarted={handleClick} />
        </section>
        <img
          ref={svgRef2}
          src="/line-white-2.svg"
          alt="line white"
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none translate-x-130"
          style={{ opacity: 0.3 }}
        />
        <div className="w-20 bg-transparent"></div>
      </main>
      <footer className="w-full flex flex-row items-center justify-between py-4 px-8 bg-transparent h-[10vh]">
        <div className="flex flex-col items-start justify-center w-80">
          <span className="text-sm mb-2">Powered by:</span>
          <div className="flex gap-6">
            <img src="/logo-alibaba.svg" alt="Alibaba Cloud" className="h-14" />
            <img src="/logo-qwen.svg" alt="Star" className="h-12" />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center flex-1">
          <GetStartedButton onClick={handleClick} onHoverChange={setButtonHovered} />
        </div>
        <div className="flex flex-col items-end justify-center w-80">
          <div className="text-right text-gray-400 text-sm max-w-xs">
            Powered by Wan & Qwen "Modular AI creativity on Alibaba Cloud PAI-EAS."
          </div>
        </div>
      </footer>
    </div>
  );
}
