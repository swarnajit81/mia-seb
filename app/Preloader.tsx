"use client";

import { useEffect, useRef, useState } from "react";

// Deterministic star positions — no Math.random() to avoid hydration mismatch
const STARS = Array.from({ length: 42 }, (_, i) => ({
  id:    i,
  left:  (i * 37 + 11) % 100,
  top:   (i * 61 + 7)  % 68,
  delay: ((i * 13) % 25) / 10,
  size:  9 + (i * 7) % 11,
}));

// Deterministic piano keys
const WHITE_KEYS = Array.from({ length: 14 }, (_, i) => i);
const BLACK_KEY_POSITIONS = [1, 2, 4, 5, 6, 8, 9, 11, 12, 13]; // which gaps have black keys

export default function Preloader({ onDone }: { onDone: () => void }) {
  const [progress,   setProgress]  = useState(0);
  const [fadeOut,    setFadeOut]   = useState(false);
  const [subtitle,   setSubtitle]  = useState(false);
  const doneRef = useRef(false);

  useEffect(() => {
    // Subtitle fades in after a beat
    const t = setTimeout(() => setSubtitle(true), 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let loaded = 0;
    const total = 2;

    function onLoad() {
      loaded++;
      setProgress((loaded / total) * 100);
      if (loaded >= total && !doneRef.current) finish();
    }

    function finish() {
      doneRef.current = true;
      setTimeout(() => {
        setFadeOut(true);
        setTimeout(onDone, 650);
      }, 400);
    }

    // Track background image
    const img = new Image();
    img.src = "/bg.jpg";
    img.onload  = onLoad;
    img.onerror = onLoad;

    // Track audio
    const audio = new Audio();
    audio.src = "/theme.mp3";
    audio.addEventListener("canplaythrough", onLoad, { once: true });
    audio.addEventListener("error", onLoad, { once: true });
    audio.load();

    // Safety fallback — never block more than 6 s
    const fallback = setTimeout(() => { if (!doneRef.current) finish(); }, 6000);

    return () => clearTimeout(fallback);
  }, [onDone]);

  return (
    <div className={`pl${fadeOut ? " pl-out" : ""}`}>

      {/* Twinkling stars */}
      <div className="pl-stars" aria-hidden>
        {STARS.map((s) => (
          <span
            key={s.id}
            className="pl-star"
            style={{
              left:            `${s.left}%`,
              top:             `${s.top}%`,
              fontSize:        `${s.size}px`,
              animationDelay:  `${s.delay}s`,
            }}
          >✦</span>
        ))}
      </div>

      {/* Centre content */}
      <div className="pl-body">
        <p className="pl-eyebrow">a night under the stars</p>
        <h1 className="pl-title">Mia &amp; Seb</h1>
        <p className={`pl-sub${subtitle ? " pl-sub-in" : ""}`}>
          City of Stars, are you shining just for me?
        </p>

        {/* Loading bar */}
        <div className="pl-bar-wrap">
          <div className="pl-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Animated piano keys */}
      <div className="pl-piano" aria-hidden>
        {WHITE_KEYS.map((k) => (
          <div
            key={k}
            className="pl-white-key"
            style={{ animationDelay: `${k * 0.07}s` }}
          />
        ))}
        {BLACK_KEY_POSITIONS.map((pos) => (
          <div
            key={pos}
            className="pl-black-key"
            style={{ left: `calc(${pos} * (100% / 14) - 1.4%)`, animationDelay: `${pos * 0.07 + 0.04}s` }}
          />
        ))}
      </div>

    </div>
  );
}
