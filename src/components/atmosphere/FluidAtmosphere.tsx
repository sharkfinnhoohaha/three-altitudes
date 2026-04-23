'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { isCompactLayout } from '@/lib/responsive';

/**
 * PocketAtmosphere — Stage 2 (26–50% scroll)
 *
 * Smooth, mesmerising dark-blue ocean wave. A high-resolution PlaneGeometry
 * with layered sinusoidal vertex displacement creates rolling swells that
 * feel like staring into the Pacific at dusk. Mouse Y gently modulates
 * wave amplitude for hover interaction.
 */
export function PocketAtmosphere() {
  const waveRef = useRef<THREE.Mesh>(null);
  const mouseRef = useRef({ y: 0 });
  const smoothMouseY = useRef(0);

  // Store original vertex positions for wave displacement
  const origPositions = useRef<Float32Array | null>(null);

  // Reduce geometry complexity on mobile/coarse-pointer devices.
  const compact = useMemo(() => isCompactLayout(), []);
  const waveXSegs = compact ? 48 : 96;
  const waveYSegs = compact ? 24 : 48;

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouse, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  const waveGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(50, 24, waveXSegs, waveYSegs);
    origPositions.current = new Float32Array(
      geo.attributes.position.array as Float32Array
    );
    return geo;
  }, [waveXSegs, waveYSegs]);

  const waveMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#0a1a3a',
        emissive: '#061430',
        emissiveIntensity: 0.6,
        roughness: 0.12,
        metalness: 0.7,
        transparent: true,
        opacity: 0.0,
        side: THREE.DoubleSide,
      }),
    []
  );

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    const scrollY = window.scrollY || 0;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;

    // Same visibility window as the old PocketAtmosphere
    const visibility =
      progress < 0.20
        ? 0
        : progress < 0.28
          ? (progress - 0.20) / 0.08
          : progress < 0.52
            ? 1
            : Math.max(0, 1 - (progress - 0.52) / 0.08);

    // Smooth mouse — slower lerp for a relaxed, fluid feel
    smoothMouseY.current +=
      (mouseRef.current.y - smoothMouseY.current) * 0.04;
    const hoverAmp = 1.0 + Math.abs(smoothMouseY.current) * 0.5;

    waveMat.opacity = visibility * 0.35;

    // --- Wave plane vertex displacement (layered ocean swells) ---
    if (waveRef.current && origPositions.current) {
      const pos = waveGeo.attributes.position.array as Float32Array;
      const orig = origPositions.current;

      for (let i = 0; i < pos.length; i += 3) {
        const ox = orig[i];
        const oy = orig[i + 1];

        // Primary ocean swell — long wavelength, slow majestic roll
        const swell1 = Math.sin(ox * 0.06 + time * 0.25) * 2.2;
        // Secondary cross-swell — slightly faster, offset angle for realism
        const swell2 =
          Math.sin(oy * 0.08 + ox * 0.03 + time * 0.18 + 1.5) * 1.4;
        // Tertiary chop — shorter wavelength, gentle
        const ripple =
          Math.sin(ox * 0.14 + oy * 0.10 + time * 0.35 + 3.0) * 0.5;
        // Micro detail — very fine, slow drift
        const micro =
          Math.sin((ox * 0.22 + oy * 0.18) + time * 0.12 + 5.0) * 0.25;

        pos[i + 2] = (swell1 + swell2 + ripple + micro) * hoverAmp;
      }

      waveGeo.attributes.position.needsUpdate = true;
      waveGeo.computeVertexNormals();
    }
  });

  return (
    <mesh
      ref={waveRef}
      geometry={waveGeo}
      material={waveMat}
      position={[0, -2, -32]}
      rotation={[-Math.PI / 3.5, 0, 0]}
    />
  );
}
