"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Stop } from "@phosphor-icons/react";

interface Props {
  valueMins: number | undefined;
  onChange: (mins: number) => void;
}

export function BrewTimer({ valueMins, onChange }: Props) {
  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  function tick() {
    if (startRef.current === null) return;
    setElapsedMs(Date.now() - startRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }

  function start() {
    startRef.current = Date.now() - elapsedMs;
    setRunning(true);
    rafRef.current = requestAnimationFrame(tick);
  }

  function stop() {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    setRunning(false);
    const mins = elapsedMs / 60000;
    onChange(Math.round(mins * 100) / 100);
  }

  function reset() {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    setRunning(false);
    setElapsedMs(0);
    startRef.current = null;
  }

  const totalMs = running || elapsedMs > 0 ? elapsedMs : (valueMins ?? 0) * 60000;
  const mins = Math.floor(totalMs / 60000);
  const secs = Math.floor((totalMs % 60000) / 1000);
  const display = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm text-stone-700 w-12 tabular-nums">{display}</span>
      {!running ? (
        <button
          type="button"
          onClick={start}
          className="flex items-center gap-1 px-2 py-1 text-xs border border-stone-300 rounded text-stone-600 hover:bg-stone-50 transition-colors"
        >
          <Play size={11} weight="fill" />
          Start
        </button>
      ) : (
        <button
          type="button"
          onClick={stop}
          className="flex items-center gap-1 px-2 py-1 text-xs border border-red-200 rounded text-red-600 hover:bg-red-50 transition-colors"
        >
          <Stop size={11} weight="fill" />
          Stop
        </button>
      )}
      {(elapsedMs > 0 || running) && (
        <button
          type="button"
          onClick={reset}
          className="text-xs text-stone-400 hover:text-stone-600"
        >
          Reset
        </button>
      )}
    </div>
  );
}
