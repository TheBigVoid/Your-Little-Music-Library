/** Master volume goes from silent (0) to full (1). */
export const MASTER_VOLUME_MAX = 1

/**
 * Per-song volume can go above 100% so quiet recordings can be boosted
 * to sit alongside louder ones.
 */
export const SONG_VOLUME_MAX = 2

export const DEFAULT_MASTER_VOLUME = 0.8
export const DEFAULT_SONG_VOLUME = 1

export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min
  return Math.min(max, Math.max(min, value))
}

/** Rounds to whole percent so slider values don't accumulate float noise. */
export function roundVolume(value: number): number {
  return Math.round(value * 100) / 100
}

/** The loudness a song actually plays at: its own volume scaled by the master volume. */
export function effectiveVolume(master: number, song: number, muted = false): number {
  if (muted) return 0
  return roundVolume(clamp(master, 0, MASTER_VOLUME_MAX) * clamp(song, 0, SONG_VOLUME_MAX))
}

export function toPercent(value: number): string {
  return `${Math.round(value * 100)}%`
}
