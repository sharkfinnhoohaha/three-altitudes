'use client';

import { useState, useEffect, useRef } from 'react';
import { useScroll } from '@/contexts/ScrollContext';
import { AirplaneCursor } from './AirplaneCursor';
import { CaliforniaTime } from './CaliforniaTime';
import type {
  SanityHero,
  SanityAudioWork,
  SanityAviation,
  SanityWebProject,
  SanityDevProject,
} from '@/lib/sanity/types';
import {
  FALLBACK_IDENTITIES,
  FALLBACK_PROJECTS,
  FALLBACK_WEB_PROJECTS,
  FALLBACK_AUDIO_STATS,
  FALLBACK_TRACKS,
  FALLBACK_TOURING_CREDITS,
  FALLBACK_DISCIPLINES,
  FALLBACK_AVIATION_GAUGES,
  FALLBACK_AVIATION_BEACON_LINKS,
  DATA_COLUMNS,
  WAVEFORM_BARS,
} from '@/lib/fallbacks';
import { COMPACT_LAYOUT_MEDIA_QUERY } from '@/lib/responsive';

// Section entry motion: subtle scale only. No translate/rotate — content is fixed-positioned
// and centered at all times, so any translate would visibly drift content off-center mid-fade.
const SECTION_ENTRY_MOTION = {
  pocket: { baseScale: 0.97, scaleRange: 0.03 },
  engine: { baseScale: 0.97, scaleRange: 0.03 },
  web: { baseScale: 0.97, scaleRange: 0.03 },
  horizon: { baseScale: 0.97, scaleRange: 0.03 },
} as const;

const SECTION_STARTS: number[] = [0, 0.25, 0.5, 0.75, 1];
const SECTION_BOUNDARIES = [0.25, 0.5, 0.75] as const;
const VEIL_TRANSITION_RADIUS = 0.055;

// Shared style for each section's fixed-position inner container. Anchors content to
// viewport center so it never drifts during opacity cross-fades.
const SECTION_SHELL_BASE = {
  position: 'fixed' as const,
  inset: 0,
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  willChange: 'opacity, transform',
};
const VEIL_BASE_RGB = '5,8,12';
const HORIZON_PANEL_BORDER = 'rgba(42,42,42,0.22)';
const HORIZON_PANEL_BG_TOP = 'rgba(255,255,255,0.48)';
const HORIZON_PANEL_BG_BOTTOM = 'rgba(232,236,242,0.55)';
const VEIL_BACKGROUND = `
  radial-gradient(ellipse at center, rgba(0,0,0,0) 30%, rgba(0,0,0,0.55) 100%),
  linear-gradient(180deg, rgba(${VEIL_BASE_RGB},0.8) 0%, rgba(${VEIL_BASE_RGB},0.2) 22%, rgba(${VEIL_BASE_RGB},0.2) 78%, rgba(${VEIL_BASE_RGB},0.8) 100%)
`;
const CASCADE_TRIGGER_PROGRESS = 0.47;


