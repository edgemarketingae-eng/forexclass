import { useCallback, useEffect, useRef, useState } from "react";
import { CLASSES, MODULES, PDF_FOLDER, pad, viewUrl, driveEmbed, ytEmbed } from "./data.js";
import { ls, useApp, useOnline, go, IS_IOS } from "./store.jsx";
import { Arr, Ic } from "./ui.jsx";

/* claude.ai previews block third-party players; every other host embeds them. */
const CAN_EMBED = !/claude/i.test(window.location.hostname);

function Video({ c }) {
  const online = useOnline();
  if (!online) {
    return (
      <div className="vbox"><div className="poster off">
        <span className="pl offi"><Ic.cloudOff width="30" height="30" /></span>
        <h3>Recording needs internet</h3>
        <p>You can still study this class's slides{c.slides.length ? " below" : ""} and write notes. The video plays when you're back online.</p>
      </div></div>
    );
  }
  if (!CAN_EMBED) {
    return (
      <div className="vbox"><a className="poster" href={viewUrl(c.id)} target="_blank" rel="noopener">
        {c.thumb && <img src={`s/${c.thumb}.jpg`} alt="" />}
        <span className="pl" /><h3>{c.t}</h3><p>This preview can't embed Google Drive, so the recording opens in a new tab.</p>
      </a></div>
    );
  }
  return (
    <div className="vbox">
      <iframe key={c.n} src={c.yt ? ytEmbed(c.yt) : driveEmbed(c.id)} title={`${c.t} recording`}
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
    </div>
  );
}

