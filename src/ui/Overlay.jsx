import React, { useEffect, useRef, useState } from 'react';
import { store, clamp } from '../store.js';
import { vis, phase, centerU } from '../timeline.js';
import { scrollToU } from '../lib/scroll.js';
import { GROUPS, SKILLS, PROJECTS, STATS, JOURNEY, PROFILE, ABOUT, ABOUT_POINTS, HONORS, EDUCATION, BUILDS } from '../content.js';
import avatarUrl from '../assets/uma-avatar.webp';
import Contact from './Contact.jsx';

function Words({ text, base = 0 }) {
  return text.split(' ').map((w, i) => {
    const em = w.startsWith('*');
    const t = w.replace(/\*/g, '');
    return (
      <React.Fragment key={i}>
        <span className="wd">
          <span className={`wd-in ${em ? 'em' : ''}`} style={{ transitionDelay: `${base + i * 0.035}s` }}>
            {t}
          </span>
        </span>{' '}
      </React.Fragment>
    );
  });
}

function Count({ to, decimals = 0, on }) {
  const ref = useRef(null);
  const done = useRef(false);
  useEffect(() => {
    if (!on || done.current) return;
    done.current = true;
    const t0 = performance.now();
    const dur = 1800;
    const tick = (now) => {
      const k = clamp((now - t0) / dur);
      const e = 1 - Math.pow(1 - k, 4);
      if (ref.current) ref.current.textContent = (to * e).toFixed(decimals);
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [on, to, decimals]);
  return <span ref={ref}>{(0).toFixed(decimals)}</span>;
}

export default function Overlay({ ready }) {
  const tl = store.tl;
  const I = tl.index;
  const panels = useRef([]);
  const [onSet, setOnSet] = useState({});
  const [group, setGroup] = useState(null);
  const onRef = useRef({});

  useEffect(() => {
    let raf;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const u = store.off;
      let changed = false;
      panels.current.forEach((el) => {
        if (!el) return;
        const i = Number(el.dataset.shot);
        const fade = Number(el.dataset.fade || 0.3);
        let v = vis(tl, u, i, fade);
        if (i === 0 && !store.introDone) v = 0;
        const ph = phase(tl, u, i, fade);
        el.style.opacity = v.toFixed(3);
        el.style.visibility = v < 0.003 ? 'hidden' : 'visible';
        el.style.transform = `translate3d(0, ${(-ph * 60).toFixed(1)}px, 0)`;
        el.style.pointerEvents = v > 0.6 ? 'auto' : 'none';
        const key = el.dataset.key;
        const on = v > 0.55;
        if (onRef.current[key] !== on) {
          onRef.current[key] = on;
          el.classList.toggle('on', on);
          changed = true;
        }
      });
      if (changed) setOnSet({ ...onRef.current });
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [tl]);

  const reg = (el) => el && !panels.current.includes(el) && panels.current.push(el);
  const P = (key, shot, className, children, fade) => (
    <section ref={reg} data-shot={shot} data-key={key} data-fade={fade} className={`pnl ${className}`}>
      {children}
    </section>
  );

  const pickGroup = (g) => {
    store.skillGroup = g;
    setGroup(g);
  };

  return (
    <div className={`overlay ${ready ? 'ready' : ''}`}>
      {/* HERO */}
      {P(
        'hero',
        I.hero,
        'pnl-hero',
        <>
          <div className="hm-col">
            <span className="mono dim">{PROFILE.name}</span>
            <span>{PROFILE.role}</span>
          </div>
          <div className="hm-col right">
            <span className="mono dim">{PROFILE.focus}</span>
            <span>{PROFILE.location} — 15+ years</span>
          </div>
        </>,
        0.25
      )}

      {/* ABOUT */}
      {P(
        'about',
        I.about,
        'pnl-about',
        <>
          <div className="ab-id">
            <img src={avatarUrl} alt={`Portrait of ${PROFILE.name}`} width="64" height="64" />
            <span>
              <b>{PROFILE.name}</b>
              <span className="mono dim">{PROFILE.role}</span>
            </span>
          </div>
          <span className="mono dim kicker">(01) — About</span>
          <p className="lead">
            <Words text={ABOUT} />
          </p>
          <ul className="ab-points">
            {ABOUT_POINTS.map((t, i) => (
              <li key={t} style={{ transitionDelay: `${0.5 + i * 0.08}s` }}>
                {t}
              </li>
            ))}
          </ul>
          <div className="stats">
            <div>
              <b>
                <Count to={15} on={onSet.about} />+
              </b>
              <span className="mono dim">Years</span>
            </div>
            <div>
              <b>
                0<Count to={8} on={onSet.about} />
              </b>
              <span className="mono dim">Companies</span>
            </div>
            <div>
              <b>
                0<Count to={BUILDS.length} on={onSet.about} />
              </b>
              <span className="mono dim">Products built</span>
            </div>
          </div>
        </>
      )}

      {/* WORK */}
      {PROJECTS.map((p, i) =>
        P(
          `work${i}`,
          I[`work${i}`],
          `pnl-work ${tl.shots[I[`work${i}`]].pos.x > 0 ? 'side-right' : 'side-left'}`,
          <div className="work-card">
            <div className="wc-top mono dim">
              <span>(02) Selected Work</span>
              <span>
                0{i + 1} / 0{PROJECTS.length}
              </span>
            </div>
            <span className="mono dim wc-tag">{p.tag}</span>
            <h3 className="wc-title">
              <Words text={`${p.title} *${p.em}*`} />
            </h3>
            <p className="wc-desc">{p.desc}</p>
            {p.link && (
              <a className="wc-link mono" href={p.link} target="_blank" rel="noreferrer">
                View project ↗
              </a>
            )}
            <ul className="chips">
              {p.stack.map((s, k) => (
                <li key={s} style={{ transitionDelay: `${0.25 + k * 0.05}s` }}>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )
      )}

      {/* SKILLS */}
      {P(
        'skills',
        I.skills,
        'pnl-skills',
        <>
          <div className="sk-head">
            <span className="mono dim">(03)</span>
            <h2 className="big">
              <Words text="The *Toolkit*" />
            </h2>
          </div>
          <ul className="groups" onMouseLeave={() => pickGroup(null)}>
            {Object.entries(GROUPS).map(([g, ws], i) => (
              <li key={g} style={{ transitionDelay: `${0.15 + i * 0.06}s` }}>
                <button
                  className={`group ${group === g ? 'on' : ''}`}
                  onMouseEnter={() => pickGroup(g)}
                  onClick={() => pickGroup(group === g ? null : g)}
                >
                  <span className="mono dim gi">0{i + 1}</span>
                  <span className="gname">{g}</span>
                  <span className="mono dim">{ws.length}</span>
                </button>
              </li>
            ))}
          </ul>
        </>,
        0.4
      )}
      <div className="labels">
        {SKILLS.map((s, i) => (
          <span key={s.w} className="sk-label" ref={(el) => (store.labels.skills[i] = el)}>
            {s.w}
          </span>
        ))}
        {STATS.map((s, i) => (
          <span key={s.label} className="tw-label" ref={(el) => (store.labels.towers[i] = el)}>
            <span className="tw-val">
              {s.prefix && <span className="tw-suf">{s.prefix}</span>}
              <span className="tw-num">0</span>
              <span className="tw-suf">{s.suffix}</span>
            </span>
            <span className="mono dim">{s.label}</span>
          </span>
        ))}
      </div>

      {/* NUMBERS */}
      {P(
        'numbers',
        I.numbers,
        'pnl-numbers',
        <>
          <div className="nb-head">
            <span className="mono dim">(04)</span>
            <h2 className="big">
              <Words text="By the *Numbers*" />
            </h2>
          </div>
          <div className="honors">
            {HONORS.map((h) => (
              <div key={h.big}>
                <span className="hn-star">✦</span>
                <span className="hn-big">{h.big}</span>
                <span className="mono dim">{h.small}</span>
              </div>
            ))}
            {EDUCATION.map((e) => (
              <div key={e.degree}>
                <span className="hn-star">◆</span>
                <span className="hn-big">{e.degree}</span>
                <span className="mono dim">{e.note}</span>
              </div>
            ))}
          </div>
        </>,
        0.4
      )}

      {/* JOURNEY */}
      {JOURNEY.map((j, i) =>
        P(
          `journey${i}`,
          I[`journey${i}`],
          'pnl-journey',
          <>
            <span className="mono dim">(05) The Journey — 0{i + 1} / 0{JOURNEY.length}</span>
            <div className="jy-year">
              {j.year.split('').map((c, k) => (
                <span key={k} className="jy-d">
                  <span style={{ transitionDelay: `${k * 0.06}s` }}>{c}</span>
                </span>
              ))}
            </div>
            <div className="jy-role">{j.role}</div>
            <div className="jy-place">{j.place}</div>
            <div className="mono dim jy-note">{j.note}</div>
          </>
        )
      )}

      {/* CERTS */}
      {P(
        'certs',
        I.certs,
        'pnl-certs',
        <>
          <span className="mono dim">(06) Built across the years</span>
          <h2 className="big">
            <Words text="Eight *products*" />
          </h2>
        </>,
        0.4
      )}

      {/* CONTACT */}
      {P('contact', I.contact, 'pnl-contact', <Contact />, 0.4)}

      <Nav show={ready} />
    </div>
  );
}

function Nav({ show }) {
  const tl = store.tl;
  const go = (id) => scrollToU(centerU(tl, tl.index[id]));
  return (
    <nav className={`nav ${show ? 'show' : ''}`}>
      <button className="nav-mark" onClick={() => scrollToU(0)} aria-label="Back to start">
        U<span>.</span>
      </button>
      <div className="nav-links">
        {[
          ['about', 'About'],
          ['work0', 'Work'],
          ['skills', 'Skills'],
          ['journey0', 'Journey'],
          ['contact', 'Contact'],
        ].map(([id, label]) => (
          <button key={id} className="nav-link" onClick={() => go(id)}>
            <span className="nav-roll" data-text={label}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
