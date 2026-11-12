"use client";

import { useEffect, useState } from "react";
import { backgroundEmojis as config } from "@/config/background-emojis";

type Item = { id: number; emoji: string; x: number; y: number; size: number; rotate: number };

/** Element s tímto atributem (sloupec s kartou v PageShell) se emoji vyhýbají. */
const AVOID_ATTR = "data-emoji-avoid";

// Globální počítadlo, ať jsou klíče unikátní i když React efekt spustí dvakrát (dev StrictMode).
let nextId = 0;

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

/** Najde náhodné místo ve viewportu, které nepřekrývá kartu. Když nenajde, vrátí null. */
function findSpot(size: number): { x: number; y: number } | null {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const avoid = document.querySelector(`[${AVOID_ATTR}]`)?.getBoundingClientRect();
  const gap = 8;

  for (let attempt = 0; attempt < 12; attempt++) {
    const x = randomBetween(0, Math.max(0, w - size));
    const y = randomBetween(0, Math.max(0, h - size));
    const overlaps =
      avoid &&
      x + size > avoid.left - gap &&
      x < avoid.right + gap &&
      y + size > avoid.top - gap &&
      y < avoid.bottom + gap;
    if (!overlaps) return { x, y };
  }
  return null;
}

export function BackgroundEmojis() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const total = config.fadeInMs + config.visibleMs + config.fadeOutMs;
    const timeouts = new Set<ReturnType<typeof setTimeout>>();
    let onScreen = 0;

    const spawn = () => {
      if (document.hidden || onScreen >= config.maxOnScreen || config.emojis.length === 0) return;
      const size = Math.round(randomBetween(config.minSizePx, config.maxSizePx));
      const spot = findSpot(size);
      if (!spot) return;

      const item: Item = {
        id: nextId++,
        emoji: config.emojis[Math.floor(Math.random() * config.emojis.length)],
        size,
        rotate: Math.round(randomBetween(-20, 20)),
        ...spot,
      };
      onScreen++;
      setItems((prev) => [...prev, item]);

      const t = setTimeout(() => {
        timeouts.delete(t);
        onScreen--;
        setItems((prev) => prev.filter((i) => i.id !== item.id));
      }, total);
      timeouts.add(t);
    };

    spawn();
    const interval = setInterval(spawn, config.spawnEveryMs);
    return () => {
      clearInterval(interval);
      timeouts.forEach(clearTimeout);
      setItems([]);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {items.map((item) => (
        <span
          key={item.id}
          className="absolute select-none leading-none"
          style={{
            left: item.x,
            top: item.y,
            fontSize: item.size,
            opacity: 0,
            transform: `rotate(${item.rotate}deg)`,
          }}
          ref={(el) => {
            if (!el || el.dataset.animated) return;
            el.dataset.animated = "1";
            const total = config.fadeInMs + config.visibleMs + config.fadeOutMs;
            const rotate = `rotate(${item.rotate}deg)`;
            el.animate(
              [
                { opacity: 0, transform: `${rotate} scale(0.6)` },
                { opacity: config.opacity, transform: `${rotate} scale(1)`, offset: config.fadeInMs / total },
                {
                  opacity: config.opacity,
                  transform: `${rotate} scale(1)`,
                  offset: (config.fadeInMs + config.visibleMs) / total,
                },
                { opacity: 0, transform: `${rotate} scale(0.8)` },
              ],
              { duration: total, easing: "ease-in-out", fill: "forwards" },
            );
          }}
        >
          {item.emoji}
        </span>
      ))}
    </div>
  );
}
