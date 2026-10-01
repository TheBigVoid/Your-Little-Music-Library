import type { CSSProperties } from 'react'
import type { Player } from '../player/usePlayer'
import { formatTime } from '../lib/format'
import {
  DEFAULT_SONG_VOLUME,
  effectiveVolume,
  MASTER_VOLUME_MAX,
  SONG_VOLUME_MAX,
  toPercent,
} from '../lib/volume'
import { MusicIcon, MutedIcon, NextIcon, PauseIcon, PlayIcon, PreviousIcon, VolumeIcon } from './Icons'
import { VolumeSlider } from './VolumeSlider'

interface PlayerBarProps {
  player: Player
}

export function PlayerBar({ player }: PlayerBarProps) {
  const { currentSong, isPlaying, currentTime, duration, masterVolume, muted, currentSongVolume } = player
  const hasDuration = Number.isFinite(duration) && duration > 0
  const progressStyle = {
    '--fill': hasDuration ? `${(currentTime / duration) * 100}%` : '0%',
  } as CSSProperties
  const outputVolume = effectiveVolume(masterVolume, currentSongVolume, muted)

  return (
    <footer className="player-bar">
      <div className="player-bar__now-playing">
        <span className="player-bar__eyebrow">{currentSong ? 'Now playing' : 'Nothing playing'}</span>
        <span className="player-bar__title" title={currentSong?.fileName}>
          {currentSong?.title ?? 'Pick a song to start'}
        </span>
      </div>

      <div className="player-bar__transport">
        <div className="player-bar__controls">
          <button
            type="button"
            className="icon-button"
            onClick={player.previous}
            disabled={!currentSong}
            aria-label="Previous song"
            title="Previous"
          >
            <PreviousIcon />
          </button>
          <button
            type="button"
            className="play-button"
            onClick={player.togglePlay}
            disabled={player.songs.length === 0}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={player.next}
            disabled={!player.hasNext}
            aria-label="Next song"
            title="Next"
          >
            <NextIcon />
          </button>
        </div>

        <div className="player-bar__progress">
          <span className="time">{formatTime(currentTime)}</span>
          <input
            type="range"
            className="range"
            aria-label="Seek"
            aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
            min={0}
            max={hasDuration ? duration : 0}
            step={0.1}
            value={hasDuration ? Math.min(currentTime, duration) : 0}
            disabled={!hasDuration}
            style={progressStyle}
            onChange={(event) => player.seek(Number(event.currentTarget.value))}
          />
          <span className="time">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="player-bar__volumes">
        <span className="player-bar__volume-icon" aria-hidden="true">
          <MusicIcon />
        </span>
        <VolumeSlider
          label="This song"
          value={currentSongVolume}
          max={SONG_VOLUME_MAX}
          step={0.05}
          marker={DEFAULT_SONG_VOLUME}
          disabled={!currentSong}
          onChange={(volume) => currentSong && player.setSongVolume(currentSong.id, volume)}
        />
        <button
          type="button"
          className="icon-button"
          onClick={player.toggleMute}
          aria-label="Mute"
          aria-pressed={muted}
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <MutedIcon /> : <VolumeIcon level={masterVolume} />}
        </button>
        <VolumeSlider
          label="Master"
          value={muted ? 0 : masterVolume}
          max={MASTER_VOLUME_MAX}
          onChange={player.setMasterVolume}
        />
        <p className="player-bar__output" title="This song × Master">
          Plays at <strong>{toPercent(outputVolume)}</strong>
        </p>
      </div>
    </footer>
  )
}
