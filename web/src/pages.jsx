import { useMemo, useState } from "react";
import { CLASSES, MODULES, TOTAL_SLIDES, JOIN_URL, pad } from "./data.js";
import { useApp, useOnline, SAVEABLE } from "./store.jsx";
import { Arr, ClassCard, Eyebrow, HeroBg, Ic, InstallCard, Stages, Thumb } from "./ui.jsx";

/* ================= HOME ================= */
export function Home() {
  const { done, pct, nextUp, saved } = useApp();
  const nx = nextUp;
  return (
    <>
      <section className="hero">
        <HeroBg />
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <Eyebrow>Recorded classes · Forex Trading Program</Eyebrow>
            <h1 className="in d2">Rewatch every class. <em>Master every setup.</em></h1>
            <p className="lede in d3">All <strong>14 Edge Trading Academy classes</strong> with the slides open beside the recording. Save classes to your phone and study the slides even without internet.</p>
            <div className="hero-cta in d4">
              <a className="btn btn-primary" href={`#class-${nx.n}`}>{done.size ? `Continue Class ${nx.n}` : "Start Class 1"} <Arr /></a>
              <a className="btn btn-ghost" href="#classes">Browse classes <Arr /></a>
            </div>
          </div>
          <a className="art in d3" href={`#class-${nx.n}`}>
            <div className="img"><Thumb c={nx} /><span className="play-chip"><i />{done.size ? "Up next" : "Start here"}</span></div>
            <div className="up"><span>Class {pad(nx.n)} · {MODULES[nx.m]}</span><b>{nx.t}</b>
              <div className="bar"><i style={{ width: `${pct}%` }} /></div><span style={{ marginTop: 6 }}>{done.size} of {CLASSES.length} classes complete</span></div>
          </a>
          <div className="facts in d4">
            <div className="fact"><b>14</b><span>Recorded classes</span></div>
            <div className="fact"><b>{TOTAL_SLIDES}</b><span>Slides beside the video</span></div>
            <div className="fact"><b>{saved.size}</b><span>Saved for offline</span></div>
            <div className="fact"><b>{pct}%</b><span>Your progress</span></div>
          </div>
        </div>
      </section>

      <section className="block tint"><div className="wrap">
        <div className="sec-head"><Eyebrow>Start with the basics</Eyebrow><h2>Module 1: <span className="hl">Forex Foundations.</span></h2><p>Three classes that build the vocabulary for everything after.</p></div>
        <div className="grid">{CLASSES.filter(c => c.m === 0).map(c => <ClassCard key={c.n} c={c} />)}</div>
        <div style={{ marginTop: 28 }}><a className="btn btn-ghost" href="#classes">See all 14 classes <Arr /></a></div>
      </div></section>

      <section className="block"><div className="wrap">
        <div className="sec-head"><Eyebrow>Your learning path</Eyebrow><h2>Five modules, <span className="hl">one clear route.</span></h2><p>Built in the order you'll use it on a live chart.</p></div>
        <Stages />
        <div style={{ marginTop: 32 }}><InstallCard /></div>
      </div></section>

      <section className="wrap"><div className="final">
        <img className="final-mark" src="img/icon-192.png" alt="" width="64" height="64" />
        <Eyebrow>Learn live with Edge mentors</Eyebrow>
        <h2>Ready to trade it live with a mentor?</h2>
        <p>These recordings pair with the live program in Dubai. Join a batch to ask questions and review trades with the team.</p>
        <a className="btn btn-primary" href={JOIN_URL} target="_blank" rel="noopener">Join a live batch <Arr /></a>
      </div></section>
    </>
  );
}

/* ================= CLASSES ================= */
export function Classes({ initialModule = -1 }) {
  const [mod, setMod] = useState(initialModule);
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return CLASSES.filter(c => (mod < 0 || c.m === mod) && (!s || (c.t + " " + c.d + " " + c.w.join(" ")).toLowerCase().includes(s)));
  }, [mod, q]);
  return (
    <section className="block page-top"><div className="wrap">
      <div className="sec-head"><Eyebrow>All classes</Eyebrow><h2>Every class, <span className="hl">ready to replay.</span></h2><p>Pick a module or search a topic. Each class opens with the recording and its slides together.</p></div>
      <div className="tools">
        <div className="filters">
          {[["All", -1], ...MODULES.map((m, i) => [m, i])].map(([n, i]) => (
            <button key={i} aria-pressed={i === mod} onClick={() => setMod(i)}>{n}</button>
          ))}
        </div>
        <label className="search" htmlFor="q"><input id="q" type="search" placeholder="Search a topic" value={q} onChange={e => setQ(e.target.value)} enterKeyHint="search" /><span><Ic.search width="15" height="15" /></span></label>
      </div>
      <div className="grid">
        {list.length ? list.map(c => <ClassCard key={c.n} c={c} />) : <div className="empty">No classes match “{q}”. Try “candlestick”, “risk” or “liquidity”.</div>}
      </div>
    </div></section>
  );
}

