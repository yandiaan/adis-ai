import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { RainEffect } from '../components/RainEffect';

export function AboutSection() {
  const imgRef = useRef<HTMLImageElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const containerWidth = containerRef.current?.offsetWidth || window.innerWidth;
      const isMobile = containerWidth < 768;
      const isTablet = containerWidth < 1024;

      const textSlideDistance = isMobile ? -80 : isTablet ? -120 : -180;
      const imgSlideDistance = isMobile ? 80 : isTablet ? 120 : 180;

      gsap.fromTo(
        textRef.current,
        { opacity: 0, x: 0 },
        {
          opacity: 1,
          x: textSlideDistance,
          duration: 1.5,
          ease: 'power3.out',
          delay: 0.2,
        },
      );

      gsap.fromTo(
        imgRef.current,
        {
          opacity: 0,
          x: 0,
        },
        {
          opacity: 1,
          x: imgSlideDistance,
          duration: 1.5,
          ease: 'power3.out',
          onComplete: () => {
            gsap.to(imgRef.current, {
              y: '-=15',
              duration: 2.5,
              ease: 'sine.inOut',
              repeat: -1,
              yoyo: true,
            });
          },
        },
      );
    });

    return () => ctx.revert();
  }, []);

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

      <div className="relative w-full h-full flex items-center justify-center px-6 sm:px-10 md:px-16 lg:px-24 overflow-hidden">
        <div
          ref={textRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl px-4"
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
          ref={imgRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-full flex items-end justify-center"
        >
          <img
            src="/about-ilustration.svg"
            alt="AI Illustration"
            className="h-full w-auto object-contain object-bottom"
          />
        </div>
      </div>
    </div>
  );
}
