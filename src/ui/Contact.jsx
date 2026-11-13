import React, { useRef } from 'react';
import { PROFILE } from '../content.js';

const Icons = {
  mail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3a1.96 1.96 0 1 0 0 3.92 1.96 1.96 0 0 0 0-3.92ZM20.44 13.4c0-3.1-1.65-4.54-3.85-4.54-1.78 0-2.57.98-3.02 1.67V8.5h-3.37c.04.95 0 11.5 0 11.5h3.37v-6.42c0-.34.03-.69.13-.93.27-.69.89-1.4 1.94-1.4 1.37 0 1.92 1.05 1.92 2.59V20h3.38v-6.6Z" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 4h3.2l1.6 4-2 1.3a11 11 0 0 0 5 5l1.3-2 4 1.6V17a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z" />
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 4v12m0 0-5-5m5 5 5-5M5 20h14" />
    </svg>
  ),
};

const Github = (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2.2Z" />
  </svg>
);

function Magnetic({ className, label, children, href, download }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.35;
    const y = (e.clientY - r.top - r.height / 2) * 0.35;
    ref.current.style.transform = `translate(${x}px, ${y}px)`;
  };
  const reset = () => (ref.current.style.transform = '');
  const external = href && href.startsWith('http');
  return (
    <a
      ref={ref}
      className={className}
      aria-label={label}
      title={label}
      href={href}
      download={download}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      onMouseMove={onMove}
      onMouseLeave={reset}
    >
      {children}
    </a>
  );
}

export default function Contact() {
  return (
    <div className="ct">
      <span className="mono dim">(07) Contact</span>
      <h2 className="ct-title">
        <span className="ln">
          <span>Let’s build</span>
        </span>
        <span className="ln">
          <span>
            something <em>connected.</em>
          </span>
        </span>
      </h2>
      <div className="ct-row">
        <div className="socials">
          <Magnetic className="soc" label={`Email ${PROFILE.email}`} href={`mailto:${PROFILE.email}`}>
            {Icons.mail}
          </Magnetic>
          <Magnetic className="soc" label="LinkedIn" href={PROFILE.linkedin}>
            {Icons.linkedin}
          </Magnetic>
          <Magnetic className="soc" label="GitHub" href={PROFILE.github}>
            {Github}
          </Magnetic>
        </div>
        <Magnetic className="resume" label="Download résumé (PDF)" href={PROFILE.resume} download>
          <span className="resume-ic">{Icons.arrow}</span>
          <span className="resume-txt">Résumé</span>
          <span className="resume-fill" />
        </Magnetic>
      </div>
      <div className="ct-lines mono">
        <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
        <span className="dim">Based in {PROFILE.location}</span>
      </div>
      <footer className="foot">
        <span className="mono dim">© {new Date().getFullYear()} {PROFILE.name}</span>
        <span className="mono dim">Mobile · IoT · Embedded · AI</span>
      </footer>
    </div>
  );
}
