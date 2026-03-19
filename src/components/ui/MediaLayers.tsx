'use client';

import Image from 'next/image';
import { useScroll } from '@/contexts/ScrollContext';

/**
 * MediaLayers — fixed atmospheric media layers.
 *
 * Layer 1 — Shoreline texture (wave-teal.png overlay).
 * Layer 2 — REMOVED: Wave-wipe video now handled by TransitionPass shader.
 * Layer 3 — Code background video (Engine Room).
 */
export function MediaLayers() {
  const { progress, atmosphere } = useScroll();

  const shorelineOpacity =
    progress < 0.22
      ? 0.14
      : progress < 0.32
        ? 0.14 * (1 - (progress - 0.22) / 0.10)
        : 0;

  const codeVideoOpacity =
    atmosphere === 'engine-room'
      ? progress < 0.53
        ? (progress - 0.45) / 0.08
        : progress > 0.70
          ? Math.max(0, 1 - (progress - 0.70) / 0.08)
          : 1
      : 0;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          opacity: shorelineOpacity,
          transition: 'opacity 0.6s ease',
          mixBlendMode: 'overlay',
          willChange: 'opacity',
        }}
      >
        <Image
          src="/images/wave-teal.png"
          alt=""
          fill
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          sizes="100vw"
          priority
        />
      </div>

      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          opacity: codeVideoOpacity * 0.06,
          transition: 'opacity 1s ease',
          mixBlendMode: 'screen',
          willChange: 'opacity',
        }}
      >
        <video
          src="/videos/code-bg.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
    </>
  );
}
