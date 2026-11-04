import { useEffect, useMemo, useState } from 'react'
import type { DesktopApi, UpdateSnapshot } from '../lib/updates'

export interface Updates {
  snapshot: UpdateSnapshot
  api: DesktopApi['updates']
}

/** Update state from the desktop app, or null when running in a browser (where there's nothing to update). */
export function useUpdates(): Updates | null {
  const bridge = typeof window === 'undefined' ? undefined : window.desktop?.updates
  const [snapshot, setSnapshot] = useState<UpdateSnapshot | null>(null)

  useEffect(() => {
    if (!bridge) return
    let active = true
    const stop = bridge.onChange((next) => {
      if (active) setSnapshot(next)
    })
    bridge.get().then((initial) => {
      // A change event may have arrived first; it's newer, so keep it.
      if (active) setSnapshot((current) => current ?? initial)
    })
    return () => {
      active = false
      stop()
    }
  }, [bridge])

  const api = useMemo<DesktopApi['updates'] | undefined>(
    () =>
      bridge && {
        ...bridge,
        // Show the new setting straight away instead of waiting for the app to confirm it.
        setAutoUpdate: (autoUpdate) => {
          setSnapshot((current) => current && { ...current, autoUpdate })
          return bridge.setAutoUpdate(autoUpdate)
        },
      },
    [bridge],
  )

  return api && snapshot ? { snapshot, api } : null
}
