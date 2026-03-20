'use client';

import { useRef, useMemo, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { ProjectData } from '@/lib/projectData';

// ── Geometry & Material per atmosphere ──────────────────────────

const KINETIC_COLOR = 0xff2d55;
const FLUID_COLOR = 0x00d4aa;
const VECTOR_COLOR = 0x0066ff;

function makeKineticMaterial() {
  return new THREE.MeshStandardMaterial({
    color: KINETIC_COLOR,
    emissive: KINETIC_COLOR,
    emissiveIntensity: 0.6,
    roughness: 0.3,
    metalness: 0.8,
  });
}

function makeFluidMaterial() {
  return new THREE.MeshStandardMaterial({
    color: FLUID_COLOR,
    emissive: 0x004d40,
    emissiveIntensity: 0.4,
    roughness: 0.7,
    metalness: 0.2,
    transparent: true,
    opacity: 0.7,
  });
}

function makeVectorMaterial() {
  return new THREE.MeshBasicMaterial({
    color: VECTOR_COLOR,
    wireframe: true,
  });
}

// Shared geometries (created once, reused across all artifacts)
const kineticGeo = new THREE.IcosahedronGeometry(0.6, 0);
const fluidGeo = new THREE.SphereGeometry(0.6, 32, 24);
const vectorGeo = new THREE.BoxGeometry(0.9, 0.9, 0.9);

// ── Types ───────────────────────────────────────────────────────

interface ProjectArtifactProps {
  project: ProjectData;
  /** Callback when this artifact is clicked. Receives world position + slug. */
  onExplode: (worldPos: THREE.Vector3, slug: string) => void;
  /** When true, this artifact should scale to 0 (another was clicked). */
  dismissed: boolean;
}

// ── Component ───────────────────────────────────────────────────

export function ProjectArtifact({ project, onExplode, dismissed }: ProjectArtifactProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Three mesh refs — one per atmosphere shape
  const kineticRef = useRef<THREE.Mesh>(null);
  const fluidRef = useRef<THREE.Mesh>(null);
  const vectorRef = useRef<THREE.Mesh>(null);

  // Smooth scales for crossfade morph (not React state — mutated in useFrame)
  const morphScales = useRef({ kinetic: 1, fluid: 0, vector: 0 });
  const dismissScale = useRef(1);
  const floatPhase = useMemo(() => Math.random() * Math.PI * 2, []);

  // Materials — one set per artifact instance (so opacity is independent)
  const kMat = useMemo(makeKineticMaterial, []);
  const fMat = useMemo(makeFluidMaterial, []);
  const vMat = useMemo(makeVectorMaterial, []);

  // ── Per-frame update ──────────────────────────────────────────

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;

    // Read scroll directly — no React re-renders
    const scrollY = window.scrollY || 0;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;

    // ── Morph targets based on progress ──
    const ms = morphScales.current;
    let targetK = 0, targetF = 0, targetV = 0;

    if (progress < 0.28) {
      targetK = 1;
    } else if (progress < 0.38) {
      // Crossfade kinetic → fluid
      const t = (progress - 0.28) / 0.10;
      targetK = 1 - t;
      targetF = t;
    } else if (progress < 0.61) {
      targetF = 1;
    } else if (progress < 0.71) {
      // Crossfade fluid → vector
      const t = (progress - 0.61) / 0.10;
      targetF = 1 - t;
      targetV = t;
    } else {
      targetV = 1;
    }

    // Smooth lerp toward targets
    ms.kinetic += (targetK - ms.kinetic) * 0.08;
    ms.fluid += (targetF - ms.fluid) * 0.08;
    ms.vector += (targetV - ms.vector) * 0.08;

    // Dismiss animation (when another artifact was clicked)
    const dismissTarget = dismissed ? 0 : 1;
    dismissScale.current += (dismissTarget - dismissScale.current) * 0.12;

    // ── Apply to meshes ──
    const ds = dismissScale.current;
    const floatY = Math.sin(time * 0.6 + floatPhase) * 0.15;

    groupRef.current.position.y = project.y + floatY;

    if (kineticRef.current) {
      const s = ms.kinetic * ds;
      kineticRef.current.scale.setScalar(s < 0.001 ? 0.001 : s);
      kineticRef.current.visible = ms.kinetic > 0.01;
      kineticRef.current.rotation.x += 0.005;
      kineticRef.current.rotation.y += 0.003;
    }
    if (fluidRef.current) {
      const s = ms.fluid * ds;
      fluidRef.current.scale.setScalar(s < 0.001 ? 0.001 : s);
      fluidRef.current.visible = ms.fluid > 0.01;
      fluidRef.current.rotation.y += 0.002;
    }
    if (vectorRef.current) {
      const s = ms.vector * ds;
      vectorRef.current.scale.setScalar(s < 0.001 ? 0.001 : s);
      vectorRef.current.visible = ms.vector > 0.01;
      vectorRef.current.rotation.y += 0.004;
      vectorRef.current.rotation.x += 0.002;
    }

    // Visibility fade based on proximity to the artifact's home atmosphere
    const atmZones: Record<string, [number, number]> = {
      kinetic: [0, 0.40],
      fluid: [0.22, 0.74],
      vector: [0.55, 1.0],
    };
    const [fadeIn, fadeOut] = atmZones[project.atmosphere];
    let visibility = 1;
    if (progress < fadeIn) {
      visibility = 0;
    } else if (progress < fadeIn + 0.06) {
      visibility = (progress - fadeIn) / 0.06;
    } else if (progress > fadeOut - 0.06) {
      visibility = Math.max(0, (fadeOut - progress) / 0.06);
    } else if (progress > fadeOut) {
      visibility = 0;
    }

    kMat.opacity = visibility;
    kMat.transparent = visibility < 1;
    fMat.opacity = visibility * 0.7;
    vMat.opacity = visibility;
    (vMat as THREE.MeshBasicMaterial).transparent = visibility < 1;
  });

  // ── Click handler ─────────────────────────────────────────────

  const handleClick = useCallback(
    (e: THREE.Event) => {
      // Stop R3F event propagation so only the nearest artifact fires
      (e as any).stopPropagation?.();
      if (!groupRef.current) return;

      const worldPos = new THREE.Vector3();
      groupRef.current.getWorldPosition(worldPos);
      onExplode(worldPos, project.slug);
    },
    [onExplode, project.slug]
  );

  // ── Render ────────────────────────────────────────────────────

  return (
    <group
      ref={groupRef}
      position={[project.x, project.y, project.z]}
      onClick={handleClick}
    >
      {/* Kinetic shape — jagged icosahedron */}
      <mesh ref={kineticRef} geometry={kineticGeo} material={kMat} />

      {/* Fluid shape — smooth sphere */}
      <mesh ref={fluidRef} geometry={fluidGeo} material={fMat} />

      {/* Vector shape — wireframe box */}
      <mesh ref={vectorRef} geometry={vectorGeo} material={vMat} />
    </group>
  );
}
