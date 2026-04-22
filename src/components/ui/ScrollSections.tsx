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

const SECTION_ENTRY_MOTION = {
  pocket: { y: 26, rotate: -7, baseScale: 0.93, scaleRange: 0.07 },
  engine: { x: 44, rotateY: 7, baseScale: 0.94, scaleRange: 0.06 },
  web: { y: 24, rotate: 4, baseScale: 0.95, scaleRange: 0.05 },
  horizon: { y: 30, rotateX: 8, baseScale: 0.95, scaleRange: 0.05 },
} as const;

const SECTION_STARTS: number[] = [0, 0.25, 0.5, 0.75, 1];
const SECTION_BOUNDARIES = [0.25, 0.5, 0.75] as const;
const VEIL_TRANSITION_RADIUS = 0.055;
const VEIL_BASE_RGB = '5,8,12';
const HORIZON_PANEL_BORDER = 'rgba(42,42,42,0.16)';
const HORIZON_PANEL_BG_TOP = 'rgba(255,255,255,0.26)';
const HORIZON_PANEL_BG_BOTTOM = 'rgba(235,238,243,0.34)';
const VEIL_BACKGROUND = `
  radial-gradient(ellipse at center, rgba(0,0,0,0) 30%, rgba(0,0,0,0.55) 100%),
  linear-gradient(180deg, rgba(${VEIL_BASE_RGB},0.8) 0%, rgba(${VEIL_BASE_RGB},0.2) 22%, rgba(${VEIL_BASE_RGB},0.2) 78%, rgba(${VEIL_BASE_RGB},0.8) 100%)
`;


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
        width: 'clamp(340px, 66vw, 820px)',
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
      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
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
  const pocketTextRef = useRef<HTMLDivElement>(null);
  const prevAtmosphere = useRef(atmosphere);
  const prevSectionIndex = useRef(0);

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

  const shorelineOpacity  = sectionOpacity(-0.02, 0.03, 0.21, 0.27);
  const pocketOpacity     = sectionOpacity(0.2, 0.28, 0.46, 0.54);
  const engineRoomOpacity = sectionOpacity(0.45, 0.53, 0.71, 0.79);
  const webOpacity        = sectionOpacity(0.7, 0.78, 0.94, 1.02);
  // Keep the final horizon section fully present through page end by placing fade-out past max progress (1.0).
  const horizonOpacity    = sectionOpacity(0.92, 0.98, 1.2, 1.28);

  const sectionMix = (start: number, end: number) => {
    if (progress <= start) return 0;
    if (progress >= end) return 1;
    const t = (progress - start) / (end - start);
    return t * t * (3 - 2 * t);
  };

  const pocketEnterMix = sectionMix(0.21, 0.32);
  const engineEnterMix = sectionMix(0.43, 0.56);
  const webEnterMix = sectionMix(0.68, 0.81);
  const horizonEnterMix = sectionMix(0.9, 0.99);
  const sectionTransitionVeilOpacity = SECTION_BOUNDARIES.reduce((maxOpacity, boundary) => {
    const dist = Math.abs(progress - boundary);
    if (dist >= VEIL_TRANSITION_RADIUS) return maxOpacity;
    const transitionProgress = 1 - dist / VEIL_TRANSITION_RADIUS;
    // Smoothstep interpolation to avoid abrupt veil intensity changes.
    const eased = transitionProgress * transitionProgress * (3 - 2 * transitionProgress);
    return Math.max(maxOpacity, eased);
  }, 0);

  const pocketSectionTransform = `translateY(${(1 - pocketEnterMix) * SECTION_ENTRY_MOTION.pocket.y}px) rotate(${(1 - pocketEnterMix) * SECTION_ENTRY_MOTION.pocket.rotate}deg) scale(${SECTION_ENTRY_MOTION.pocket.baseScale + pocketEnterMix * SECTION_ENTRY_MOTION.pocket.scaleRange})`;
  const engineSectionTransform = `translateX(${(1 - engineEnterMix) * SECTION_ENTRY_MOTION.engine.x}px) rotateY(${(1 - engineEnterMix) * SECTION_ENTRY_MOTION.engine.rotateY}deg) scale(${SECTION_ENTRY_MOTION.engine.baseScale + engineEnterMix * SECTION_ENTRY_MOTION.engine.scaleRange})`;
  const webSectionTransform = `translateY(${(1 - webEnterMix) * SECTION_ENTRY_MOTION.web.y}px) rotate(${(1 - webEnterMix) * SECTION_ENTRY_MOTION.web.rotate}deg) scale(${SECTION_ENTRY_MOTION.web.baseScale + webEnterMix * SECTION_ENTRY_MOTION.web.scaleRange})`;
  const horizonSectionTransform = `translateY(${(1 - horizonEnterMix) * SECTION_ENTRY_MOTION.horizon.y}px) rotateX(${(1 - horizonEnterMix) * SECTION_ENTRY_MOTION.horizon.rotateX}deg) scale(${SECTION_ENTRY_MOTION.horizon.baseScale + horizonEnterMix * SECTION_ENTRY_MOTION.horizon.scaleRange})`;

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

  // Pocket text vibration — linked to scroll velocity
  useEffect(() => {
    if (atmosphere !== 'pocket' || !pocketTextRef.current) return;
    const el = pocketTextRef.current;
    const absV = Math.min(Math.abs(velocity), 30);
    const jitterX = (Math.random() - 0.5) * absV * 0.12;
    const jitterY = (Math.random() - 0.5) * absV * 0.08;
    el.style.transform = `translate(${jitterX}px, ${jitterY}px)`;
  }, [atmosphere, velocity]);

  // Data cascade trigger on engine-room entry
  useEffect(() => {
    if (atmosphere === 'engine-room' && prevAtmosphere.current !== 'engine-room') {
      setCascadeActive(true);
      const t = setTimeout(() => setCascadeActive(false), 2000);
      prevAtmosphere.current = atmosphere;
      return () => clearTimeout(t);
    }
    prevAtmosphere.current = atmosphere;
  }, [atmosphere]);

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

      {/* ─── Stage 1: The Shoreline — Identity ────────────────────────── */}
      <section data-scroll-section data-atmosphere="shoreline" data-section-index={0} style={{ height: '100vh', position: 'relative' }}>
        <div
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: shorelineOpacity,
            pointerEvents: shorelineOpacity > 0.1 ? 'all' : 'none',
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

          {/* Hero title card — pinned to initial viewport for immediate identity */}
          <div
            style={{
              position: 'absolute',
              top: '48%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.7rem',
              textAlign: 'center',
              padding: '0 1rem',
            }}
          >
            <p
              className="serif-text"
              style={{
                fontSize: 'clamp(2.3rem, 8vw, 7rem)',
                fontWeight: 300,
                color: '#f0fbfb',
                letterSpacing: '0.22em',
                lineHeight: 0.96,
                textShadow: '0 8px 36px rgba(0,0,0,0.48)',
              }}
            >
              {heroName}
            </p>
            <p
              className="hud-text"
              style={{
                fontSize: 'clamp(0.34rem, 0.85vw, 0.58rem)',
                letterSpacing: '0.42em',
                color: '#86f5e4',
                opacity: 0.72,
                textShadow: '0 4px 16px rgba(0,0,0,0.6)',
              }}
            >
              DIGITAL STORYTELLER // CREATIVE BUILDER
            </p>
          </div>

          {/* Bottom-left context + identity ticker */}
          <div
            style={{
              position: 'absolute',
              bottom: 'clamp(1.5rem, 4vh, 3rem)',
              left: 'clamp(1.5rem, 3vw, 3rem)',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.55rem',
            }}
          >
            <p
              className="serif-text"
              style={{
                fontSize: 'clamp(0.62rem, 1.4vw, 1rem)',
                color: '#7de6d5',
                letterSpacing: '0.36em',
                lineHeight: 1,
                opacity: 0.72,
              }}
            >
              LANDING ID
            </p>

            <div
              className="hud-text"
              style={{
                fontSize: 'clamp(0.42rem, 0.9vw, 0.58rem)',
                letterSpacing: '0.38em',
                color: '#3dd9c4',
                opacity: 0.55,
                display: 'flex',
                alignItems: 'center',
                gap: '0.7em',
                height: '1.3em',
                overflow: 'hidden',
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
                fontSize: 'clamp(0.36rem, 0.75vw, 0.5rem)',
                letterSpacing: '0.32em',
                color: '#3dd9c4',
                opacity: 0.25,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5em',
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
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pocketOpacity,
            transform: pocketSectionTransform,
            filter: `blur(${(1 - pocketEnterMix) * 1.2}px)`,
            pointerEvents: pocketOpacity > 0.1 ? 'all' : 'none',
            padding: '0 clamp(1.5rem, 5vw, 4rem)',
            textAlign: 'left',
            willChange: 'transform, filter',
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
                gap: '1rem',
                marginBottom: '1.25rem',
                ...pocketAnim(0),
              }}
            >
              <p className="hud-text" style={{ fontSize: '0.38rem', letterSpacing: '0.42em', color: '#ff8c00', opacity: 0.45, whiteSpace: 'nowrap' }}>
                {audioHeadline}
              </p>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(255,140,0,0.22) 0%, rgba(255,140,0,0.04) 70%, transparent 100%)' }} />
              <p className="hud-text" style={{ fontSize: '0.28rem', letterSpacing: '0.38em', color: '#ff8c00', opacity: 0.2, whiteSpace: 'nowrap' }}>
                SIGNAL FLOW
              </p>
            </div>

            {/* ── Title + Waveform row ── */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '1.5rem',
                marginBottom: '2rem',
                ...pocketAnim(0.08),
              }}
            >
              <h2
                className="serif-text"
                style={{
                  fontSize: 'clamp(2.4rem, 5vw, 4rem)',
                  fontWeight: 300,
                  color: '#f5e6d0',
                  letterSpacing: '0.05em',
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                {sectionTitle}
              </h2>

              {/* Decorative waveform — fills remaining title row width */}
              <div style={{ flex: 1, overflow: 'hidden', paddingBottom: '0.5rem' }}>
                <svg
                  viewBox="0 0 120 32"
                  preserveAspectRatio="none"
                  width="100%"
                  height="28"
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
                        fill={`rgba(255,140,0,${(0.1 + h * 0.38).toFixed(3)})`}
                      />
                    );
                  })}
                </svg>
              </div>

              <p className="hud-text" style={{ fontSize: '0.28rem', letterSpacing: '0.38em', color: '#ff8c00', opacity: 0.2, paddingBottom: '0.5rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
                12+ YRS
              </p>
            </div>

            {/* ── Three-column body ── */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'clamp(120px, 15vw, 165px) 1fr clamp(140px, 18vw, 200px)',
                gap: 'clamp(1.25rem, 3vw, 2.5rem)',
                alignItems: 'start',
                paddingBottom: '0.75rem',
              }}
            >

              {/* Left col: Stats + Disciplines */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>

                {/* Stat readouts */}
                <div style={{ ...pocketAnim(0.15) }}>
                  <p className="hud-text" style={{ fontSize: '0.26rem', letterSpacing: '0.44em', color: '#ff8c00', opacity: 0.22, marginBottom: '0.65rem' }}>
                    CREDENTIALS
                  </p>
                  {stats.map(({ value, label }, i) => (
                    <div
                      key={label}
                      style={{
                        paddingLeft: '0.65rem',
                        paddingTop: '0.5rem',
                        paddingBottom: '0.5rem',
                        borderLeft: `1px solid rgba(255,140,0,${i === 0 ? 0.32 : 0.1})`,
                        marginBottom: '0.08rem',
                      }}
                    >
                      <p
                        className="serif-text"
                        style={{
                          fontSize: 'clamp(1.3rem, 2.2vw, 1.8rem)',
                          fontWeight: 300,
                          color: '#ff8c00',
                          lineHeight: 1,
                          opacity: 1 - i * 0.18,
                        }}
                      >
                        {value}
                      </p>
                      <p className="hud-text" style={{ fontSize: '0.23rem', letterSpacing: '0.34em', color: '#ff8c00', opacity: 0.28, marginTop: '0.07rem' }}>
                        {label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Signal-chain disciplines */}
                <div style={{ marginTop: '1.3rem', ...pocketAnim(0.35) }}>
                  <p className="hud-text" style={{ fontSize: '0.26rem', letterSpacing: '0.44em', color: '#ff8c00', opacity: 0.22, marginBottom: '0.5rem' }}>
                    DISCIPLINES
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.28rem' }}>
                    {disciplines.map((d, i) => (
                      <div key={d.code} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span
                          className="hud-text"
                          style={{
                            fontSize: '0.24rem',
                            letterSpacing: '0.22em',
                            color: '#ff8c00',
                            opacity: 0.48,
                            padding: '0.1rem 0.3rem',
                            border: '1px solid rgba(255,140,0,0.16)',
                            background: 'rgba(255,140,0,0.03)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {d.code}
                        </span>
                        {i < disciplines.length - 1 && (
                          <span className="hud-text" style={{ fontSize: '0.22rem', color: '#ff8c00', opacity: 0.16 }}>→</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Center col: Featured Tracks */}
              <div style={{ position: 'relative', ...pocketAnim(0.22) }}>

                <p className="hud-text" style={{ fontSize: '0.26rem', letterSpacing: '0.44em', color: '#ff8c00', opacity: 0.22, marginBottom: '0.65rem' }}>
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
                        gap: '0.75rem',
                        padding: '0.6rem 0',
                        borderBottom: `1px solid rgba(255,140,0,${i === tracks.length - 1 ? 0 : 0.08})`,
                        textDecoration: 'none',
                        cursor: 'pointer',
                        transition: 'opacity 0.2s ease',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '0.72')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                      {/* Track number */}
                      <span className="hud-text" style={{ fontSize: '0.2rem', letterSpacing: '0.2em', color: '#ff8c00', opacity: 0.28, minWidth: '1.4rem', flexShrink: 0 }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>

                      {/* Track info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          className="serif-text"
                          style={{
                            fontSize: 'clamp(0.8rem, 1.1vw, 0.95rem)',
                            fontWeight: 400,
                            color: '#f5e6d0',
                            letterSpacing: '0.03em',
                            lineHeight: 1.2,
                            marginBottom: '0.18rem',
                            opacity: 0.9,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {track.trackName}
                        </p>
                        <p className="hud-text" style={{ fontSize: '0.21rem', letterSpacing: '0.16em', color: '#ff8c00', opacity: 0.3 }}>
                          {track.artistName}
                        </p>
                      </div>

                      {/* Role badge */}
                      {track.role && (
                        <span
                          className="hud-text"
                          style={{
                            fontSize: '0.19rem',
                            letterSpacing: '0.18em',
                            color: '#ff8c00',
                            opacity: 0.28,
                            border: '1px solid rgba(255,140,0,0.14)',
                            padding: '0.08rem 0.28rem',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                          }}
                        >
                          {track.role}
                        </span>
                      )}

                      {/* Spotify arrow */}
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0, opacity: 0.22 }}>
                        <path d="M1 9L9 1M9 1H3M9 1V7" stroke="#ff8c00" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </a>
                  ))}
                </div>

                {/* "All tracks" link */}
                <div style={{ marginTop: '0.65rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <a
                    href={spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hud-text"
                    style={{
                      fontSize: '0.21rem',
                      letterSpacing: '0.28em',
                      color: '#ff8c00',
                      opacity: 0.18,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      transition: 'opacity 0.2s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.45')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '0.18')}
                  >
                    FULL CATALOG ON SPOTIFY
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1 7L7 1M7 1H2.5M7 1V5.5" stroke="#ff8c00" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                </div>

              </div>

              {/* Right col: Touring credits + Specialties */}
              <div style={{ ...pocketAnim(0.30) }}>

                <p className="hud-text" style={{ fontSize: '0.26rem', letterSpacing: '0.44em', color: '#ff8c00', opacity: 0.22, marginBottom: '0.65rem' }}>
                  TOURING CREDITS
                </p>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {touringCredits.map(({ artistName, role }, i) => (
                    <div
                      key={artistName}
                      style={{
                        padding: '0.65rem 0',
                        borderBottom: `1px solid rgba(255,140,0,${i === 0 ? 0.1 : 0.04})`,
                      }}
                    >
                      <p className="hud-text" style={{ fontSize: '0.21rem', letterSpacing: '0.34em', color: '#ff8c00', opacity: 0.18, marginBottom: '0.25rem' }}>
                        {String(i + 1).padStart(2, '0')}
                      </p>
                      <p
                        className="serif-text"
                        style={{
                          fontSize: 'clamp(0.85rem, 1.3vw, 1.05rem)',
                          fontWeight: 400,
                          color: '#f5e6d0',
                          letterSpacing: '0.04em',
                          lineHeight: 1.15,
                          marginBottom: '0.25rem',
                          opacity: 0.88,
                        }}
                      >
                        {artistName}
                      </p>
                      <p className="hud-text" style={{ fontSize: '0.23rem', letterSpacing: '0.18em', color: '#ff8c00', opacity: 0.32 }}>
                        {role}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Specialties */}
                <div style={{ marginTop: '1.2rem' }}>
                  <p className="hud-text" style={{ fontSize: '0.26rem', letterSpacing: '0.44em', color: '#ff8c00', opacity: 0.22, marginBottom: '0.5rem' }}>
                    SPECIALTIES
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {['FRONT OF HOUSE', 'MIX ENGINEERING', 'LIVE PRODUCTION'].map((s) => (
                      <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,140,0,0.32)', flexShrink: 0 }} />
                        <span className="hud-text" style={{ fontSize: '0.23rem', letterSpacing: '0.2em', color: '#ff8c00', opacity: 0.28 }}>
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
            position: 'sticky',
            top: 0,
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: engineRoomOpacity,
            transform: engineSectionTransform,
            filter: `blur(${(1 - engineEnterMix) * 1.4}px)`,
            pointerEvents: engineRoomOpacity > 0.1 ? 'all' : 'none',
            gap: 'clamp(1.2rem, 3.8vh, 2.4rem)',
            paddingTop: 'clamp(1.2rem, 3vh, 2.2rem)',
            paddingBottom: 'clamp(1.2rem, 3vh, 2.2rem)',
            overflow: 'hidden',
            willChange: 'transform, filter',
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

          <p
            className="hud-text"
            style={{ fontSize: '0.45rem', letterSpacing: '0.4em', color: '#888', opacity: 0.4, textAlign: 'center' }}
          >
            SELECTED WORK  //  BUILD + SHIP
          </p>

          {/* Portfolio grid */}
          <div
            style={{ position: 'relative', width: 'clamp(320px, 80vw, 920px)' }}
          >
            <div
              data-lenis-prevent
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
                maxHeight: 'min(36vh, 340px)',
                overflowY: 'auto',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(136,136,136,0.3) transparent',
                padding: '0.25rem',
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
                  border: '1px solid rgba(136,136,136,0.15)',
                  padding: '1.25rem 1.5rem',
                  position: 'relative',
                  background: 'rgba(0,0,0,0.6)',
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

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <p className="hud-text" style={{ fontSize: '0.32rem', letterSpacing: '0.3em', color: '#888', opacity: 0.35 }}>
                    {p.num}
                  </p>
                  <p className="hud-text" style={{ fontSize: '0.28rem', letterSpacing: '0.25em', color: '#00ff88', opacity: 0.5 }}>
                    {p.status}
                  </p>
                </div>

                <h3
                  className="serif-text"
                  style={{ fontSize: '1.1rem', fontWeight: 400, color: '#ccc', letterSpacing: '0.05em', marginBottom: '0.4rem' }}
                >
                  {p.name}
                </h3>

                <p className="hud-text" style={{ fontSize: '0.32rem', letterSpacing: '0.08em', color: '#666', lineHeight: 1.7, marginBottom: '0.75rem' }}>
                  {p.desc}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                  {p.tech.map((t) => (
                    <span
                      key={t}
                      className="hud-text tech-tag"
                      style={{ fontSize: '0.28rem', letterSpacing: '0.15em', color: '#555', opacity: 0.8, padding: '0.1rem 0.3rem', border: '1px solid rgba(85,85,85,0.3)' }}
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
            position: 'sticky',
            top: 0,
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: webOpacity,
            transform: webSectionTransform,
            filter: `blur(${(1 - webEnterMix) * 1.2}px)`,
            pointerEvents: webOpacity > 0.1 ? 'all' : 'none',
            gap: 'clamp(1rem, 3vh, 2.2rem)',
            padding: 'clamp(1rem, 3vh, 2rem)',
            overflow: 'hidden',
            willChange: 'transform, filter',
          }}
        >
          <p
            className="hud-text"
            style={{ fontSize: '0.4rem', letterSpacing: '0.36em', color: '#00ff88', opacity: 0.45, textAlign: 'center' }}
          >
            WEBSITE SHOWCASE  //  LIVE PREVIEWS
          </p>
          <SelectedWorkBrowser webProjects={webProjects} />
        </div>
      </section>

      {/* ─── Stage 5: The Horizon — Aviation ───────────────────────────── */}
      <section data-scroll-section data-atmosphere="horizon" data-section-index={4} style={{ height: '100vh', position: 'relative' }}>
        <div
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: horizonOpacity,
            transform: horizonSectionTransform,
            filter: `blur(${(1 - horizonEnterMix) * 1.8}px)`,
            pointerEvents: horizonOpacity > 0.1 ? 'all' : 'none',
            gap: '0.4rem',
            overflow: 'hidden',
            willChange: 'transform, filter',
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
              gap: '0.6rem',
              width: 'min(92vw, 880px)',
              padding: 'clamp(0.8rem, 2.6vw, 1.7rem)',
              border: `1px solid ${HORIZON_PANEL_BORDER}`,
              background: `linear-gradient(180deg, ${HORIZON_PANEL_BG_TOP}, ${HORIZON_PANEL_BG_BOTTOM})`,
              backdropFilter: 'blur(6px)',
            }}
          >

            <p
              className="hud-text"
              style={{ fontSize: '0.35rem', letterSpacing: '0.5em', color: '#aaa', opacity: 0.4 }}
            >
              {callsign}  //  {certLabel}
            </p>

            <div style={{ width: '80px', height: '1px', background: 'rgba(68,68,68,0.3)', margin: '0.5rem 0' }} />

            <p
              className="hud-text"
              style={{ fontSize: '0.35rem', letterSpacing: '0.5em', color: '#333', opacity: 0.3 }}
            >
              {aviationCoords}
            </p>

            <h2
              className="serif-text"
              style={{
                fontSize: 'clamp(1.5rem, 4vw, 3rem)',
                fontWeight: 300,
                fontStyle: 'italic',
                color: '#2a2a2a',
                letterSpacing: '0.1em',
                textAlign: 'center',
                marginTop: '0.5rem',
                marginBottom: '0.5rem',
              }}
            >
              {tagline}
            </h2>

            {/* Flight instruments */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {gauges.map(({ label, value }) => (
                <div
                  key={label}
                  className="flight-gauge"
                  style={{
                    textAlign: 'center',
                    padding: '0.85rem 1rem',
                    width: 'min(90px, 22vw)',
                    height: 'min(90px, 22vw)',
                    minWidth: '72px',
                    minHeight: '72px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <p className="hud-text" style={{ fontSize: '0.3rem', letterSpacing: '0.3em', color: '#aaa', marginBottom: '0.4rem' }}>
                    {label}
                  </p>
                  <p className="hud-text" style={{ fontSize: '0.55rem', letterSpacing: '0.1em', color: '#333' }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ width: '80px', height: '1px', background: 'rgba(68,68,68,0.3)', margin: '1rem 0 0.5rem' }} />

            {/* Social / company links */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
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
                    gap: '0.2rem',
                    padding: '0.6rem 1.1rem',
                    border: '1px solid rgba(42,42,42,0.35)',
                    textDecoration: 'none',
                    background: 'rgba(245,245,247,0.62)',
                    backdropFilter: 'blur(4px)',
                    transition: 'background 0.2s ease, border-color 0.2s ease',
                  }}
                >
                  <span className="hud-text" style={{ fontSize: '0.38rem', letterSpacing: '0.25em', color: '#2a2a2a' }}>
                    {label} →
                  </span>
                  <span className="hud-text" style={{ fontSize: '0.28rem', letterSpacing: '0.3em', color: '#888', opacity: 0.6 }}>
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
