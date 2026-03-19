'use client';

import { useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';

/**
 * High-frequency scroll state for use inside R3F useFrame loops.
 * Avoids React re-renders — reads directly from the DOM each frame.
 */
export function useProgress() {
  const state = useRef({
    progress: 0,
    velocity: 0,
    smoothProgress: 0,
    smoothVelocity: 0,
  });

  useFrame(() => {
    const scrollY = window.scrollY || window.pageYOffset;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const raw = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;
    const rawVelocity = raw - state.current.progress;

    // Smooth with lerp for buttery shader uniforms
    state.current.progress = raw;
    state.current.smoothProgress += (raw - state.current.smoothProgress) * 0.08;
    state.current.velocity = rawVelocity;
    state.current.smoothVelocity += (rawVelocity - state.current.smoothVelocity) * 0.1;
  });

  return state;
}

/**
 * Returns the current atmosphere segment name based on progress.
 */
export function getAtmosphereFromProgress(p: number): 'kinetic' | 'fluid' | 'vector' {
  if (p < 0.33) return 'kinetic';
  if (p < 0.66) return 'fluid';
  return 'vector';
}
