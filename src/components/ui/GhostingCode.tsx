'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useScroll } from '@/contexts/ScrollContext';

const CODE_SNIPPETS = [
  `// sømliøya — dynamic cabin routes
export async function generateStaticParams() {
  const cabins = await sanity.fetch(
    \`*[_type == "cabin"]{ slug }\`
  );
  return cabins.map((c) => ({
    slug: c.slug.current,
  }));
}

export default async function CabinPage({
  params,
}: {
  params: { slug: string };
}) {
  const cabin = await getCabin(params.slug);
  return <CabinHero data={cabin} />;
}`,

  `// overlook-strategy/lib/brand.ts
export const OVERLOOK_BRAND = {
  primary: '#0a0a0a',
  accent: '#ff6b35',
  grid: 12,
  type: {
    display: 'Cormorant Garamond',
    mono: 'JetBrains Mono',
    body: 'Helvetica Neue',
  },
  breakpoints: {
    sm: '640px',
    md: '1024px',
    lg: '1440px',
  },
} as const;`,

  `// three-altitudes/SceneManager.tsx
useFrame((_state, delta) => {
  const scrollY = window.scrollY || 0;
  const maxScroll =
    doc.scrollHeight - window.innerHeight;
  const p = scrollY / maxScroll;

  // Camera rail — Z-axis scroll
  const targetZ = lerp(10, -100, p);
  camera.position.z +=
    (targetZ - camera.position.z) * 0.08;

  // Background: 4 cinematic stages
  tempColor.copy(SHORELINE).lerp(
    POCKET, smoothstep(p, 0.25, 0.50)
  );
});`,

  `// overlook-audio/lib/signalChain.ts
const ctx = new AudioContext();
const compressor = ctx.createDynamicsCompressor();
compressor.threshold.setValueAtTime(-24, ctx.currentTime);
compressor.ratio.setValueAtTime(4, ctx.currentTime);
compressor.attack.setValueAtTime(0.003, ctx.currentTime);
compressor.release.setValueAtTime(0.25, ctx.currentTime);

source.connect(compressor)
  .connect(ctx.destination);`,

  `// contexts/ScrollContext.tsx
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) =>
    Math.min(1, 1.001 - 2 ** (-10 * t)),
  smoothWheel: true,
});

lenis.on('scroll', () => {
  ScrollTrigger.update();
  onScroll();
});

function raf(time: number) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}`,

  `// shaders/TransitionPass.glsl
float luma = dot(
  texture2D(uMask, uv).rgb,
  vec3(0.2126, 0.7152, 0.0722)
);

float edge = smoothstep(
  uWipeProgress - uEdgeSoftness,
  uWipeProgress + uEdgeSoftness,
  luma
);

// Wave crests wipe first
outputColor = mix(
  atmosphere1, atmosphere2, edge
);`,

  `// next.config.ts
const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three'],
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'cdn.sanity.io',
    }],
  },
  experimental: {
    turbo: {},
  },
};`,

  `// lib/aviation.ts
interface FlightPlan {
  origin: 'KCMA';     // Camarillo
  destination: string;
  altitude: number;    // MSL feet
  heading: number;     // degrees
  squawk: string;      // transponder
  remarks: 'VFR' | 'IFR';
}

const today: FlightPlan = {
  origin: 'KCMA',
  destination: 'KVTA',
  altitude: 5200,
  heading: 270,
  squawk: '1200',
  remarks: 'VFR',
};`,
];

interface SnippetDef {
  code: string;
  x: number;
  y: number;
  opacity: number;
  rotation: number;
}

export function GhostingCode() {
  const { atmosphere } = useScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const elementRefs = useRef<(HTMLPreElement | null)[]>([]);

  const snippets: SnippetDef[] = useMemo(
    () =>
      CODE_SNIPPETS.map((code, i) => ({
        code,
        x: 1 + (i % 4) * 24 + Math.random() * 6,
        y: 2 + Math.floor(i / 4) * 42 + Math.random() * 8,
        opacity: 0.025 + Math.random() * 0.03,
        rotation: (Math.random() - 0.5) * 3.5,
      })),
    []
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useEffect(() => {
    if (atmosphere !== 'engine-room') {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    const REPEL_RADIUS = 240;
    const REPEL_STRENGTH = 28;

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
            fontSize: '0.38rem',
            lineHeight: 1.65,
            letterSpacing: '0.04em',
            color: '#999999',
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
