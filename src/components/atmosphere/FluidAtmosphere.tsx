'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const BAR_COUNT = 64;
const BEAT_FREQ = 2.0;

/**
 * PocketAtmosphere — Stage 2 (26–50% scroll)
 *
 * The Visceral: heat and kinetic energy of touring and live production.
 * 3D waveform: 64 vertical bars in a horizontal array, driven by a
 * traveling sine wave. Mouse Y modulates amplitude for hover interaction.
 */
export function PocketAtmosphere() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const mouseRef = useRef({ y: 0 });
  const smoothMouseY = useRef(0);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouse, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  const barData = useMemo(
    () =>
      Array.from({ length: BAR_COUNT }, (_, i) => ({
        xNorm: i / (BAR_COUNT - 1), // 0→1
        x: ((i / (BAR_COUNT - 1)) - 0.5) * 32, // -16 → +16
        phase: (i / BAR_COUNT) * Math.PI * 6, // initial wave phase
        baseHeight: 0.08 + Math.random() * 0.04, // very thin at rest
        width: 0.12 + Math.random() * 0.06,
      })),
    []
  );

  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#cc6600',
        emissive: '#ff4400',
        emissiveIntensity: 0.3,
        roughness: 0.25,
        metalness: 0.4,
        transparent: true,
        opacity: 0.7,
      }),
    []
  );

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;

    const scrollY = window.scrollY || 0;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;

    const visibility =
      progress < 0.20
        ? 0
        : progress < 0.28
          ? (progress - 0.20) / 0.08
          : progress < 0.52
            ? 1
            : Math.max(0, 1 - (progress - 0.52) / 0.08);

    material.opacity = visibility * 0.72;

    // Smooth mouse
    smoothMouseY.current += (mouseRef.current.y - smoothMouseY.current) * 0.06;
    const hoverAmp = 0.35 + Math.abs(smoothMouseY.current) * 0.9;

    // Beat pulse — only drives emissive, not position
    const rawBeat = Math.sin(time * Math.PI * BEAT_FREQ * 2);
    const beat = Math.pow(Math.max(0, rawBeat), 10);
    material.emissiveIntensity = 0.25 + beat * 1.8;

    // Traveling waveform
    for (let i = 0; i < BAR_COUNT; i++) {
      const d = barData[i];

      // Multi-frequency waveform height
      const wave1 = Math.sin(d.xNorm * Math.PI * 4 - time * 1.2) * 0.6;
      const wave2 = Math.sin(d.xNorm * Math.PI * 8 - time * 2.1 + 1.0) * 0.25;
      const wave3 = Math.sin(d.xNorm * Math.PI * 2.5 - time * 0.7 + 2.3) * 0.15;
      const waveHeight = (wave1 + wave2 + wave3) * hoverAmp;

      const barH = d.baseHeight + Math.abs(waveHeight);

      dummy.position.set(d.x, waveHeight * 0.5, -32);
      dummy.scale.set(d.width, barH, 0.06);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, BAR_COUNT]}
      frustumCulled={false}
    />
  );
}
