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

// Fallback section snap points as progress fractions (0–1).
const FALLBACK_SECTION_PROGRESS = [0, 0.25, 0.5, 0.75];

function getSectionProgressPoints(maxScroll: number) {
  // During initial layout or very short content, maxScroll can be 0; keep stable fallback snap points.
  if (typeof document === 'undefined' || maxScroll <= 0) return FALLBACK_SECTION_PROGRESS;
  const sectionEls = Array.from(
    document.querySelectorAll<HTMLElement>('[data-scroll-section]')
  ).sort(
    (a, b) =>
      Number(a.dataset.sectionIndex ?? '0') - Number(b.dataset.sectionIndex ?? '0')
  );
  if (sectionEls.length < 4) return FALLBACK_SECTION_PROGRESS;

  const points = sectionEls.map((el) =>
    Math.min(Math.max(el.offsetTop / maxScroll, 0), 1)
  );
  return points;
}

function getAtmosphere(progress: number, sectionPoints: number[]): Atmosphere {
  if (sectionPoints.length < 4) {
    if (progress < 0.25) return 'shoreline';
    if (progress < 0.5) return 'pocket';
    if (progress < 0.75) return 'engine-room';
    return 'horizon';
  }

  const b1 = (sectionPoints[0] + sectionPoints[1]) / 2;
  const b2 = (sectionPoints[1] + sectionPoints[2]) / 2;
  const b3 = (sectionPoints[2] + sectionPoints[3]) / 2;

  if (progress < b1) return 'shoreline';
  if (progress < b2) return 'pocket';
  if (progress < b3) return 'engine-room';
  return 'horizon';
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
  const sectionProgressRef = useRef<number[]>(FALLBACK_SECTION_PROGRESS);

  const scrollToSection = useCallback((index: number) => {
    const sectionProgress = sectionProgressRef.current;
    if (!sectionProgress.length) return;
    const clampedIndex = Math.max(0, Math.min(index, sectionProgress.length - 1));
    const targetProgress = sectionProgress[clampedIndex];
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
    const sectionProgress = getSectionProgressPoints(maxScroll);
    sectionProgressRef.current = sectionProgress;
    maxScrollRef.current = maxScroll;
    const progress = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;
    const velocity = scrollY - prevScrollY.current;
    prevScrollY.current = scrollY;

    setState((prev) => ({
      ...prev,
      progress,
      velocity,
      atmosphere: getAtmosphere(progress, sectionProgress),
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
            const sectionProgress = getSectionProgressPoints(maxScroll);
            sectionProgressRef.current = sectionProgress;

            // Find nearest section start
            let nearestIdx = 0;
            let nearestDist = Infinity;
            sectionProgress.forEach((sp, i) => {
              const dist = Math.abs(p - sp);
              if (dist < nearestDist) {
                nearestDist = dist;
                nearestIdx = i;
              }
            });

            // Only snap if the user is in a transition zone (within 8% of a boundary)
            // and not already very close to the snap point (< 0.5%)
            if (nearestDist > 0.005 && nearestDist < 0.08) {
              const targetY = sectionProgress[nearestIdx] * maxScroll;
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
