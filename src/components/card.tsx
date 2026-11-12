import type { CSSProperties, ReactNode } from "react";

const BULBS = ["#ef4444", "#facc15", "#22c55e", "#3b82f6", "#f97316", "#ec4899"];

function Lights() {
  return (
    <div className="lights" aria-hidden="true">
      {Array.from({ length: 11 }, (_, i) => (
        <span
          key={i}
          className="bulb"
          style={
            {
              "--c": BULBS[i % BULBS.length],
              "--d": `${(i * 0.37) % 1.8}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

export function PageShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <main className="flex flex-1 flex-col items-center px-4 py-8 sm:py-14">
      <div className={`w-full ${wide ? "max-w-3xl" : "max-w-md"}`}>
        <Lights />
        <div className="overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/40 ring-4 ring-yellow-400/70">
          <div className="candy-stripe h-3" />
          <div className="p-6 sm:p-8">{children}</div>
        </div>
        <p className="mt-6 text-center text-sm text-green-100/80">
          🎄 Veselé Vánoce 🎄
        </p>
      </div>
    </main>
  );
}

/** Medvěd se Santovou čepicí. */
export function BearLogo({ size = 72 }: { size?: number }) {
  return (
    <div className="relative mx-auto" style={{ width: size * 1.25, height: size * 1.15 }} aria-hidden="true">
      <span
        className="absolute bottom-0 left-1/2 -translate-x-1/2 leading-none"
        style={{ fontSize: size }}
      >
        🐻
      </span>
      <svg
        viewBox="0 0 64 48"
        className="absolute"
        style={{ width: size * 0.82, top: -size * 0.02, left: size * 0.3, transform: "rotate(14deg)" }}
      >
        <path d="M8 38 Q 20 4 46 6 Q 60 8 57 20 L 54 38 Z" fill="#dc2626" />
        <path d="M46 6 Q 60 8 57 20" fill="none" stroke="#b91c1c" strokeWidth="2" />
        <circle cx="57" cy="20" r="6.5" fill="#fff" />
        <rect x="3" y="33" width="58" height="12" rx="6" fill="#fff" />
      </svg>
    </div>
  );
}

export function Title({ children }: { children: ReactNode }) {
  return <h1 className="font-festive text-4xl text-red-700 sm:text-5xl">{children}</h1>;
}

export function Notice({
  tone = "info",
  children,
}: {
  tone?: "info" | "success" | "error";
  children: ReactNode;
}) {
  const styles = {
    info: "border-amber-200 bg-amber-50 text-amber-900",
    success: "border-green-200 bg-green-50 text-green-900",
    error: "border-red-200 bg-red-50 text-red-900",
  }[tone];
  return <div className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>{children}</div>;
}
