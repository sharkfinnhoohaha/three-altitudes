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

export type Atmosphere = 'shoreline' | 'pocket' | 'engine-room' | 'horizon';

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
  if (progress < 0.25) return 'shoreline';   // Stage 1: The Shoreline — Identity
  if (progress < 0.50) return 'pocket';      // Stage 2: The Pocket — The Visceral
  if (progress < 0.75) return 'engine-room'; // Stage 3: The Engine Room — The Systems
  return 'horizon';                           // Stage 4: The Horizon — The Perspective
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
