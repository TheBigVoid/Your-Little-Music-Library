import { useEffect, useEffectEvent, useState } from 'react'
import { AudioEngine } from '../audio/AudioEngine'
import { createSongs, type Song } from '../lib/songs'
import {
  loadSettings,
  loadSongVolumes,
  saveSettings,
  saveSongVolumes,
  type Settings,
  type SongVolumes,
} from '../lib/storage'
import { clamp, DEFAULT_SONG_VOLUME, MASTER_VOLUME_MAX, roundVolume, SONG_VOLUME_MAX } from '../lib/volume'

/** Pressing "previous" this far into a song restarts it instead of going back a track. */
const RESTART_THRESHOLD_SECONDS = 3

function cannotPlayMessage(song: Song): string {
  return `Couldn't play "${song.title}". Your browser may not support this file format.`
}

export function usePlayer() {
  // One engine for the lifetime of the app; the lazy initializer means it's only constructed once.
  const [engine] = useState(() => new AudioEngine())
  const [songs, setSongs] = useState<Song[]>([])
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState<Settings>(() => loadSettings())
  const [songVolumes, setSongVolumes] = useState<SongVolumes>(() => loadSongVolumes())

  const currentIndex = songs.findIndex((song) => song.id === currentId)
  const currentSong = currentIndex === -1 ? null : songs[currentIndex]

  const songVolumeOf = (id: string) => songVolumes[id] ?? DEFAULT_SONG_VOLUME
  const currentSongVolume = currentSong ? songVolumeOf(currentSong.id) : DEFAULT_SONG_VOLUME

  useEffect(() => saveSettings(settings), [settings])
  useEffect(() => saveSongVolumes(songVolumes), [songVolumes])

  useEffect(() => {
    engine.setMasterVolume(settings.muted ? 0 : settings.masterVolume)
  }, [engine, settings])

  useEffect(() => {
    engine.setSongVolume(currentSongVolume)
  }, [engine, currentSongVolume])

  const startPlayback = (song: Song) => {
    engine.play().catch((err: unknown) => {
      // AbortError just means another track was picked before this one started.
      if (err instanceof DOMException && err.name === 'AbortError') return
      setError(cannotPlayMessage(song))
    })
  }

  const playSong = (song: Song) => {
    setError(null)
    setCurrentId(song.id)
    setCurrentTime(0)
    setDuration(0)
    engine.load(song.url)
    engine.setSongVolume(songVolumeOf(song.id), { immediate: true })
    startPlayback(song)
  }

  const onEnded = useEffectEvent(() => {
    const nextSong = songs[currentIndex + 1]
    if (nextSong) playSong(nextSong)
  })

  const onMediaError = useEffectEvent(() => {
    if (currentSong) setError(cannotPlayMessage(currentSong))
  })

  useEffect(() => {
    const unsubscribers = [
      engine.on('play', () => setIsPlaying(true)),
      engine.on('pause', () => setIsPlaying(false)),
      engine.on('timeupdate', () => setCurrentTime(engine.currentTime)),
      engine.on('durationchange', () => setDuration(engine.duration)),
      engine.on('ended', () => onEnded()),
      engine.on('error', () => onMediaError()),
    ]
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe())
  }, [engine])

  const togglePlay = () => {
    if (!currentSong) {
      if (songs.length > 0) playSong(songs[0])
      return
    }
    if (engine.paused) startPlayback(currentSong)
    else engine.pause()
  }

  /** Clicking a song plays it, or toggles play/pause if it's already the current song. */
  const selectSong = (song: Song) => {
    if (song.id === currentId) togglePlay()
    else playSong(song)
  }

  const hasNext = currentIndex !== -1 && currentIndex < songs.length - 1

  const next = () => {
    if (hasNext) playSong(songs[currentIndex + 1])
  }

  const previous = () => {
    if (!currentSong) return
    if (engine.currentTime > RESTART_THRESHOLD_SECONDS || currentIndex === 0) engine.seek(0)
    else playSong(songs[currentIndex - 1])
  }

  const seek = (seconds: number) => {
    engine.seek(seconds)
    setCurrentTime(seconds)
  }

  const addFiles = (files: Iterable<File>) => {
    const added = createSongs(files, new Set(songs.map((song) => song.id)))
    if (added.length > 0) setSongs((prev) => [...prev, ...added])
    return added.length
  }

  const removeSong = (song: Song) => {
    if (song.id === currentId) {
      engine.unload()
      setCurrentId(null)
      setIsPlaying(false)
      setCurrentTime(0)
      setDuration(0)
      setError(null)
    }
    URL.revokeObjectURL(song.url)
    setSongs((prev) => prev.filter((s) => s.id !== song.id))
  }

  /** Moving the master slider also unmutes, like most players. */
  const setMasterVolume = (volume: number) => {
    setSettings((prev) => ({ ...prev, masterVolume: roundVolume(clamp(volume, 0, MASTER_VOLUME_MAX)), muted: false }))
  }

  const toggleMute = () => {
    setSettings((prev) => ({ ...prev, muted: !prev.muted }))
  }

  const setSongVolume = (id: string, volume: number) => {
    const value = roundVolume(clamp(volume, 0, SONG_VOLUME_MAX))
    setSongVolumes((prev) => {
      const next = { ...prev }
      // Only remember songs that differ from the default, keeping storage small.
      if (value === DEFAULT_SONG_VOLUME) delete next[id]
      else next[id] = value
      return next
    })
  }

  return {
    songs,
    currentSong,
    isPlaying,
    currentTime,
    duration,
    error,
    hasNext,
    masterVolume: settings.masterVolume,
    muted: settings.muted,
    currentSongVolume,
    songVolumeOf,
    selectSong,
    togglePlay,
    next,
    previous,
    seek,
    addFiles,
    removeSong,
    setMasterVolume,
    toggleMute,
    setSongVolume,
  }
}

export type Player = ReturnType<typeof usePlayer>
