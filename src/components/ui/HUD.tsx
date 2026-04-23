'use client';

import { useScroll, type Atmosphere } from '@/contexts/ScrollContext';

interface AtmosphereConfig {
  primaryLabel: string;
  secondaryLabel: string;
  color: string;
}

const ATMOSPHERE_CONFIG: Record<Atmosphere, AtmosphereConfig> = {
  shoreline: {
    primaryLabel: '34.2746° N  119.2290° W',
    secondaryLabel: 'VENTURA, CA',
    color: '#3dd9c4',
  },
  pocket: {
    primaryLabel: 'OVERLOOK AUDIO',
    secondaryLabel: 'SONIC ARCHIVE // ACTIVE',
    color: '#ff8c00',
  },
  'engine-room': {
    primaryLabel: 'OVERLOOK STRATEGY',
    secondaryLabel: 'SYSTEMS // WEB + DEV',
    color: '#888888',
  },
  horizon: {
    primaryLabel: 'MSL +5,200 FT',
    secondaryLabel: 'KCMA → KVTA // IFR CLR',
    color: '#444444',
  },
};

// Section pager — one entry per scroll section. Multiple sections can share the same
// atmosphere (engine-room covers both WORK and SHOWCASE), so we track by index instead.
const SECTION_LABELS: { index: number; label: string; atmosphere: Atmosphere }[] = [
  { index: 0, label: 'SHORELINE', atmosphere: 'shoreline' },
  { index: 1, label: 'SONIC', atmosphere: 'pocket' },
  { index: 2, label: 'WORK', atmosphere: 'engine-room' },
  { index: 3, label: 'SHOWCASE', atmosphere: 'engine-room' },
  { index: 4, label: 'HORIZON', atmosphere: 'horizon' },
];

const SECTION_STARTS = [0, 0.25, 0.5, 0.75, 1] as const;

export function HUD() {
  const { atmosphere, scrollToSection, progress } = useScroll();

  const config = ATMOSPHERE_CONFIG[atmosphere] || ATMOSPHERE_CONFIG.shoreline;
  const { primaryLabel, secondaryLabel, color } = config;

  const isHorizon = atmosphere === 'horizon';
  const labelColor = isHorizon ? '#444' : '#fff';
  const subColor = isHorizon ? '#666' : color;

  // Current section index — derived from nearest snap point, since atmosphere
  // doesn't uniquely identify sections (WORK + SHOWCASE both use engine-room).
  const currentSectionIndex = SECTION_STARTS.reduce<number>((nearestIdx, sectionStart, idx) => {
    const nearestDist = Math.abs(progress - SECTION_STARTS[nearestIdx]);
    const currentDist = Math.abs(progress - sectionStart);
    return currentDist < nearestDist ? idx : nearestIdx;
  }, 0);

  return (
    <>
      {/* Premium Minimalist Navigation Bar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          padding: '2rem 3rem',
          zIndex: 50,
          pointerEvents: 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          textShadow: isHorizon ? 'none' : '0 2px 10px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span
            className="sans-text"
            style={{
              fontSize: '0.85rem',
              fontWeight: 500,
              letterSpacing: '0.15em',
              color: labelColor,
              opacity: 0.9,
              transition: 'color 0.8s ease',
            }}
          >
            FINN BENNETT
          </span>
          <span
            className="hud-text"
            style={{
              fontSize: '0.5rem',
              letterSpacing: '0.3em',
              color: subColor,
              opacity: 0.6,
              transition: 'color 0.8s ease',
            }}
          >
            {primaryLabel}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <span
            className="hud-text"
            style={{
              fontSize: '0.55rem',
              letterSpacing: '0.25em',
              color: subColor,
              opacity: 0.6,
              transition: 'color 0.8s ease',
            }}
          >
            {secondaryLabel}
          </span>
          
          <div
            style={{
              width: '40px',
              height: '2px',
              background: subColor,
              opacity: 0.4,
              transition: 'background 0.8s ease',
            }}
          />
        </div>
      </div>

      {/* Section navigation pager — right side, dot + expanded label on active */}
      <nav
        aria-label="Section navigation"
        style={{
          position: 'fixed',
          right: 'clamp(1rem, 2vw, 1.8rem)',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          alignItems: 'flex-end',
        }}
      >
        {SECTION_LABELS.map(({ index, label }) => {
          const isActive = currentSectionIndex === index;
          const dotColor = isHorizon ? '#2a2a2a' : '#ffffff';
          return (
            <button
              key={index}
              onClick={() => scrollToSection(index)}
              title={label}
              aria-label={`Go to ${label}`}
              aria-current={isActive ? 'true' : undefined}
              className="nav-dot-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '0.65rem',
                height: '22px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0 0.3rem',
                pointerEvents: 'all',
                color: 'inherit',
              }}
            >
              <span
                className="hud-text"
                style={{
                  fontSize: 'clamp(0.5rem, 0.62vw, 0.58rem)',
                  letterSpacing: '0.3em',
                  color: dotColor,
                  opacity: isActive ? 0.85 : 0,
                  transform: isActive ? 'translateX(0)' : 'translateX(6px)',
                  transition: 'opacity 0.4s ease, transform 0.4s ease, color 0.6s ease',
                  whiteSpace: 'nowrap',
                  paddingLeft: '0.3em',
                }}
              >
                {label}
              </span>
              <span
                style={{
                  display: 'block',
                  width: isActive ? '22px' : '9px',
                  height: '1px',
                  background: dotColor,
                  opacity: isActive ? 0.9 : 0.3,
                  transition: 'width 0.45s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease, background 0.6s ease',
                  flexShrink: 0,
                }}
              />
            </button>
          );
        })}
      </nav>
    </>
  );
}
