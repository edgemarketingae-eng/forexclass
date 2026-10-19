import { CLASSES, MODULES, MOD_BLURB, pad } from "./data.js";
import { useApp, useOnline, useRoute, useInstall, IN_APK } from "./store.jsx";
import { useState } from "react";

/* ---------- icons ---------- */
const sv = (p, w = 2.2) => props => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{p}</svg>
);
export const Ic = {
  play: sv(<><circle cx="12" cy="12" r="9" /><path d="m10 8.5 5 3.5-5 3.5z" fill="currentColor" /></>, 2),
  slides: sv(<><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></>, 2),
  l: sv(<path d="m15 5-7 7 7 7" />, 2.4),
  r: sv(<path d="m9 5 7 7-7 7" />, 2.4),
  ne: sv(<path d="M7 17 17 7M8 7h9v9" />, 2.4),
  search: sv(<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>, 2.6),
  full: sv(<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />),
  swap: sv(<path d="M7 7h13l-4-4M17 17H4l4 4" />),
  home: sv(<><path d="M4 11 12 4l8 7" /><path d="M6 10v10h12V10" /></>),
  grid: sv(<><rect x="4" y="4" width="7" height="7" rx="2" /><rect x="13" y="4" width="7" height="7" rx="2" /><rect x="4" y="13" width="7" height="7" rx="2" /><rect x="13" y="13" width="7" height="7" rx="2" /></>),
  save: sv(<><path d="M12 4v11" /><path d="m7 10 5 5 5-5" /><path d="M5 20h14" /></>),
  user: sv(<><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>),
  check: sv(<path d="m5 12 5 5 9-10" />, 2.8),
  cloudOff: sv(<><path d="M3 3l18 18" /><path d="M8 8a6 6 0 0 0-2 .3A4.5 4.5 0 0 0 7 17h9.5M20 15.5A4 4 0 0 0 17 9h-.2a6 6 0 0 0-5.5-3.9" /></>),
  trash: sv(<><path d="M4 7h16M10 11v6M14 11v6" /><path d="M6 7l1 13h10l1-13M9 7V4h6v3" /></>),
  phone: sv(<><rect x="7" y="3" width="10" height="18" rx="2" /><path d="M11 18h2" /></>)
};

export const Arr = ({ ch = "→" }) => <span className="arr" aria-hidden="true">{ch}</span>;
export const Eyebrow = ({ children }) => <span className="eyebrow"><span className="dot" />{children}</span>;

export const HeroBg = () => (
  <div className="hero-bg" aria-hidden="true">
    <svg className="hero-line" viewBox="0 0 1200 300" preserveAspectRatio="none">
      <defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#08E186" stopOpacity=".22" /><stop offset="1" stopColor="#08E186" stopOpacity="0" /></linearGradient></defs>
      <path className="area" d="M0 250 L90 230 L170 240 L260 190 L340 205 L430 150 L520 170 L610 120 L700 140 L790 90 L880 110 L970 60 L1060 80 L1200 30 L1200 300 L0 300Z" />
      <path d="M0 250 L90 230 L170 240 L260 190 L340 205 L430 150 L520 170 L610 120 L700 140 L790 90 L880 110 L970 60 L1060 80 L1200 30" />
    </svg>
  </div>
);

export function Thumb({ c }) {
  if (c.thumb) return <img src={`s/${c.thumb}.jpg`} alt="" loading="lazy" />;
  return (
    <div className="th-gen">
      <svg viewBox="0 0 100 60">{Array.from({ length: 14 }, (_, i) => (
        <rect key={i} x={6 + i * 6.5} y={38 - i * 2 - ((i * 13) % 10)} width="3.6" height={8 + ((i * 37) % 22)} rx="1" fill={i % 3 ? "#08E186" : "#9FD9C0"} />
      ))}</svg>
      <small>Class {pad(c.n)}</small><b>{c.t}</b>
    </div>
  );
}

export function ClassCard({ c }) {
  const { done, saved } = useApp();
  const online = useOnline();
  const unavailable = !online && c.slides.length && !saved.has(c.n);
  return (
    <a className={"card" + (unavailable ? " dim" : "")} href={`#class-${c.n}`}>
      <div className="th">
        <Thumb c={c} />
        <span className="num">Class {pad(c.n)}</span>
        {done.has(c.n) && <span className="ok">✓ Done</span>}
        {saved.has(c.n) && <span className="offl"><Ic.save width="13" height="13" />Offline</span>}
      </div>
      <div className="body">
        <span className="k">{MODULES[c.m]}</span>
        <h3>{c.t}</h3>
        <p>{c.d}</p>
        <div className="meta">
          <span><Ic.play />Video</span>
          <span><Ic.slides />{c.slides.length ? `${c.slides.length} slides` : "No slides"}</span>
          <span className="go"><Ic.ne width="16" height="16" /></span>
        </div>
      </div>
    </a>
  );
}

export function Stages() {
  const { done } = useApp();
  return (
    <div className="stages">
      {MODULES.map((m, i) => {
        const ls = CLASSES.filter(c => c.m === i), f = ls.filter(c => done.has(c.n)).length;
        return (
          <a className="stage" key={m} href={`#classes-${i + 1}`}>
            <span className="n">{pad(i + 1)}</span>
            <div><h3>{m}<small>{ls.length} classes · {f} done</small></h3><div className="prog-line"><i style={{ width: `${f / ls.length * 100}%` }} /></div></div>
            <div className="desc">{MOD_BLURB[i]}<div className="chips">{ls.map(c => <span key={c.n}>{c.t}</span>)}</div></div>
          </a>
        );
      })}
    </div>
  );
}

