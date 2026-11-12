"use client";

import { useState } from "react";
import type { CSSProperties } from "react";

// Pevně dané směry konfet (bez Math.random, ať server i klient vykreslí totéž).
const CONFETTI = ["✨", "🎉", "⭐", "❄️", "🎊", "✨", "⭐", "🎉", "❄️", "🎊", "✨", "⭐"].map(
  (emoji, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const dist = 110 + (i % 3) * 35;
    return {
      emoji,
      style: {
        "--dx": `${Math.round(Math.cos(angle) * dist)}px`,
        "--dy": `${Math.round(Math.sin(angle) * dist * 0.8 - 60)}px`,
        "--rot": `${(i % 2 ? 1 : -1) * (90 + i * 20)}deg`,
        "--delay": `${0.3 + (i % 4) * 0.05}s`,
      } as CSSProperties,
    };
  },
);

export function GiftReveal({ name, receiverName }: { name: string; receiverName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="text-center">
      <p className="text-gray-600">
        Ahoj <span className="font-semibold text-gray-800">{name}</span>,
      </p>
      <p className="mt-1 h-7 text-lg font-medium text-green-800">
        {open ? "letos obdarováváš:" : "rozbal svůj dárek 👇"}
      </p>

      <button
        type="button"
        className="gift mt-2"
        data-open={open}
        disabled={open}
        onClick={() => setOpen(true)}
        aria-label={open ? `Obdarováváš: ${receiverName}` : "Rozbalit dárek"}
      >
        <span className="gift-name rounded-2xl bg-white px-5 py-2 font-festive text-3xl text-red-700 shadow-lg ring-2 ring-yellow-400 sm:text-5xl">
          {receiverName}
        </span>
        <span className="gift-lid">
          <span className="gift-bow">🎀</span>
        </span>
        <span className="gift-box" />
        {open &&
          CONFETTI.map((c, i) => (
            <span key={i} className="confetti" style={c.style}>
              {c.emoji}
            </span>
          ))}
      </button>

      <p
        className={`mt-6 text-sm text-gray-500 transition-opacity duration-700 ${open ? "opacity-100 delay-1000" : "opacity-0"}`}
      >
        Psst… nikomu to neprozraď. 🤫🐻
      </p>
    </div>
  );
}
