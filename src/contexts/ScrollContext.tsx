'use client';

import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

export type Atmosphere = 'shoreline' | 'pocket' | 'engine-room' | 'selected-work' | 'horizon';

interface ScrollState {
  /** 0.0 – 1.0, normalized scroll progress */
  progress: number;
  /** Scroll velocity (px/frame), useful for motion blur / chromatic aberration */
  velocity: number;
  /** Current atmosphere segment — 4 cinematic stages */
  atmosphere: Atmosphere;
  /** Raw scroll Y in pixels */
  scrollY: number;
  /** Total scrollable height */
  maxScroll: number;
  /** Scroll to a given section index (0-4) */
  scrollToSection: (index: number) => void;
  /** Programmatically scroll to an element, selector, or pixel offset */
  scrollTo: (target: string | HTMLElement | number, options?: { offset?: number; duration?: number }) => void;
}

const noop = () => {};

const defaultState: ScrollState = {
  progress: 0,
  velocity: 0,
  atmosphere: 'shoreline',
  scrollY: 0,
  maxScroll: 1,
  scrollToSection: () => {},
  scrollTo: noop,
};

const ScrollContext = createContext<ScrollState>(defaultState);

export function useScroll() {
  return useContext(ScrollContext);
}

// Section snap points as progress fractions (0–1)
const SECTION_PROGRESS = [0, 0.2, 0.4, 0.6, 0.8];

function getAtmosphere(progress: number): Atmosphere {
  if (progress < 0.20) return 'shoreline';      // Stage 1: The Shoreline — Identity
  if (progress < 0.40) return 'pocket';         // Stage 2: The Pocket — The Visceral
  if (progress < 0.60) return 'engine-room';    // Stage 3: The Engine Room — The Systems
  if (progress < 0.80) return 'selected-work';  // Stage 4: Selected Work — Web Projects
  return 'horizon';                              // Stage 5: The Horizon — The Perspective
}

interface ScrollProviderProps {
  children: ReactNode;
}

export function ScrollProvider({ children }: ScrollProviderProps) {
  const [state, setState] = useState<Omit<ScrollState, 'scrollToSection' | 'scrollTo'>>({
    progress: 0,
    velocity: 0,
    atmosphere: 'shoreline',
    scrollY: 0,
    maxScroll: 1,
  });
  const prevScrollY = useRef(0);
  const rafId = useRef<number>(0);
  const lenisRef = useRef<any>(null);
  const maxScrollRef = useRef(1);

  const scrollToSection = useCallback((index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, SECTION_PROGRESS.length - 1));
    const targetProgress = SECTION_PROGRESS[clampedIndex];
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const targetY = targetProgress * (maxScroll > 0 ? maxScroll : maxScrollRef.current);
    if (lenisRef.current) {
      lenisRef.current.scrollTo(targetY, { duration: 1.4 });
    } else {
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }
  }, []);

  const scrollTo = useCallback(
    (target: string | HTMLElement | number, options?: { offset?: number; duration?: number }) => {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(target, { offset: options?.offset ?? 0, duration: options?.duration ?? 1.4 });
      } else {
        // Fallback to native scroll when Lenis is not available
        const el = typeof target === 'string' ? document.querySelector(target) : target;
        if (el && typeof el !== 'number' && 'scrollIntoView' in el) {
          (el as HTMLElement).scrollIntoView({ behavior: 'smooth' });
        } else if (typeof target === 'number') {
          window.scrollTo({ top: target, behavior: 'smooth' });
        }
      }
    },
    [],
  );

  const onScroll = useCallback(() => {
    const scrollY = window.scrollY || window.pageYOffset;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    maxScrollRef.current = maxScroll;
    const progress = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;
    const velocity = scrollY - prevScrollY.current;
    prevScrollY.current = scrollY;

    setState((prev) => ({
      ...prev,
      progress,
      velocity,
      atmosphere: getAtmosphere(progress),
      scrollY,
      maxScroll,
    }));
  }, []);

  useEffect(() => {
    // Dynamic import Lenis to avoid SSR issues
    let lenis: any = null;
    let snapDebounceId: ReturnType<typeof setTimeout> | null = null;

    async function initLenis() {
      try {
        const Lenis = (await import('lenis')).default;
        lenis = new Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: 'vertical',
          gestureOrientation: 'vertical',
          smoothWheel: true,
          touchMultiplier: 2,
        });

        lenisRef.current = lenis;

        // Wire Lenis to GSAP ScrollTrigger
        const gsapModule = await import('gsap');
        const scrollTriggerModule = await import('gsap/ScrollTrigger');
        const gsap = gsapModule.default || gsapModule;
        const ScrollTrigger = scrollTriggerModule.ScrollTrigger || scrollTriggerModule.default;

        gsap.registerPlugin(ScrollTrigger);

        lenis.on('scroll', () => {
          ScrollTrigger.update();
          onScroll();

          // Section snap: debounce 550ms after scroll stops, then snap to nearest section start
          if (snapDebounceId) clearTimeout(snapDebounceId);
          snapDebounceId = setTimeout(() => {
            const scrollY = window.scrollY || 0;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            if (maxScroll <= 0) return;
            const p = scrollY / maxScroll;

            // Find nearest section start
            let nearestIdx = 0;
            let nearestDist = Infinity;
            SECTION_PROGRESS.forEach((sp, i) => {
              const dist = Math.abs(p - sp);
              if (dist < nearestDist) {
                nearestDist = dist;
                nearestIdx = i;
              }
            });

            // Only snap if the user is in a transition zone (within 8% of a boundary)
            // and not already very close to the snap point (< 0.5%)
            if (nearestDist > 0.005 && nearestDist < 0.08) {
              const targetY = SECTION_PROGRESS[nearestIdx] * maxScroll;
              lenis.scrollTo(targetY, { duration: 1.0 });
            }
          }, 550);
        });

        function raf(time: number) {
          lenis.raf(time);
          rafId.current = requestAnimationFrame(raf);
        }
        rafId.current = requestAnimationFrame(raf);
      } catch (e) {
        // Fallback: native scroll listener
        console.warn('Lenis init failed, falling back to native scroll:', e);
        window.addEventListener('scroll', onScroll, { passive: true });
      }
    }

    initLenis();

    return () => {
      if (snapDebounceId) clearTimeout(snapDebounceId);
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (lenisRef.current) lenisRef.current.destroy();
      window.removeEventListener('scroll', onScroll);
    };
  }, [onScroll]);

  return (
    <ScrollContext.Provider value={{ ...state, scrollToSection, scrollTo }}>
      {children}
    </ScrollContext.Provider>
  );
}
