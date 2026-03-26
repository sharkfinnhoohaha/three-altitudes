'use client';

import Image from 'next/image';
import { useRef, useEffect } from 'react';
import { useScroll } from '@/contexts/ScrollContext';
import type { SanityMediaItem } from '@/lib/sanity/types';

/**
 * MediaLayers — fixed atmospheric media layers.
 *
 * Layer 0  — Shoreline hero video (wave-transition.mp4, poster=finn-surf-paddle-bw.jpg) [LCP optimized]
 * Layer 1  — Shoreline surf bg (finn-surf-paddle-bw.jpg, full-bleed)
 * Layer 2  — Shoreline surf bg 2 (finn-surf.jpg, full-bleed)
 * Layer 3  — Shoreline wave texture overlay (wave-teal.png)
 * Layer 4  — Shoreline wave vivid accent (wave-vivid.png)
 * Layer 5  — Pocket drums bg (Sanity photo[0] or finn-drums-mint.jpg fallback)
 * Layer 6  — Pocket drums bg 2 (Sanity photo[1] or finn-drums-live.jpg fallback)
 * Layer 7  — Code background video (Engine Room)
 */

interface MediaLayersProps {
  /** Optional photos/videos uploaded via Sanity for the Pocket section. */
  photos?: SanityMediaItem[];
}

/** Render a single Sanity media item as either an <Image> or a <video>. */
function SanityMedia({
  item,
  objectPosition = 'center',
}: {
  item: SanityMediaItem;
  objectPosition?: string;
}) {
  const isVideo =
    item._type === 'file' ||
    (item.mimeType != null && item.mimeType.startsWith('video/'));

  if (isVideo) {
    return (
      <video
        src={item.url}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition,
        }}
      />
    );
  }

  return (
    <Image
      src={item.url}
      alt=""
      fill
      style={{ objectFit: 'cover', objectPosition }}
      sizes="100vw"
    />
  );
}

export function MediaLayers({ photos = [] }: MediaLayersProps) {
  const { progress, atmosphere } = useScroll();
  const heroVideoRef = useRef<HTMLVideoElement>(null);

  // ── Hero video — play/pause based on visibility ─────────────────────────────
  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;
    if (atmosphere === 'shoreline') {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [atmosphere]);

  // ── Hero video opacity — full in shoreline, fades during transition ──────────
  const heroVideoOpacity =
    progress < 0.05
      ? (progress / 0.05) * 0.55
      : progress < 0.18
        ? 0.55
        : progress < 0.27
          ? 0.55 * (1 - (progress - 0.18) / 0.09)
          : 0;

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
      {/* Shoreline: hero video — LCP poster strategy */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          opacity: heroVideoOpacity,
          willChange: 'opacity',
          mixBlendMode: 'screen',
        }}
      >
        <video
          ref={heroVideoRef}
          poster="/images/finn-surf-paddle-bw.jpg"
          src="/videos/wave-transition.mp4"
          muted
          loop
          playsInline
          preload="none"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
      </div>

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

      {/* Pocket: drums mint bg — Sanity photo[0] or static fallback */}
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
        {photos[0] ? (
          <SanityMedia item={photos[0]} objectPosition="center top" />
        ) : (
          <Image
            src="/images/finn-drums-mint.jpg"
            alt=""
            fill
            style={{ objectFit: 'cover', objectPosition: 'center top' }}
            sizes="100vw"
          />
        )}
      </div>

      {/* Pocket: drums live bg — Sanity photo[1] or static fallback */}
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
        {photos[1] ? (
          <SanityMedia item={photos[1]} objectPosition="center" />
        ) : (
          <Image
            src="/images/finn-drums-live.jpg"
            alt=""
            fill
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            sizes="100vw"
          />
        )}
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
