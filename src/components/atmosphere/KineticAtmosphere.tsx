'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const FOAM_COUNT = 28;
const WAVE_X_SEGS = 48;
const WAVE_Y_SEGS = 24;

/**
 * ShorelineAtmosphere — Stage 1 (0–25% scroll)
 *
 * The Default State: grounded morning clarity in Ventura.
 * Visual signature: a slow, breathing Pacific swell — large wave plane with
 * animated vertex displacement + drifting foam particles. Deep Ventura Teal.
 */
export function ShorelineAtmosphere() {
  const waveRef = useRef<THREE.Mesh>(null);
  const foamRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const waveGeo = useMemo(() => {
    return new THREE.PlaneGeometry(60, 22, WAVE_X_SEGS, WAVE_Y_SEGS);
  }, []);

  const waveMat = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: '#003333',
      emissive: '#001a1a',
      emissiveIntensity: 0.7,
      roughness: 0.15,
      metalness: 0.6,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
    });

    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = { value: 0 };
      mat.userData.shader = shader;
      
      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `
        #include <common>
        uniform float uTime;
        `
      );
      
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        float ox = position.x;
        float oy = position.y;
        transformed.z += sin(ox * 0.09 + uTime * 0.38) * 2.0 +
                         sin(oy * 0.13 + uTime * 0.27 + 1.3) * 1.2 +
                         sin((ox * 0.06 + oy * 0.04) + uTime * 0.18 + 2.1) * 0.8;
        `
      );
    };
    return mat;
  }, []);

  // Foam: small organic spheres drifting with the swell
  const foamData = useMemo(
    () =>
      Array.from({ length: FOAM_COUNT }, () => ({
        x: (Math.random() - 0.5) * 30,
        y: (Math.random() - 0.5) * 10,
        z: 7 - Math.random() * 28,
        baseScale: 0.05 + Math.random() * 0.22,
        phase: Math.random() * Math.PI * 2,
        period: 3.5 + Math.random() * 4.5, // slow swell 3.5–8s
        lateralPeriod: 5 + Math.random() * 6,
      })),
    []
  );

  const foamGeo = useMemo(() => new THREE.SphereGeometry(1, 5, 4), []);
  const foamMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#3dd9c4',
        emissive: '#3dd9c4',
        emissiveIntensity: 0.55,
        roughness: 0.85,
        transparent: true,
        opacity: 0.3,
      }),
    []
  );

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const scrollY = window.scrollY || 0;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;

    // Fade out as we leave the Shoreline zone
    const visibility =
      progress < 0.25 ? 1.0 : Math.max(0, 1 - (progress - 0.25) / 0.07);

    // --- Wave plane GPU displacement uniform ---
    if (waveMat.userData.shader) {
      waveMat.userData.shader.uniforms.uTime.value = time;
    }
    waveMat.opacity = visibility * 0.22;

    // --- Foam particles ---
    if (foamRef.current) {
      foamMat.opacity = visibility * 0.32;
      for (let i = 0; i < FOAM_COUNT; i++) {
        const d = foamData[i];
        const swellY = Math.sin(time / d.period + d.phase) * 2.0;
        const swellX = Math.cos(time / d.lateralPeriod + d.phase) * 0.5;
        dummy.position.set(d.x + swellX, d.y + swellY, d.z);
        dummy.scale.setScalar(
          d.baseScale * (1 + Math.sin(time * 0.18 + d.phase) * 0.08)
        );
        dummy.updateMatrix();
        foamRef.current.setMatrixAt(i, dummy.matrix);
      }
      foamRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Wave plane — the breathing swell */}
      <mesh
        ref={waveRef}
        geometry={waveGeo}
        material={waveMat}
        position={[0, -2.5, -6]}
        rotation={[-Math.PI / 3.8, 0, 0]}
      />
      {/* Drifting foam particles */}
      <instancedMesh
        ref={foamRef}
        args={[foamGeo, foamMat, FOAM_COUNT]}
        frustumCulled={false}
      />
    </group>
  );
}
