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

const SECTION_LABELS: { index: number; label: string; atmosphere: Atmosphere }[] = [
  { index: 0, label: 'SHORELINE', atmosphere: 'shoreline' },
  { index: 1, label: 'SONIC', atmosphere: 'pocket' },
  { index: 2, label: 'WORK', atmosphere: 'engine-room' },
  { index: 4, label: 'HORIZON', atmosphere: 'horizon' },
];

export function HUD() {
  const { atmosphere, scrollToSection } = useScroll();

  const config = ATMOSPHERE_CONFIG[atmosphere] || ATMOSPHERE_CONFIG.shoreline;
  const { primaryLabel, secondaryLabel, color } = config;

  const isHorizon = atmosphere === 'horizon';
  const labelColor = isHorizon ? '#444' : '#fff';
  const subColor = isHorizon ? '#666' : color;

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

      {/* Section navigation dots — right side */}
      <nav
        aria-label="Section navigation"
        style={{
          position: 'fixed',
          right: '1.8rem',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          alignItems: 'center',
        }}
      >
        {SECTION_LABELS.map(({ index, label, atmosphere: sectionAtmos }) => {
          const isActive = atmosphere === sectionAtmos;
          const dotColor = isHorizon ? '#444' : (isActive ? color : 'rgba(255,255,255,0.25)');
          return (
            <button
              key={index}
              onClick={() => scrollToSection(index)}
              title={label}
              aria-label={`Go to ${label}`}
              className="nav-dot-btn"
              style={{
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                pointerEvents: 'all',
              }}
            >
              <span
                style={{
                  display: 'block',
                  width: isActive ? '8px' : '5px',
                  height: isActive ? '8px' : '5px',
                  borderRadius: '50%',
                  background: dotColor,
                  transition: 'width 0.3s ease, height 0.3s ease, background 0.3s ease, box-shadow 0.3s ease',
                  boxShadow: isActive ? `0 0 8px 2px ${dotColor}55` : 'none',
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
