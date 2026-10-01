import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS, loadSettings, loadSongVolumes, saveSettings, saveSongVolumes } from './storage'

function memoryStore(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial))
  const store = {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  }
  return () => store
}

describe('settings', () => {
  it('round-trips through storage', () => {
    const store = memoryStore()
    saveSettings({ masterVolume: 0.35, muted: true }, store)
    expect(loadSettings(store)).toEqual({ masterVolume: 0.35, muted: true })
  })

  it('falls back to defaults when nothing is saved or data is corrupt', () => {
    expect(loadSettings(memoryStore())).toEqual(DEFAULT_SETTINGS)
    expect(loadSettings(memoryStore({ 'ylml.settings.v1': '{not json' }))).toEqual(DEFAULT_SETTINGS)
    expect(loadSettings(memoryStore({ 'ylml.settings.v1': '[1,2]' }))).toEqual(DEFAULT_SETTINGS)
  })

  it('repairs invalid fields individually', () => {
    const store = memoryStore({ 'ylml.settings.v1': JSON.stringify({ masterVolume: 7, muted: 'yes' }) })
    expect(loadSettings(store)).toEqual({ masterVolume: 1, muted: false })
  })

  it('survives storage being unavailable', () => {
    const broken = () => {
      throw new Error('SecurityError')
    }
    expect(loadSettings(broken)).toEqual(DEFAULT_SETTINGS)
    expect(() => saveSettings(DEFAULT_SETTINGS, broken)).not.toThrow()
  })
})

describe('song volumes', () => {
  it('round-trips through storage', () => {
    const store = memoryStore()
    saveSongVolumes({ a: 0.5, b: 1.75 }, store)
    expect(loadSongVolumes(store)).toEqual({ a: 0.5, b: 1.75 })
  })

  it('drops invalid entries, clamps out-of-range ones and skips defaults', () => {
    const store = memoryStore({
      'ylml.songVolumes.v1': JSON.stringify({ loud: 5, quiet: -1, normal: 1, junk: 'x', nope: null }),
    })
    expect(loadSongVolumes(store)).toEqual({ loud: 2, quiet: 0 })
  })
})
