"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Heart = { id: number; x: number; y: number; emoji: string; scale: number };
type Confetto = { id: number; left: number; delay: number; color: string; emoji: string };

const TRAIL_EMOJIS = ["💖", "💗", "💓", "💘", "💞", "✨", "🌸"];
const CONFETTI_EMOJIS = ["💖", "💘", "💕", "🌸", "✨", "🌷", "🎉", "💝"];
const CONFETTI_COLORS = ["#ff6b9d", "#ffd166", "#06d6a0", "#ab7fff", "#ff8c42"];

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
  const [cursor, setCursor] = useState({ x: -100, y: -100 });
  const [hearts, setHearts] = useState<Heart[]>([]);
  const [yesClicked, setYesClicked] = useState(false);
  const [noIndex, setNoIndex] = useState(0);
  const [noPos, setNoPos] = useState<{ x: number; y: number } | null>(null);
  const [yesScale, setYesScale] = useState(1);
  const [confetti, setConfetti] = useState<Confetto[]>([]);

  const heartIdRef = useRef(0);
  const lastHeartAtRef = useRef(0);
  const noBtnRef = useRef<HTMLButtonElement | null>(null);

  // Track mouse + emit heart trail
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setCursor({ x: e.clientX, y: e.clientY });

      const now = performance.now();
      if (now - lastHeartAtRef.current > 55) {
        lastHeartAtRef.current = now;
        const id = heartIdRef.current++;
        const emoji = TRAIL_EMOJIS[Math.floor(Math.random() * TRAIL_EMOJIS.length)];
        const scale = 0.7 + Math.random() * 0.8;
        const jitterX = e.clientX + (Math.random() - 0.5) * 24;
        const jitterY = e.clientY + (Math.random() - 0.5) * 24;
        setHearts((prev) => [...prev, { id, x: jitterX, y: jitterY, emoji, scale }]);
        window.setTimeout(() => {
          setHearts((prev) => prev.filter((h) => h.id !== id));
        }, 1100);
      }

      // Dodge logic for the No button
      const btn = noBtnRef.current;
      if (btn && !yesClicked) {
        const r = btn.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);
        if (dist < 140) {
          const pad = 30;
          const maxX = window.innerWidth - r.width - pad;
          const maxY = window.innerHeight - r.height - pad;
          let nx = Math.random() * (maxX - pad) + pad;
          let ny = Math.random() * (maxY - pad) + pad;
          // keep it away from current cursor
          if (Math.hypot(nx - e.clientX, ny - e.clientY) < 220) {
            nx = (e.clientX + window.innerWidth / 2) % maxX;
            ny = (e.clientY + window.innerHeight / 2) % maxY;
          }
          setNoPos({ x: nx, y: ny });
          setNoIndex((i) => Math.min(i + 1, NO_TAUNTS.length - 1));
        }
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [yesClicked]);

  // Yes button grows with every hover
  const onYesHover = useCallback(() => {
    setYesScale((s) => Math.min(s * 1.12, 3.5));
  }, []);

  const sayYes = useCallback(() => {
    setYesClicked(true);
    const pieces: Confetto[] = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 1.2,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      emoji: CONFETTI_EMOJIS[i % CONFETTI_EMOJIS.length],
    }));
    setConfetti(pieces);
  }, []);

  return (
    <main style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      {/* Floating background blobs */}
      <div className="blob blob1" />
      <div className="blob blob2" />
      <div className="blob blob3" />

      {/* Heart trail */}
      {hearts.map((h) => (
        <span
          key={h.id}
          className="trail"
          style={{
            left: h.x,
            top: h.y,
            transform: `translate(-50%, -50%) scale(${h.scale})`,
          }}
        >
          {h.emoji}
        </span>
      ))}

      {/* Custom cursor */}
      <div
        className="cursor-dot"
        style={{ left: cursor.x, top: cursor.y }}
        aria-hidden
      />
      <div
        className="cursor-ring"
        style={{ left: cursor.x, top: cursor.y }}
        aria-hidden
      />

      {!yesClicked ? (
        <div className="stage">
          <h1 className="question">
            Would you go out with me on{" "}
            <span className="sunday">Sunday</span>?
          </h1>
          <p className="sub">(pick carefully 😉)</p>

          <div className="btn-row">
            <button
              className="yes-btn"
              onMouseEnter={onYesHover}
              onClick={sayYes}
              style={{ transform: `scale(${yesScale}) rotate(${(yesScale - 1) * 4}deg)` }}
            >
              Yes 💘
            </button>

            <button
              ref={noBtnRef}
              className="no-btn"
              style={
                noPos
                  ? { position: "fixed", left: noPos.x, top: noPos.y }
                  : undefined
              }
              onClick={(e) => e.preventDefault()}
            >
              {NO_TAUNTS[noIndex]}
            </button>
          </div>
        </div>
      ) : (
        <div className="stage celebrate">
          <h1 className="yay">Yay!! 🎉💕</h1>
          <p className="plan">
            It's a date. Sunday it is. <br />
            I'll pick you up at&nbsp;
            <span className="time">6pm</span> ✨
          </p>
          <div className="hearts-burst">
            <span>💖</span><span>💘</span><span>💕</span><span>💞</span><span>💗</span>
          </div>
        </div>
      )}

      {/* Confetti */}
      {confetti.map((c) => (
        <span
          key={c.id}
          className="confetti"
          style={{
            left: `${c.left}%`,
            color: c.color,
            animationDelay: `${c.delay}s`,
          }}
        >
          {c.emoji}
        </span>
      ))}

      <style jsx>{`
        .stage {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 0 24px;
        }
        .question {
          font-size: clamp(2rem, 6vw, 4.5rem);
          font-weight: 800;
          color: #5b1a3a;
          text-shadow: 0 4px 24px rgba(255, 255, 255, 0.45);
          letter-spacing: -0.02em;
          animation: floaty 4s ease-in-out infinite;
        }
        .sunday {
          background: linear-gradient(90deg, #ff477e, #ff8c42, #ffd166);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          display: inline-block;
          animation: wiggle 2.4s ease-in-out infinite;
        }
        .sub {
          margin-top: 16px;
          color: #6b1d44;
          font-size: clamp(1rem, 2vw, 1.2rem);
          opacity: 0.8;
        }
        .btn-row {
          margin-top: 48px;
          display: flex;
          gap: 28px;
          align-items: center;
          flex-wrap: wrap;
          justify-content: center;
        }
        .yes-btn {
          border: none;
          padding: 18px 38px;
          font-size: 1.3rem;
          font-weight: 700;
          color: white;
          background: linear-gradient(135deg, #ff477e, #ff6b9d);
          border-radius: 999px;
          box-shadow: 0 12px 30px rgba(255, 71, 126, 0.45),
            inset 0 -3px 0 rgba(0, 0, 0, 0.15);
          transition: transform 180ms cubic-bezier(0.2, 0.9, 0.3, 1.4),
            box-shadow 180ms ease;
          transform-origin: center;
        }
        .yes-btn:hover {
          box-shadow: 0 18px 40px rgba(255, 71, 126, 0.55);
        }
        .no-btn {
          border: 2px solid #b84a73;
          background: rgba(255, 255, 255, 0.7);
          color: #b84a73;
          padding: 14px 28px;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 999px;
          backdrop-filter: blur(6px);
          transition: left 280ms cubic-bezier(0.2, 0.9, 0.3, 1.4),
            top 280ms cubic-bezier(0.2, 0.9, 0.3, 1.4),
            background 180ms ease;
        }
        .no-btn:hover {
          background: rgba(255, 255, 255, 0.95);
        }

        .celebrate .yay {
          font-size: clamp(2.6rem, 8vw, 6rem);
          font-weight: 900;
          color: #5b1a3a;
          background: linear-gradient(90deg, #ff477e, #ffd166, #06d6a0, #ab7fff);
          background-size: 300% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: rainbow 3.5s linear infinite, pop 700ms ease-out;
        }
        .plan {
          margin-top: 20px;
          font-size: clamp(1.1rem, 2.2vw, 1.6rem);
          color: #5b1a3a;
          line-height: 1.5;
        }
        .time {
          font-weight: 800;
          color: #ff477e;
        }
        .hearts-burst {
          margin-top: 32px;
          font-size: clamp(2rem, 5vw, 3.2rem);
          display: flex;
          gap: 12px;
        }
        .hearts-burst span {
          animation: bob 1.4s ease-in-out infinite;
        }
        .hearts-burst span:nth-child(2) { animation-delay: 0.15s; }
        .hearts-burst span:nth-child(3) { animation-delay: 0.3s; }
        .hearts-burst span:nth-child(4) { animation-delay: 0.45s; }
        .hearts-burst span:nth-child(5) { animation-delay: 0.6s; }

        @keyframes floaty {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
        @keyframes rainbow {
          0% { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }
        @keyframes pop {
          0% { transform: scale(0.4); opacity: 0; }
          60% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes bob {
          0%, 100% { transform: translateY(0) rotate(-6deg); }
          50% { transform: translateY(-14px) rotate(6deg); }
        }
      `}</style>

      <style jsx global>{`
        .cursor-dot {
          position: fixed;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #ff1f6b;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 9999;
          box-shadow: 0 0 12px rgba(255, 31, 107, 0.75);
          transition: transform 80ms ease-out;
        }
        .cursor-ring {
          position: fixed;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 2px solid rgba(255, 31, 107, 0.65);
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 9998;
          transition: transform 220ms ease-out, width 200ms ease, height 200ms ease;
          animation: ringPulse 1.6s ease-in-out infinite;
        }
        @keyframes ringPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255, 31, 107, 0.35); }
          50% { box-shadow: 0 0 0 10px rgba(255, 31, 107, 0); }
        }

        .trail {
          position: fixed;
          pointer-events: none;
          z-index: 100;
          font-size: 22px;
          animation: trailFade 1.1s ease-out forwards;
          will-change: transform, opacity;
        }
        @keyframes trailFade {
          0%   { opacity: 1; }
          100% { opacity: 0; transform: translate(-50%, -120%) scale(0.4) rotate(20deg); }
        }

        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.55;
          z-index: 1;
          animation: drift 18s ease-in-out infinite;
        }
        .blob1 { width: 420px; height: 420px; background: #ff9ec7; top: -120px; left: -80px; }
        .blob2 { width: 380px; height: 380px; background: #ffd3a5; bottom: -100px; right: -60px; animation-delay: -6s; }
        .blob3 { width: 300px; height: 300px; background: #c5a3ff; top: 50%; left: 60%; animation-delay: -12s; }

        @keyframes drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -30px) scale(1.08); }
          66% { transform: translate(-30px, 40px) scale(0.95); }
        }

        .confetti {
          position: fixed;
          top: -40px;
          font-size: 22px;
          animation: fall 3.5s linear forwards;
          pointer-events: none;
          z-index: 50;
        }
        @keyframes fall {
          0%   { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0.9; }
        }
      `}</style>
    </main>
  );
}
