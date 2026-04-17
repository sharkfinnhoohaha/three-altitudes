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

  // Auto-rotation — pauses on user interaction, resumes after 8 s
  useEffect(() => {
    if (paused) return;
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
        width: 'clamp(360px, 72vw, 900px)',
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
                outline: 'none',
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
  const pocketTextRef = useRef<HTMLDivElement>(null);
  const prevAtmosphere = useRef(atmosphere);

  // Resolve data — Sanity data when available, fallback constants otherwise
  const heroName = hero?.name ?? 'FINN BENNETT';
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

  const shorelineOpacity   = sectionOpacity(0,    0.04, 0.17, 0.25);
  const pocketOpacity      = sectionOpacity(0.18, 0.25, 0.37, 0.45);
  const engineRoomOpacity  = sectionOpacity(0.38, 0.45, 0.57, 0.65);
  const selectedWorkOpacity= sectionOpacity(0.58, 0.65, 0.77, 0.85);
  const horizonOpacity     = sectionOpacity(0.78, 0.85, 0.97, 1.02);

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

  // Hide default cursor in horizon section — AirplaneCursor renders the SVG replacement
  useEffect(() => {
    if (atmosphere === 'horizon') {
      document.body.classList.add('cursor-none');
    } else {
      document.body.classList.remove('cursor-none');
    }
    return () => document.body.classList.remove('cursor-none');
  }, [atmosphere]);

  const show = (zone: typeof atmosphere) => atmosphere === zone;

  // Staggered entrance animation helper — opacity + lift-in with delay
  const pocketAnim = (delay: number) => ({
    opacity: pocketEntered ? 1 : 0,
    transform: pocketEntered ? 'translateY(0px)' : 'translateY(16px)',
    transition: `opacity 0.75s ease ${delay}s, transform 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
  });

  return (
    <div className="scroll-content" style={{ height: '1000vh' }}>

      {/* ─── Stage 1: The Shoreline — Identity ────────────────────────── */}
      <section style={{ height: '200vh', position: 'relative' }}>
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

          {/* Bottom-left name + identity + time block */}
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
                fontSize: 'clamp(2rem, 4.5vw, 4rem)',
                fontWeight: 300,
                color: '#e8f5f5',
                letterSpacing: '0.16em',
                lineHeight: 1,
                opacity: 0.88,
              }}
            >
              {heroName}
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
      <section style={{ height: '200vh', position: 'relative' }}>
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
            pointerEvents: pocketOpacity > 0.1 ? 'all' : 'none',
            padding: '0 clamp(1.5rem, 5vw, 4rem)',
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
                marginBottom: '0.9rem',
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
                marginBottom: '1.6rem',
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
                gridTemplateColumns: '165px 1fr 200px',
                gap: 'clamp(1.25rem, 3vw, 2.5rem)',
                alignItems: 'start',
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

      {/* ─── Stage 3: The Engine Room — Dev Portfolio ─────────────────── */}
      <section style={{ height: '200vh', position: 'relative' }}>
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
            pointerEvents: engineRoomOpacity > 0.1 ? 'all' : 'none',
            gap: '1.5rem',
            overflow: 'hidden',
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
            style={{ fontSize: '0.45rem', letterSpacing: '0.4em', color: '#888', opacity: 0.4 }}
          >
            SELECTED WORK
          </p>

          {/* Portfolio grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              width: 'clamp(320px, 80vw, 920px)',
              maxHeight: '65vh',
              overflowY: 'auto',
              scrollbarWidth: 'none',
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
        </div>
      </section>

      {/* ─── Stage 4: Selected Work — Web Projects ─────────────────────── */}
      <section id="selected-work" style={{ height: '200vh', position: 'relative' }}>
        <div
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: selectedWorkOpacity,
            pointerEvents: selectedWorkOpacity > 0.1 ? 'all' : 'none',
            gap: '1.5rem',
          }}
        >
          {/* Section header */}
          <p
            className="hud-text"
            style={{ fontSize: '0.45rem', letterSpacing: '0.4em', color: '#888', opacity: 0.4 }}
          >
            SELECTED WORK  //  WEB
          </p>

          {/* Single browser mockup with tab switcher */}
          <SelectedWorkBrowser webProjects={webProjects} />
        </div>
      </section>

      {/* ─── Stage 5: The Horizon — Aviation ──────────────────────────── */}
      <section style={{ height: '200vh', position: 'relative' }}>
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
            pointerEvents: horizonOpacity > 0.1 ? 'all' : 'none',
            gap: '0.4rem',
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
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>

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
            <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
              {gauges.map(({ label, value }) => (
                <div
                  key={label}
                  className="flight-gauge"
                  style={{
                    textAlign: 'center',
                    padding: '1rem 1.25rem',
                    width: '90px',
                    height: '90px',
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
                    background: 'rgba(245,245,247,0.5)',
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
