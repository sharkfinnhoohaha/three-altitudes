'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const MODULE_COUNT = 14;

// ── Shared Simplex Noise GLSL (Ashima / McEwan, BSD licensed) ───────────────

const SIMPLEX_GLSL = /* glsl */ `
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
`;

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

  // Per-layer variation uniforms
  uniform float uFrequency;    // noise scale (unique per layer)
  uniform vec3  uNoiseOffset;  // seed offset (unique per layer)
  uniform float uMaxOpacity;   // opacity cap (unique per layer)
  uniform float uDensityBias;  // cloud coverage threshold (unique per layer)

  ${SIMPLEX_GLSL}

  void main() {
    // World-space noise coord — each layer samples a different region of noise space
    vec3 coord = vec3(
      vWorldPos.xy * uFrequency + uNoiseOffset.xy,
      uNoiseOffset.z + uTime * 0.009
    );

    // 4-octave fBm — more natural cloud shapes than 3-octave
    float n  = snoise(coord)               * 0.5000;
    n       += snoise(coord * 2.1 + 7.3)   * 0.2500;
    n       += snoise(coord * 4.3 + 15.7)  * 0.1250;
    n       += snoise(coord * 8.7 + 31.4)  * 0.0625;
    n = n * (1.0 / 0.9375);   // normalise amplitude sum
    n = n * 0.5 + 0.5;        // remap [-1,1] → [0,1]

    // Adjustable cloud density threshold per layer
    float cloud = smoothstep(uDensityBias, uDensityBias + 0.26, n);

    // Elliptical vignette — clouds are wider than tall
    vec2 uvc = vUv - 0.5;
    float edgeDist = length(uvc * vec2(0.80, 1.10)) * 2.0;
    float edge = 1.0 - smoothstep(0.52, 1.02, edgeDist);

    // Wispy irregular edges via secondary noise — breaks up the ellipse silhouette
    float edgeNoise = snoise(vec3(
      vUv * 4.8 + uNoiseOffset.xy * 0.25,
      uNoiseOffset.z * 0.18 + uTime * 0.004
    ));
    edge *= 0.78 + edgeNoise * 0.22;
    edge = clamp(edge, 0.0, 1.0);

    // Vertical colour gradient — lit from above
    // Bottom: warm cream (shadow underside)  →  Mid: bright white  →  Top: cool blue-white
    float yFac = clamp(vUv.y, 0.0, 1.0);
    vec3 bottomColor = vec3(0.978, 0.950, 0.915); // warm cream underside
    vec3 midColor    = vec3(1.000, 0.998, 0.996); // near-white core
    vec3 topColor    = vec3(0.955, 0.968, 1.000); // cool blue-white lit top
    vec3 cloudColor  = mix(bottomColor, midColor, smoothstep(0.0, 0.55, yFac));
    cloudColor       = mix(cloudColor,  topColor,  smoothstep(0.5,  1.0,  yFac));

    // Self-shadowing: denser mass = brighter (scatters more light)
    cloudColor *= mix(0.90, 1.0, cloud);

    float alpha = cloud * edge * uVisibility * uMaxOpacity;
    gl_FragColor = vec4(cloudColor, clamp(alpha, 0.0, 1.0));
  }
