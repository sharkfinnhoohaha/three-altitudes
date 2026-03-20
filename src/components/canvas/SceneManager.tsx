'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const SHORELINE_COLOR = new THREE.Color('#003838');
const POCKET_COLOR = new THREE.Color('#050305');
const ENGINE_COLOR = new THREE.Color('#111111');
const HORIZON_COLOR = new THREE.Color('#f5f5f7');
const tempColor = new THREE.Color();

const CAMERA_START_Z = 10;
const CAMERA_END_Z = -100;

interface SceneManagerProps {
  transitionRef?: React.RefObject<any>;
  cameraRef?: React.MutableRefObject<THREE.Camera | null>;
  cameraLocked?: boolean;
}

export function SceneManager({ transitionRef, cameraRef, cameraLocked }: SceneManagerProps) {
  const { camera, scene, gl } = useThree();

  useEffect(() => {
    if (cameraRef) cameraRef.current = camera;
  }, [camera, cameraRef]);

  const prevScrollY = useRef(0);
  const smoothProgress = useRef(0);
  const smoothVelocity = useRef(0);
  const fogRef = useRef<THREE.Fog | null>(null);

  useEffect(() => {
    scene.background = SHORELINE_COLOR.clone();
    scene.fog = new THREE.Fog('#003838', 25, 130);
    fogRef.current = scene.fog as THREE.Fog;
  }, [scene]);

  useFrame((_state, delta) => {
    const scrollY = window.scrollY || 0;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const rawProgress = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;
    const rawVelocity = (scrollY - prevScrollY.current) / Math.max(delta, 0.001);
    prevScrollY.current = scrollY;

    smoothProgress.current += (rawProgress - smoothProgress.current) * 0.06;
    smoothVelocity.current += (rawVelocity - smoothVelocity.current) * 0.1;

    const p = smoothProgress.current;
    const v = smoothVelocity.current;

    if (!cameraLocked) {
      const targetZ = THREE.MathUtils.lerp(CAMERA_START_Z, CAMERA_END_Z, p);
      camera.position.z += (targetZ - camera.position.z) * 0.08;
    }

    if (p < 0.20) {
      tempColor.copy(SHORELINE_COLOR);
    } else if (p < 0.40) {
      const t = (p - 0.20) / 0.20;
      const smooth = t * t * (3 - 2 * t);
      tempColor.copy(SHORELINE_COLOR).lerp(POCKET_COLOR, smooth);
    } else if (p < 0.60) {
      const t = (p - 0.40) / 0.20;
      tempColor.copy(POCKET_COLOR).lerp(ENGINE_COLOR, t);
    } else if (p < 0.80) {
      // Stage 4: Selected Work — stays engine-room dark
      tempColor.copy(ENGINE_COLOR);
    } else {
      const t = (p - 0.80) / 0.20;
      const smooth = t * t * (3 - 2 * t);
      tempColor.copy(ENGINE_COLOR).lerp(HORIZON_COLOR, smooth);
    }

    if (scene.background instanceof THREE.Color) {
      scene.background.lerp(tempColor, 0.08);
    }

    if (fogRef.current) {
      fogRef.current.color.lerp(tempColor, 0.08);
      const targetNear = p > 0.80 ? 50 : p > 0.60 ? 15 : 20;
      const targetFar = p > 0.80 ? 200 : p > 0.60 ? 100 : 120;
      fogRef.current.near += (targetNear - fogRef.current.near) * 0.05;
      fogRef.current.far += (targetFar - fogRef.current.far) * 0.05;
    }

    if (transitionRef?.current) {
      const effect = transitionRef.current;
      const uniforms = effect.uniforms;
      if (uniforms) {
        const progressU = uniforms.get('uProgress');
        const velocityU = uniforms.get('uVelocity');
        if (progressU) progressU.value = p;
        if (velocityU) velocityU.value = v * 0.001;
      }
    }
  });

  return null;
}
