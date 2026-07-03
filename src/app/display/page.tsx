"use client";

import { useEffect, useRef, useState } from "react";
import type { DisplayState } from "@/types";

export default function DisplayPage() {
  const [state, setState] = useState<DisplayState | null>(null);
  const [idx, setIdx] = useState(0);
  const [failed, setFailed] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);
  const versionRef = useRef(0);
  const idxRef = useRef(0);
  const nextTimer = useRef<any>(null);
  const refreshTimer = useRef<any>(null);
  const failTimer = useRef<any>(null);

  useEffect(() => { idxRef.current = idx; }, [idx]);

  async function poll() {
    try {
      const r = await fetch("/api/display-state", { cache: "no-store" });
      const s: DisplayState = await r.json();
      if (s.version !== versionRef.current) {
        versionRef.current = s.version;
        setState((prev) => {
          if (!prev) { setIdx(0); return s; }
          // If current dashboard no longer active/exists, advance
          const currentId = prev.dashboards[idxRef.current]?.id;
          const existsIdx = s.dashboards.findIndex((d) => d.id === currentId);
          if (existsIdx === -1) setIdx(0);
          else setIdx(existsIdx);
          return s;
        });
      }
    } catch {}
  }

  useEffect(() => {
    poll();
    const t = setInterval(poll, 5000);
    return () => clearInterval(t);
  }, []);

  const current = state?.dashboards[idx];
  const zoom = state?.config.zoom ?? 100;

  // Advance timer
  useEffect(() => {
    if (!current) return;
    if (nextTimer.current) clearTimeout(nextTimer.current);
    nextTimer.current = setTimeout(() => {
      setIdx((i) => (state!.dashboards.length ? (i + 1) % state!.dashboards.length : 0));
    }, Math.max(5, current.duration) * 1000);
    return () => nextTimer.current && clearTimeout(nextTimer.current);
  }, [current?.id, current?.duration, state?.dashboards.length]);

  // Refresh timer
  useEffect(() => {
    if (refreshTimer.current) clearInterval(refreshTimer.current);
    const interval = state?.config.refreshInterval ?? 0;
    if (interval > 0) {
      refreshTimer.current = setInterval(() => setReloadTick((t) => t + 1), interval * 1000);
    }
    return () => refreshTimer.current && clearInterval(refreshTimer.current);
  }, [state?.config.refreshInterval]);

  // Fail timeout
  useEffect(() => {
    setFailed(false);
    if (failTimer.current) clearTimeout(failTimer.current);
    if (current) {
      failTimer.current = setTimeout(() => setFailed(true), 15000);
    }
    return () => failTimer.current && clearTimeout(failTimer.current);
  }, [current?.id, reloadTick]);

  if (!state || !current) {
    return <div style={{ background: "#000", width: "100vw", height: "100vh", cursor: "none" }} />;
  }

  if (failed) {
    return (
      <div style={{ background: "#000", width: "100vw", height: "100vh", cursor: "none" }}>
        {state.config.fallbackImageUrl ? (
          <img src={state.config.fallbackImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : null}
      </div>
    );
  }

  return (
    <div style={{ background: "#000", width: "100vw", height: "100vh", overflow: "hidden", cursor: "none" }}>
      <div style={{ width: `${10000 / zoom}%`, height: `${10000 / zoom}%`, transform: `scale(${zoom / 100})`, transformOrigin: "top left" }}>
        <iframe
          key={`${current.id}-${reloadTick}`}
          src={current.url}
          onLoad={() => { failTimer.current && clearTimeout(failTimer.current); setFailed(false); }}
          onError={() => setFailed(true)}
          style={{ width: "100%", height: "100%", border: 0 }}
          allow="fullscreen"
        />
      </div>
    </div>
  );
}
