import { useEffect, useRef, useState, type DragEvent } from 'react'
import { MusicIcon, PlusIcon } from './components/Icons'
import { PlayerBar } from './components/PlayerBar'
import { SongList } from './components/SongList'
import { usePlayer } from './player/usePlayer'
import './App.css'

function hasFiles(event: DragEvent) {
  return event.dataTransfer.types.includes('Files')
}

export default function App() {
  const player = usePlayer()
  const fileInput = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!notice) return
    const timeout = setTimeout(() => setNotice(null), 5000)
    return () => clearTimeout(timeout)
  }, [notice])

  const addFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const added = player.addFiles(files)
    const skipped = files.length - added
    setNotice(skipped > 0 ? `Skipped ${skipped} file${skipped === 1 ? '' : 's'} (not audio, or already added).` : null)
  }

  const onDragOver = (event: DragEvent) => {
    if (!hasFiles(event)) return
    event.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = (event: DragEvent) => {
    // Ignore leave events fired when moving between child elements.
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
    setIsDragging(false)
  }

  const onDrop = (event: DragEvent) => {
    event.preventDefault()
    setIsDragging(false)
    addFiles(event.dataTransfer.files)
  }

  const message = player.error ?? notice

  return (
    <div className="app" onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
      <header className="app-header">
        <div className="brand">
          <MusicIcon className="brand__icon" />
          <h1>Your Little Music Library</h1>
        </div>
        <button type="button" className="button" onClick={() => fileInput.current?.click()}>
          <PlusIcon /> Add songs
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="audio/*"
          multiple
          hidden
          onChange={(event) => {
            addFiles(event.currentTarget.files)
            // Reset so picking the same file again still fires a change event.
            event.currentTarget.value = ''
          }}
        />
      </header>

      <main className="library">
        {message && (
          <p className={player.error ? 'banner banner--error' : 'banner'} role="status">
            {message}
          </p>
        )}

        {player.songs.length > 0 ? (
          <>
            <div className="library__header">
              <h2>Library</h2>
              <span className="library__count">
                {player.songs.length} song{player.songs.length === 1 ? '' : 's'}
              </span>
              <span className="library__volume-heading">Song volume</span>
            </div>
            <SongList player={player} />
          </>
        ) : (
          <div className="empty-state">
            <MusicIcon className="empty-state__icon" />
            <h2>Your library is empty</h2>
            <p>Add some music files, or drag and drop them anywhere on this page.</p>
            <button type="button" className="button" onClick={() => fileInput.current?.click()}>
              <PlusIcon /> Add songs
            </button>
          </div>
        )}
      </main>

      <PlayerBar player={player} />

      {isDragging && (
        <div className="drop-overlay" aria-hidden="true">
          <p>Drop to add to your library</p>
        </div>
      )}
    </div>
  )
}
