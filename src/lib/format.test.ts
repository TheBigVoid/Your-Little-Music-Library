import { describe, expect, it } from 'vitest'
import { formatTime } from './format'

describe('formatTime', () => {
  it('formats minutes and seconds', () => {
    expect(formatTime(0)).toBe('0:00')
    expect(formatTime(7.9)).toBe('0:07')
    expect(formatTime(65)).toBe('1:05')
  })

  it('includes hours for long tracks', () => {
    expect(formatTime(3725)).toBe('1:02:05')
  })

  it('handles missing durations', () => {
    expect(formatTime(Number.NaN)).toBe('0:00')
    expect(formatTime(Infinity)).toBe('0:00')
    expect(formatTime(-3)).toBe('0:00')
  })
})
