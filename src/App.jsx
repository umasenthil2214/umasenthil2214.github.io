import React, { useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { store } from './store.js';
import { buildTimeline } from './timeline.js';
import { initScroll, getScroll } from './lib/scroll.js';
import World from './world/World.jsx';
import Overlay from './ui/Overlay.jsx';
import Cursor from './ui/Cursor.jsx';

const UNIT_VH = 58; // scroll length per timeline unit

export default function App() {
  const [fonts, setFonts] = useState(false);
  const [ready, setReady] = useState(false);

  const tl = useMemo(() => {
    store.mobile = window.innerWidth < 760;
    store.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    store.tl = buildTimeline(store.mobile);
    return store.tl;
  }, []);

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    document.documentElement.classList.add('locked');
    const l = initScroll();
    l.stop();
    store.onIntroDone = () => {
      document.documentElement.classList.remove('locked');
      getScroll()?.start();
      setReady(true);
    };
    const move = (e) => {
      if (e.pointerType === 'mouse') store.hasPointer = true;
      store.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      store.mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', move);
    const timeout = new Promise((r) => setTimeout(r, 2500));
    Promise.race([
      Promise.all([
        document.fonts.load('900 220px "Inter Tight"'),
        document.fonts.load('300 40px "Inter Tight"'),
        document.fonts.load('400 40px "Instrument Serif"'),
        document.fonts.load('italic 400 40px "Instrument Serif"'),
        document.fonts.load('500 20px "JetBrains Mono"'),
      ]),
      timeout,
    ]).then(() => setFonts(true));
    // rebuild on orientation / big resize
    let w = window.innerWidth;
    const onResize = () => {
      if ((w < 760) !== (window.innerWidth < 760)) window.location.reload();
      w = window.innerWidth;
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <>
      <div className="stage">
        {fonts && (
          <Canvas
            eventSource={document.getElementById('root')}
            eventPrefix="client"
            dpr={[1, store.mobile ? 2 : 2]}
            gl={{ antialias: false, powerPreference: 'high-performance', alpha: false }}
            camera={{ fov: store.mobile ? 54 : 40, near: 0.1, far: 420, position: [0, 0, 8] }}
          >
            <World />
          </Canvas>
        )}
      </div>
      {fonts && <Overlay ready={ready} />}
      <Cursor />
      <div className="spacer" style={{ height: `${tl.total * UNIT_VH}vh` }} />
    </>
  );
}
