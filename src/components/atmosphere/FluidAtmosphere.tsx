'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const FILAMENT_COUNT = 80;

const BEAT_FREQ = 2.0;

/**
 * PocketAtmosphere — Stage 2 (26–50% scroll)
 *
 * The Visceral: heat and kinetic energy of touring and live production.
 * UPDATED: Deeper saturation, more aggressive jitter, harder beat response,
 * flash bursts on the snare hit. Near OLED-black between beats.
 */
export function PocketAtmosphere() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const flashRef = useRef<THREE.Mesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const filamentData = useMemo(
    () =>
      Array.from({ length: FILAMENT_COUNT }, (_, i) => ({
        x: (Math.random() - 0.5) * 28,
        y: (Math.random() - 0.5) * 17,
        z: -28 - i * 0.52,
        length: 0.25 + Math.random() * 2.2,
        radius: 0.014 + Math.random() * 0.028,
        phase: Math.random() * Math.PI * 2,
        driftSpeed: 0.05 + Math.random() * 0.18,
        rotX: Math.random() * Math.PI,
        rotZ: Math.random() * Math.PI,
        beatWeight: 0.3 + Math.random() * 1.7,
        jitterAmp: 0.06 + Math.random() * 0.14,
        isHot: Math.random() > 0.7,
      })),
    []
  );

  const geometry = useMemo(() => new THREE.CylinderGeometry(1, 0.65, 1, 5), []);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ff7700',
        emissive: '#ff4400',
        emissiveIntensity: 0.6,
        roughness: 0.05,
        metalness: 0.35,
        transparent: true,
        opacity: 0.7,
      }),
    []
  );

  const flashMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#ff6600',
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
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

    material.opacity = visibility * 0.78;

    const rawBeat = Math.sin(time * Math.PI * BEAT_FREQ * 2);
    const beat = Math.pow(Math.max(0, rawBeat), 10);

    const ghostBeat = Math.pow(Math.max(0, Math.sin(time * Math.PI * BEAT_FREQ * 2 + Math.PI)), 12) * 0.35;

    const combinedBeat = Math.min(1, beat + ghostBeat);

    material.emissiveIntensity = 0.15 + combinedBeat * 2.65;

    const beatHue = beat > 0.5 ? 0.08 : 0;
    material.emissive.setRGB(1.0 + beatHue, 0.27 + beat * 0.25, 0.0);

    if (flashRef.current) {
      flashMat.opacity = beat > 0.7 ? (beat - 0.7) * 1.2 * visibility : 0;
    }

    for (let i = 0; i < FILAMENT_COUNT; i++) {
      const d = filamentData[i];

      const driftY = Math.cos(time * d.driftSpeed + d.phase) * 1.1;
      const driftX = Math.sin(time * d.driftSpeed * 0.7 + d.phase + 1.0) * 0.5;

      const jitterSeed = d.phase + time * 47.0;
      const jitterX = combinedBeat * d.beatWeight * d.jitterAmp *
        Math.sin(jitterSeed * 13.37) * 2.5;
      const jitterY = combinedBeat * d.beatWeight * d.jitterAmp *
        Math.cos(jitterSeed * 7.91) * 2.5;

      const kickX = beat > 0.6
        ? Math.sign(d.x) * beat * d.beatWeight * 0.3
        : 0;
      const kickY = beat > 0.6
        ? Math.sign(d.y) * beat * d.beatWeight * 0.2
        : 0;

      dummy.position.set(
        d.x + driftX + jitterX + kickX,
        d.y + driftY + jitterY + kickY,
        d.z
      );

      const beatSwell = combinedBeat * d.beatWeight;
      dummy.scale.set(
        d.radius * (1 + beatSwell * 0.7),
        d.length * (1 + beatSwell * 0.15),
        d.radius * (1 + beatSwell * 0.7)
      );

      if (d.isHot) {
        dummy.scale.multiplyScalar(1 + beat * 0.3);
      }

      dummy.rotation.set(
        d.rotX + combinedBeat * d.beatWeight * 0.05,
        0,
        d.rotZ + combinedBeat * d.beatWeight * 0.03
      );
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, FILAMENT_COUNT]}
        frustumCulled={false}
      />
      <mesh
        ref={flashRef}
        position={[0, 0, -35]}
        material={flashMat}
      >
        <planeGeometry args={[60, 40]} />
      </mesh>
    </group>
  );
}
