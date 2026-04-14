'use client';

import { useState, useEffect, useRef } from 'react';
import type { SanityWebProject } from '@/lib/sanity/types';

export function SelectedWorkBrowser({ projects }: { projects: SanityWebProject[] }) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        maxWidth: '1200px',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.8s ease, transform 0.8s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '4rem',
        padding: '0 2rem',
        maxHeight: '80vh',
        overflowY: 'auto',
        scrollbarWidth: 'none',
      }}
    >
      <h2
        className="serif-text"
        style={{
          fontSize: 'clamp(2.5rem, 6vw, 5rem)',
          fontWeight: 300,
          color: '#ffffff',
          letterSpacing: '0.05em',
          marginBottom: '1rem',
          textAlign: 'center',
        }}
      >
        Digital Identity
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2.5rem' }}>
        {projects.map((project, idx) => (
          <div key={project._id ?? String(idx)} className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.4s ease' }}>
            <div style={{ padding: '2.5rem 2.5rem 1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <span className="hud-text" style={{ fontSize: '0.6rem', color: '#ff8c00', opacity: 0.7 }}>{String(idx + 1).padStart(2, '0')}</span>
                <span className="hud-text" style={{ fontSize: '0.5rem', color: '#ff8c00', opacity: 0.7, padding: '0.3rem 0.6rem', border: '1px solid rgba(255,140,0,0.3)', borderRadius: '12px' }}>{project.type}</span>
              </div>
              <h3 className="serif-text" style={{ fontSize: '2.2rem', fontWeight: 300, color: '#fff', marginBottom: '1rem', lineHeight: 1.1 }}>{project.name}</h3>
              <p className="sans-text" style={{ fontSize: '1rem', color: '#ccc', lineHeight: 1.6, opacity: 0.9 }}>{project.desc}</p>
            </div>
            
            <div style={{ padding: '0 2.5rem 1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {project.tech?.map((t) => (
                <span key={t} className="sans-text" style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', color: '#aaa' }}>{t}</span>
              ))}
            </div>

            <div style={{ padding: '1.5rem 2.5rem 2.5rem', marginTop: 'auto' }}>
              <a 
                href={project.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="sans-text magnetic-btn" 
                style={{ 
                  display: 'inline-block',
                  padding: '1rem 2rem', 
                  fontSize: '0.85rem', 
                  fontWeight: 600,
                  letterSpacing: '0.15em', 
                  color: '#fff', 
                  border: '1px solid rgba(255, 140, 0, 0.3)', 
                  borderRadius: '30px', 
                  background: 'rgba(255, 140, 0, 0.05)', 
                  cursor: 'pointer', 
                  textTransform: 'uppercase',
                  textDecoration: 'none'
                }}
              >
                Visit Live Site
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
