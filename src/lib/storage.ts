import {
  clamp,
  DEFAULT_MASTER_VOLUME,
  DEFAULT_SONG_VOLUME,
  MASTER_VOLUME_MAX,
  SONG_VOLUME_MAX,
} from './volume'

const SETTINGS_KEY = 'ylml.settings.v1'
const SONG_VOLUMES_KEY = 'ylml.songVolumes.v1'

type KeyValueStore = Pick<Storage, 'getItem' | 'setItem'>

export interface Settings {
  masterVolume: number
  muted: boolean
}

/** Song id -> volume. Songs at the default volume are left out. */
export type SongVolumes = Record<string, number>

export const DEFAULT_SETTINGS: Settings = {
  masterVolume: DEFAULT_MASTER_VOLUME,
  muted: false,
}

function defaultStore(): KeyValueStore {
  return window.localStorage
}

function read(key: string, store: () => KeyValueStore): unknown {
  try {
    const raw = store().getItem(key)
    return raw === null ? null : JSON.parse(raw)
  } catch {
    return null
  }
}

function write(key: string, value: unknown, store: () => KeyValueStore): void {
  try {
    store().setItem(key, JSON.stringify(value))
  } catch {
    // Storage can be full or disabled (e.g. private browsing); settings just won't persist.
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function loadSettings(store = defaultStore): Settings {
  const saved = read(SETTINGS_KEY, store)
  if (!isRecord(saved)) return { ...DEFAULT_SETTINGS }
  return {
    masterVolume:
      typeof saved.masterVolume === 'number' && Number.isFinite(saved.masterVolume)
        ? clamp(saved.masterVolume, 0, MASTER_VOLUME_MAX)
        : DEFAULT_SETTINGS.masterVolume,
    muted: typeof saved.muted === 'boolean' ? saved.muted : DEFAULT_SETTINGS.muted,
  }
}

export function saveSettings(settings: Settings, store = defaultStore): void {
  write(SETTINGS_KEY, settings, store)
}

export function loadSongVolumes(store = defaultStore): SongVolumes {
  const saved = read(SONG_VOLUMES_KEY, store)
  if (!isRecord(saved)) return {}
  const volumes: SongVolumes = {}
  for (const [id, volume] of Object.entries(saved)) {
    if (typeof volume !== 'number' || !Number.isFinite(volume)) continue
    const clamped = clamp(volume, 0, SONG_VOLUME_MAX)
    if (clamped !== DEFAULT_SONG_VOLUME) volumes[id] = clamped
  }
  return volumes
}

export function saveSongVolumes(volumes: SongVolumes, store = defaultStore): void {
  write(SONG_VOLUMES_KEY, volumes, store)
}
