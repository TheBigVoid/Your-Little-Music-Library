import { useEffect, useId, useRef, useState } from 'react'
import type { Updates } from '../desktop/useUpdates'
import {
  canRunUpdateAction,
  describeUpdateStatus,
  hasPendingUpdate,
  primaryUpdateAction,
  type UpdateAction,
} from '../lib/updates'
import { UpdateIcon } from './Icons'

const ACTION_LABELS: Record<UpdateAction, string> = {
  check: 'Check for updates',
  download: 'Download update',
  install: 'Restart to update',
}

function runAction(updates: Updates, action: UpdateAction) {
  if (action === 'download') return updates.api.download()
  if (action === 'install') return updates.api.install()
  return updates.api.check()
}

/** The Updates button in the header, with a menu for checking manually and turning automatic updates on or off. */
export function UpdateMenu({ updates }: { updates: Updates }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const { snapshot } = updates
  const action = primaryUpdateAction(snapshot.status)
  const pending = hasPendingUpdate(snapshot.status)

  // Close when clicking elsewhere or pressing Escape.
  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className="update-menu" ref={root}>
      <button
        type="button"
        className="icon-button update-menu__toggle"
        aria-label={pending ? 'Updates (update available)' : 'Updates'}
        title="Updates"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <UpdateIcon />
        {pending && <span className="update-menu__dot" aria-hidden="true" />}
      </button>

      {open && (
        <div className="update-menu__panel" id={panelId} role="dialog" aria-label="Updates">
          <p className="update-menu__title">Your Little Music Library</p>
          <p className="update-menu__version">Version {snapshot.version}</p>
          <p
            className={snapshot.status.state === 'error' ? 'update-menu__status update-menu__status--error' : 'update-menu__status'}
            role="status"
          >
            {describeUpdateStatus(snapshot.status)}
          </p>
          <button
            type="button"
            className="button update-menu__action"
            disabled={!canRunUpdateAction(snapshot.status)}
            onClick={() => void runAction(updates, action)}
          >
            {ACTION_LABELS[action]}
          </button>
          <label className="update-menu__auto">
            <input
              type="checkbox"
              checked={snapshot.autoUpdate}
              disabled={snapshot.status.state === 'unsupported'}
              onChange={(event) => void updates.api.setAutoUpdate(event.currentTarget.checked)}
            />
            <span>
              Update automatically
              <small>
                {snapshot.autoUpdate
                  ? 'New versions download in the background and install when you close the app.'
                  : "You'll be asked before anything downloads."}
              </small>
            </span>
          </label>
        </div>
      )}
    </div>
  )
}

/** A banner in the library when there's an update to download or install. */
export function UpdateBanner({ updates }: { updates: Updates }) {
  const { status } = updates.snapshot
  const [dismissed, setDismissed] = useState<string | null>(null)

  if (status.state !== 'available' && status.state !== 'downloaded') return null
  const key = `${status.state}:${status.version}`
  if (dismissed === key) return null

  const action = primaryUpdateAction(status)
  return (
    <div className="banner banner--update" role="status">
      <span>
        {status.state === 'downloaded'
          ? `Version ${status.version} is ready to install.`
          : `Version ${status.version} is available.`}
      </span>
      <span className="banner__actions">
        <button type="button" className="button button--small" onClick={() => void runAction(updates, action)}>
          {action === 'install' ? 'Restart now' : 'Download'}
        </button>
        <button type="button" className="text-button" onClick={() => setDismissed(key)}>
          Later
        </button>
      </span>
    </div>
  )
}
