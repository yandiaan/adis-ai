import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { RainEffect } from '../components/RainEffect';

const IMG_SRC = '/about-ilustration.svg';

const GLITCH_FRAMES = [
  'drop-shadow(6px 0 0 rgba(255,0,60,0.95)) drop-shadow(-6px 0 0 rgba(0,255,240,0.95))',
  'drop-shadow(-8px 0 0 rgba(255,0,60,0.95)) drop-shadow(8px 0 0 rgba(0,255,240,0.95))',
  'drop-shadow(3px 0 0 rgba(255,0,60,0.7)) drop-shadow(-3px 0 0 rgba(0,255,240,0.7))',
  'drop-shadow(10px 0 0 rgba(255,0,60,0.95)) drop-shadow(-10px 0 0 rgba(0,255,240,0.95))',
  'drop-shadow(-4px 0 0 rgba(255,0,60,0.8)) drop-shadow(4px 0 0 rgba(0,255,240,0.8))',
];

export function AboutSection() {
  const imgWrapperRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const glitchTlRef = useRef<gsap.core.Timeline | null>(null);
  const ctxRef = useRef<gsap.Context | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const preload = new window.Image();
    preload.src = IMG_SRC;
    if (preload.complete) {
      setImgLoaded(true);
    } else {
      preload.onload = () => setImgLoaded(true);
      preload.onerror = () => setImgLoaded(true);
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const startGlitch = useCallback((el: HTMLDivElement) => {
    glitchTlRef.current?.kill();

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2.8 });

    tl.to(el, { filter: GLITCH_FRAMES[0], duration: 0.05, ease: 'none' })
      .to(el, { filter: GLITCH_FRAMES[1], duration: 0.05, ease: 'none' })
      .to(el, { filter: GLITCH_FRAMES[2], duration: 0.04, ease: 'none' })
      .to(el, { filter: GLITCH_FRAMES[3], duration: 0.04, ease: 'none' })
      .to(el, { filter: 'none', duration: 0.08, ease: 'power2.out' })
      .to(el, { duration: 1.0 })
      .to(el, { filter: GLITCH_FRAMES[4], duration: 0.06, ease: 'none' })
      .to(el, { filter: GLITCH_FRAMES[2], duration: 0.05, ease: 'none' })
      .to(el, { filter: 'none', duration: 0.08, ease: 'power2.out' });

    glitchTlRef.current = tl;
  }, []);

  const runAnimations = useCallback(() => {
    if (!textRef.current || !imgWrapperRef.current) return;

    ctxRef.current?.revert();
    glitchTlRef.current?.kill();

    ctxRef.current = gsap.context(() => {
      gsap.set(textRef.current, { opacity: 0, x: -40 });
      gsap.to(textRef.current, {
        opacity: 1,
        x: 0,
        duration: 1.4,
        ease: 'power3.out',
        delay: 0.2,
      });

      gsap.set(imgWrapperRef.current, { opacity: 0, x: 80 });
      gsap.to(imgWrapperRef.current, {
        opacity: 1,
        x: 0,
        duration: 1.4,
        ease: 'power3.out',
        onComplete: () => {
          if (imgWrapperRef.current) startGlitch(imgWrapperRef.current);
        },
      });
    });
  }, [startGlitch]);

  useEffect(() => {
    if (imgLoaded && inView) {
      runAnimations();
    }

    return () => {
      glitchTlRef.current?.kill();
      ctxRef.current?.revert();
    };
  }, [imgLoaded, inView, runAnimations]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden isolate"
      style={{
        backgroundColor: '#282828',
        backgroundImage: "url('/background-about.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <RainEffect />

      <div
        aria-hidden
        className="absolute inset-0 z-30 pointer-events-none overflow-hidden"
        style={{
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.13) 2px, rgba(0,0,0,0.13) 4px)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: '100%',
            height: '4px',
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.06) 70%, transparent 100%)',
            animation: 'vhs-track 5s linear infinite',
          }}
        />
      </div>
      <style>{`
        @keyframes vhs-track {
          0%   { top: -4px; }
          100% { top: 100%; }
        }
      `}</style>

      <div className="relative w-full h-full overflow-hidden">
        <div
          ref={textRef}
          className="absolute left-8 sm:left-14 md:left-20 top-1/2 -translate-y-1/2 z-20 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"
          style={{ opacity: 0, willChange: 'transform, opacity' }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold italic mb-3 sm:mb-4 text-white uppercase tracking-tighter leading-tight">
            Redefining Digital Expression
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-300 leading-relaxed">
            Unlike traditional black-box AI where users have zero control over the pipeline, our
            node-based architecture provides full transparency and modularity. Users can audit,
            tweak, and perfect every step of the sticker creation process.
          </p>
        </div>

        <div
          ref={imgWrapperRef}
          className="absolute right-0 top-0 h-full flex items-end justify-end"
          style={{ opacity: 0, willChange: 'transform, filter' }}
        >
          <img
            src={IMG_SRC}
            alt="AI Illustration"
            fetchPriority="high"
            decoding="async"
            className="h-full w-auto object-contain object-bottom"
          />
        </div>
      </div>
    </div>
  );
}
