'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const MODULE_COUNT = 14;

// ── Aviation Cloud ShaderMaterial GLSL ──────────────────────────────────────

const CLOUD_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const CLOUD_FRAG = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  uniform float uTime;
  uniform float uVisibility;

  // Ashima / McEwan 3-D Simplex Noise (BSD licensed)
  vec3 _m3(vec3 x) { return x - floor(x * (1./289.)) * 289.; }
  vec4 _m4(vec4 x) { return x - floor(x * (1./289.)) * 289.; }
  vec4 _pm(vec4 x) { return _m4(((x * 34.) + 10.) * x); }
  vec4 _ti(vec4 r) { return 1.79284291400159 - .85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1./6., 1./3.);
    const vec4 D = vec4(0., .5, 1., 2.);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g  = step(x0.yzx, x0.xyz);
    vec3 l  = 1. - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = _m3(i);
    vec4 p = _pm(_pm(_pm(
      i.z + vec4(0., i1.z, i2.z, 1.))
      + i.y + vec4(0., i1.y, i2.y, 1.))
      + i.x + vec4(0., i1.x, i2.x, 1.));
    float n_ = .142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j  = p - 49. * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7. * x_);
    vec4 x  = x_ * ns.x + ns.yyyy;
    vec4 y  = y_ * ns.x + ns.yyyy;
    vec4 h  = 1. - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2. + 1.;
    vec4 s1 = floor(b1) * 2. + 1.;
    vec4 sh = -step(h, vec4(0.));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = _ti(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.);
    m = m * m;
    return 105. * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    // World XY shapes the cloud; Z differentiates each layer; time drifts slowly
    vec3 coord = vec3(vWorldPos.xy * .045, vWorldPos.z * .12 + uTime * .014);
    float n1 = snoise(coord);
    float n2 = snoise(coord * 2.1 + 17.3) * .5;
    float n3 = snoise(coord * 4.3 + 38.6) * .25;
    float noise = (n1 + n2 + n3) / 1.75 * .5 + .5; // remap [0,1]
    float cloud = smoothstep(.40, .68, noise);
    // Radial fade so plane edges never produce a hard cut
    float uvDist = length(vUv - .5) * 2.;
    float edge = 1. - smoothstep(.50, 1.0, uvDist);
    gl_FragColor = vec4(1., 1., 1., cloud * edge * uVisibility * .60);
  }