/* ---------- app chrome ---------- */
const NAV = [
  ["home", "Home", Ic.home],
  ["classes", "Classes", Ic.grid],
  ["saved", "Offline", Ic.save],
  ["learning", "Progress", Ic.user]
];
const isActive = (route, key) => route === key || (key === "classes" && route.startsWith("classes"));

export function Header() {
  const route = useRoute();
  const { nextUp, done } = useApp();
  const online = useOnline();
  return (
    <header className="nav">
      <div className="wrap">
        <a className="logo" href="#home" aria-label="Edge Trading Academy home"><img src="img/edge-logo.png" alt="Edge Trading Academy" width="140" height="34" /></a>
        <nav className="nav-links" aria-label="Main">
          <a href="#home" aria-current={route === "home" ? "page" : undefined}>Home</a>
          <a href="#classes" aria-current={route.startsWith("classes") ? "page" : undefined}>Classes</a>
          <a href="#outline" aria-current={route === "outline" ? "page" : undefined}>Course outline</a>
          <a href="#saved" aria-current={route === "saved" ? "page" : undefined}>Offline</a>
          <a href="#learning" aria-current={route === "learning" ? "page" : undefined}>My learning</a>
        </nav>
        <div className="nav-r">
          {!online && <span className="net-pill"><Ic.cloudOff width="15" height="15" />Offline</span>}
          <a className="btn btn-primary btn-sm btn-desk" href={`#class-${nextUp.n}`}>{done.size ? `Continue Class ${nextUp.n}` : "Start learning"} <Arr /></a>
        </div>
      </div>
    </header>
  );
}

export function BottomNav() {
  const route = useRoute();
  return (
    <nav className="tabbar" aria-label="App">
      {NAV.map(([k, label, I]) => (
        <a key={k} href={`#${k}`} className={isActive(route, k) ? "on" : ""} aria-current={isActive(route, k) ? "page" : undefined}>
          <span className="ti"><I width="22" height="22" /></span><span className="tl">{label}</span>
        </a>
      ))}
    </nav>
  );
}

export function OfflineBanner() {
  const online = useOnline();
  if (online) return null;
  return (
    <div className="offbar" role="status">
      <Ic.cloudOff width="16" height="16" />
      <span>You're offline. Saved classes, slides, notes and progress still work. Recordings need internet.</span>
    </div>
  );
}

export function Toast() {
  const { toast } = useApp();
  return <div className={"toast" + (toast ? " show" : "")} role="status" aria-live="polite">{toast}</div>;
}

export function InstallCard({ compact }) {
  const { canPrompt, installed, install, ios } = useInstall();
  const [showIos, setShowIos] = useState(false);
  if (installed || IN_APK) return null;
  if (!canPrompt && !ios) {
    return (
      <div className={"install" + (compact ? " compact" : "")}>
        <span className="ii"><Ic.phone width="22" height="22" /></span>
        <div><b>Get the Edge Academy app</b><span>Android app, or add this site to your home screen from your browser menu.</span></div>
        <a className="btn btn-ghost btn-sm" href="download/edge-academy.apk">Android APK</a>
      </div>
    );
  }
  return (
    <div className={"install" + (compact ? " compact" : "")}>
      <span className="ii"><Ic.phone width="22" height="22" /></span>
      <div>
        <b>Install Edge Academy</b>
        <span>{ios ? (showIos ? "Tap the Share button, then “Add to Home Screen”." : "Add it to your home screen. It opens full screen and works offline.") : "Opens full screen like an app and works offline."}</span>
      </div>
      {ios
        ? <button className="btn btn-primary btn-sm" onClick={() => setShowIos(true)}>How to install</button>
        : <button className="btn btn-primary btn-sm" onClick={install}>Install app</button>}
    </div>
  );
}

export function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot">
          <div><img src="img/edge-logo.png" alt="Edge Trading Academy" width="140" height="34" style={{ height: 34, width: "auto" }} /><p className="tagline">Learn Forex. Build a skill. Create more possibilities.</p></div>
          <div><h4>Learn</h4><ul><li><a href="#classes">All classes</a></li><li><a href="#outline">Course outline</a></li><li><a href="#learning">My learning</a></li><li><a href="#saved">Offline classes</a></li></ul></div>
          <div><h4>Get the app</h4><ul><li><a href="download/edge-academy.apk">Android app (APK)</a></li><li><a href="#saved">Install on any phone</a></li></ul></div>
          <div><h4>Edge Academy</h4><ul><li><a href="https://www.edgeacademy.ae" target="_blank" rel="noopener">edgeacademy.ae</a></li><li><a href="https://joinedge.vercel.app/#course" target="_blank" rel="noopener">Join a live batch</a></li></ul></div>
        </div>
        <div className="legal"><span>© Edge Trading Academy, Dubai</span><span>Educational content only. Trading involves risk and this is not financial advice.</span></div>
      </div>
    </footer>
  );
}
