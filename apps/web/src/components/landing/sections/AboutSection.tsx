import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { RainEffect } from '../components/RainEffect';

export function AboutSection() {
  const imgRef = useRef<HTMLImageElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(imgRef.current, {
        zIndex: 50,
        translateY: '5%',
      });

      gsap.fromTo(
        imgRef.current,
        {
          opacity: 0,
          xPercent: -50,
        },
        {
          opacity: 1,
          xPercent: 40,
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

      gsap.fromTo(
        textRef.current,
        { opacity: 0, xPercent: -50 },
        {
          opacity: 1,
          xPercent: -130,
          duration: 1.5,
          ease: 'power3.out',
          delay: 0.2,
        },
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      className="relative w-full h-full overflow-hidden flex items-center justify-center isolate"
      style={{
        backgroundColor: '#282828',
        backgroundImage: "url('/background-about.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <RainEffect />

      <div
        ref={textRef}
        className="absolute left-1/2 top-1/2 -translate-y-1/2 w-112.5 z-10 pointer-events-none"
      >
        <h2 className="text-5xl font-bold italic mb-4 text-white uppercase tracking-tighter">
          Redefining Digital Expression
        </h2>
        <p className="text-base text-gray-300 leading-relaxed">
          Unlike traditional black-box AI where users have zero control over the pipeline, our
          node-based architecture provides full transparency and modularity. Users can audit, tweak,
          and perfect every step of the sticker creation process.
        </p>
      </div>

      <img
        ref={imgRef}
        src="/about-ilustration.svg"
        alt="AI Illustration"
        className="absolute left-1/2 top-1/2 -translate-y-1/2 h-full w-auto object-contain object-bottom"
      />
    </div>
  );
}
