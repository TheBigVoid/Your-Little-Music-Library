import type { Player } from '../player/usePlayer'
import { DEFAULT_SONG_VOLUME, SONG_VOLUME_MAX } from '../lib/volume'
import { CloseIcon, PauseIcon, PlayIcon } from './Icons'
import { VolumeSlider } from './VolumeSlider'

interface SongListProps {
  player: Player
}

export function SongList({ player }: SongListProps) {
  const { songs, currentSong, isPlaying } = player

  return (
    <ol className="song-list">
      {songs.map((song, index) => {
        const isCurrent = song.id === currentSong?.id
        const isActive = isCurrent && isPlaying
        return (
          <li key={song.id} className={isCurrent ? 'song-row song-row--current' : 'song-row'}>
            <button
              type="button"
              className="song-row__main"
              onClick={() => player.selectSong(song)}
              aria-label={`${isActive ? 'Pause' : 'Play'} ${song.title}`}
              aria-current={isCurrent || undefined}
            >
              <span className="song-row__index" aria-hidden="true">
                {isActive ? (
                  <span className="eq-bars">
                    <i />
                    <i />
                    <i />
                  </span>
                ) : (
                  index + 1
                )}
              </span>
              <span className="song-row__icon" aria-hidden="true">
                {isActive ? <PauseIcon /> : <PlayIcon />}
              </span>
              <span className="song-row__title" title={song.fileName}>
                {song.title}
              </span>
            </button>

            <div className="song-row__volume">
              <VolumeSlider
                label={`Volume for ${song.title}`}
                hideLabel
                value={player.songVolumeOf(song.id)}
                max={SONG_VOLUME_MAX}
                step={0.05}
                marker={DEFAULT_SONG_VOLUME}
                onChange={(volume) => player.setSongVolume(song.id, volume)}
              />
            </div>

            <button
              type="button"
              className="icon-button song-row__remove"
              onClick={() => player.removeSong(song)}
              aria-label={`Remove ${song.title}`}
              title="Remove from library"
            >
              <CloseIcon />
            </button>
          </li>
        )
      })}
    </ol>
  )
}