// ── Selected Work Browser ─────────────────────────────────────────────────────
// Single macOS-style browser mockup with three stacked iframe panels,
// crossfade transitions, tab selector, and auto-rotation.
function SelectedWorkBrowser({ webProjects }: { webProjects: SanityWebProject[] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const resumeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll entrance via IntersectionObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Cleanup resume timeout on unmount
  useEffect(() => {
    return () => {
      if (resumeRef.current) clearTimeout(resumeRef.current);
    };
  }, []);

  // Auto-rotation — pauses on user interaction, resumes after 8 s
  // Skip rotation when there's only one project or list is empty
  useEffect(() => {
    if (paused || webProjects.length <= 1) return;
    const id = setInterval(() => {
      setActiveIdx((i) => (i + 1) % webProjects.length);
    }, 4500);
    return () => clearInterval(id);
  }, [paused, webProjects.length]);

  const handleTabClick = (idx: number) => {
    setActiveIdx(idx);
    setPaused(true);
    if (resumeRef.current) clearTimeout(resumeRef.current);
    resumeRef.current = setTimeout(() => setPaused(false), 8000);
  };

  const activeProject = webProjects[activeIdx];

  if (!activeProject) return null;

  return (
    <div
      ref={containerRef}
      style={{
        width: 'clamp(280px, 90vw, 820px)',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.8s ease, transform 0.8s ease',
      }}
    >
      {/* ── Browser frame ── */}
      <div
        style={{
          borderRadius: 16,
          overflow: 'hidden',
          background: 'rgb(26,26,26)',
          boxShadow: 'rgba(0,0,0,0.15) 0px 25px 50px',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Title bar */}
        <div
          style={{
            background: 'rgb(20,20,20)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          {/* Traffic lights */}
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            <span style={{ display: 'block', width: 12, height: 12, borderRadius: '50%', background: 'rgb(255,95,87)' }} />
            <span style={{ display: 'block', width: 12, height: 12, borderRadius: '50%', background: 'rgb(254,188,46)' }} />
            <span style={{ display: 'block', width: 12, height: 12, borderRadius: '50%', background: 'rgb(40,200,64)' }} />
          </div>

          {/* URL bar — dynamically updates on tab switch */}
          <div
            style={{
              flex: 1,
              background: 'rgb(10,10,10)',
              borderRadius: 6,
              padding: '5px 12px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.6rem',
              letterSpacing: '0.04em',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            <span style={{ color: '#444' }}>https://</span>
            <span style={{ color: '#888' }}>{activeProject.domain}</span>
          </div>
        </div>

        {/* Panel area — all panels exist in DOM, stacked absolutely */}
        <div
          data-lenis-prevent
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 10',
            background: '#0a0a0a',
            overflow: 'hidden',
          }}
        >
          {webProjects.map((project, idx) => (
            <div
              key={project._id}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: idx === activeIdx ? 1 : 0,
                transform: idx === activeIdx ? 'scale(1)' : 'scale(0.98)',
                zIndex: idx === activeIdx ? 10 : 0,
                pointerEvents: idx === activeIdx ? 'auto' : 'none',
                transition: 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {project.screenshotUrl ? (
                <img
                  src={project.screenshotUrl}
                  alt={project.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <iframe
                  src={project.url}
                  title={project.name}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                />
              )}
            </div>
          ))}

          {/* Bottom fade — softens the content edge */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 48,
              background: 'linear-gradient(transparent, rgb(26,26,26))',
              pointerEvents: 'none',
              zIndex: 20,
            }}
          />
        </div>
      </div>

      {/* ── Tab selector ── */}
      <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
        {webProjects.map((project, idx) => {
          const isActive = idx === activeIdx;
          return (
            <button
              key={project._id}
              onClick={() => handleTabClick(idx)}
              className="browser-tab-btn"
              style={{
                flex: 1,
                borderRadius: 12,
                padding: '16px 20px',
                height: 68,
                cursor: 'pointer',
                border: `1px solid ${isActive ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)'}`,
                background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
                textAlign: 'left',
                transition: 'background 0.3s ease, border-color 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              <span
                className="serif-text"
                style={{
                  fontSize: 'clamp(0.7rem, 1.1vw, 0.9rem)',
                  fontWeight: 400,
                  color: isActive ? '#ccc' : '#444',
                  letterSpacing: '0.05em',
                  lineHeight: 1,
                  transition: 'color 0.3s ease',
                  display: 'block',
                }}
              >
                {project.name}
              </span>
              <span
                className="hud-text"
                style={{
                  fontSize: '0.28rem',
                  letterSpacing: '0.3em',
                  color: isActive ? '#00ff88' : '#333',
                  transition: 'color 0.3s ease',
                  display: 'block',
                }}
              >
                {project.type}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export interface ScrollSectionsProps {
  hero?: SanityHero | null;
  audioWork?: SanityAudioWork | null;
  aviation?: SanityAviation | null;
  webProjects?: SanityWebProject[];
  devProjects?: SanityDevProject[];
}

export function ScrollSections({
  hero,
  audioWork,
  aviation,
  webProjects: webProjectsProp,
  devProjects: devProjectsProp,
}: ScrollSectionsProps) {
  const { atmosphere, velocity, progress } = useScroll();
  const [identityIndex, setIdentityIndex] = useState(0);
  const [cascadeActive, setCascadeActive] = useState(false);
  const [pocketEntered, setPocketEntered] = useState(false);
  const [swipeFxKey, setSwipeFxKey] = useState(0);
  const [isCompactLayout, setIsCompactLayout] = useState(false);
  const pocketTextRef = useRef<HTMLDivElement>(null);
  const prevAtmosphere = useRef(atmosphere);
  const prevSectionIndex = useRef(0);
  const prevProgressRef = useRef(progress);

  // Resolve data — Sanity data when available, fallback constants otherwise
  const heroName = (hero?.name ?? '').trim() || 'FINN BENNETT';
  const heroLocationLabel = hero?.locationLabel ?? 'VENTURA, CA';
  const identities = hero?.identities?.length ? hero.identities : FALLBACK_IDENTITIES;
  const heroBgUrl = hero?.primaryPhotoUrl ?? null;
  const aviationBgUrl = aviation?.primaryPhotoUrl ?? '/images/la-altitude.jpg';
  const callsign = aviation?.callsign ?? 'N12345';
  const certLabel = aviation?.certLabel ?? 'COMMERCIAL PILOT';
  const aviationCoords = aviation?.coordinates ?? '34°12′48″N  //  119°05′39″W';
  const tagline = aviation?.tagline ?? 'From altitude, everything is pattern.';
  const gauges = aviation?.gauges?.length ? aviation.gauges : FALLBACK_AVIATION_GAUGES;
  const beaconLinks = aviation?.beaconLinks?.length ? aviation.beaconLinks : FALLBACK_AVIATION_BEACON_LINKS;
  const audioHeadline = audioWork?.headline ?? 'OVERLOOK AUDIO';
  const sectionTitle = audioWork?.sectionTitle ?? 'Sonic Work';
  const stats = audioWork?.stats?.length ? audioWork.stats : FALLBACK_AUDIO_STATS;
  const tracks = audioWork?.tracks?.length ? audioWork.tracks : FALLBACK_TRACKS;
  const touringCredits = audioWork?.touringCredits?.length ? audioWork.touringCredits : FALLBACK_TOURING_CREDITS;
  const disciplines = audioWork?.disciplines?.length ? audioWork.disciplines : FALLBACK_DISCIPLINES;
  const spotifyPlaylistId = audioWork?.spotifyPlaylistId;
  const spotifyUrl = spotifyPlaylistId
    ? `https://open.spotify.com/playlist/${spotifyPlaylistId}`
    : 'https://open.spotify.com';
  const devProjects = devProjectsProp?.length ? devProjectsProp : FALLBACK_PROJECTS;
  const webProjects = webProjectsProp?.length ? webProjectsProp : FALLBACK_WEB_PROJECTS;

  // ── Smooth progress-driven section opacities ──────────────────────────────
  // Each section has an independent fade-in / fade-out range so sections gently
  // dissolve into one another rather than snapping on the atmosphere boundary.
  // The overlap creates a cinematic cross-fade as the user scrolls.
  function sectionOpacity(
    fadeInStart: number, fadeInEnd: number,
    fadeOutStart: number, fadeOutEnd: number
  ): number {
    const fadeIn =
      progress <= fadeInStart ? 0
      : progress <= fadeInEnd ? (progress - fadeInStart) / (fadeInEnd - fadeInStart)
      : 1;
    const fadeOut =
      progress <= fadeOutStart ? 1
      : progress <= fadeOutEnd ? 1 - (progress - fadeOutStart) / (fadeOutEnd - fadeOutStart)
      : 0;
    return fadeIn * fadeOut;
  }

  // Tighter fade windows now that each section is fixed-centered: the outgoing section
  // clears quickly so the incoming section can fully own the viewport without ghosting.
  const shorelineOpacity  = sectionOpacity(-0.02, 0.04, 0.2, 0.26);
  const pocketOpacity     = sectionOpacity(0.19, 0.27, 0.45, 0.51);
  const engineRoomOpacity = sectionOpacity(0.44, 0.52, 0.69, 0.76);
  const webOpacity        = sectionOpacity(0.69, 0.77, 0.92, 0.98);
  // Keep the final horizon section fully present through page end by placing fade-out past max progress (1.0).
  const horizonOpacity    = sectionOpacity(0.92, 1, 1.2, 1.28);

  const sectionMix = (start: number, end: number) => {
    if (progress <= start) return 0;
    if (progress >= end) return 1;
    const t = (progress - start) / (end - start);
    return t * t * (3 - 2 * t);
  };

  const pocketEnterMix = sectionMix(0.15, 0.25);
  const engineEnterMix = sectionMix(0.38, 0.5);
  const webEnterMix = sectionMix(0.63, 0.76);
  const horizonEnterMix = sectionMix(0.9, 1);
  const sectionTransitionVeilOpacity = SECTION_BOUNDARIES.reduce((maxOpacity, boundary) => {
    const dist = Math.abs(progress - boundary);
    if (dist >= VEIL_TRANSITION_RADIUS) return maxOpacity;
    const transitionProgress = 1 - dist / VEIL_TRANSITION_RADIUS;
    // Smoothstep interpolation to avoid abrupt veil intensity changes.
    const eased = transitionProgress * transitionProgress * (3 - 2 * transitionProgress);
    return Math.max(maxOpacity, eased);
  }, 0);

  // Subtle scale-only entry — keeps content pinned to viewport center during opacity fades.
  const pocketSectionTransform = `scale(${SECTION_ENTRY_MOTION.pocket.baseScale + pocketEnterMix * SECTION_ENTRY_MOTION.pocket.scaleRange})`;
  const engineSectionTransform = `scale(${SECTION_ENTRY_MOTION.engine.baseScale + engineEnterMix * SECTION_ENTRY_MOTION.engine.scaleRange})`;
  const webSectionTransform = `scale(${SECTION_ENTRY_MOTION.web.baseScale + webEnterMix * SECTION_ENTRY_MOTION.web.scaleRange})`;
  const horizonSectionTransform = `scale(${SECTION_ENTRY_MOTION.horizon.baseScale + horizonEnterMix * SECTION_ENTRY_MOTION.horizon.scaleRange})`;

  const currentSectionIndex = SECTION_STARTS.reduce((nearestIdx, sectionStart, idx) => {
    const nearestDist = Math.abs(progress - SECTION_STARTS[nearestIdx]);
    const currentDist = Math.abs(progress - sectionStart);
    return currentDist < nearestDist ? idx : nearestIdx;
  }, 0);

  useEffect(() => {
    const id = setInterval(() => {
      setIdentityIndex((i) => (i + 1) % identities.length);
    }, 2200);
    return () => clearInterval(id);
  }, [identities.length]);

  useEffect(() => {
    const media = window.matchMedia(COMPACT_LAYOUT_MEDIA_QUERY);
    const update = () => setIsCompactLayout(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  // Pocket text vibration — linked to scroll velocity
  useEffect(() => {
    if (atmosphere !== 'pocket' || !pocketTextRef.current) return;
    const el = pocketTextRef.current;
    const absV = Math.min(Math.abs(velocity), 30);
    const jitterX = (Math.random() - 0.5) * absV * 0.12;
    const jitterY = (Math.random() - 0.5) * absV * 0.08;
    el.style.transform = `translate(${jitterX}px, ${jitterY}px)`;
  }, [atmosphere, velocity]);

  // Data cascade trigger slightly before engine-room entry to land earlier in the transition.
  useEffect(() => {
    const previousProgress = prevProgressRef.current;
    prevProgressRef.current = progress;
    const crossedIntoCascadeZone =
      previousProgress < CASCADE_TRIGGER_PROGRESS &&
      progress >= CASCADE_TRIGGER_PROGRESS;
    if (crossedIntoCascadeZone) {
      setCascadeActive(true);
      const t = setTimeout(() => setCascadeActive(false), 2000);
      return () => clearTimeout(t);
    }
  }, [progress]);

  // Pocket section entrance — triggers once on first visit
  useEffect(() => {
    if (atmosphere === 'pocket') setPocketEntered(true);
  }, [atmosphere]);

  useEffect(() => {
    if (currentSectionIndex !== prevSectionIndex.current) {
      prevSectionIndex.current = currentSectionIndex;
      setSwipeFxKey((k) => k + 1);
    }
  }, [currentSectionIndex]);

  // Hide default cursor in horizon section — AirplaneCursor renders the SVG replacement
  useEffect(() => {
    if (atmosphere === 'horizon') {
      document.body.classList.add('cursor-none');
    } else {
      document.body.classList.remove('cursor-none');
    }
    return () => document.body.classList.remove('cursor-none');
  }, [atmosphere]);

  // Staggered entrance animation helper — opacity + lift-in with delay
  const pocketAnim = (delay: number) => ({
    opacity: pocketEntered ? 1 : 0,
    transform: pocketEntered ? 'translateY(0px)' : 'translateY(16px)',
    transition: `opacity 0.75s ease ${delay}s, transform 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
  });

  return (
    <div className="scroll-content" style={{ height: '500vh' }}>
      {/* Full-page transition veil to soften hard image edges at section boundaries */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 40,
          pointerEvents: 'none',
          opacity: sectionTransitionVeilOpacity,
          transition: 'opacity 180ms linear',
          background: VEIL_BACKGROUND,
          mixBlendMode: 'multiply',
        }}
      />

      {/* Swipe transition pulse — surf/aviation inspired streak overlay */}
      <div
        key={swipeFxKey}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 41,
          pointerEvents: 'none',
          opacity: 0,
          background:
            'linear-gradient(115deg, rgba(61,217,196,0) 8%, rgba(61,217,196,0.15) 28%, rgba(255,140,0,0.24) 50%, rgba(212,228,240,0.22) 72%, rgba(212,228,240,0) 92%)',
          transform: 'translateX(-14%) skewX(-8deg)',
          animation: 'journey-swipe 620ms cubic-bezier(0.16,1,0.3,1) forwards',
        }}
      />

      {/* ── Scroll progress bar — cinematic thin line at top of viewport ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          zIndex: 45,
          pointerEvents: 'none',
          background: 'rgba(255,255,255,0.04)',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${Math.min(progress * 100, 100)}%`,
            background: atmosphere === 'horizon'
              ? 'linear-gradient(90deg, rgba(42,42,42,0.7), rgba(42,42,42,0.35))'
              : atmosphere === 'pocket'
              ? 'linear-gradient(90deg, rgba(255,140,0,0.8), rgba(255,140,0,0.35))'
              : atmosphere === 'engine-room'
              ? 'linear-gradient(90deg, rgba(0,255,136,0.7), rgba(0,255,136,0.3))'
              : 'linear-gradient(90deg, rgba(61,217,196,0.8), rgba(61,217,196,0.35))',
            transition: 'background 0.6s ease',
          }}
        />
      </div>


      {/* ─── Stage 1: The Shoreline — Identity ────────────────────────── */}
      <section data-scroll-section data-atmosphere="shoreline" data-section-index={0} style={{ height: '100vh', position: 'relative' }}>
        <div
          tabIndex={isCompactLayout ? 0 : -1}
          style={{
            ...SECTION_SHELL_BASE,
            opacity: shorelineOpacity,
            pointerEvents: shorelineOpacity > 0.4 ? 'all' : 'none',
            overflow: 'hidden',
          }}
        >
          {/* Hero background photo — primary photo from Sanity hero document */}
          {heroBgUrl && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
              <img
                src={heroBgUrl}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  opacity: 0.14,
                  mixBlendMode: 'luminosity',
                }}
              />
            </div>
          )}

          {/* Hero title card — anchored to viewport center */}
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.2rem',
              textAlign: 'center',
              padding: '0 1rem',
              maxWidth: '92vw',
            }}
          >
            <p
              className="hud-text"
              style={{
                fontSize: 'clamp(0.6rem, 0.85vw, 0.75rem)',
                letterSpacing: '0.55em',
                color: '#86f5e4',
                opacity: 0.55,
                textShadow: '0 4px 16px rgba(0,0,0,0.6)',
                paddingLeft: '0.55em',
              }}
            >
              STAGE 01 — SHORELINE
            </p>
            <p
              className="serif-text"
              style={{
                fontSize: 'clamp(2.6rem, 9vw, 7.6rem)',
                fontWeight: 300,
                color: '#f0fbfb',
                letterSpacing: '0.22em',
                lineHeight: 0.96,
                textShadow: '0 8px 36px rgba(0,0,0,0.48)',
                paddingLeft: '0.22em',
              }}
            >
              {heroName}
            </p>
            <p
              className="hud-text"
              style={{
                fontSize: 'clamp(0.62rem, 1vw, 0.82rem)',
                letterSpacing: '0.42em',
                color: '#d7fbf3',
                opacity: 0.8,
                textShadow: '0 4px 16px rgba(0,0,0,0.6)',
                paddingLeft: '0.42em',
              }}
            >
              DIGITAL STORYTELLER // CREATIVE BUILDER
            </p>
          </div>

          {/* Bottom-left context + identity ticker */}
          <div
            style={{
              position: 'absolute',
              bottom: 'clamp(1.75rem, 5vh, 3.2rem)',
              left: 'clamp(1.5rem, 3vw, 3rem)',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.8rem',
            }}
          >
            <p
              className="hud-text"
              style={{
                fontSize: 'clamp(0.58rem, 0.75vw, 0.72rem)',
                color: '#7de6d5',
                letterSpacing: '0.45em',
                lineHeight: 1,
                opacity: 0.7,
                paddingLeft: '0.45em',
              }}
            >
              LANDING ID
            </p>

            <div
              className="hud-text"
              style={{
                fontSize: 'clamp(0.62rem, 0.85vw, 0.78rem)',
                letterSpacing: '0.38em',
                color: '#3dd9c4',
                opacity: 0.8,
                display: 'flex',
                alignItems: 'center',
                gap: '0.7em',
                height: '1.3em',
                overflow: 'hidden',
                paddingLeft: '0.38em',
              }}
            >
              <span key={identityIndex} style={{ animation: 'identity-enter 0.5s ease forwards' }}>
                {identities[identityIndex]}
              </span>
              <span style={{ opacity: 0.35 }}>//</span>
              <span style={{ opacity: 0.35 }}>{identities[(identityIndex + 1) % identities.length]}</span>
              <span style={{ opacity: 0.18 }}>//</span>
              <span style={{ opacity: 0.18 }}>{identities[(identityIndex + 2) % identities.length]}</span>
            </div>

            <div
              className="hud-text"
              style={{
                fontSize: 'clamp(0.54rem, 0.72vw, 0.66rem)',
                letterSpacing: '0.32em',
                color: '#3dd9c4',
                opacity: 0.4,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5em',
                paddingLeft: '0.32em',
              }}
            >
              <span>{heroLocationLabel}</span>
              <span style={{ opacity: 0.4 }}>//</span>
              <CaliforniaTime />
              <span style={{ opacity: 0.4 }}>PT</span>
            </div>
          </div>

        </div>
      </section>

      {/* ─── Stage 2: The Pocket — Sonic Work ─────────────────────────── */}
      <section data-scroll-section data-atmosphere="pocket" data-section-index={1} style={{ height: '100vh', position: 'relative' }}>
        <div
          tabIndex={isCompactLayout ? 0 : -1}
          style={{
            ...SECTION_SHELL_BASE,
            opacity: pocketOpacity,
            transform: pocketSectionTransform,
            filter: isCompactLayout ? 'none' : `blur(${(1 - pocketEnterMix) * 0.6}px)`,
            pointerEvents: pocketOpacity > 0.4 ? 'all' : 'none',
            padding: 'clamp(2.5rem, 6vh, 4rem) clamp(1.5rem, 5vw, 4rem)',
            textAlign: 'left',
            overflowY: isCompactLayout ? 'auto' : 'hidden',
          }}
        >
          <div
            ref={pocketTextRef}
            style={{
              willChange: 'transform',
              transition: 'transform 0.05s linear',
              width: '100%',
              maxWidth: '1100px',
            }}
          >

            {/* ── Header strip ── */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                marginBottom: '1.5rem',
                ...pocketAnim(0),
              }}
            >
              <p className="hud-text" style={{ fontSize: 'clamp(0.6rem, 0.8vw, 0.78rem)', letterSpacing: '0.48em', color: '#ff8c00', opacity: 0.7, whiteSpace: 'nowrap', paddingLeft: '0.48em' }}>
                STAGE 02 — {audioHeadline}
              </p>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(255,140,0,0.35) 0%, rgba(255,140,0,0.06) 70%, transparent 100%)' }} />
              <p className="hud-text" style={{ fontSize: 'clamp(0.54rem, 0.7vw, 0.66rem)', letterSpacing: '0.42em', color: '#ff8c00', opacity: 0.42, whiteSpace: 'nowrap', paddingLeft: '0.42em' }}>
                SIGNAL FLOW
              </p>
            </div>

            {/* ── Title + Waveform row ── */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '1.75rem',
                marginBottom: '2.5rem',
                ...pocketAnim(0.08),
              }}
            >
              <h2
                className="serif-text"
                style={{
                  fontSize: 'clamp(2.6rem, 5.5vw, 4.4rem)',
                  fontWeight: 300,
                  color: '#f5e6d0',
                  letterSpacing: '0.04em',
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                {sectionTitle}
              </h2>

              {/* Decorative waveform — fills remaining title row width */}
              <div style={{ flex: 1, overflow: 'hidden', paddingBottom: '0.6rem' }}>
                <svg
                  viewBox="0 0 120 32"
                  preserveAspectRatio="none"
                  width="100%"
                  height="30"
                  style={{ display: 'block' }}
                >
                  {WAVEFORM_BARS.map((h, i) => {
                    const halfH = h * 13;
                    return (
                      <rect
                        key={i}
                        x={i + 0.15}
                        y={16 - halfH}
                        width={0.7}
                        height={halfH * 2}
                        fill={`rgba(255,140,0,${(0.12 + h * 0.44).toFixed(3)})`}
                      />
                    );
                  })}
                </svg>
              </div>

              <p className="hud-text" style={{ fontSize: 'clamp(0.56rem, 0.72vw, 0.68rem)', letterSpacing: '0.4em', color: '#ff8c00', opacity: 0.5, paddingBottom: '0.6rem', whiteSpace: 'nowrap', flexShrink: 0, paddingLeft: '0.4em' }}>
                12+ YRS
              </p>
            </div>

            {/* ── Three-column body ── */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isCompactLayout
                  ? '1fr'
                  : 'clamp(120px, 15vw, 165px) 1fr clamp(140px, 18vw, 200px)',
                gap: 'clamp(1.25rem, 3vw, 2.5rem)',
                alignItems: 'start',
                paddingBottom: '0.75rem',
              }}
            >

              {/* Left col: Stats + Disciplines */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>

                {/* Stat readouts */}
                <div style={{ ...pocketAnim(0.15) }}>
                  <p className="hud-text" style={{ fontSize: 'clamp(0.56rem, 0.72vw, 0.66rem)', letterSpacing: '0.44em', color: '#ff8c00', opacity: 0.5, marginBottom: '0.9rem', paddingLeft: '0.44em' }}>
                    CREDENTIALS
                  </p>
                  {stats.map(({ value, label }, i) => (
                    <div
                      key={label}
                      style={{
                        paddingLeft: '0.85rem',
                        paddingTop: '0.55rem',
                        paddingBottom: '0.55rem',
                        borderLeft: `1px solid rgba(255,140,0,${i === 0 ? 0.45 : 0.16})`,
                        marginBottom: '0.15rem',
                      }}
                    >
                      <p
                        className="serif-text"
                        style={{
                          fontSize: 'clamp(1.4rem, 2.3vw, 1.9rem)',
                          fontWeight: 300,
                          color: '#ffa538',
                          lineHeight: 1,
                          opacity: 1 - i * 0.14,
                        }}
                      >
                        {value}
                      </p>
                      <p className="hud-text" style={{ fontSize: 'clamp(0.5rem, 0.66vw, 0.6rem)', letterSpacing: '0.34em', color: '#ff8c00', opacity: 0.58, marginTop: '0.25rem', paddingLeft: '0.34em' }}>
                        {label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Signal-chain disciplines */}
                <div style={{ marginTop: '1.8rem', ...pocketAnim(0.35) }}>
                  <p className="hud-text" style={{ fontSize: 'clamp(0.56rem, 0.72vw, 0.66rem)', letterSpacing: '0.44em', color: '#ff8c00', opacity: 0.5, marginBottom: '0.7rem', paddingLeft: '0.44em' }}>
                    DISCIPLINES
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {disciplines.map((d) => (
                      <span
                        key={d.code}
                        className="hud-text"
                        style={{
                          fontSize: 'clamp(0.52rem, 0.68vw, 0.62rem)',
                          letterSpacing: '0.22em',
                          color: '#ffa538',
                          opacity: 0.75,
                          padding: '0.3rem 0.55rem',
                          border: '1px solid rgba(255,140,0,0.28)',
                          background: 'rgba(255,140,0,0.04)',
                          whiteSpace: 'nowrap',
                          paddingLeft: 'calc(0.55rem + 0.22em)',
                        }}
                      >
                        {d.code}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Center col: Featured Tracks */}
              <div style={{ position: 'relative', ...pocketAnim(0.22) }}>

                <p className="hud-text" style={{ fontSize: 'clamp(0.56rem, 0.72vw, 0.66rem)', letterSpacing: '0.44em', color: '#ff8c00', opacity: 0.5, marginBottom: '0.9rem', paddingLeft: '0.44em' }}>
                  SELECTED TRACKS
                </p>

                {/* Track list */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {tracks.map((track, i) => (
                    <a
                      key={i}
                      href={track.spotifyUrl ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.85rem',
                        padding: '0.8rem 0',
                        borderBottom: `1px solid rgba(255,140,0,${i === tracks.length - 1 ? 0 : 0.14})`,
                        textDecoration: 'none',
                        cursor: 'pointer',
                        transition: 'opacity 0.2s ease',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '0.72')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                      {/* Track number */}
                      <span className="hud-text" style={{ fontSize: 'clamp(0.5rem, 0.66vw, 0.58rem)', letterSpacing: '0.22em', color: '#ff8c00', opacity: 0.55, minWidth: '1.6rem', flexShrink: 0, paddingLeft: '0.22em' }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>

                      {/* Track info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          className="serif-text"
                          style={{
                            fontSize: 'clamp(0.92rem, 1.18vw, 1.05rem)',
                            fontWeight: 400,
                            color: '#f5e6d0',
                            letterSpacing: '0.03em',
                            lineHeight: 1.2,
                            marginBottom: '0.28rem',
                            opacity: 0.95,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {track.trackName}
                        </p>
                        <p className="hud-text" style={{ fontSize: 'clamp(0.5rem, 0.66vw, 0.58rem)', letterSpacing: '0.2em', color: '#ffa538', opacity: 0.65, paddingLeft: '0.2em' }}>
                          {track.artistName}
                        </p>
                      </div>

                      {/* Role badge */}
                      {track.role && (
                        <span
                          className="hud-text"
                          style={{
                            fontSize: 'clamp(0.48rem, 0.62vw, 0.56rem)',
                            letterSpacing: '0.22em',
                            color: '#ff8c00',
                            opacity: 0.6,
                            border: '1px solid rgba(255,140,0,0.28)',
                            padding: '0.22rem 0.5rem',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            paddingLeft: 'calc(0.5rem + 0.22em)',
                          }}
                        >
                          {track.role}
                        </span>
                      )}

                      {/* Spotify arrow */}
                      <svg width="11" height="11" viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0, opacity: 0.4 }}>
                        <path d="M1 9L9 1M9 1H3M9 1V7" stroke="#ff8c00" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </a>
                  ))}
                </div>

                {/* "All tracks" link */}
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <a
                    href={spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hud-text"
                    style={{
                      fontSize: 'clamp(0.5rem, 0.66vw, 0.58rem)',
                      letterSpacing: '0.3em',
                      color: '#ff8c00',
                      opacity: 0.5,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      transition: 'opacity 0.2s ease',
                      paddingLeft: '0.3em',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
                  >
                    FULL CATALOG ON SPOTIFY
                    <svg width="9" height="9" viewBox="0 0 8 8" fill="none">
                      <path d="M1 7L7 1M7 1H2.5M7 1V5.5" stroke="#ff8c00" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                </div>

              </div>

              {/* Right col: Touring credits + Specialties */}
              <div style={{ ...pocketAnim(0.30) }}>

                <p className="hud-text" style={{ fontSize: 'clamp(0.56rem, 0.72vw, 0.66rem)', letterSpacing: '0.44em', color: '#ff8c00', opacity: 0.5, marginBottom: '0.9rem', paddingLeft: '0.44em' }}>
                  TOURING CREDITS
                </p>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {touringCredits.map(({ artistName, role }, i) => (
                    <div
                      key={artistName}
                      style={{
                        padding: '0.75rem 0',
                        borderBottom: `1px solid rgba(255,140,0,${i === touringCredits.length - 1 ? 0 : 0.14})`,
                      }}
                    >
                      <p className="hud-text" style={{ fontSize: 'clamp(0.48rem, 0.62vw, 0.56rem)', letterSpacing: '0.3em', color: '#ff8c00', opacity: 0.4, marginBottom: '0.3rem', paddingLeft: '0.3em' }}>
                        {String(i + 1).padStart(2, '0')}
                      </p>
                      <p
                        className="serif-text"
                        style={{
                          fontSize: 'clamp(0.95rem, 1.35vw, 1.1rem)',
                          fontWeight: 400,
                          color: '#f5e6d0',
                          letterSpacing: '0.04em',
                          lineHeight: 1.15,
                          marginBottom: '0.3rem',
                          opacity: 0.95,
                        }}
                      >
                        {artistName}
                      </p>
                      <p className="hud-text" style={{ fontSize: 'clamp(0.5rem, 0.66vw, 0.58rem)', letterSpacing: '0.2em', color: '#ffa538', opacity: 0.65, paddingLeft: '0.2em' }}>
                        {role}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Specialties */}
                <div style={{ marginTop: '1.6rem' }}>
                  <p className="hud-text" style={{ fontSize: 'clamp(0.56rem, 0.72vw, 0.66rem)', letterSpacing: '0.44em', color: '#ff8c00', opacity: 0.5, marginBottom: '0.7rem', paddingLeft: '0.44em' }}>
                    SPECIALTIES
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {['FRONT OF HOUSE', 'MIX ENGINEERING', 'LIVE PRODUCTION'].map((s) => (
                      <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,140,0,0.55)', flexShrink: 0 }} />
                        <span className="hud-text" style={{ fontSize: 'clamp(0.5rem, 0.66vw, 0.58rem)', letterSpacing: '0.22em', color: '#ffa538', opacity: 0.65, paddingLeft: '0.22em' }}>
                          {s}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ─── Stage 3: Work Lab — Dev + Web Portfolio ───────────────────── */}
      <section data-scroll-section data-atmosphere="engine-room" data-section-index={2} style={{ height: '100vh', position: 'relative' }}>
        <div
          style={{
            ...SECTION_SHELL_BASE,
            opacity: engineRoomOpacity,
            transform: engineSectionTransform,
            filter: isCompactLayout ? 'none' : `blur(${(1 - engineEnterMix) * 0.7}px)`,
            pointerEvents: engineRoomOpacity > 0.4 ? 'all' : 'none',
            gap: 'clamp(1.4rem, 3.5vh, 2.4rem)',
            padding: 'clamp(2.5rem, 6vh, 4rem) clamp(1.5rem, 5vw, 3rem)',
            overflowY: isCompactLayout ? 'auto' : 'hidden',
          }}
        >
          {/* Data cascade overlay */}
          {cascadeActive && DATA_COLUMNS.map((col, i) => (
            <div
              key={i}
              className="data-cascade-column"
              style={{
                left: `${8 + i * 9}%`,
                animationDelay: `${i * 0.08}s`,
                opacity: 0,
              }}
            >
              {col}
            </div>
          ))}

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <p
              className="hud-text"
              style={{ fontSize: 'clamp(0.6rem, 0.8vw, 0.78rem)', letterSpacing: '0.48em', color: '#c8c8c8', opacity: 0.75, textAlign: 'center', paddingLeft: '0.48em' }}
            >
              STAGE 03 — WORK LAB
            </p>
            <p
              className="hud-text"
              style={{ fontSize: 'clamp(0.5rem, 0.7vw, 0.62rem)', letterSpacing: '0.35em', color: '#888', opacity: 0.5, textAlign: 'center', paddingLeft: '0.35em' }}
            >
              SELECTED WORK  //  BUILD + SHIP
            </p>
          </div>

          {/* Portfolio grid */}
          <div
            style={{ position: 'relative', width: 'clamp(320px, 82vw, 960px)' }}
          >
            <div
              data-lenis-prevent
              style={{
                display: 'grid',
                gridTemplateColumns: isCompactLayout ? '1fr' : 'repeat(3, 1fr)',
                gap: '1.1rem',
                maxHeight: isCompactLayout ? 'min(56vh, 520px)' : 'min(48vh, 440px)',
                overflowY: 'auto',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(136,136,136,0.3) transparent',
                padding: '0.35rem',
              }}
            >
            {devProjects.map((p) => (
              <a
                key={p._id}
                href={p.url ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="targeting-card"
                style={{
                  border: '1px solid rgba(136,136,136,0.2)',
                  padding: '1.35rem 1.55rem',
                  position: 'relative',
                  background: 'rgba(0,0,0,0.55)',
                  cursor: 'crosshair',
                  display: 'block',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                {/* Targeting corners — animated on hover via CSS */}
                <div className="target-corner target-corner--tr" />
                <div className="target-corner target-corner--bl" />
                <div className="target-corner target-corner--tl" />
                <div className="target-corner target-corner--br" />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.9rem' }}>
                  <p className="hud-text" style={{ fontSize: 'clamp(0.5rem, 0.65vw, 0.58rem)', letterSpacing: '0.3em', color: '#888', opacity: 0.6, paddingLeft: '0.3em' }}>
                    {p.num}
                  </p>
                  <p className="hud-text" style={{ fontSize: 'clamp(0.5rem, 0.65vw, 0.58rem)', letterSpacing: '0.28em', color: '#00ff88', opacity: 0.8, paddingLeft: '0.28em' }}>
                    {p.status}
                  </p>
                </div>

                <h3
                  className="serif-text"
                  style={{ fontSize: 'clamp(1rem, 1.3vw, 1.15rem)', fontWeight: 400, color: '#eaeaea', letterSpacing: '0.04em', marginBottom: '0.5rem', lineHeight: 1.2 }}
                >
                  {p.name}
                </h3>

                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 'clamp(0.6rem, 0.78vw, 0.72rem)', letterSpacing: '0.04em', color: '#9a9a9a', lineHeight: 1.55, marginBottom: '0.95rem' }}>
                  {p.desc}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {p.tech.map((t) => (
                    <span
                      key={t}
                      className="hud-text tech-tag"
                      style={{ fontSize: 'clamp(0.48rem, 0.62vw, 0.56rem)', letterSpacing: '0.16em', color: '#888', opacity: 0.9, padding: '0.22rem 0.45rem', border: '1px solid rgba(136,136,136,0.32)', paddingLeft: 'calc(0.45rem + 0.16em)' }}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Lock-on label — revealed on hover */}
                <div className="lock-on-label hud-text">
                  LOCKED ▶
                </div>
              </a>
            ))}
            </div>

            {/* Bottom fade — hints at scrollable content below */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 48,
                background: 'linear-gradient(transparent, rgba(20,20,20,0.9))',
                pointerEvents: 'none',
              }}
            />
          </div>

        </div>
      </section>

      {/* ─── Stage 4: Website Showcase ──────────────────────────────────── */}
      <section data-scroll-section data-atmosphere="engine-room" data-section-index={3} style={{ height: '100vh', position: 'relative' }}>
        <div
          style={{
            ...SECTION_SHELL_BASE,
            opacity: webOpacity,
            transform: webSectionTransform,
            filter: isCompactLayout ? 'none' : `blur(${(1 - webEnterMix) * 0.6}px)`,
            pointerEvents: webOpacity > 0.4 ? 'all' : 'none',
            gap: 'clamp(1.25rem, 3vh, 2.2rem)',
            padding: 'clamp(2.5rem, 6vh, 4rem) clamp(1.5rem, 5vw, 3rem)',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <p
              className="hud-text"
              style={{ fontSize: 'clamp(0.6rem, 0.8vw, 0.78rem)', letterSpacing: '0.48em', color: '#d0f7e4', opacity: 0.75, textAlign: 'center', paddingLeft: '0.48em' }}
            >
              STAGE 04 — LIVE PREVIEWS
            </p>
            <p
              className="hud-text"
              style={{ fontSize: 'clamp(0.5rem, 0.7vw, 0.62rem)', letterSpacing: '0.38em', color: '#00ff88', opacity: 0.55, textAlign: 'center', paddingLeft: '0.38em' }}
            >
              WEBSITE SHOWCASE  //  ROTATING CATALOG
            </p>
          </div>
          <SelectedWorkBrowser webProjects={webProjects} />
        </div>
      </section>

      {/* ─── Stage 5: The Horizon — Aviation ───────────────────────────── */}
      <section data-scroll-section data-atmosphere="horizon" data-section-index={4} style={{ height: '100vh', position: 'relative' }}>
        <div
          style={{
            ...SECTION_SHELL_BASE,
            opacity: horizonOpacity,
            transform: horizonSectionTransform,
            filter: isCompactLayout ? 'none' : `blur(${(1 - horizonEnterMix) * 0.8}px)`,
            pointerEvents: horizonOpacity > 0.4 ? 'all' : 'none',
            gap: '0.5rem',
            padding: 'clamp(2.5rem, 6vh, 4rem) clamp(1.5rem, 5vw, 3rem)',
            overflow: 'hidden',
          }}
        >
          {/* Aviation background photo — from Sanity or falls back to la-altitude.jpg */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
            <img
              src={aviationBgUrl}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 40%',
                opacity: 0.12,
                mixBlendMode: 'multiply',
              }}
            />
          </div>

          {/* Content */}
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.85rem',
              width: 'min(92vw, 920px)',
              padding: 'clamp(1.75rem, 4vw, 2.8rem) clamp(1.25rem, 3.5vw, 2.4rem)',
              borderRadius: '2px',
              border: `1px solid ${HORIZON_PANEL_BORDER}`,
              background: `linear-gradient(180deg, ${HORIZON_PANEL_BG_TOP}, ${HORIZON_PANEL_BG_BOTTOM})`,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.3)',
            }}
          >

            <p
              className="hud-text"
              style={{ fontSize: 'clamp(0.58rem, 0.8vw, 0.72rem)', letterSpacing: '0.48em', color: '#555', opacity: 0.85, paddingLeft: '0.48em' }}
            >
              STAGE 05 — HORIZON
            </p>

            <p
              className="hud-text"
              style={{ fontSize: 'clamp(0.56rem, 0.76vw, 0.68rem)', letterSpacing: '0.42em', color: '#2a2a2a', opacity: 0.7, paddingLeft: '0.42em' }}
            >
              {callsign}  //  {certLabel}
            </p>

            <div style={{ width: '100px', height: '1px', background: 'rgba(68,68,68,0.35)', margin: '0.65rem 0' }} />

            <p
              className="hud-text"
              style={{ fontSize: 'clamp(0.54rem, 0.72vw, 0.64rem)', letterSpacing: '0.44em', color: '#444', opacity: 0.55, paddingLeft: '0.44em' }}
            >
              {aviationCoords}
            </p>

            <h2
              className="serif-text"
              style={{
                fontSize: 'clamp(1.7rem, 4.2vw, 3.2rem)',
                fontWeight: 300,
                fontStyle: 'italic',
                color: '#1a1a1a',
                letterSpacing: '0.08em',
                textAlign: 'center',
                marginTop: '0.85rem',
                marginBottom: '0.85rem',
                lineHeight: 1.15,
              }}
            >
              {tagline}
            </h2>

            {/* Flight instruments */}
            <div style={{ display: 'flex', gap: '1.15rem', marginTop: '1.15rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {gauges.map(({ label, value }) => (
                <div
                  key={label}
                  className="flight-gauge"
                  style={{
                    textAlign: 'center',
                    padding: '0.85rem 1rem',
                    width: 'min(108px, 24vw)',
                    height: 'min(108px, 24vw)',
                    minWidth: '86px',
                    minHeight: '86px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <p className="hud-text" style={{ fontSize: 'clamp(0.5rem, 0.66vw, 0.58rem)', letterSpacing: '0.3em', color: '#666', opacity: 0.8, paddingLeft: '0.3em' }}>
                    {label}
                  </p>
                  <p className="hud-text" style={{ fontSize: 'clamp(0.78rem, 1.05vw, 0.92rem)', letterSpacing: '0.08em', color: '#1a1a1a' }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ width: '100px', height: '1px', background: 'rgba(68,68,68,0.35)', margin: '1.15rem 0 0.65rem' }} />

            {/* Social / company links */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.65rem' }}>
              {beaconLinks.map(({ label, href, sub }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="beacon-link"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.8rem 1.3rem',
                    border: '1px solid rgba(42,42,42,0.4)',
                    textDecoration: 'none',
                    background: 'rgba(245,245,247,0.7)',
                    backdropFilter: 'blur(4px)',
                    transition: 'background 0.2s ease, border-color 0.2s ease',
                  }}
                >
                  <span className="hud-text" style={{ fontSize: 'clamp(0.58rem, 0.78vw, 0.7rem)', letterSpacing: '0.28em', color: '#1a1a1a', paddingLeft: '0.28em' }}>
                    {label} →
                  </span>
                  <span className="hud-text" style={{ fontSize: 'clamp(0.48rem, 0.62vw, 0.56rem)', letterSpacing: '0.32em', color: '#555', opacity: 0.8, paddingLeft: '0.32em' }}>
                    {sub}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SVG airplane cursor — only active in the horizon/aviation section */}
      <AirplaneCursor />

    </div>
  );
}
