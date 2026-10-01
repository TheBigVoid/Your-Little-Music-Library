export interface Song {
  /** Stable across sessions for the same file, so per-song settings survive a reload. */
  id: string
  title: string
  fileName: string
  /** Object URL for the file; only valid for the current page session. */
  url: string
}

const AUDIO_EXTENSIONS = /\.(mp3|wav|ogg|oga|opus|flac|m4a|aac|webm)$/i

/** Some systems report an empty MIME type (e.g. for .flac), so fall back to the extension. */
export function isAudioFile(file: Pick<File, 'name' | 'type'>): boolean {
  return file.type.startsWith('audio/') || AUDIO_EXTENSIONS.test(file.name)
}

export function songIdFor(file: Pick<File, 'name' | 'size' | 'lastModified'>): string {
  return `${file.name}|${file.size}|${file.lastModified}`
}

export function titleFromFileName(fileName: string): string {
  const dot = fileName.lastIndexOf('.')
  return dot > 0 ? fileName.slice(0, dot) : fileName
}

/**
 * Turns picked/dropped files into songs, skipping non-audio files and
 * anything already in the library (or repeated within the same batch).
 */
export function createSongs(
  files: Iterable<File>,
  existingIds: ReadonlySet<string>,
  createUrl: (file: File) => string = (file) => URL.createObjectURL(file),
): Song[] {
  const seen = new Set(existingIds)
  const songs: Song[] = []
  for (const file of files) {
    if (!isAudioFile(file)) continue
    const id = songIdFor(file)
    if (seen.has(id)) continue
    seen.add(id)
    songs.push({ id, title: titleFromFileName(file.name), fileName: file.name, url: createUrl(file) })
  }
  return songs
}
