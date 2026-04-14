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
}

const defaultState: ScrollState = {
  progress: 0,
  velocity: 0,
  atmosphere: 'shoreline',
  scrollY: 0,
  maxScroll: 1,
};

const ScrollContext = createContext<ScrollState>(defaultState);

export function useScroll() {
  return useContext(ScrollContext);
}

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
  const [state, setState] = useState<ScrollState>(defaultState);
  const prevScrollY = useRef(0);
  const rafId = useRef<number>(0);
  const lenisRef = useRef<any>(null);

  const onScroll = useCallback(() => {
    const scrollY = window.scrollY || window.pageYOffset;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;
    const velocity = scrollY - prevScrollY.current;
    prevScrollY.current = scrollY;

    setState({
      progress,
      velocity,
      atmosphere: getAtmosphere(progress),
      scrollY,
      maxScroll,
    });
  }, []);

  useEffect(() => {
    // Dynamic import Lenis to avoid SSR issues
    let lenis: any = null;
    let snapDebounceId: ReturnType<typeof setTimeout> | null = null;

    // Section snap points — normalized scroll positions (0–1) for each atmosphere boundary
    const SNAP_POINTS = [0, 0.2, 0.4, 0.6, 0.8, 1.0];

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
    <ScrollContext.Provider value={state}>
      {children}
    </ScrollContext.Provider>
  );
}
