'use client';

import Image from 'next/image';
import { useScroll } from '@/contexts/ScrollContext';

/**
 * MediaLayers — fixed atmospheric media layers.
 *
 * Layer 1  — Shoreline surf bg (finn-surf-paddle-bw.jpg, full-bleed)
 * Layer 2  — Shoreline surf bg 2 (finn-surf.jpg, full-bleed)
 * Layer 3  — Shoreline wave texture overlay (wave-teal.png)
 * Layer 4  — Shoreline wave vivid accent (wave-vivid.png)
 * Layer 5  — Pocket drums bg (finn-drums-mint.jpg, full-bleed)
 * Layer 6  — Pocket drums bg 2 (finn-drums-live.jpg, full-bleed)
 * Layer 7  — Code background video (Engine Room)
 */
export function MediaLayers() {
  const { progress, atmosphere } = useScroll();

  // ── Shoreline image backgrounds ────────────────────────────────────────────
  const surfPaddleOpacity =
    progress < 0.04
      ? (progress / 0.04) * 0.18
      : progress < 0.22
        ? 0.18
        : progress < 0.32
          ? 0.18 * (1 - (progress - 0.22) / 0.10)
          : 0;

  const surfRideOpacity =
    progress < 0.08
      ? (progress / 0.08) * 0.12
      : progress < 0.22
        ? 0.12
        : progress < 0.30
          ? 0.12 * (1 - (progress - 0.22) / 0.08)
          : 0;

  // ── Shoreline wave overlays ─────────────────────────────────────────────────
  const waveOverlayOpacity =
    progress < 0.28
      ? 0.32
      : progress < 0.36
        ? 0.32 * (1 - (progress - 0.28) / 0.08)
        : 0;

  const waveVividOpacity =
    progress < 0.22
      ? 0.15
      : progress < 0.28
        ? 0.15 * (1 - (progress - 0.22) / 0.06)
        : 0;

  // ── Pocket drums backgrounds ────────────────────────────────────────────────
  const drumsMintOpacity =
    progress < 0.22
      ? 0
      : progress < 0.30
        ? ((progress - 0.22) / 0.08) * 0.20
        : progress < 0.48
          ? 0.20
          : progress < 0.56
            ? 0.20 * (1 - (progress - 0.48) / 0.08)
            : 0;

  const drumsLiveOpacity =
    progress < 0.26
      ? 0
      : progress < 0.34
        ? ((progress - 0.26) / 0.08) * 0.15
        : progress < 0.50
          ? 0.15
          : progress < 0.58
            ? 0.15 * (1 - (progress - 0.50) / 0.08)
            : 0;

  // ── Engine Room code video ──────────────────────────────────────────────────
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
      {/* Shoreline: surf paddle bg */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          opacity: surfPaddleOpacity,
          willChange: 'opacity',
          mixBlendMode: 'screen',
        }}
      >
        <Image
          src="/images/finn-surf-paddle-bw.jpg"
          alt=""
          fill
          style={{ objectFit: 'cover', objectPosition: 'center top' }}
          sizes="100vw"
          priority
        />
      </div>

      {/* Shoreline: surf ride bg */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          opacity: surfRideOpacity,
          willChange: 'opacity',
          mixBlendMode: 'screen',
        }}
      >
        <Image
          src="/images/finn-surf.jpg"
          alt=""
          fill
          style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
          sizes="100vw"
        />
      </div>

      {/* Shoreline: wave-teal texture overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2,
          pointerEvents: 'none',
          opacity: waveOverlayOpacity,
          willChange: 'opacity',
          mixBlendMode: 'screen',
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

      {/* Shoreline: wave-vivid accent */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2,
          pointerEvents: 'none',
          opacity: waveVividOpacity,
          willChange: 'opacity',
          mixBlendMode: 'color-dodge',
        }}
      >
        <Image
          src="/images/wave-vivid.png"
          alt=""
          fill
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          sizes="100vw"
          priority
        />
      </div>

      {/* Pocket: drums mint bg */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          opacity: drumsMintOpacity,
          willChange: 'opacity',
          mixBlendMode: 'screen',
        }}
      >
        <Image
          src="/images/finn-drums-mint.jpg"
          alt=""
          fill
          style={{ objectFit: 'cover', objectPosition: 'center top' }}
          sizes="100vw"
        />
      </div>

      {/* Pocket: drums live bg */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          opacity: drumsLiveOpacity,
          willChange: 'opacity',
          mixBlendMode: 'screen',
        }}
      >
        <Image
          src="/images/finn-drums-live.jpg"
          alt=""
          fill
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          sizes="100vw"
        />
      </div>

      {/* Engine Room: code background video */}
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
