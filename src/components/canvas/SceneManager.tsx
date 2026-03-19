'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Stage 1: Shoreline — Ventura Teal (richer than the old #002b2b)
const SHORELINE_COLOR = new THREE.Color('#003838');
// Stage 2: Pocket — Deep saturated void (the vacuum tube darkness)
const POCKET_COLOR = new THREE.Color('#080508');
// Stage 3: Engine Room — Terminal grey
const ENGINE_COLOR = new THREE.Color('#111111');
// Stage 4: Horizon — Hangar White (#f5f5f7)
const HORIZON_COLOR = new THREE.Color('#f5f5f7');
const tempColor = new THREE.Color();

// Camera positions along the Z rail
const CAMERA_START_Z = 10;
const CAMERA_END_Z = -100;

interface SceneManagerProps {
  transitionRef?: React.RefObject<any>;
  /** Exposed so click-to-explode can tween the camera */
  cameraRef?: React.MutableRefObject<THREE.Camera | null>;
  /** When true, scroll-driven camera is paused (explosion tween owns it) */
  cameraLocked?: boolean;
}

export function SceneManager({ transitionRef, cameraRef, cameraLocked }: SceneManagerProps) {
  const { camera, scene, gl } = useThree();

  // Expose the R3F camera to the parent so GSAP can tween it
  useEffect(() => {
    if (cameraRef) cameraRef.current = camera;
  }, [camera, cameraRef]);
  const prevScrollY = useRef(0);
  const smoothProgress = useRef(0);
  const smoothVelocity = useRef(0);
  const fogRef = useRef<THREE.Fog | null>(null);

  // Initialize scene
  useEffect(() => {
    scene.background = SHORELINE_COLOR.clone();
    // Fog: slightly visible in Shoreline for atmospheric depth
    scene.fog = new THREE.Fog('#003838', 25, 130);
    fogRef.current = scene.fog as THREE.Fog;
  }, [scene]);

  useFrame((_state, delta) => {
    // --- Read scroll state (no React overhead) ---
    const scrollY = window.scrollY || 0;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const rawProgress = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;
    const rawVelocity = (scrollY - prevScrollY.current) / Math.max(delta, 0.001);
    prevScrollY.current = scrollY;

    // Smooth everything
    smoothProgress.current += (rawProgress - smoothProgress.current) * 0.06;
    smoothVelocity.current += (rawVelocity - smoothVelocity.current) * 0.1;

    const p = smoothProgress.current;
    const v = smoothVelocity.current;

    // --- Camera Rail (Z-axis scroll) — skip when explosion tween owns the camera ---
    if (!cameraLocked) {
      const targetZ = THREE.MathUtils.lerp(CAMERA_START_Z, CAMERA_END_Z, p);
      camera.position.z += (targetZ - camera.position.z) * 0.08;
    }

    // --- Background Color Lerp — 4 cinematic stages ---
    if (p < 0.25) {
      // Stage 1: Shoreline — stable deep teal
      tempColor.copy(SHORELINE_COLOR);
    } else if (p < 0.50) {
      // Stage 2: Pocket — wave-wipe to saturated void
      const t = (p - 0.25) / 0.25;
      const smooth = t * t * (3 - 2 * t); // smoothstep
      tempColor.copy(SHORELINE_COLOR).lerp(POCKET_COLOR, smooth);
    } else if (p < 0.75) {
      // Stage 3: Engine Room — subtle shift deeper grey
      const t = (p - 0.50) / 0.25;
      tempColor.copy(POCKET_COLOR).lerp(ENGINE_COLOR, t);
    } else {
      // Stage 4: Horizon — cloud-break to Hangar White
      const t = (p - 0.75) / 0.25;
      const smooth = t * t * (3 - 2 * t); // smoothstep for cinematic fade
      tempColor.copy(ENGINE_COLOR).lerp(HORIZON_COLOR, smooth);
    }

    if (scene.background instanceof THREE.Color) {
      scene.background.lerp(tempColor, 0.08);
    }

    // --- Fog follows atmosphere ---
    if (fogRef.current) {
      fogRef.current.color.lerp(tempColor, 0.08);
      // Expand fog in Horizon for clarity; compress in Pocket for depth
      const targetNear = p > 0.75 ? 50 : p > 0.50 ? 15 : 20;
      const targetFar = p > 0.75 ? 200 : p > 0.50 ? 100 : 120;
      fogRef.current.near += (targetNear - fogRef.current.near) * 0.05;
      fogRef.current.far += (targetFar - fogRef.current.far) * 0.05;
    }

    // --- Update Transition Shader Uniforms ---
    if (transitionRef?.current) {
      const effect = transitionRef.current;
      const uniforms = effect.uniforms;
      if (uniforms) {
        const progressU = uniforms.get('uProgress');
        const velocityU = uniforms.get('uVelocity');
        if (progressU) progressU.value = p;
        if (velocityU) velocityU.value = v * 0.001; // normalize for shader
      }
    }
  });

  return null;
}