`;

// Camera traverses z ≈ -72.5 → -100 during the aviation section (75–100 % scroll).
// Layer z-positions are distributed through that range so the camera flies through them.
const CLOUD_LAYERS = [
  { x:  0.0, y:  1.5, z: -73, rx:  0.08, ry:  0.04 },
  { x:  7.0, y: -2.0, z: -77, rx: -0.05, ry: -0.06 },
  { x: -5.0, y:  3.0, z: -81, rx:  0.10, ry:  0.05 },
  { x:  3.0, y: -1.5, z: -85, rx: -0.07, ry: -0.03 },
  { x: -6.0, y:  2.0, z: -88, rx:  0.06, ry:  0.07 },
  { x:  4.0, y:  1.0, z: -91, rx:  0.04, ry:  0.04 },
  { x: -2.0, y: -2.5, z: -95, rx: -0.09, ry: -0.05 },
  { x:  1.0, y:  0.5, z: -98, rx:  0.05, ry:  0.03 },
];

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

/**
 * HorizonAtmosphere — Stage 4 (75–100 % scroll)
 *
 * Aviation: Procedural Simplex Noise cloud planes the camera flies through,
 * backed by FogExp2 atmospheric haze. PA-28 banking horizon reference line
 * remains mouse-driven. HUD data (MSL +5,200 FT, KCMA→KVTA, 270° W) is
 * preserved in the UI overlay.
 */
export function HorizonAtmosphere() {
  const groupRef = useRef<THREE.Group>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const smoothMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouse, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  // ── Procedural cloud planes ────────────────────────────────────────────────
  const cloudPlaneGeo = useMemo(() => new THREE.PlaneGeometry(80, 40), []);
  const cloudPlaneMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: CLOUD_VERT,
        fragmentShader: CLOUD_FRAG,
        uniforms: {
          uTime: { value: 0 },
          uVisibility: { value: 0 },
        },
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    []
  );

  // ── Horizon reference lines ────────────────────────────────────────────────
  const horizonMat = useRef(
    new THREE.LineBasicMaterial({ color: '#2a2a2a', transparent: true, opacity: 0 })
  );

  const horizonLine = useMemo(() => {
    const pts = [new THREE.Vector3(-22, 0, 0), new THREE.Vector3(22, 0, 0)];
    return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), horizonMat.current);
  }, []);

  const tickMats = useRef<THREE.LineBasicMaterial[]>([]);
  const ticks = useMemo(() => {
    const group = new THREE.Group();
    const positions = [-12, -8, -4, 0, 4, 8, 12];
    tickMats.current = positions.map(
      () => new THREE.LineBasicMaterial({ color: '#2a2a2a', transparent: true, opacity: 0 })
    );
    positions.forEach((x, i) => {
      const h = x === 0 ? 0.5 : 0.28;
      const pts = [new THREE.Vector3(x, -h, 0), new THREE.Vector3(x, h, 0)];
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), tickMats.current[i]));
    });
    return group;
  }, []);

  const wingMats = useRef<THREE.LineBasicMaterial[]>([]);
  const wings = useMemo(() => {
    const group = new THREE.Group();
    [
      { from: new THREE.Vector3(-22, 0, 0), to: new THREE.Vector3(-30, 0, 0) },
      { from: new THREE.Vector3(22, 0, 0), to: new THREE.Vector3(30, 0, 0) },
    ].forEach(({ from, to }, i) => {
      const mat = new THREE.LineBasicMaterial({ color: '#2a2a2a', transparent: true, opacity: 0 });
      wingMats.current[i] = mat;
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([from, to]), mat));
    });
    return group;
  }, []);

  useFrame((state) => {
    const scrollY = window.scrollY || 0;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;

    const visibility =
      progress < 0.72 ? 0 : progress < 0.82 ? (progress - 0.72) / 0.10 : 1;

    // Cloud shader uniforms — shared across all cloud plane instances
    cloudPlaneMat.uniforms.uTime.value = state.clock.elapsedTime;
    cloudPlaneMat.uniforms.uVisibility.value = visibility;

    // Horizon reference line opacities
    horizonMat.current.opacity = visibility * 0.65;
    tickMats.current.forEach((m, i) => { m.opacity = visibility * (i === 3 ? 0.5 : 0.25); });
    wingMats.current.forEach((m) => { m.opacity = visibility * 0.18; });

    // PA-28 banking: two-stage mouse smoothing
    if (groupRef.current) {
      const AILERON_DAMPING = 0.025;
      smoothMouse.current.x += (mouseRef.current.x - smoothMouse.current.x) * AILERON_DAMPING;
      smoothMouse.current.y += (mouseRef.current.y - smoothMouse.current.y) * AILERON_DAMPING;

      const ROLL_DAMPING = 0.04;
      const targetRotZ = smoothMouse.current.x * -0.16;
      const targetRotX = smoothMouse.current.y * 0.07;
      const targetY    = smoothMouse.current.y * -0.5;

      groupRef.current.rotation.z += (targetRotZ - groupRef.current.rotation.z) * ROLL_DAMPING;
      groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * ROLL_DAMPING;
      groupRef.current.position.y += (targetY    - groupRef.current.position.y) * ROLL_DAMPING;
    }
  });

  return (
    <>
      {/* Noise-driven cloud planes — camera flies through as scroll progresses */}
      {CLOUD_LAYERS.map((layer, i) => (
        <mesh
          key={i}
          geometry={cloudPlaneGeo}
          material={cloudPlaneMat}
          position={[layer.x, layer.y, layer.z]}
          rotation={[layer.rx, layer.ry, 0]}
          frustumCulled={false}
        />
      ))}

      {/* Horizon reference group — mouse-driven banking */}
      <group ref={groupRef} position={[0, 0, -88]}>
        <primitive object={horizonLine} />
        <primitive object={ticks} />
        <primitive object={wings} />
      </group>
    </>
  );
}
