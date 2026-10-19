import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { CLASSES, ALL_SLIDES } from "./data.js";

/* ---------- safe localStorage ---------- */
export const ls = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } }
};

/* ---------- hash routing (keeps #class-3 links working for the Android app) ---------- */
const subHash = cb => { window.addEventListener("hashchange", cb); return () => window.removeEventListener("hashchange", cb); };
export function useRoute() {
  const hash = useSyncExternalStore(subHash, () => window.location.hash, () => "");
  return (hash || "#home").slice(1) || "home";
}
export const go = r => { window.location.hash = r; };

/* ---------- online / offline ---------- */
const subOnline = cb => { window.addEventListener("online", cb); window.addEventListener("offline", cb); return () => { window.removeEventListener("online", cb); window.removeEventListener("offline", cb); }; };
export const useOnline = () => useSyncExternalStore(subOnline, () => navigator.onLine, () => true);

/* ---------- app state: progress, notes, saved slides ---------- */
const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);
const SLIDE_CACHE = "edge-slides-v1";

export function AppProvider({ children }) {
  const [done, setDone] = useState(() => new Set(ls.get("edge.done", [])));
  const [saved, setSaved] = useState(() => new Set(ls.get("edge.saved", [])));
  const [saving, setSaving] = useState({}); // n -> 0..1
  const [toast, setToast] = useState(null);

  useEffect(() => { ls.set("edge.done", [...done]); }, [done]);
  useEffect(() => { ls.set("edge.saved", [...saved]); }, [saved]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2800); return () => clearTimeout(t); }, [toast]);

  // Confirm saved classes are really in the cache (the browser may have cleared it).
  useEffect(() => {
    if (!("caches" in window)) return;
    (async () => {
      try {
        const cache = await caches.open(SLIDE_CACHE);
        const keep = new Set();
        for (const n of saved) {
          const c = CLASSES[n - 1];
          if (!c || !c.slides.length) continue;
          const hits = await Promise.all(c.slides.map(s => cache.match(new URL(s, document.baseURI).href)));
          if (hits.every(Boolean)) keep.add(n);
        }
        if (keep.size !== saved.size) setSaved(keep);
      } catch (e) { /* ignore */ }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleDone = useCallback(n => setDone(prev => {
    const s = new Set(prev);
    if (s.has(n)) s.delete(n); else s.add(n);
    return s;
  }), []);
  const resetProgress = useCallback(() => setDone(new Set()), []);

  const saveClass = useCallback(async n => {
    const c = CLASSES[n - 1];
    if (!c || !c.slides.length) return false;
    if (!("caches" in window)) { setToast("This browser can't save classes for offline use."); return false; }
    setSaving(s => ({ ...s, [n]: 0 }));
    try {
      const cache = await caches.open(SLIDE_CACHE);
      let k = 0;
      for (const s of c.slides) {
        const url = new URL(s, document.baseURI).href;
        if (!(await cache.match(url))) {
          const res = await fetch(url);
          if (!res.ok) throw new Error("download failed");
          await cache.put(url, res);
        }
        k++;
        setSaving(st => ({ ...st, [n]: k / c.slides.length }));
      }
      setSaved(prev => new Set(prev).add(n));
      return true;
    } catch (e) {
      setToast(`Couldn't save Class ${n}. Check your connection and try again.`);
      return false;
    } finally {
      setSaving(s => { const x = { ...s }; delete x[n]; return x; });
    }
  }, []);

  const removeClass = useCallback(async n => {
    const c = CLASSES[n - 1];
    try {
      const cache = await caches.open(SLIDE_CACHE);
      const stillNeeded = new Set(CLASSES.filter(x => x.n !== n && saved.has(x.n)).flatMap(x => x.slides));
      await Promise.all(c.slides.filter(s => !stillNeeded.has(s)).map(s => cache.delete(new URL(s, document.baseURI).href)));
    } catch (e) { /* ignore */ }
    setSaved(prev => { const s = new Set(prev); s.delete(n); return s; });
  }, [saved]);

  const saveAll = useCallback(async () => {
    let ok = 0;
    for (const c of CLASSES) if (c.slides.length && !saved.has(c.n)) { if (await saveClass(c.n)) ok++; else break; }
    if (ok) setToast(`Saved ${ok} class${ok > 1 ? "es" : ""} for offline.`);
  }, [saveClass, saved]);

  const value = useMemo(() => ({
    done, toggleDone, resetProgress,
    saved, saving, saveClass, removeClass, saveAll,
    toast, setToast,
    pct: Math.round(done.size / CLASSES.length * 100),
    nextUp: CLASSES.find(c => !done.has(c.n)) || CLASSES[0]
  }), [done, toggleDone, resetProgress, saved, saving, saveClass, removeClass, saveAll, toast]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export const SAVEABLE = CLASSES.filter(c => c.slides.length);
export const ALL_SLIDE_COUNT = ALL_SLIDES.length;

/* ---------- install prompt ---------- */
export const IN_APK = /EdgeAcademyApp/.test(navigator.userAgent);
export const IS_IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const standalone = () => window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;

export function useInstall() {
  const [evt, setEvt] = useState(null);
  const [installed, setInstalled] = useState(standalone() || IN_APK);
  useEffect(() => {
    const onPrompt = e => { e.preventDefault(); setEvt(e); };
    const onInstalled = () => { setInstalled(true); setEvt(null); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => { window.removeEventListener("beforeinstallprompt", onPrompt); window.removeEventListener("appinstalled", onInstalled); };
  }, []);
  const install = useCallback(async () => {
    if (!evt) return false;
    evt.prompt();
    const r = await evt.userChoice.catch(() => null);
    setEvt(null);
    return r?.outcome === "accepted";
  }, [evt]);
  return { canPrompt: !!evt, installed, install, ios: IS_IOS && !installed };
}
