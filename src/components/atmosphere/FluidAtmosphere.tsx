'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const FILAMENT_COUNT = 65;

// 120 BPM = 2 Hz — the snare beat frequency
const BEAT_FREQ = 2.0;

/**
 * PocketAtmosphere — Stage 2 (26–50% scroll)
 *
 * The Visceral: heat and kinetic energy of touring and live production.
 * Visual signature: amber vacuum-tube filaments that pulse rhythmically
 * like a snare hit. Elongated cylinders drift in warm amber void.
 */
export function PocketAtmosphere() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const filamentData = useMemo(
    () =>
      Array.from({ length: FILAMENT_COUNT }, (_, i) => ({
        x: (Math.random() - 0.5) * 24,
        y: (Math.random() - 0.5) * 15,
        z: -28 - i * 0.62,
        length: 0.35 + Math.random() * 1.8,
        radius: 0.018 + Math.random() * 0.025,
        phase: Math.random() * Math.PI * 2,
        driftSpeed: 0.07 + Math.random() * 0.22,
        rotX: Math.random() * Math.PI,
        rotZ: Math.random() * Math.PI,
        // Unique beat response weight per filament (0.5–1.5)
        beatWeight: 0.5 + Math.random(),
        jitterAmp: 0.04 + Math.random() * 0.08,
      })),
    []
  );

  // Unit cylinder — fully driven by dummy.scale for radius/length control
  const geometry = useMemo(() => new THREE.CylinderGeometry(1, 0.75, 1, 5), []);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ff8c00',
        emissive: '#ff5500',
        emissiveIntensity: 1.0,
        roughness: 0.08,
        metalness: 0.25,
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

    // Visible in Pocket zone: 0.20 → fade in, 0.52 → fade out
    const visibility =
      progress < 0.20
        ? 0
        : progress < 0.28
          ? (progress - 0.20) / 0.08
          : progress < 0.52
            ? 1
            : Math.max(0, 1 - (progress - 0.52) / 0.08);

    material.opacity = visibility * 0.72;

    // Beat pulse: sharp attack, fast decay (120 BPM)
    // pow(6) makes it punchy — only spikes near the beat
    const rawBeat = Math.sin(time * Math.PI * BEAT_FREQ * 2);
    const beat = Math.pow(Math.max(0, rawBeat), 8);

    // Emissive breathes with the beat
    material.emissiveIntensity = 0.8 + beat * 1.2;

    for (let i = 0; i < FILAMENT_COUNT; i++) {
      const d = filamentData[i];

      // Slow drift
      const driftY = Math.cos(time * d.driftSpeed + d.phase) * 0.9;
      const driftX = Math.sin(time * d.driftSpeed * 0.7 + d.phase + 1.0) * 0.4;

      // Beat jitter: micro-displacement per filament
      const jitterX = beat * d.beatWeight * d.jitterAmp * (Math.random() - 0.5) * 2;
      const jitterY = beat * d.beatWeight * d.jitterAmp * (Math.random() - 0.5) * 2;

      dummy.position.set(d.x + driftX + jitterX, d.y + driftY + jitterY, d.z);

      // Scale: radius × length + subtle beat swell
      dummy.scale.set(
        d.radius * (1 + beat * d.beatWeight * 0.4),
        d.length * (1 + beat * 0.08),
        d.radius * (1 + beat * d.beatWeight * 0.4)
      );

      // Fixed orientation — each filament has its own angle in space
      dummy.rotation.set(d.rotX, 0, d.rotZ);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, FILAMENT_COUNT]}
      frustumCulled={false}
    />
  );
}
