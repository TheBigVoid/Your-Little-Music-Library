/** How quickly gain changes settle (seconds). Short enough to feel instant, long enough to avoid clicks. */
const RAMP_TIME_CONSTANT = 0.015

type MediaEvent = 'play' | 'pause' | 'ended' | 'timeupdate' | 'durationchange' | 'error'

/**
 * Plays one track at a time through a Web Audio graph:
 *
 *   <audio> -> song gain -> master gain -> speakers
 *
 * Keeping song and master volume as separate gain stages lets each be changed
 * independently, allows boosting a song above 100%, and leaves room to slot in
 * more processing (EQ, crossfade, ...) later.
 */
export class AudioEngine {
  private readonly element: HTMLAudioElement
  private context: AudioContext | null = null
  private songGain: GainNode | null = null
  private masterGain: GainNode | null = null
  private songVolume = 1
  private masterVolume = 1

  constructor() {
    this.element = new Audio()
    this.element.preload = 'auto'
  }

  get currentTime(): number {
    return this.element.currentTime
  }

  get duration(): number {
    return this.element.duration
  }

  get paused(): boolean {
    return this.element.paused
  }

  /** Browsers only allow an AudioContext to start after a user gesture, so build it on first play. */
  private ensureGraph(): AudioContext {
    if (this.context) return this.context
    const context = new AudioContext()
    this.songGain = context.createGain()
    this.masterGain = context.createGain()
    this.songGain.gain.value = this.songVolume
    this.masterGain.gain.value = this.masterVolume
    context
      .createMediaElementSource(this.element)
      .connect(this.songGain)
      .connect(this.masterGain)
      .connect(context.destination)
    this.context = context
    return context
  }

  private applyGain(node: GainNode | null, value: number, immediate: boolean): void {
    if (!node || !this.context) return
    const now = this.context.currentTime
    node.gain.cancelScheduledValues(now)
    if (immediate) node.gain.setValueAtTime(value, now)
    else node.gain.setTargetAtTime(value, now, RAMP_TIME_CONSTANT)
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = volume
    this.applyGain(this.masterGain, volume, false)
  }

  /** Use `immediate` when switching tracks so the new song doesn't briefly play at the old song's level. */
  setSongVolume(volume: number, { immediate = false } = {}): void {
    this.songVolume = volume
    this.applyGain(this.songGain, volume, immediate)
  }

  load(url: string): void {
    this.element.src = url
  }

  async play(): Promise<void> {
    const context = this.ensureGraph()
    if (context.state === 'suspended') await context.resume()
    await this.element.play()
  }

  pause(): void {
    this.element.pause()
  }

  seek(seconds: number): void {
    if (Number.isFinite(seconds)) this.element.currentTime = seconds
  }

  /** Stops playback and releases the current track. */
  unload(): void {
    this.element.pause()
    this.element.removeAttribute('src')
    this.element.load()
  }

  on(event: MediaEvent, handler: () => void): () => void {
    this.element.addEventListener(event, handler)
    return () => this.element.removeEventListener(event, handler)
  }
}