function Deck({ c }) {
  const { saved } = useApp();
  const online = useOnline();
  const N = c.slides.length;
  const trackRef = useRef(null), thumbsRef = useRef(null), paneRef = useRef(null);
  const [cur, setCur] = useState(() => Math.min(ls.get("edge.slide", {})[c.n] || 0, Math.max(N - 1, 0)));
  const [full, setFull] = useState(false);
  const curRef = useRef(cur); curRef.current = cur;

  const jump = useCallback((i, smooth = true) => {
    const T = trackRef.current; if (!T) return;
    i = Math.max(0, Math.min(N - 1, i));
    const x = T.clientWidth * i;
    try { T.scrollTo({ left: x, behavior: smooth ? "smooth" : "auto" }); } catch (e) { T.scrollLeft = x; }
    setCur(i);
  }, [N]);

  // remember position + keep the active thumbnail in view
  useEffect(() => {
    const pos = ls.get("edge.slide", {}); pos[c.n] = cur; ls.set("edge.slide", pos);
    const TB = thumbsRef.current, tb = TB?.children[cur];
    if (TB && tb) TB.scrollLeft = Math.max(0, tb.offsetLeft - TB.offsetLeft - (TB.clientWidth - tb.clientWidth) / 2);
  }, [cur, c.n]);

  // initial position, swipe tracking, resize (only on real width changes: phone address bars resize on scroll)
  useEffect(() => {
    const T = trackRef.current; if (!T) return;
    requestAnimationFrame(() => { T.scrollLeft = T.clientWidth * curRef.current; });
    let st, lastW = T.clientWidth;
    const onScroll = () => { clearTimeout(st); st = setTimeout(() => { if (T.clientWidth) setCur(Math.round(T.scrollLeft / T.clientWidth)); }, 90); };
    T.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(() => { const w = T.clientWidth; if (w && Math.abs(w - lastW) > 1) { lastW = w; T.scrollLeft = w * curRef.current; } });
    ro.observe(T);
    return () => { T.removeEventListener("scroll", onScroll); ro.disconnect(); clearTimeout(st); };
  }, [c.n]);

  useEffect(() => {
    const onKey = e => {
      if (e.target.matches?.("input,textarea")) return;
      if (e.key === "ArrowRight") { e.preventDefault(); jump(curRef.current + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); jump(curRef.current - 1); }
      else if (e.key === "Escape") setFull(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [jump]);

  useEffect(() => {
    document.body.style.overflow = full ? "hidden" : "";
    const T = trackRef.current;
    requestAnimationFrame(() => { if (T) T.scrollLeft = T.clientWidth * curRef.current; });
    return () => { document.body.style.overflow = ""; };
  }, [full]);

  if (!N) {
    return <div className="noslides"><div><b>No slides for this class</b>This session was a live screen share. Follow along in the recording.</div></div>;
  }
  const offlineMissing = !online && !saved.has(c.n);
  return (
    <div className={"deck" + (full ? " fullwrap" : "")} ref={paneRef}>
      <button className="dnav l" onClick={() => jump(cur - 1)} disabled={cur === 0} aria-label="Previous slide"><Ic.l /></button>
      <div className="track" ref={trackRef} tabIndex={0} aria-label="Slides. Swipe or use arrow keys.">
        {c.slides.map((s, i) => (
          <div className="slide" key={s}><img src={s} alt={`Slide ${i + 1}`} loading={Math.abs(i - cur) < 3 ? "eager" : "lazy"} decoding="async" draggable="false" /></div>
        ))}
      </div>
      <button className="dnav r" onClick={() => jump(cur + 1)} disabled={cur === N - 1} aria-label="Next slide"><Ic.r /></button>
      {offlineMissing && <div className="deck-note">Slides you haven't opened yet need internet. Save this class next time you're online.</div>}
      <div className="dbar">
        <span className="c">{cur + 1} / {N}</span>
        <div className="thumbs" ref={thumbsRef}>
          {c.slides.map((s, i) => (
            <button key={s} aria-label={`Slide ${i + 1}`} aria-current={i === cur ? "true" : "false"} onClick={() => jump(i)}><img src={s} alt="" loading="lazy" decoding="async" /></button>
          ))}
        </div>
        <button className="fsb" onClick={() => setFull(f => !f)} aria-label={full ? "Exit full screen" : "Full screen slides"}><Ic.full width="15" height="15" /><span>{full ? "Exit" : "Full screen"}</span></button>
      </div>
    </div>
  );
}

export default function Room({ n }) {
  const c = CLASSES[n - 1];
  const { done, toggleDone, saved, saving, saveClass, removeClass, pct } = useApp();
  const online = useOnline();
  const [layout, setLayout] = useState(() => ls.get("edge.layout", "split"));
  const [swapped, setSwapped] = useState(() => ls.get("edge.swap", false));
  const [tab, setTab] = useState("ov");
  const [note, setNote] = useState(() => ls.get("edge.note." + n, ""));
  const [noteState, setNoteState] = useState("Notes save on this device.");

  useEffect(() => { ls.set("edge.layout", layout); }, [layout]);
  useEffect(() => { ls.set("edge.swap", swapped); }, [swapped]);
  useEffect(() => { setNote(ls.get("edge.note." + n, "")); setTab("ov"); window.scrollTo(0, 0); }, [n]);
  useEffect(() => {
    const t = setTimeout(() => { ls.set("edge.note." + n, note); if (note) setNoteState("Saved on this device"); }, 400);
    return () => clearTimeout(t);
  }, [note, n]);

  const p = saving[n];
  const isSaved = saved.has(n);
  return (
    <div className="room">
      <div className="rtop"><div className="in">
        <a className="back" href="#classes" aria-label="Back to all classes"><Ic.l /></a>
        <a className="logo" href="#home"><img src="img/edge-logo.png" alt="Edge Trading Academy" width="115" height="28" /></a>
        <div className="t"><small>Class {pad(n)} of {CLASSES.length}</small><b>{c.t}</b></div>
        {!online && <span className="net-pill"><Ic.cloudOff width="15" height="15" /><span>Offline</span></span>}
        <div className="seg" role="group" aria-label="Layout">
          {[["split", "Video + slides"], ["video", "Video"], ["slides", "Slides"]].map(([k, l]) => (
            <button key={k} aria-pressed={layout === k} onClick={() => setLayout(k)}>{l}</button>
          ))}
        </div>
        <button className="icbtn swap" onClick={() => setSwapped(s => !s)} title="Swap sides" aria-label="Swap video and slides"><Ic.swap width="16" height="16" /></button>
        <button className="icbtn" onClick={() => go(`class-${n - 1}`)} disabled={n === 1} aria-label="Previous class"><Ic.l /></button>
        <button className="icbtn" onClick={() => go(`class-${n + 1}`)} disabled={n === CLASSES.length} aria-label="Next class"><Ic.r /></button>
      </div></div>

      <div className="stagearea">
        <div className={`split ${layout === "video" ? "v-only" : layout === "slides" ? "s-only" : ""} ${swapped ? "swap" : ""}`}>
          <section className="pane video">
            <div className="pane-h"><span className="dot" />Recording<span className="sp" /><a href={viewUrl(c.id)} target="_blank" rel="noopener">Open in Drive <Ic.ne width="15" height="15" /></a></div>
            <Video c={c} />
            {online && !c.yt && CAN_EMBED && (
              <a className={"vhelp" + (IS_IOS ? " ios" : "")} href={viewUrl(c.id)} target="_blank" rel="noopener">
                <span>{IS_IOS ? "Video not starting on iPhone?" : "Video not starting?"}</span><b>Watch in Google Drive <Ic.ne width="15" height="15" /></b>
              </a>
            )}
          </section>
          <section className="pane slides">
            <div className="pane-h"><span className="dot g" />Slides<span className="sp" />{c.slides.length > 0 && <span className="muted" style={{ fontSize: 13, fontWeight: 600 }}>Swipe or use ← →</span>}</div>
            <Deck key={c.n} c={c} />
          </section>
        </div>
      </div>

      <div className="wrap below">
        <div style={{ minWidth: 0 }}>
          <div className="cls-head">
            <span className="k">Module {c.m + 1} · {MODULES[c.m]}</span>
            <h1>{c.t}</h1>
            <div className="cls-actions">
              <button className={"btn " + (done.has(n) ? "btn-ghost done" : "btn-primary")} onClick={() => toggleDone(n)}>{done.has(n) ? "✓ Completed" : "Mark as complete"}</button>
              {c.slides.length > 0 && (isSaved
                ? <button className="btn btn-ghost done" onClick={() => removeClass(n)}><Ic.check width="16" height="16" /> Saved offline</button>
                : <button className="btn btn-ghost" onClick={() => saveClass(n)} disabled={!online || p !== undefined}>{p !== undefined ? `Saving ${Math.round(p * 100)}%` : "Save slides offline"} <Arr ch="↓" /></button>)}
              {n < CLASSES.length && <a className="btn btn-ghost" href={`#class-${n + 1}`}>Next class <Arr /></a>}
            </div>
          </div>
          <div className="tabs" role="tablist">
            {[["ov", "Overview"], ["nt", "My notes"], ["rs", "Resources"]].map(([k, l]) => (
              <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{l}</button>
            ))}
          </div>
          {tab === "ov" && <div><p className="muted" style={{ maxWidth: "68ch", fontSize: 16.5 }}>{c.d}</p>
            <div className="boxc" style={{ marginTop: 20 }}><b style={{ fontSize: 17 }}>Topics covered</b><div className="topics">{c.w.map(x => <div key={x}>{x}</div>)}</div></div></div>}
          {tab === "nt" && <div>
            <textarea className="note" id="note" value={note} onChange={e => { setNote(e.target.value); setNoteState("Saving…"); }} placeholder="Key rules, levels and questions for your mentor…" />
            <div className="muted" style={{ fontSize: 13, marginTop: 8 }}>{noteState} Works offline.</div></div>}
          {tab === "rs" && <div className="boxc">
            <div className="res"><span className="ic">MP4</span><div><b>Class {n} recording</b><div className="muted" style={{ fontSize: 13.5 }}>Google Drive</div></div><a className="btn btn-ghost btn-sm" href={viewUrl(c.id)} target="_blank" rel="noopener">Open</a></div>
            <div className="res"><span className="ic">PDF</span><div><b>Course PDF notes</b><div className="muted" style={{ fontSize: 13.5 }}>All class decks in one Drive folder</div></div><a className="btn btn-ghost btn-sm" href={PDF_FOLDER} target="_blank" rel="noopener">Open</a></div>
          </div>}
        </div>
        <aside className="curr">
          <div className="curr-h"><b>Course content</b><div className="prog-line"><i style={{ width: `${pct}%` }} /></div><div className="muted" style={{ fontSize: 13, marginTop: 6 }}>{done.size} of {CLASSES.length} complete</div></div>
          {MODULES.map((m, i) => (
            <div key={m}>
              <div className="mh">Module {i + 1} · {m}</div>
              {CLASSES.filter(x => x.m === i).map(x => {
                const ok = done.has(x.n) && x.n !== n;
                return (
                  <button key={x.n} className={"citem" + (x.n === n ? " active" : "")} onClick={() => go(`class-${x.n}`)}>
                    <span className={"n" + (ok ? " ok" : "")}>{ok ? "✓" : pad(x.n)}</span>
                    <span><span className="tt">{x.t}</span><span className="sb">{x.slides.length ? `Video · ${x.slides.length} slides` : "Video only"}{saved.has(x.n) ? " · Offline" : ""}</span></span>
                  </button>
                );
              })}
            </div>
          ))}
          <div style={{ height: 10 }} />
        </aside>
      </div>
    </div>
  );
}