/* ================= OUTLINE ================= */
export function Outline() {
  const { nextUp, done } = useApp();
  return (
    <>
      <section className="phead"><HeroBg /><div className="wrap">
        <div className="crumb"><a href="#home">Home</a> / Course outline</div>
        <h1>Forex Trading Program: <span className="hl">foundations to smart money.</span></h1>
        <p>Five modules, fourteen classes, {TOTAL_SLIDES} slides. Each module builds on the one before it.</p>
        <div className="hero-cta" style={{ marginTop: 24 }}><a className="btn btn-primary" href={`#class-${nextUp.n}`}>{done.size ? `Continue Class ${nextUp.n}` : "Start Class 1"} <Arr /></a></div>
      </div></section>
      <section className="block"><div className="wrap">
        <div className="sec-head"><Eyebrow>What you'll learn</Eyebrow><h2>Skills you take to the chart.</h2></div>
        <div className="boxc" style={{ marginBottom: 56 }}><div className="topics" style={{ margin: 0 }}>
          {["Read currency pairs and calculate pips, lots and P/L", "Recognise 20+ candlestick patterns", "Use TradingView and every MT5 order type", "Map trend with structure, trendlines and S/R",
            "Trade flags, double tops, head and shoulders and triangles", "Run a capital plan with 1% risk and position sizing", "Prepare for CPI, NFP and FOMC releases", "Find liquidity, FVGs, BPRs and order blocks"].map(x => <div key={x}>{x}</div>)}
        </div></div>
        <Stages />
      </div></section>
    </>
  );
}

/* ================= MY LEARNING ================= */
export function Learning() {
  const { done, pct, resetProgress } = useApp();
  const [armed, setArmed] = useState(false);
  const up = CLASSES.filter(c => !done.has(c.n)), fin = CLASSES.filter(c => done.has(c.n));
  const reset = () => {
    if (!armed) { setArmed(true); setTimeout(() => setArmed(false), 3000); return; }
    resetProgress(); setArmed(false);
  };
  return (
    <>
      <section className="phead"><HeroBg /><div className="wrap">
        <div className="crumb"><a href="#home">Home</a> / My learning</div>
        <h1>My learning</h1>
        <div className="big-prog"><div className="bar"><i style={{ width: `${pct}%` }} /></div><b>{pct}% · {done.size} of {CLASSES.length} classes</b>
          <button className="btn btn-ghost btn-sm" onClick={reset}>{armed ? "Tap again to reset" : "Reset progress"}</button></div>
      </div></section>
      <section className="block"><div className="wrap">
        <div className="sec-head"><Eyebrow>Up next</Eyebrow><h2>{up.length ? `${up.length} classes to go.` : "All classes complete."}</h2></div>
        <div className="grid">{up.length ? up.map(c => <ClassCard key={c.n} c={c} />) : <div className="empty">Every class is complete. Well done.</div>}</div>
        <div className="sec-head" style={{ marginTop: 72 }}><Eyebrow>Completed</Eyebrow><h2>{fin.length} finished.</h2></div>
        <div className="grid">{fin.length ? fin.map(c => <ClassCard key={c.n} c={c} />) : <div className="empty">Classes you mark complete in the classroom show up here.</div>}</div>
      </div></section>
    </>
  );
}

/* ================= OFFLINE / SAVED ================= */
const MB_PER_SLIDE = 0.083; // average size of a slide image

export function Saved() {
  const { saved, saving, saveClass, removeClass, saveAll } = useApp();
  const online = useOnline();
  const savedSlides = SAVEABLE.filter(c => saved.has(c.n)).reduce((a, c) => a + c.slides.length, 0);
  const allSlides = SAVEABLE.reduce((a, c) => a + c.slides.length, 0);
  const busy = Object.keys(saving).length > 0;
  return (
    <>
      <section className="phead"><HeroBg /><div className="wrap">
        <div className="crumb"><a href="#home">Home</a> / Offline</div>
        <h1>Study <span className="hl">without internet.</span></h1>
        <p>Save a class to keep its slides on this device. Your notes and progress are always saved on the device. Recordings stream from Google Drive, so they need internet.</p>
        <div className="big-prog">
          <div className="bar"><i style={{ width: `${savedSlides / allSlides * 100}%` }} /></div>
          <b>{saved.size} of {SAVEABLE.length} classes saved · about {(savedSlides * MB_PER_SLIDE).toFixed(1)} MB</b>
        </div>
        <div className="hero-cta" style={{ marginTop: 20 }}>
          <button className="btn btn-primary" onClick={saveAll} disabled={!online || busy || saved.size === SAVEABLE.length}>
            {saved.size === SAVEABLE.length ? "All classes saved" : busy ? "Saving…" : `Save all classes (${(allSlides * MB_PER_SLIDE).toFixed(0)} MB)`} <Arr ch="↓" />
          </button>
        </div>
      </div></section>
      <section className="block"><div className="wrap">
        <InstallCard />
        <div className="savelist">
          {CLASSES.map(c => {
            const p = saving[c.n];
            const isSaved = saved.has(c.n);
            return (
              <div className="saverow" key={c.n}>
                <a className="sthumb" href={`#class-${c.n}`}><Thumb c={c} /></a>
                <a className="sinfo" href={`#class-${c.n}`}>
                  <small>Class {pad(c.n)} · {MODULES[c.m]}</small>
                  <b>{c.t}</b>
                  <span>{c.slides.length ? `${c.slides.length} slides · ${(c.slides.length * MB_PER_SLIDE).toFixed(1)} MB` : "Video only, nothing to save"}</span>
                  {p !== undefined && <span className="sbar"><i style={{ width: `${p * 100}%` }} /></span>}
                </a>
                {c.slides.length > 0 && (isSaved
                  ? <button className="sbtn saved" onClick={() => removeClass(c.n)} aria-label={`Remove Class ${c.n} from this device`}><Ic.check width="16" height="16" /><span>Saved</span><Ic.trash className="tr" width="16" height="16" /></button>
                  : <button className="sbtn" onClick={() => saveClass(c.n)} disabled={!online || p !== undefined} aria-label={`Save Class ${c.n} for offline`}>
                      <Ic.save width="16" height="16" /><span>{p !== undefined ? `${Math.round(p * 100)}%` : "Save"}</span></button>)}
              </div>
            );
          })}
        </div>
      </div></section>
    </>
  );
}
