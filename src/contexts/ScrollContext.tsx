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
type SectionPoint = { progress: number; atmosphere: Atmosphere };

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
const FALLBACK_SECTION_POINTS: SectionPoint[] = [
  { progress: 0, atmosphere: 'shoreline' },
  { progress: 0.25, atmosphere: 'pocket' },
  { progress: 0.5, atmosphere: 'engine-room' },
  { progress: 0.75, atmosphere: 'engine-room' },
  { progress: 1, atmosphere: 'horizon' },
];
// Skip tiny progress deltas (<0.04% of total range) to reduce noisy re-renders from
// smooth scrolling while keeping section transitions visually responsive.
const PROGRESS_CHANGE_THRESHOLD = 0.0004;
// Ignore sub-pixel-equivalent velocity jitter so animation hooks only react to
// meaningful motion changes instead of high-frequency touch/momentum noise.
const VELOCITY_CHANGE_THRESHOLD = 0.5;

function getSectionPoints(maxScroll: number): SectionPoint[] {
  // During initial layout or very short content, maxScroll can be 0; keep stable fallback snap points.
  if (typeof document === 'undefined' || maxScroll <= 0) return FALLBACK_SECTION_POINTS;
  const sectionEls = Array.from(
    document.querySelectorAll<HTMLElement>('[data-scroll-section]')
  ).sort(
    (a, b) =>
      Number(a.dataset.sectionIndex ?? '0') - Number(b.dataset.sectionIndex ?? '0')
  );
  if (sectionEls.length < 4) return FALLBACK_SECTION_POINTS;

  const points = sectionEls.map((el) => {
    const progress = Math.min(Math.max(el.offsetTop / maxScroll, 0), 1);
    const atmosphere = (el.dataset.atmosphere as Atmosphere | undefined) ?? 'shoreline';
    return { progress, atmosphere };
  });
  return points;
}

function getAtmosphere(progress: number, sectionPoints: SectionPoint[]): Atmosphere {
  let current = sectionPoints[0]?.atmosphere ?? 'shoreline';
  for (const point of sectionPoints) {
    if (progress >= point.progress) current = point.atmosphere;
  }
  return current;
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
  const sectionPointsRef = useRef<SectionPoint[]>(FALLBACK_SECTION_POINTS);
  const isCoarsePointerRef = useRef(false);

  const scrollToSection = useCallback((index: number) => {
    const sectionPoints = sectionPointsRef.current;
    if (!sectionPoints.length) return;
    const clampedIndex = Math.max(0, Math.min(index, sectionPoints.length - 1));
    const targetProgress = sectionPoints[clampedIndex].progress;
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
    const sectionPoints = sectionPointsRef.current;
    maxScrollRef.current = maxScroll;
    const progress = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;
    const velocity = scrollY - prevScrollY.current;
    prevScrollY.current = scrollY;
    const nextAtmosphere = getAtmosphere(progress, sectionPoints);

    setState((prev) => {
      if (
        Math.abs(prev.progress - progress) < PROGRESS_CHANGE_THRESHOLD &&
        Math.abs(prev.velocity - velocity) < VELOCITY_CHANGE_THRESHOLD &&
        prev.maxScroll === maxScroll &&
        prev.atmosphere === nextAtmosphere
      ) {
        return prev;
      }
      return {
        ...prev,
        progress,
        velocity,
        atmosphere: nextAtmosphere,
        scrollY,
        maxScroll,
      };
    });
  }, []);

  useEffect(() => {
    // Dynamic import Lenis to avoid SSR issues
    let lenis: any = null;
    let snapDebounceId: ReturnType<typeof setTimeout> | null = null;

    const recalcSectionLayout = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      maxScrollRef.current = maxScroll > 0 ? maxScroll : 1;
      sectionPointsRef.current = getSectionPoints(maxScroll);
    };

    async function initLenis() {
      try {
        const Lenis = (await import('lenis')).default;
        isCoarsePointerRef.current = window.matchMedia('(pointer: coarse)').matches;
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
            if (isCoarsePointerRef.current) return;
            const scrollY = window.scrollY || 0;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            if (maxScroll <= 0) return;
            const p = scrollY / maxScroll;
            const sectionPoints = sectionPointsRef.current;

            // Find nearest section start
            let nearestIdx = 0;
            let nearestDist = Infinity;
            sectionPoints.forEach((sp, i) => {
              const sectionProgress = sp.progress;
              const dist = Math.abs(p - sectionProgress);
              if (dist < nearestDist) {
                nearestDist = dist;
                nearestIdx = i;
              }
            });

            // Only snap if the user is in a transition zone (within 8% of a boundary)
            // and not already very close to the snap point (< 0.5%)
            if (nearestDist > 0.005 && nearestDist < 0.08) {
              const targetY = sectionPoints[nearestIdx].progress * maxScroll;
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

    recalcSectionLayout();
    initLenis();
    window.addEventListener('resize', recalcSectionLayout, { passive: true });
    window.addEventListener('orientationchange', recalcSectionLayout, { passive: true });

    return () => {
      if (snapDebounceId) clearTimeout(snapDebounceId);
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (lenisRef.current) lenisRef.current.destroy();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', recalcSectionLayout);
      window.removeEventListener('orientationchange', recalcSectionLayout);
    };
  }, [onScroll]);

  return (
    <ScrollContext.Provider value={{ ...state, scrollToSection, scrollTo }}>
      {children}
    </ScrollContext.Provider>
  );
}
