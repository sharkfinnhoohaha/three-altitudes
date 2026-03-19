'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const MODULE_COUNT = 14;

// ─────────────────────────────────────────────────────────────────────────────
// EngineRoomAtmosphere — Stage 3 (51–75% scroll)
//
// The Logic: systems, branding, high-performance code.
// Visual signature: glass-morphism wireframe modules drifting in terminal grey.
// The "ghosting code" lives in the HTML layer (GhostingCode.tsx).
// ─────────────────────────────────────────────────────────────────────────────
export function EngineRoomAtmosphere() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const moduleData = useMemo(
    () =>
      Array.from({ length: MODULE_COUNT }, (_, i) => ({
        x: (Math.random() - 0.5) * 22,
        y: (Math.random() - 0.5) * 13,
        z: -52 - i * 3.2,
        width: 0.7 + Math.random() * 3.0,
        height: 0.5 + Math.random() * 2.2,
        depth: 0.08 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        floatSpeed: 0.15 + Math.random() * 0.28,
        // Slow Y-axis rotation for the "systemic" feel
        rotSpeed: (Math.random() - 0.5) * 0.006,
      })),
    []
  );

  const geo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#4a4a4a',
        wireframe: true,
        transparent: true,
        opacity: 0.45,
      }),
    []
  );

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    const scrollY = window.scrollY || 0;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;

    // Visible 0.45 → fade in, 0.72 → fade out
    const visibility =
      progress < 0.45
        ? 0
        : progress < 0.53
          ? (progress - 0.45) / 0.08
          : progress < 0.70
            ? 1
            : Math.max(0, 1 - (progress - 0.70) / 0.08);

    mat.opacity = visibility * 0.45;

    for (let i = 0; i < MODULE_COUNT; i++) {
      const d = moduleData[i];
      dummy.position.set(
        d.x,
        d.y + Math.sin(time * d.floatSpeed + d.phase) * 0.35,
        d.z
      );
      dummy.scale.set(d.width, d.height, d.depth);
      dummy.rotation.set(0, time * d.rotSpeed + d.phase, 0);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geo, mat, MODULE_COUNT]}
      frustumCulled={false}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HorizonAtmosphere — Stage 4 (76–100% scroll)
//
// The Perspective: aviation, surfing, the infinite SoCal sky.
// Visual signature: a single thin 3D horizon line that tilts with the mouse
// on the Z axis — an artificial horizon indicator, weightless and precise.
// ─────────────────────────────────────────────────────────────────────────────
export function HorizonAtmosphere() {
  const groupRef = useRef<THREE.Group>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouse, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  // Main horizon line
  const horizonMat = useRef(
    new THREE.LineBasicMaterial({
      color: '#2a2a2a',
      transparent: true,
      opacity: 0,
    })
  );

  const horizonLine = useMemo(() => {
    const pts = [new THREE.Vector3(-22, 0, 0), new THREE.Vector3(22, 0, 0)];
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    return new THREE.Line(geo, horizonMat.current);
  }, []);

  // Tick marks — the HUD graduation marks
  const tickMats = useRef<THREE.LineBasicMaterial[]>([]);
  const ticks = useMemo(() => {
    const group = new THREE.Group();
    const positions = [-12, -8, -4, 0, 4, 8, 12];
    tickMats.current = positions.map(() =>
      new THREE.LineBasicMaterial({ color: '#2a2a2a', transparent: true, opacity: 0 })
    );
    positions.forEach((x, i) => {
      const isCenter = x === 0;
      const h = isCenter ? 0.5 : 0.28;
      const pts = [new THREE.Vector3(x, -h, 0), new THREE.Vector3(x, h, 0)];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      group.add(new THREE.Line(geo, tickMats.current[i]));
    });
    return group;
  }, []);

  // Outer wing lines — long thin extensions for the aviation feel
  const wingMats = useRef<THREE.LineBasicMaterial[]>([]);
  const wings = useMemo(() => {
    const group = new THREE.Group();
    [
      { from: new THREE.Vector3(-22, 0, 0), to: new THREE.Vector3(-30, 0, 0) },
      { from: new THREE.Vector3(22, 0, 0), to: new THREE.Vector3(30, 0, 0) },
    ].forEach(({ from, to }, i) => {
      const mat = new THREE.LineBasicMaterial({
        color: '#2a2a2a',
        transparent: true,
        opacity: 0,
      });
      wingMats.current[i] = mat;
      const pts = [from, to];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      group.add(new THREE.Line(geo, mat));
    });
    return group;
  }, []);

  useFrame(() => {
    const scrollY = window.scrollY || 0;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;

    // Fade in during Horizon zone
    const visibility =
      progress < 0.72
        ? 0
        : progress < 0.82
          ? (progress - 0.72) / 0.10
          : 1;

    // Update opacities
    horizonMat.current.opacity = visibility * 0.65;
    tickMats.current.forEach((m, i) => {
      // Center tick is strongest
      m.opacity = visibility * (i === 3 ? 0.5 : 0.25);
    });
    wingMats.current.forEach((m) => {
      m.opacity = visibility * 0.18;
    });

    if (groupRef.current) {
      // Tilt on Z with mouse X — the artificial horizon roll
      const targetRotZ = mouseRef.current.x * -0.14;
      // Subtle pitch (Y-axis tilt) with mouse Y
      const targetRotX = mouseRef.current.y * 0.06;
      // Vertical drift with mouse
      const targetY = mouseRef.current.y * -0.4;

      groupRef.current.rotation.z += (targetRotZ - groupRef.current.rotation.z) * 0.04;
      groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.04;
      groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.04;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -88]}>
      <primitive object={horizonLine} />
      <primitive object={ticks} />
      <primitive object={wings} />
    </group>
  );
}
