'use client';

import { useState, useEffect, useRef } from 'react';
import type { SanityWebProject } from '@/lib/sanity/types';

export function SelectedWorkBrowser({ projects }: { projects: SanityWebProject[] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const resumeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setActiveIdx((i) => (i + 1) % projects.length);
    }, 4500);
    return () => clearInterval(id);
  }, [paused, projects.length]);

  const handleTabClick = (idx: number) => {
    setActiveIdx(idx);
    setPaused(true);
    if (resumeRef.current) clearTimeout(resumeRef.current);
    resumeRef.current = setTimeout(() => setPaused(false), 8000);
  };

  const activeProject = projects[activeIdx];

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
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            <span style={{ display: 'block', width: 12, height: 12, borderRadius: '50%', background: 'rgb(255,95,87)' }} />
            <span style={{ display: 'block', width: 12, height: 12, borderRadius: '50%', background: 'rgb(254,188,46)' }} />
            <span style={{ display: 'block', width: 12, height: 12, borderRadius: '50%', background: 'rgb(40,200,64)' }} />
          </div>

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
            <span style={{ color: '#888' }}>{activeProject?.domain}</span>
          </div>
        </div>

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
          {projects.map((project, idx) => (
            <div
              key={project._id ?? String(idx)}
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
              <iframe
                src={project.url}
                title={project.name}
                loading="lazy"
                style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              />
            </div>
          ))}

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

      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        {projects.map((project, idx) => {
          const isActive = idx === activeIdx;
          return (
            <button
              key={project._id ?? String(idx)}
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
