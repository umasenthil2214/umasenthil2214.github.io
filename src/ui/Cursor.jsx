import React, { useEffect, useRef } from 'react';
import { store } from '../store.js';

export default function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!fine) return;
    document.documentElement.classList.add('has-cursor');
    let x = -100, y = -100, rx = -100, ry = -100, hover = false;
    const move = (e) => {
      x = e.clientX;
      y = e.clientY;
      hover = !!e.target.closest?.('button, a');
    };
    window.addEventListener('pointermove', move);
    let raf;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (ring.current) {
        ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
        ring.current.classList.toggle('is-hover', hover || store.hover3d);
      }
    };
    tick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
    };
  }, []);
  return (
    <>
      <div className="cursor-dot" ref={dot} />
      <div className="cursor-ring" ref={ring} />
    </>
  );
}
