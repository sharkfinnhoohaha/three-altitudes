'use client';

import Image from 'next/image';
import { useRef, useEffect, useState } from 'react';
import { useScroll } from '@/contexts/ScrollContext';

/**
 * MediaLayers — fixed atmospheric media layers that sit above the Three.js
 * canvas (z-index 1) and below the HUD (z-index 10).
 *
 * Layer 1 — Shoreline texture:
 *   The deep moody teal ocean swell photo (wave-teal.png).
 *   Low opacity, multiply blend — adds surface grain and water texture to
 *   the Three.js scene. Fades out at the Stage 1→2 boundary.
 *
 * Layer 2 — Wave-wipe transition video:
 *   Plays `wave-transition.mp4` once when scroll crosses 24% → 26%.
 *   Full-screen, muted, covers the GLSL transition with real ocean footage.
 *   Disappears instantly after playback.
 *
 * Layer 3 — Code background video (Stage 3):
 *   `code-bg.mp4` looped at very low opacity behind the Engine Room stage.
 *   Adds a second layer of visual texture to the ghosting code effect.
 */
export function MediaLayers() {
  const { progress, atmosphere } = useScroll();
  const waveVideoRef = useRef<HTMLVideoElement>(null);
  const hasPlayedRef = useRef(false);
  const [waveVideoVisible, setWaveVideoVisible] = useState(false);

  // ── Wave-wipe video trigger ──────────────────────────────────────────────
  // Fire once when progress crosses 0.23 going forward
  useEffect(() => {
    if (progress > 0.23 && progress < 0.32 && !hasPlayedRef.current) {
      hasPlayedRef.current = true;
      const video = waveVideoRef.current;
      if (!video) return;

      setWaveVideoVisible(true);
      video.currentTime = 0;
      video.play().catch(() => {});

      // Hide after video duration (or fallback 2.5s)
      const duration = video.duration > 0 ? video.duration * 1000 : 2500;
      const timer = setTimeout(() => setWaveVideoVisible(false), duration + 200);
      return () => clearTimeout(timer);
    }
    // Reset trigger so it can fire again if user scrolls back
    if (progress < 0.18) {
      hasPlayedRef.current = false;
    }
  }, [progress]);

  // Shoreline texture opacity — full in Stage 1, fade out into Pocket
  const shorelineOpacity =
    progress < 0.22
      ? 0.14
      : progress < 0.32
        ? 0.14 * (1 - (progress - 0.22) / 0.10)
        : 0;

  // Code video opacity — fade in/out for Engine Room
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
      {/* ── Layer 1: Shoreline ocean texture ─────────────────────────── */}
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

      {/* ── Layer 2: Wave-wipe transition video ───────────────────────── */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 8,
          pointerEvents: 'none',
          opacity: waveVideoVisible ? 1 : 0,
          transition: waveVideoVisible ? 'opacity 0.1s ease' : 'opacity 0.4s ease',
        }}
      >
        <video
          ref={waveVideoRef}
          src="/videos/wave-transition.mp4"
          muted
          playsInline
          preload="auto"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onEnded={() => setWaveVideoVisible(false)}
        />
      </div>

      {/* ── Layer 3: Code bg video (Engine Room) ─────────────────────── */}
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
