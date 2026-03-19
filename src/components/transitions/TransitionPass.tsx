import { forwardRef, useMemo } from 'react';
import { Effect } from 'postprocessing';
import * as THREE from 'three';

/**
 * TransitionPass — cinematic post-processing for the 4-stage atmospheric journey.
 *
 * Stage 1 — Shoreline (0–0.25):
 *   Gentle water-refraction displacement (always on, very subtle).
 *   Velocity-driven chromatic aberration on fast scroll — the teal world
 *   smears like light refracting through moving water.
 *
 * Stage 1→2 transition (0.20–0.30):
 *   Wave-Wipe: bell-curve simplex noise displacement centred at 0.25.
 *   The teal ocean "washes" across the screen to reveal the amber void.
 *
 * Stage 2 — Pocket (0.25–0.50):
 *   Minimal distortion — warmth comes from scene lighting/materials.
 *
 * Stage 3 — Engine Room (0.50–0.75):
 *   Near-clean pass. Residual noise fades out entirely.
 *
 * Stage 4 — Horizon (0.75–1.0):
 *   Fully clean pass — no distortion, perfectly crisp.
 */

const fragmentShader = /* glsl */ `
// ── Simplex 3D noise ──────────────────────────────────────────────────────────
vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0 / 7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

// ── Uniforms ─────────────────────────────────────────────────────────────────
uniform float uProgress;
uniform float uTime;
uniform float uVelocity;

// ── Main ─────────────────────────────────────────────────────────────────────
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

  // 1) Shoreline ambient water refraction — gentle constant in Stage 1
  float shoreFactor = smoothstep(0.25, 0.0, uProgress);
  float shoreNoise = snoise(vec3(uv * 2.2, uTime * 0.18)) * 0.006 * shoreFactor;

  // 2) Wave-Wipe transition — bell curve centred at the Stage 1→2 boundary (0.25)
  //    Width controlled by the 12.0 exponent (narrower = sharper wipe)
  float waveFactor = exp(-pow((uProgress - 0.25) * 12.0, 2.0));
  float waveNX = snoise(vec3(uv * 3.8, uTime * 0.45)) * 0.055 * waveFactor;
  float waveNY = snoise(vec3(uv * 3.8 + 100.0, uTime * 0.38)) * 0.055 * waveFactor;

  vec2 displacedUv = uv + vec2(waveNX + shoreNoise, waveNY + shoreNoise);

  // 3) Chromatic aberration — velocity-driven, only in Shoreline zone
  float aberrationZone = smoothstep(0.28, 0.0, uProgress);
  float aberration = clamp(abs(uVelocity) * 2.5 * aberrationZone, 0.0, 0.014);

  float r = texture2D(inputBuffer, displacedUv + vec2(aberration, 0.0)).r;
  float g = texture2D(inputBuffer, displacedUv).g;
  float b = texture2D(inputBuffer, displacedUv - vec2(aberration, 0.0)).b;

  // 4) Horizon clean pass — fully unprocessed from 0.72 → 0.82
  float cleanFactor = smoothstep(0.72, 0.82, uProgress);
  vec4 clean = texture2D(inputBuffer, uv);
  vec4 effected = vec4(r, g, b, inputColor.a);

  outputColor = mix(effected, clean, cleanFactor);
}
`;

class TransitionEffectImpl extends Effect {
  constructor() {
    super('TransitionEffect', fragmentShader, {
      uniforms: new Map<string, THREE.Uniform>([
        ['uProgress', new THREE.Uniform(0.0)],
        ['uTime', new THREE.Uniform(0.0)],
        ['uVelocity', new THREE.Uniform(0.0)],
      ]),
    });
  }

  update(_renderer: THREE.WebGLRenderer, _inputBuffer: THREE.WebGLRenderTarget, deltaTime: number) {
    const timeUniform = this.uniforms.get('uTime');
    if (timeUniform) timeUniform.value += deltaTime;
  }
}

export const TransitionPass = forwardRef(function TransitionPass(_props, ref) {
  const effect = useMemo(() => new TransitionEffectImpl(), []);
  return <primitive ref={ref} object={effect} dispose={null} />;
});
