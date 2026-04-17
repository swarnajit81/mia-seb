"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Preloader from "./Preloader";

type Confetto = { id: number; left: number; delay: number; color: string; emoji: string };

const TRAIL_EMOJIS    = ["⭐", "🌟", "✨", "🎵", "🎶", "💫", "🌙"];
const CONFETTI_EMOJIS = ["⭐", "🌟", "🎵", "🎶", "💫", "🌃", "🎹", "🌙"];
const CONFETTI_COLORS = ["#f5c518", "#48cae4", "#a78bfa", "#ffe066", "#90e0ef"];

const NO_TAUNTS = [
  "No",
  "Are you sure?",
  "Really?",
  "Please reconsider 🥺",
  "Think again!",
  "You don't mean it...",
  "Come on!",
  "One more chance?",
  "Pretty please?",
  "Last try 🥺",
];


export default function Page() {
  const [yesClicked, setYesClicked] = useState(false);
  const [noIndex,    setNoIndex]    = useState(0);
  const [yesScale,   setYesScale]   = useState(1);
  const [confetti,   setConfetti]   = useState<Confetto[]>([]);
  const [playing,    setPlaying]    = useState(false);
  const [loaded,     setLoaded]     = useState(false);

  const cursorDotRef      = useRef<HTMLDivElement>(null);
  const cursorRingRef     = useRef<HTMLDivElement>(null);
  const trailContainerRef = useRef<HTMLDivElement>(null);
  const lastHeartAtRef    = useRef(0);
  const noBtnRef          = useRef<HTMLButtonElement>(null);
  const yesClickedRef     = useRef(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio("/theme.mp3");
    audio.loop = true;
    audioRef.current = audio;
    return () => { audio.pause(); };
  }, []);

  useEffect(() => {
    if (playing) audioRef.current?.play();
    else         audioRef.current?.pause();
  }, [playing]);

  const toggleMusic = useCallback(() => setPlaying((p) => !p), []);

  // Mouse tracking — direct DOM, no re-renders
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (cursorDotRef.current) {
        cursorDotRef.current.style.left = e.clientX + "px";
        cursorDotRef.current.style.top  = e.clientY + "px";
      }
      if (cursorRingRef.current) {
        cursorRingRef.current.style.left = e.clientX + "px";
        cursorRingRef.current.style.top  = e.clientY + "px";
      }

      const now = performance.now();
      if (now - lastHeartAtRef.current > 55) {
        lastHeartAtRef.current = now;
        const container = trailContainerRef.current;
        if (container) {
          const emoji = TRAIL_EMOJIS[Math.floor(Math.random() * TRAIL_EMOJIS.length)];
          const scale = 0.7 + Math.random() * 0.8;
          const span  = document.createElement("span");
          span.className   = "trail";
          span.style.left  = (e.clientX + (Math.random() - 0.5) * 24) + "px";
          span.style.top   = (e.clientY + (Math.random() - 0.5) * 24) + "px";
          span.style.transform = `translate(-50%, -50%) scale(${scale})`;
          span.textContent = emoji;
          container.appendChild(span);
          window.setTimeout(() => span.remove(), 1100);
        }
      }

      const btn = noBtnRef.current;
      if (btn && !yesClickedRef.current) {
        const r    = btn.getBoundingClientRect();
        const dist = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
        if (dist < 140) {
          const pad  = 30;
          const maxX = window.innerWidth  - r.width  - pad;
          const maxY = window.innerHeight - r.height - pad;
          let nx = Math.random() * (maxX - pad) + pad;
          let ny = Math.random() * (maxY - pad) + pad;
          if (Math.hypot(nx - e.clientX, ny - e.clientY) < 220) {
            nx = (e.clientX + window.innerWidth  / 2) % maxX;
            ny = (e.clientY + window.innerHeight / 2) % maxY;
          }
          btn.style.position = "fixed";
          btn.style.left     = nx + "px";
          btn.style.top      = ny + "px";
          setNoIndex((i) => Math.min(i + 1, NO_TAUNTS.length - 1));
        }
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const onYesHover = useCallback(() => setYesScale((s) => Math.min(s * 1.12, 3.5)), []);

  const sayYes = useCallback(() => {
    yesClickedRef.current = true;
    setYesClicked(true);
    setConfetti(Array.from({ length: 80 }, (_, i) => ({
      id:    i,
      left:  Math.random() * 100,
      delay: Math.random() * 1.2,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      emoji: CONFETTI_EMOJIS[i % CONFETTI_EMOJIS.length],
    })));
  }, []);

  return (
    <>
    {!loaded && <Preloader onDone={() => setLoaded(true)} />}
    <main style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
<div className="blob blob1" />
      <div className="blob blob2" />
      <div className="blob blob3" />

      <div ref={trailContainerRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 100 }} />
      <div ref={cursorDotRef}  className="cursor-dot"  style={{ left: -100, top: -100 }} aria-hidden />
      <div ref={cursorRingRef} className="cursor-ring" style={{ left: -100, top: -100 }} aria-hidden />

      <button className="music-btn" onClick={toggleMusic} aria-label={playing ? "Pause music" : "Play music"}>
        {playing ? "🎵" : "🎹"}
      </button>

      {!yesClicked ? (
        <div className="stage">
          <h1 className="question">
            Mia, would you dance with Seb under the stars on{" "}
            <span className="sunday">Sunday</span>?
          </h1>
          <p className="sub">(somewhere in the crowd you found me 🎵)</p>

          <div className="btn-row">
            <button
              className="yes-btn"
              onMouseEnter={onYesHover}
              onClick={sayYes}
              style={{ transform: `scale(${yesScale}) rotate(${(yesScale - 1) * 4}deg)` }}
            >
              Yes 🌟
            </button>
            <button ref={noBtnRef} className="no-btn" onClick={(e) => e.preventDefault()}>
              {NO_TAUNTS[noIndex]}
            </button>
          </div>
        </div>
      ) : (
        <div className="stage celebrate">
          <h1 className="yay">It&apos;s happening! 🌟</h1>
          <p className="plan">
            Mia &amp; Seb. Sunday, <br />
            Seb picks you up at&nbsp;<span className="time">11am</span> 🎵
          </p>
          <div className="hearts-burst">
            <span>⭐</span><span>🎵</span><span>🌙</span><span>🎶</span><span>✨</span>
          </div>
        </div>
      )}

      {confetti.map((c) => (
        <span key={c.id} className="confetti"
          style={{ left: `${c.left}%`, color: c.color, animationDelay: `${c.delay}s` }}>
          {c.emoji}
        </span>
      ))}
    </main>
    </>
  );
}
