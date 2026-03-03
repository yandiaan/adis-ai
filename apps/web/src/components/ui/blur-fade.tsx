'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

import { cn } from '@/lib/utils';

interface BlurFadeProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
  offset?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  inView?: boolean;
  inViewMargin?: string;
  blur?: string;
}

export function BlurFade({
  children,
  className,
  duration = 0.4,
  delay = 0,
  offset = 6,
  direction = 'down',
  inView = false,
  inViewMargin = '-50px',
  blur = '6px',
}: BlurFadeProps) {
  const ref = useRef<HTMLDivElement>(null);
  // If inView=false, animate immediately on mount; otherwise wait for viewport
  const [shouldAnimate, setShouldAnimate] = useState(!inView);

  useEffect(() => {
    if (!inView) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldAnimate(true);
          observer.unobserve(el);
        }
      },
      { rootMargin: inViewMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [inView, inViewMargin]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !shouldAnimate) return;
    const axis = direction === 'left' || direction === 'right' ? 'x' : 'y';
    const startVal = direction === 'right' || direction === 'down' ? -offset : offset;
    gsap.fromTo(
      el,
      { [axis]: startVal, opacity: 0, filter: `blur(${blur})` },
      { [axis]: 0, opacity: 1, filter: 'blur(0px)', duration, delay: 0.04 + delay, ease: 'power2.out' }
    );
  }, [shouldAnimate]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={ref} className={cn(className)} style={shouldAnimate ? undefined : { opacity: 0 }}>
      {children}
    </div>
  );
}
