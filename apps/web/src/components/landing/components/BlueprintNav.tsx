import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

const navItems = ['About Us', 'How it works', 'Node Based', 'Templates', 'Contributors'];

export function BlueprintNav({ onIndexChange }: { onIndexChange?: (index: number) => void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const progressRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const autoPlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const createTimeline = (startIndex: number) => {
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    gsap.set(progressRefs.current, { scaleX: 0, transformOrigin: 'left' });

    const tl = gsap.timeline({ repeat: -1 });
    const defaultDuration = 5;
    const contributorsDuration = 15;

    navItems.forEach((_, index) => {
      const currentIndex = (startIndex + index) % navItems.length;
      const nextIndex = (currentIndex + 1) % navItems.length;
      const isContributors = currentIndex === 4; // Contributors is at index 4
      const itemDuration = isContributors ? contributorsDuration : defaultDuration;

      tl.add(() => {
        setActiveIndex(currentIndex);
        onIndexChange?.(currentIndex);
        gsap.set(progressRefs.current[currentIndex], { scaleX: 0 });
      });

      tl.to(progressRefs.current[nextIndex], {
        scaleX: 1,
        duration: itemDuration,
        ease: 'none',
      });

      tl.set(progressRefs.current[nextIndex], { scaleX: 0 });
    });

    timelineRef.current = tl;
  };

  const handleNavClick = (index: number) => {
    // Kill current timeline
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    // Clear any pending auto-play restart
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
    }

    // Update active index
    setActiveIndex(index);
    onIndexChange?.(index);

    // Reset all progress bars
    gsap.set(progressRefs.current, { scaleX: 0 });

    // Start new timeline from clicked index
    createTimeline(index);
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      createTimeline(0);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <nav className="w-full" ref={containerRef}>
      <ul className="list-none p-0 m-0 flex flex-col items-start w-full space-y-4">
        {navItems.map((item, i) => {
          const isActive = activeIndex === i;

          return (
            <li
              key={i}
              className="relative w-fit pb-1 cursor-pointer group transition-all"
              onClick={() => handleNavClick(i)}
            >
              <span
                className={`text-l block transition-all duration-300 ${
                  isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'
                }`}
              >
                {item}
              </span>

              {isActive && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)] z-10" />
              )}

              <div
                ref={(el) => {
                  progressRefs.current[i] = el;
                }}
                className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-600 z-0"
                style={{ transform: 'scaleX(0)', transformOrigin: 'left' }}
              />
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
