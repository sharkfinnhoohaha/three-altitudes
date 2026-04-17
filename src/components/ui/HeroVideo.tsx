'use client';

import { useScroll } from '@/contexts/ScrollContext';
import { useRef, useEffect } from 'react';

interface HeroVideoProps {
  src?: string | null;
}

/**
 * HeroVideo — fullscreen fixed video for the Shoreline section.
 * Source is set via Sanity siteSettings.heroVideo and passed in as a prop.
 * Plays only when in the shoreline atmosphere; fades out as user scrolls away.
 */
export function HeroVideo({ src }: HeroVideoProps) {
  const { progress, atmosphere } = useScroll();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (atmosphere === 'shoreline') {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [atmosphere]);

  if (!src) return null;

  const opacity =
    progress < 0.05
      ? (progress / 0.05) * 0.55
      : progress < 0.18
        ? 0.55
        : progress < 0.27
          ? 0.55 * (1 - (progress - 0.18) / 0.09)
          : 0;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
        opacity,
        willChange: 'opacity',
        mixBlendMode: 'screen',
      }}
    >
      <video
        ref={videoRef}
        src={src}
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
  );
}
