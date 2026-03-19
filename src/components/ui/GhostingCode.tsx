'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useScroll } from '@/contexts/ScrollContext';

/**
 * GhostingCode — Stage 3: The Engine Room (51–75% scroll)
 *
 * Faint, low-opacity TypeScript / Next.js / Three.js code fragments
 * scattered across the screen. Each snippet subtly repels from the
 * mouse cursor — like ghostly code that doesn't want to be seen.
 *
 * Runs on RAF with direct DOM manipulation for zero re-render overhead.
 */

const CODE_SNIPPETS = [
  `const useProgress = () => {
  const ref = useRef(0);
  useFrame(() => {
    const s = window.scrollY;
    const max = doc.scrollHeight - win.h;
    ref.current = s / max;
  });
  return ref;
};`,

  `type Atmosphere =
  | 'shoreline'
  | 'pocket'
  | 'engine-room'
  | 'horizon';

function getAtmosphere(p: number) {
  if (p < 0.25) return 'shoreline';
  if (p < 0.50) return 'pocket';
  if (p < 0.75) return 'engine-room';
  return 'horizon';
}`,

  `export async function generateStaticParams() {
  const projects = await tina
    .queries.projectConnection();
  return projects.map((p) => ({
    slug: p._sys.filename,
  }));
}`,

  `const lenis = new Lenis({
  duration: 1.2,
  easing: (t: number) =>
    Math.min(1, 1.001 - 2 ** (-10 * t)),
  orientation: 'vertical',
  smoothWheel: true,
});`,

  `<Canvas
  gl={{ antialias: true,
    powerPreference: 'high-performance' }}
  dpr={[1, 2]}
>
  <SceneManager
    transitionRef={transitionRef} />
  <EffectComposer>
    <TransitionPass ref={transitionRef} />
    <Bloom intensity={0.8} mipmapBlur />
  </EffectComposer>
</Canvas>`,

  `const submergeFactor =
  exp(-pow(
    (uProgress - 0.25) * 12.0, 2.0
  ));
float noiseDisplace =
  snoise(vec3(uv * 3.5, uTime * 0.4))
  * 0.05 * submergeFactor;`,

  `smoothProgress.current +=
  (rawProgress - smoothProgress.current)
  * 0.06;

camera.position.z +=
  (targetZ - camera.position.z) * 0.08;`,
];

interface SnippetDef {
  code: string;
  x: number;    // % from left
  y: number;    // % from top
  opacity: number;
  rotation: number;
}

export function GhostingCode() {
  const { atmosphere } = useScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const elementRefs = useRef<(HTMLPreElement | null)[]>([]);

  // Randomise positions once on mount
  const snippets: SnippetDef[] = useMemo(
    () =>
      CODE_SNIPPETS.map((code, i) => ({
        code,
        // Spread across the full viewport avoiding centre cluster
        x: 2 + (i % 3) * 32 + Math.random() * 8,
        y: 4 + Math.floor(i / 3) * 30 + Math.random() * 10,
        opacity: 0.032 + Math.random() * 0.036,
        rotation: (Math.random() - 0.5) * 4,
      })),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Mouse tracking
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // RAF loop — direct DOM transform for maximum perf
  useEffect(() => {
    if (atmosphere !== 'engine-room') {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    const REPEL_RADIUS = 220; // px
    const REPEL_STRENGTH = 24; // px max push

    const update = () => {
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      elementRefs.current.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = cx - mx;
        const dy = cy - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let tx = 0;
        let ty = 0;
        if (dist < REPEL_RADIUS && dist > 0) {
          const force = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH;
          tx = (dx / dist) * force;
          ty = (dy / dist) * force;
        }

        el.style.transform = `rotate(${snippets[i].rotation}deg) translate(${tx}px, ${ty}px)`;
      });

      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafRef.current);
  }, [atmosphere, snippets]);

  // Reset transforms when leaving engine room
  useEffect(() => {
    if (atmosphere !== 'engine-room') {
      elementRefs.current.forEach((el, i) => {
        if (el) el.style.transform = `rotate(${snippets[i].rotation}deg) translate(0px, 0px)`;
      });
    }
  }, [atmosphere, snippets]);

  const isVisible = atmosphere === 'engine-room';

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2,
        pointerEvents: 'none',
        overflow: 'hidden',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 1.2s ease',
      }}
    >
      {snippets.map((s, i) => (
        <pre
          key={i}
          ref={(el) => { elementRefs.current[i] = el; }}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            fontFamily: 'JetBrains Mono, SF Mono, monospace',
            fontSize: '0.42rem',
            lineHeight: 1.7,
            letterSpacing: '0.04em',
            color: '#aaaaaa',
            opacity: s.opacity,
            transform: `rotate(${s.rotation}deg)`,
            whiteSpace: 'pre',
            userSelect: 'none',
            willChange: 'transform',
            transition: 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        >
          {s.code}
        </pre>
      ))}
    </div>
  );
}
