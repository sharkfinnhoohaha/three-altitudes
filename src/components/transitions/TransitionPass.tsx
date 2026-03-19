import { forwardRef, useMemo, useEffect, useRef } from 'react';
import { Effect } from 'postprocessing';
import * as THREE from 'three';

/**
 * TransitionPass — cinematic post-processing for the 4-stage atmospheric journey.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * LUMA WIPE TRANSITION (Stage 1 → 2)
 *
 * Instead of a full-frame video overlay, the wave-transition video is sampled
 * as a luma mask (uMask). The brightness of each pixel in the video frame is
 * compared against a scroll-driven threshold (uWipeProgress). As the wave
 * crests (brightest pixels), those areas "wipe" first — revealing Atmosphere 2
 * through the bright areas of the wave video.
 *
 * The effect: water physically "washing" across the screen to dissolve
 * the Shoreline into the Pocket.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Stage 1 — Shoreline (0–0.25):
 *   Gentle water-refraction displacement (always on, subtle).
 *   Velocity-driven chromatic aberration — teal world smears on fast scroll.
 *
 * Stage 1→2 Luma Wipe (0.20–0.32):
 *   Wave video brightness drives per-pixel wipe from Shoreline → Pocket.
 *   Bright wave crests wipe first, dark troughs wipe last.
 *   Soft edge (uEdgeSoftness) prevents hard cutoff.
 *
 * Stage 2 — Pocket (0.25–0.50):
 *   Minimal distortion — warmth from scene lighting.
 *
 * Stage 3 — Engine Room (0.50–0.75):
 *   Near-clean pass. Residual noise fades out.
 *
 * Stage 4 — Horizon (0.75–1.0):
 *   Fully clean — no distortion, perfectly crisp.
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
uniform sampler2D uMask;          // Wave video texture (luma source)
uniform float uWipeProgress;      // 0→1 wipe progress within the transition zone
uniform float uEdgeSoftness;      // Softness of the luma wipe edge
uniform float uMaskActive;        // 1.0 when mask video has valid frames

// ── Main ─────────────────────────────────────────────────────────────────────
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

  // ═══════════════════════════════════════════════════════════════════════════
  // 1) LUMA WIPE TRANSITION (Stage 1 → 2)
  // ═══════════════════════════════════════════════════════════════════════════
  float wipeAmount = 0.0;

  // Active zone: progress 0.20 → 0.32 (centered on the 0.25 boundary)
  float wipeZone = smoothstep(0.18, 0.22, uProgress) * (1.0 - smoothstep(0.30, 0.34, uProgress));

  if (wipeZone > 0.001 && uMaskActive > 0.5) {
    vec2 maskUv = vec2(uv.x, 1.0 - uv.y);
    vec4 maskColor = texture2D(uMask, maskUv);

    float luma = dot(maskColor.rgb, vec3(0.2126, 0.7152, 0.0722));
    float edgeNoise = snoise(vec3(uv * 8.0, uTime * 0.5)) * 0.06;
    luma += edgeNoise;

    float edge = smoothstep(
      uWipeProgress - uEdgeSoftness,
      uWipeProgress + uEdgeSoftness,
      luma
    );

    wipeAmount = edge * wipeZone;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2) SHORELINE AMBIENT REFRACTION
  // ═══════════════════════════════════════════════════════════════════════════
  float shoreFactor = smoothstep(0.25, 0.0, uProgress);
  float shoreNoise = snoise(vec3(uv * 2.2, uTime * 0.18)) * 0.006 * shoreFactor;

  // ═══════════════════════════════════════════════════════════════════════════
  // 3) FALLBACK SIMPLEX WIPE — for when video isn't loaded
  // ═══════════════════════════════════════════════════════════════════════════
  float waveFallback = exp(-pow((uProgress - 0.25) * 12.0, 2.0));
  float fallbackStrength = waveFallback * (1.0 - uMaskActive);
  float waveNX = snoise(vec3(uv * 3.8, uTime * 0.45)) * 0.055 * fallbackStrength;
  float waveNY = snoise(vec3(uv * 3.8 + 100.0, uTime * 0.38)) * 0.055 * fallbackStrength;

  float wipeEdgeDisplace = 0.0;
  if (uMaskActive > 0.5) {
    float edgeProximity = 1.0 - abs(wipeAmount - 0.5) * 2.0;
    wipeEdgeDisplace = edgeProximity * wipeZone * 0.015;
  }

  float displaceNX = snoise(vec3(uv * 4.5, uTime * 0.35)) * wipeEdgeDisplace;
  float displaceNY = snoise(vec3(uv * 4.5 + 50.0, uTime * 0.3)) * wipeEdgeDisplace;

  vec2 displacedUv = uv + vec2(
    waveNX + shoreNoise + displaceNX,
    waveNY + shoreNoise + displaceNY
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // 4) CHROMATIC ABERRATION
  // ═══════════════════════════════════════════════════════════════════════════
  float aberrationZone = smoothstep(0.28, 0.0, uProgress);
  float aberration = clamp(abs(uVelocity) * 2.5 * aberrationZone, 0.0, 0.014);

  float wipeChroma = wipeAmount * (1.0 - wipeAmount) * 4.0 * wipeZone * 0.006;
  aberration += wipeChroma;

  float r = texture2D(inputBuffer, displacedUv + vec2(aberration, 0.0)).r;
  float g = texture2D(inputBuffer, displacedUv).g;
  float b = texture2D(inputBuffer, displacedUv - vec2(aberration, 0.0)).b;

  // ═══════════════════════════════════════════════════════════════════════════
  // 5) LUMA WIPE COLOR MIX
  // ═══════════════════════════════════════════════════════════════════════════
  vec3 effected = vec3(r, g, b);

  if (wipeAmount > 0.001 && wipeAmount < 0.999) {
    vec3 warmTint = mix(effected, effected * vec3(1.12, 0.92, 0.72), wipeAmount * wipeZone * 0.4);
    effected = warmTint;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 6) HORIZON CLEAN PASS
  // ═══════════════════════════════════════════════════════════════════════════
  float cleanFactor = smoothstep(0.72, 0.82, uProgress);
  vec4 clean = texture2D(inputBuffer, uv);
  vec4 final = vec4(effected, inputColor.a);

  outputColor = mix(final, clean, cleanFactor);
}
`;

class TransitionEffectImpl extends Effect {
  private videoElement: HTMLVideoElement | null = null;
  private videoTexture: THREE.VideoTexture | null = null;
  private maskActive = false;
  private wipeProgress = 0;

  constructor() {
    super('TransitionEffect', fragmentShader, {
      uniforms: new Map<string, THREE.Uniform>([
        ['uProgress', new THREE.Uniform(0.0)],
        ['uTime', new THREE.Uniform(0.0)],
        ['uVelocity', new THREE.Uniform(0.0)],
        ['uMask', new THREE.Uniform(null)],
        ['uWipeProgress', new THREE.Uniform(0.0)],
        ['uEdgeSoftness', new THREE.Uniform(0.18)],
        ['uMaskActive', new THREE.Uniform(0.0)],
      ]),
    });
  }

  attachVideo(video: HTMLVideoElement) {
    this.videoElement = video;
    this.videoTexture = new THREE.VideoTexture(video);
    this.videoTexture.minFilter = THREE.LinearFilter;
    this.videoTexture.magFilter = THREE.LinearFilter;
    this.videoTexture.format = THREE.RGBAFormat;
    this.videoTexture.colorSpace = THREE.SRGBColorSpace;

    const maskUniform = this.uniforms.get('uMask');
    if (maskUniform) maskUniform.value = this.videoTexture;
  }

  update(
    _renderer: THREE.WebGLRenderer,
    _inputBuffer: THREE.WebGLRenderTarget,
    deltaTime: number
  ) {
    const timeUniform = this.uniforms.get('uTime');
    if (timeUniform) timeUniform.value += deltaTime;

    if (this.videoTexture && this.videoElement) {
      this.videoTexture.needsUpdate = true;

      const isPlaying =
        !this.videoElement.paused &&
        !this.videoElement.ended &&
        this.videoElement.readyState >= 2;

      const maskActiveU = this.uniforms.get('uMaskActive');
      if (maskActiveU) {
        const target = isPlaying ? 1.0 : 0.0;
        maskActiveU.value += (target - maskActiveU.value) * 0.15;
      }
    }

    const progressU = this.uniforms.get('uProgress');
    const wipeU = this.uniforms.get('uWipeProgress');
    if (progressU && wipeU) {
      const p = progressU.value;
      const wipe = Math.max(0, Math.min(1, (p - 0.20) / 0.12));
      wipeU.value = wipe;
    }
  }

  dispose() {
    if (this.videoTexture) {
      this.videoTexture.dispose();
      this.videoTexture = null;
    }
    super.dispose();
  }
}

export const TransitionPass = forwardRef(function TransitionPass(_props, ref) {
  const effect = useMemo(() => new TransitionEffectImpl(), []);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const attachedRef = useRef(false);

  useEffect(() => {
    const video = document.createElement('video');
    video.src = '/videos/wave-transition.mp4';
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.loop = false;
    video.style.position = 'fixed';
    video.style.top = '-9999px';
    video.style.left = '-9999px';
    video.style.width = '1px';
    video.style.height = '1px';
    video.style.opacity = '0';
    video.style.pointerEvents = 'none';
    document.body.appendChild(video);
    videoRef.current = video;

    video.addEventListener('loadeddata', () => {
      if (!attachedRef.current) {
        effect.attachVideo(video);
        attachedRef.current = true;
      }
    });

    if (video.readyState >= 2 && !attachedRef.current) {
      effect.attachVideo(video);
      attachedRef.current = true;
    }

    return () => {
      video.pause();
      video.src = '';
      video.remove();
      videoRef.current = null;
    };
  }, [effect]);

  useEffect(() => {
    let lastScrollProgress = 0;
    let hasTriggered = false;

    const checkScroll = () => {
      const scrollY = window.scrollY || 0;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;

      const video = videoRef.current;
      if (!video) return;

      if (progress > 0.18 && progress < 0.34 && !hasTriggered) {
        hasTriggered = true;
        video.currentTime = 0;
        video.play().catch(() => {});
      }

      if (hasTriggered && progress >= 0.18 && progress <= 0.34) {
        const wipeT = Math.max(0, Math.min(1, (progress - 0.18) / 0.16));
        if (video.duration > 0) {
          const scrubTime = wipeT * video.duration;
          const currentDelta = Math.abs(video.currentTime - scrubTime);
          if (currentDelta > 0.3) {
            video.currentTime = scrubTime;
          }
        }
      }

      if (progress < 0.15) {
        hasTriggered = false;
        if (video) {
          video.pause();
          video.currentTime = 0;
        }
      }

      if (progress > 0.36 && hasTriggered) {
        video.pause();
      }

      lastScrollProgress = progress;
    };

    let rafId: number;
    const loop = () => {
      checkScroll();
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(rafId);
  }, []);

  return <primitive ref={ref} object={effect} dispose={null} />;
});
