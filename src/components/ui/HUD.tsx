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
    secondaryLabel: 'SYSTEMS // DEVELOPMENT',
    color: '#888888',
  },
  horizon: {
    primaryLabel: 'MSL +5,200 FT',
    secondaryLabel: 'VNY → KVTA // IFR',
    color: '#444444',
  },
};

export function HUD() {
  const { progress, atmosphere } = useScroll();

  const config = ATMOSPHERE_CONFIG[atmosphere];
  const { primaryLabel, secondaryLabel, color } = config;

  return (
    <>
      {/* Top-left: identity/coordinate data */}
      <div
        className="hud-text"
        style={{
          position: 'fixed',
          top: '2rem',
          left: '2rem',
          zIndex: 10,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}
      >
        <span
          style={{
            fontSize: '0.6rem',
            letterSpacing: '0.25em',
            color,
            opacity: 0.9,
            transition: 'color 0.8s ease, opacity 0.8s ease',
          }}
        >
          {primaryLabel}
        </span>
        <span
          style={{
            fontSize: '0.5rem',
            letterSpacing: '0.3em',
            color,
            opacity: 0.4,
            transition: 'color 0.8s ease',
          }}
        >
          {secondaryLabel}
        </span>
      </div>

      {/* Top-right: site name */}
      <div
        className="hud-text"
        style={{
          position: 'fixed',
          top: '2rem',
          right: '2rem',
          zIndex: 10,
          pointerEvents: 'none',
          fontSize: '0.5rem',
          letterSpacing: '0.3em',
          color,
          opacity: 0.3,
          transition: 'color 0.8s ease',
        }}
      >
        FINN BENNETT
      </div>

      {/* Right-side progress rail */}
      <div
        style={{
          position: 'fixed',
          right: '2rem',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '1px',
          height: '100px',
          background: 'rgba(255,255,255,0.08)',
          zIndex: 10,
          borderRadius: '1px',
          overflow: 'visible',
          pointerEvents: 'none',
        }}
      >
        {/* Progress fill */}
        <div
          style={{
            width: '100%',
            height: `${progress * 100}%`,
            background: color,
            transition: 'background 0.8s ease',
            borderRadius: '1px',
          }}
        />
        {/* Scrubber tick */}
        <div
          style={{
            position: 'absolute',
            left: '-2px',
            top: `${progress * 100}%`,
            width: '5px',
            height: '1px',
            background: color,
            transition: 'background 0.8s ease',
          }}
        />
      </div>

      {/* Progress readout */}
      <div
        className="hud-text"
        style={{
          position: 'fixed',
          right: '2rem',
          top: 'calc(50% + 62px)',
          fontSize: '0.5rem',
          letterSpacing: '0.2em',
          opacity: 0.3,
          color,
          zIndex: 10,
          pointerEvents: 'none',
          transition: 'color 0.8s ease',
        }}
      >
        {(progress * 100).toFixed(0).padStart(3, '0')}
      </div>
    </>
  );
}
