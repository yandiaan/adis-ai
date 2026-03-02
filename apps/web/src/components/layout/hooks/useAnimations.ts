import { useRef, useEffect } from 'react';
import gsap from 'gsap';

export const useNewWorkflowButtonAnimation = (isExpanded: boolean) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const btnEl = buttonRef.current;
    const textEl = textRef.current;
    if (!btnEl || !textEl) return;

    if (isExpanded) {
      gsap.to(btnEl, {
        width: '100%',
        duration: 0.4,
        delay: 0.35,
        ease: 'power2.out',
      });
      gsap.fromTo(
        textEl,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.3,
          delay: 0.45,
          ease: 'power2.out',
        },
      );
    } else {
      gsap.to(textEl, {
        opacity: 0,
        duration: 0.15,
        ease: 'power2.in',
      });
      gsap.to(btnEl, {
        width: '3rem',
        duration: 0.3,
        delay: 0.1,
        ease: 'power2.in',
      });
    }
  }, [isExpanded]);

  return { buttonRef, textRef };
};

export const useAdisTextAnimation = (isExpanded: boolean) => {
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const textEl = textRef.current;
    if (!textEl) return;

    if (isExpanded) {
      gsap.fromTo(
        textEl,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          delay: 0.15,
          ease: 'power2.out',
        },
      );
    } else {
      gsap.to(textEl, {
        opacity: 0,
        x: -20,
        duration: 0.2,
        ease: 'power2.in',
      });
    }
  }, [isExpanded]);

  return textRef;
};

export const useNewWorkflowButtonHover = () => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const btn = buttonRef.current;
    if (!btn) return;

    const handleMouseEnter = () => {
      gsap.to(btn, {
        boxShadow: '0 0 8px rgba(254, 115, 58, 0.6)',
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(btn, {
        boxShadow: '0 0 0px rgba(254, 115, 58, 0)',
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    btn.addEventListener('mouseenter', handleMouseEnter);
    btn.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      btn.removeEventListener('mouseenter', handleMouseEnter);
      btn.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return buttonRef;
};

export const useTemplateButtonsHover = (
  buttonRefs: React.MutableRefObject<Record<string, HTMLButtonElement>>,
) => {
  useEffect(() => {
    Object.values(buttonRefs.current).forEach((btn) => {
      if (!btn) return;

      const handleMouseEnter = () => {
        gsap.to(btn, {
          scale: 1.1,
          duration: 0.3,
          ease: 'power2.out',
        });
      };

      const handleMouseLeave = () => {
        gsap.to(btn, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out',
        });
      };

      btn.addEventListener('mouseenter', handleMouseEnter);
      btn.addEventListener('mouseleave', handleMouseLeave);
    });
  }, [buttonRefs]);
};

export const useModalAnimation = (
  showConfirmModal: boolean,
  backdropRef: React.MutableRefObject<HTMLDivElement | null>,
  cardRef: React.MutableRefObject<HTMLDivElement | null>,
) => {
  useEffect(() => {
    const backdrop = backdropRef.current;
    const card = cardRef.current;
    if (!backdrop || !card) return;

    if (showConfirmModal) {
      gsap.fromTo(
        backdrop,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out',
        },
      );

      gsap.fromTo(
        card,
        { scale: 0.9, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.4,
          delay: 0.1,
          ease: 'back.out(1.2)',
        },
      );
    } else {
      gsap.to(backdrop, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
      });
      gsap.to(card, {
        scale: 0.9,
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
      });
    }
  }, [showConfirmModal, backdropRef, cardRef]);
};

export const useModalButtonsHover = (showConfirmModal: boolean) => {
  useEffect(() => {
    if (!showConfirmModal) return;

    const buttons = document.querySelectorAll(
      '[data-modal-button]',
    ) as NodeListOf<HTMLButtonElement>;
    buttons.forEach((button) => {
      const isConfirmButton =
        button.textContent?.includes('Create') || button.textContent?.includes('Load');

      const handleMouseEnter = () => {
        if (isConfirmButton) {
          gsap.to(button, {
            boxShadow: '0 0 12px rgba(254, 115, 58, 0.8)',
            duration: 0.3,
            ease: 'power2.out',
          });
        } else {
          gsap.to(button, {
            boxShadow: '0 0 8px rgba(255, 255, 255, 0.3)',
            duration: 0.3,
            ease: 'power2.out',
          });
        }
      };

      const handleMouseLeave = () => {
        gsap.to(button, {
          boxShadow: '0 0 0px rgba(255, 255, 255, 0)',
          duration: 0.3,
          ease: 'power2.out',
        });
      };

      button.addEventListener('mouseenter', handleMouseEnter);
      button.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        button.removeEventListener('mouseenter', handleMouseEnter);
        button.removeEventListener('mouseleave', handleMouseLeave);
      };
    });
  }, [showConfirmModal]);
};
