import { describe, expect, it } from 'vitest'
import { createSongs, isAudioFile, songIdFor, titleFromFileName } from './songs'

function fakeFile(name: string, { type = 'audio/mpeg', size = 100, lastModified = 1 } = {}): File {
  return { name, type, size, lastModified } as File
}

const fakeUrl = (file: File) => `blob:${file.name}`

describe('isAudioFile', () => {
  it('accepts audio MIME types', () => {
    expect(isAudioFile(fakeFile('a.bin', { type: 'audio/ogg' }))).toBe(true)
  })

  it('falls back to the extension when the MIME type is missing', () => {
    expect(isAudioFile(fakeFile('song.FLAC', { type: '' }))).toBe(true)
  })

  it('rejects other files', () => {
    expect(isAudioFile(fakeFile('cover.jpg', { type: 'image/jpeg' }))).toBe(false)
    expect(isAudioFile(fakeFile('notes.txt', { type: '' }))).toBe(false)
  })
})

describe('songIdFor', () => {
  it('is stable for the same file and differs for different files', () => {
    expect(songIdFor(fakeFile('a.mp3'))).toBe(songIdFor(fakeFile('a.mp3')))
    expect(songIdFor(fakeFile('a.mp3'))).not.toBe(songIdFor(fakeFile('a.mp3', { size: 200 })))
  })
})

describe('titleFromFileName', () => {
  it('strips the extension', () => {
    expect(titleFromFileName('My Song.mp3')).toBe('My Song')
    expect(titleFromFileName('artist - track.v2.flac')).toBe('artist - track.v2')
  })

  it('leaves names without an extension alone', () => {
    expect(titleFromFileName('README')).toBe('README')
    expect(titleFromFileName('.hidden')).toBe('.hidden')
  })
})

describe('createSongs', () => {
  it('creates songs for audio files only', () => {
    const songs = createSongs([fakeFile('one.mp3'), fakeFile('cover.png', { type: 'image/png' })], new Set(), fakeUrl)
    expect(songs).toEqual([{ id: songIdFor(fakeFile('one.mp3')), title: 'one', fileName: 'one.mp3', url: 'blob:one.mp3' }])
  })

  it('skips songs already in the library and duplicates within the batch', () => {
    const existing = new Set([songIdFor(fakeFile('old.mp3'))])
    const songs = createSongs([fakeFile('old.mp3'), fakeFile('new.mp3'), fakeFile('new.mp3')], existing, fakeUrl)
    expect(songs.map((song) => song.fileName)).toEqual(['new.mp3'])
  })
})