`;

// ── Per-layer cloud configuration ───────────────────────────────────────────
// Camera travels z ≈ -72.5 → -100 during aviation (75–100% scroll).
// 10 layers distributed through that range; each has unique noise personality.

interface CloudLayer {
  x: number; y: number; z: number;
  rx: number; ry: number;
  sx: number; sy: number;        // mesh scale (x, y)
  freq: number;                  // noise frequency
  opMax: number;                 // max opacity
  noiseOff: [number, number, number];
  densityBias: number;           // cloud coverage floor
  driftX: number;                // lateral drift speed (world units/sec)
  driftY: number;                // vertical drift speed
}

const CLOUD_LAYERS: CloudLayer[] = [
  { x:  2.0, y:  2.5, z: -71, rx:  0.06, ry:  0.03, sx: 1.3, sy: 0.90, freq: 0.038, opMax: 0.42, noiseOff: [ 0.0,  0.0,  0.0], densityBias: 0.44, driftX:  0.014, driftY:  0.003 },
  { x: -8.0, y: -1.5, z: -74, rx: -0.04, ry: -0.05, sx: 1.1, sy: 1.00, freq: 0.051, opMax: 0.60, noiseOff: [ 5.7,  3.2, 11.4], densityBias: 0.40, driftX: -0.009, driftY:  0.005 },
  { x:  6.0, y:  4.0, z: -77, rx:  0.09, ry:  0.04, sx: 1.5, sy: 0.85, freq: 0.041, opMax: 0.68, noiseOff: [12.3,  7.8, 24.7], densityBias: 0.38, driftX:  0.016, driftY: -0.004 },
  { x: -4.0, y: -2.0, z: -80, rx: -0.06, ry: -0.03, sx: 0.9, sy: 1.10, freq: 0.046, opMax: 0.54, noiseOff: [ 8.1, 15.6,  6.3], densityBias: 0.42, driftX: -0.011, driftY:  0.002 },
  { x:  9.5, y:  1.5, z: -83, rx:  0.07, ry:  0.06, sx: 1.2, sy: 0.95, freq: 0.035, opMax: 0.66, noiseOff: [17.4,  2.1, 33.5], densityBias: 0.36, driftX:  0.008, driftY:  0.006 },
  { x: -6.5, y:  2.8, z: -86, rx: -0.08, ry:  0.05, sx: 1.0, sy: 0.80, freq: 0.058, opMax: 0.40, noiseOff: [ 3.9, 20.3, 15.8], densityBias: 0.46, driftX: -0.013, driftY: -0.003 },
  { x:  4.0, y: -3.0, z: -89, rx:  0.05, ry: -0.04, sx: 1.4, sy: 1.00, freq: 0.043, opMax: 0.72, noiseOff: [22.6,  8.9, 41.2], densityBias: 0.39, driftX:  0.010, driftY:  0.004 },
  { x: -2.5, y:  1.5, z: -92, rx: -0.03, ry:  0.07, sx: 1.1, sy: 0.90, freq: 0.048, opMax: 0.56, noiseOff: [ 9.2, 26.4, 19.7], densityBias: 0.43, driftX: -0.012, driftY: -0.002 },
  { x:  7.0, y: -1.0, z: -95, rx:  0.06, ry: -0.03, sx: 0.85, sy: 1.05, freq: 0.040, opMax: 0.60, noiseOff: [31.5, 13.7,  8.4], densityBias: 0.41, driftX:  0.007, driftY:  0.005 },
  { x: -5.0, y:  2.5, z: -97, rx: -0.07, ry:  0.04, sx: 1.3, sy: 0.90, freq: 0.053, opMax: 0.48, noiseOff: [14.8, 33.2, 26.1], densityBias: 0.44, driftX: -0.009, driftY:  0.003 },
];

// ── Engine-room atmosphere (unchanged) ──────────────────────────────────────

export function EngineRoomAtmosphere() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const moduleData = useMemo(
    () =>
      Array.from({ length: MODULE_COUNT }, (_, i) => ({
        x: (Math.random() - 0.5) * 24,
        y: (Math.random() - 0.5) * 14,
        z: -52 - i * 3.2,
        scale: 1.2 + Math.random() * 2.8,
        phase: Math.random() * Math.PI * 2,
        floatSpeed: 0.12 + Math.random() * 0.22,
        heading: Math.random() * Math.PI * 2,
        bank: (Math.random() - 0.5) * 0.35,
        pitch: (Math.random() - 0.5) * 0.12,
        bankDrift: 0.08 + Math.random() * 0.12,
        yawDrift: (Math.random() - 0.5) * 0.008,
      })),
    []
  );

  // Merged module geometry for the work section (avoids aircraft silhouettes
  // before the dedicated aviation section).
  const geo = useMemo(() => {
    const core = new THREE.BoxGeometry(0.9, 0.22, 0.22);
    const sideLeft = new THREE.BoxGeometry(0.12, 0.12, 0.12);
    sideLeft.translate(-0.58, 0, 0);
    const sideRight = sideLeft.clone();
    sideRight.translate(1.16, 0, 0);
    const antenna = new THREE.BoxGeometry(0.08, 0.32, 0.08);
    antenna.translate(0, 0.24, 0);
    return mergeGeometries([core, sideLeft, sideRight, antenna])!;
  }, []);

  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#5a6a7a',
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

    // Fade in only inside the work section.
    const visibility =
      progress < 0.52
        ? 0
        : progress < 0.60
          ? (progress - 0.52) / 0.08
          : progress < 0.74
            ? 1
            : Math.max(0, 1 - (progress - 0.74) / 0.08);

    mat.opacity = visibility * 0.50;

    for (let i = 0; i < MODULE_COUNT; i++) {
      const d = moduleData[i];
      dummy.position.set(
        d.x,
        d.y + Math.sin(time * d.floatSpeed + d.phase) * 0.35,
        d.z
      );
      dummy.scale.setScalar(d.scale);
      dummy.rotation.set(
        d.pitch + Math.sin(time * 0.10 + d.phase) * 0.04,
        d.heading + time * d.yawDrift,
        d.bank + Math.sin(time * d.bankDrift + d.phase + 1.0) * 0.06
      );
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
 * HorizonAtmosphere — Stage 4 (75–100% scroll)
 *
 * Procedural cloud flythrough: 10 unique Simplex fBm cloud planes the camera
 * flies through. Each layer has its own ShaderMaterial with unique frequency,
 * noise offset, opacity, and density bias — no two layers look the same.
 *
 * Parallax depth: farther layers drift more slowly; nearby layers have faster
 * lateral drift, selling the depth separation during the flythrough.
 *
 * Colour: warm cream underside → bright white core → cool blue-white top,
 * matching the look of sunlit cumulonimbus from a cockpit window.
 */
export function HorizonAtmosphere() {
  const groupRef = useRef<THREE.Group>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const smoothMouse = useRef({ x: 0, y: 0 });
  const cloudMeshRefs = useRef<(THREE.Mesh | null)[]>(
    Array(CLOUD_LAYERS.length).fill(null)
  );

  // ── Per-layer materials (each unique — no shared state) ───────────────────
  const cloudMaterials = useMemo(
    () =>
      CLOUD_LAYERS.map(
        (layer) =>
          new THREE.ShaderMaterial({
            vertexShader: CLOUD_VERT,
            fragmentShader: CLOUD_FRAG,
            uniforms: {
              uTime:        { value: 0 },
              uVisibility:  { value: 0 },
              uFrequency:   { value: layer.freq },
              uNoiseOffset: { value: new THREE.Vector3(...layer.noiseOff) },
              uMaxOpacity:  { value: layer.opMax },
              uDensityBias: { value: layer.densityBias },
            },
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
          })
      ),
    []
  );

  // ── Shared plane geometry (scaled per-mesh via mesh.scale) ────────────────
  const cloudPlaneGeo = useMemo(() => new THREE.PlaneGeometry(80, 40, 1, 1), []);

  // ── Horizon reference lines ────────────────────────────────────────────────
  const horizonMat = useRef(
    new THREE.LineBasicMaterial({ color: '#2a2a2a', transparent: true, opacity: 0 })
  );

  const horizonLine = useMemo(() => {
    const pts = [new THREE.Vector3(-22, 0, 0), new THREE.Vector3(22, 0, 0)];
    return new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      horizonMat.current
    );
  }, []);

  const tickMats = useRef<THREE.LineBasicMaterial[]>([]);
  const ticks = useMemo(() => {
    const group = new THREE.Group();
    const positions = [-12, -8, -4, 0, 4, 8, 12];
    tickMats.current = positions.map(
      () =>
        new THREE.LineBasicMaterial({ color: '#2a2a2a', transparent: true, opacity: 0 })
    );
    positions.forEach((x, i) => {
      const h = x === 0 ? 0.5 : 0.28;
      const pts = [new THREE.Vector3(x, -h, 0), new THREE.Vector3(x, h, 0)];
      group.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(pts),
          tickMats.current[i]
        )
      );
    });
    return group;
  }, []);

  const wingMats = useRef<THREE.LineBasicMaterial[]>([]);
  const wings = useMemo(() => {
    const group = new THREE.Group();
    [
      { from: new THREE.Vector3(-22, 0, 0), to: new THREE.Vector3(-30, 0, 0) },
      { from: new THREE.Vector3(22,  0, 0), to: new THREE.Vector3( 30, 0, 0) },
    ].forEach(({ from, to }, i) => {
      const mat = new THREE.LineBasicMaterial({
        color: '#2a2a2a',
        transparent: true,
        opacity: 0,
      });
      wingMats.current[i] = mat;
      group.add(
        new THREE.Line(new THREE.BufferGeometry().setFromPoints([from, to]), mat)
      );
    });
    return group;
  }, []);

  // ── Mouse handler ──────────────────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useFrame((state) => {

    const scrollY = window.scrollY || 0;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;
    const time = state.clock.elapsedTime;

    // Clouds: start only after aviation section begins.
    const visibility =
      progress < 0.75
        ? 0
        : progress < 0.86
          ? (progress - 0.75) / 0.11
          : 1;

    // ── Per-layer material + drift updates ────────────────────────────────
    CLOUD_LAYERS.forEach((layer, i) => {
      const mat = cloudMaterials[i];
      mat.uniforms.uTime.value = time;
      mat.uniforms.uVisibility.value = visibility;

      // Parallax drift — depth-scaled so distant layers move more slowly
      // giving the cockpit window depth separation feel
      const depthFactor = 1.0 + (Math.abs(layer.z) - 71) / 26.0; // 1.0 → 2.0
      const mesh = cloudMeshRefs.current[i];
      if (mesh) {
        mesh.position.x = layer.x + time * layer.driftX / depthFactor;
        mesh.position.y =
          layer.y +
          Math.sin(time * 0.07 + i * 1.13) * 0.4 +
          time * layer.driftY / depthFactor;
      }
    });

    // ── Horizon reference line opacities ──────────────────────────────────
    horizonMat.current.opacity = visibility * 0.65;
    tickMats.current.forEach((m, i) => {
      m.opacity = visibility * (i === 3 ? 0.50 : 0.25);
    });
    wingMats.current.forEach((m) => {
      m.opacity = visibility * 0.18;
    });

    // ── PA-28 banking: two-stage mouse smoothing ───────────────────────────
    if (groupRef.current) {
      const AILERON_DAMPING = 0.025;
      smoothMouse.current.x +=
        (mouseRef.current.x - smoothMouse.current.x) * AILERON_DAMPING;
      smoothMouse.current.y +=
        (mouseRef.current.y - smoothMouse.current.y) * AILERON_DAMPING;

      const ROLL_DAMPING = 0.04;
      const targetRotZ = smoothMouse.current.x * -0.16;
      const targetRotX = smoothMouse.current.y * 0.07;
      const targetY    = smoothMouse.current.y * -0.5;

      groupRef.current.rotation.z +=
        (targetRotZ - groupRef.current.rotation.z) * ROLL_DAMPING;
      groupRef.current.rotation.x +=
        (targetRotX - groupRef.current.rotation.x) * ROLL_DAMPING;
      groupRef.current.position.y +=
        (targetY - groupRef.current.position.y) * ROLL_DAMPING;
    }
  });

  return (
    <>
      {/* Cloud planes — each with its own unique ShaderMaterial */}
      {CLOUD_LAYERS.map((layer, i) => (
        <mesh
          key={i}
          ref={(el) => { cloudMeshRefs.current[i] = el; }}
          geometry={cloudPlaneGeo}
          material={cloudMaterials[i]}
          position={[layer.x, layer.y, layer.z]}
          rotation={[layer.rx, layer.ry, 0]}
          scale={[layer.sx, layer.sy, 1]}
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
