import { describe, expect, it } from 'vitest'
import {
  canRunUpdateAction,
  describeUpdateStatus,
  hasPendingUpdate,
  primaryUpdateAction,
  type UpdateStatus,
} from './updates'

describe('describeUpdateStatus', () => {
  it('describes each state', () => {
    expect(describeUpdateStatus({ state: 'unsupported' })).toBe('Updates work in the installed app.')
    expect(describeUpdateStatus({ state: 'checking' })).toBe('Checking for updates…')
    expect(describeUpdateStatus({ state: 'up-to-date', checkedAt: 0 })).toBe("You're up to date.")
    expect(describeUpdateStatus({ state: 'available', version: '1.2.0' })).toBe('Version 1.2.0 is available.')
    expect(describeUpdateStatus({ state: 'downloaded', version: '1.2.0' })).toBe(
      'Version 1.2.0 is ready. Restart to finish updating.',
    )
    expect(describeUpdateStatus({ state: 'error', message: 'Offline.' })).toBe('Offline.')
  })

  it('shows download progress as a whole, clamped percentage', () => {
    expect(describeUpdateStatus({ state: 'downloading', version: '1.2.0', percent: 42.7 })).toBe(
      'Downloading version 1.2.0… 42%',
    )
    expect(describeUpdateStatus({ state: 'downloading', version: '1.2.0', percent: 140 })).toMatch(/100%$/)
    expect(describeUpdateStatus({ state: 'downloading', version: '1.2.0', percent: Number.NaN })).toMatch(/ 0%$/)
  })
})

describe('primaryUpdateAction', () => {
  it('downloads an available update, installs a downloaded one, and checks otherwise', () => {
    expect(primaryUpdateAction({ state: 'available', version: '2.0.0' })).toBe('download')
    expect(primaryUpdateAction({ state: 'downloaded', version: '2.0.0' })).toBe('install')
    expect(primaryUpdateAction({ state: 'idle' })).toBe('check')
    expect(primaryUpdateAction({ state: 'error', message: 'x' })).toBe('check')
  })
})

describe('canRunUpdateAction', () => {
  it('is disabled while busy or when updates are unsupported', () => {
    const busy: UpdateStatus[] = [
      { state: 'unsupported' },
      { state: 'checking' },
      { state: 'downloading', version: '2.0.0', percent: 10 },
    ]
    for (const status of busy) expect(canRunUpdateAction(status)).toBe(false)
    expect(canRunUpdateAction({ state: 'up-to-date', checkedAt: 0 })).toBe(true)
    expect(canRunUpdateAction({ state: 'error', message: 'x' })).toBe(true)
  })
})

describe('hasPendingUpdate', () => {
  it('is true only when the user can download or install something', () => {
    expect(hasPendingUpdate({ state: 'available', version: '2.0.0' })).toBe(true)
    expect(hasPendingUpdate({ state: 'downloaded', version: '2.0.0' })).toBe(true)
    expect(hasPendingUpdate({ state: 'downloading', version: '2.0.0', percent: 5 })).toBe(false)
    expect(hasPendingUpdate({ state: 'up-to-date', checkedAt: 0 })).toBe(false)
  })
})
