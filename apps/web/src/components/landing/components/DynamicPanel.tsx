import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { sectionsData } from '../sections/sectionsConfig';

export function DynamicPanel({
  activeIndex = 0,
  onGetStarted,
}: {
  activeIndex?: number;
  onGetStarted?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [prevIndex, setPrevIndex] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isSlideFromRight = activeIndex > prevIndex;

    // Animate container slide transition
    gsap.fromTo(
      container,
      {
        opacity: 0,
        xPercent: isSlideFromRight ? 50 : -50,
      },
      {
        opacity: 1,
        xPercent: 0,
        duration: 0.8,
        ease: 'power3.out',
      },
    );

    setPrevIndex(activeIndex);
  }, [activeIndex, prevIndex]);

  const currentSection = sectionsData[activeIndex];
  const CurrentComponent = currentSection.Component;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-surface-panel rounded-lg overflow-hidden"
    >
      <CurrentComponent onGetStarted={onGetStarted} />
    </div>
  );
}
