'use client';

import { useRef, useEffect } from 'react';
import { useScroll } from '@/contexts/ScrollContext';

const ATMOSPHERE_COLORS: Record<string, string> = {
  shoreline: '#3dd9c4',
  pocket: '#ff8c00',
  'engine-room': '#4a4a4a',
  'selected-work': '#4a4a4a',
  horizon: 'transparent',
};

interface MediaLayersProps {
  engineRoomVideoUrl?: string | null;
}

/**
 * MediaLayers — fixed atmospheric layers.
 *
 * Layer A — CSS radial-gradient vignette, color shifts with atmosphere.
 * Layer B — Engine Room code background video (engineRoomVideoUrl or code-bg.mp4, 6% opacity).
 */
export function MediaLayers({ engineRoomVideoUrl }: MediaLayersProps) {
  const { atmosphere } = useScroll();
  const codeVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = codeVideoRef.current;
    if (!video) return;
    if (atmosphere === 'engine-room') {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [atmosphere]);

  const vignetteColor = ATMOSPHERE_COLORS[atmosphere] ?? 'transparent';
  const vignetteOpacity = atmosphere === 'horizon' ? 0 : 0.12;

  const codeVideoSrc = engineRoomVideoUrl ?? '/videos/code-bg.mp4';

  return (
    <>
      {/* Atmosphere color vignette — pure CSS, no image load */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          background: `radial-gradient(ellipse at center, transparent 25%, ${vignetteColor} 100%)`,
          opacity: vignetteOpacity,
          transition: 'background 1.2s ease, opacity 1.2s ease',
          willChange: 'opacity',
        }}
      />

      {/* Engine Room: code background video */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          opacity: atmosphere === 'engine-room' ? 0.06 : 0,
          transition: 'opacity 1.2s ease',
          mixBlendMode: 'screen',
          willChange: 'opacity',
        }}
      >
        <video
          ref={codeVideoRef}
          src={codeVideoSrc}
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
