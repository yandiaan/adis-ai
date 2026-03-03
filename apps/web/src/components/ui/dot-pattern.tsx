import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';

import { cn } from '@/lib/utils';

interface DotPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  cx?: number;
  cy?: number;
  cr?: number;
  className?: string;
  glow?: boolean;
  [key: string]: unknown;
}

export function DotPattern({
  width = 16,
  height = 16,
  cx = 1,
  cy = 1,
  cr = 1,
  className,
  glow = false,
  ...props
}: DotPatternProps) {
  const id = useId();
  const containerRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width: w, height: h } = containerRef.current.getBoundingClientRect();
        setDimensions({ width: w, height: h });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const dots = useMemo(
    () =>
      Array.from(
        {
          length: Math.ceil(dimensions.width / width) * Math.ceil(dimensions.height / height),
        },
        (_, i) => {
          const col = i % Math.ceil(dimensions.width / width);
          const row = Math.floor(i / Math.ceil(dimensions.width / width));
          return {
            x: col * width + cx,
            y: row * height + cy,
            delay: Math.random() * 5,
            duration: Math.random() * 3 + 2,
          };
        },
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dimensions.width, dimensions.height, width, height, cx, cy],
  );

  // Apply GSAP glow animations after dots render
  useEffect(() => {
    if (!glow || !containerRef.current || dots.length === 0) return;
    const circles = Array.from(containerRef.current.querySelectorAll('circle'));
    circles.forEach((circle, i) => {
      const dot = dots[i];
      if (!dot) return;
      gsap.fromTo(
        circle,
        { opacity: 0.4, attr: { r: cr } },
        {
          opacity: 1,
          attr: { r: cr * 1.5 },
          duration: dot.duration,
          delay: dot.delay,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        },
      );
    });
    return () => {
      if (containerRef.current) {
        gsap.killTweensOf(Array.from(containerRef.current.querySelectorAll('circle')));
      }
    };
  }, [glow, dots, cr]);

  return (
    <svg
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 h-full w-full text-neutral-400/80',
        className,
      )}
      {...props}
    >
      <defs>
        <radialGradient id={`${id}-gradient`}>
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      {dots.map((dot, index) => (
        <circle
          key={`${dot.x}-${dot.y}-${index}`}
          cx={dot.x}
          cy={dot.y}
          r={cr}
          fill={glow ? `url(#${id}-gradient)` : 'currentColor'}
          style={glow ? { opacity: 0.4 } : undefined}
        />
      ))}
    </svg>
  );
}
