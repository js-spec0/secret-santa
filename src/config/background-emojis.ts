/**
 * Nastavení vánočních emoji, která se objevují v pozadí (mimo kartu s textem).
 * Všechny časy jsou v milisekundách.
 *
 * Jedno emoji na stránce:  fadeInMs  →  visibleMs  →  fadeOutMs
 * (celkem tedy fadeInMs + visibleMs + fadeOutMs)
 */
export const backgroundEmojis = {
  /** Ze kterých emoji se náhodně vybírá. */
  emojis: ["🎄", "🎁", "⭐", "🔔", "🦌", "🍪", "🧦", "❄️", "☃️", "🎅", "🕯️", "🍬", "🐻"],

  /** Jak dlouho je emoji plně vidět (mezi fade in a fade out). */
  visibleMs: 4000,

  /** Délka postupného objevení. */
  fadeInMs: 800,

  /** Délka postupného zmizení. */
  fadeOutMs: 800,

  /** Četnost: jak často se objeví nové emoji (menší číslo = víc emoji). */
  spawnEveryMs: 700,

  /** Maximální počet emoji najednou na obrazovce. */
  maxOnScreen: 14,

  /** Velikost emoji v pixelech (náhodně mezi min a max). */
  minSizePx: 28,
  maxSizePx: 56,

  /** Neprůhlednost plně viditelného emoji (0–1). */
  opacity: 0.85,
};
