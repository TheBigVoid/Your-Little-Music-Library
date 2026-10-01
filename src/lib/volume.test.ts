import { describe, expect, it } from 'vitest'
import { clamp, effectiveVolume, roundVolume, toPercent } from './volume'

describe('clamp', () => {
  it('keeps values inside the range', () => {
    expect(clamp(-1, 0, 1)).toBe(0)
    expect(clamp(0.4, 0, 1)).toBe(0.4)
    expect(clamp(3, 0, 2)).toBe(2)
  })

  it('treats NaN as the minimum', () => {
    expect(clamp(Number.NaN, 0, 1)).toBe(0)
  })
})

describe('effectiveVolume', () => {
  it('scales the song volume by the master volume', () => {
    expect(effectiveVolume(0.5, 1)).toBe(0.5)
    expect(effectiveVolume(0.8, 1.5)).toBe(1.2)
    expect(effectiveVolume(1, 0.25)).toBe(0.25)
  })

  it('is silent when muted', () => {
    expect(effectiveVolume(1, 2, true)).toBe(0)
  })

  it('clamps out-of-range inputs', () => {
    expect(effectiveVolume(5, 1)).toBe(1)
    expect(effectiveVolume(1, 9)).toBe(2)
  })
})

describe('roundVolume', () => {
  it('removes floating point noise', () => {
    expect(roundVolume(0.1 + 0.2)).toBe(0.3)
  })
})

describe('toPercent', () => {
  it('formats as a whole percentage', () => {
    expect(toPercent(0)).toBe('0%')
    expect(toPercent(0.805)).toBe('81%')
    expect(toPercent(1.5)).toBe('150%')
  })
})
