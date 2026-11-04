/** Where the app is in checking for, downloading and installing an update. Sent by electron/updater.cjs. */
export type UpdateStatus =
  | { state: 'unsupported' }
  | { state: 'idle' }
  | { state: 'checking' }
  | { state: 'up-to-date'; checkedAt: number }
  | { state: 'available'; version: string }
  | { state: 'downloading'; version: string; percent: number }
  | { state: 'downloaded'; version: string }
  | { state: 'error'; message: string }

export interface UpdateSnapshot {
  /** The version that's running now. */
  version: string
  /** Download and install new versions without asking. */
  autoUpdate: boolean
  status: UpdateStatus
}

/** What electron/preload.cjs exposes as `window.desktop`. Missing when the app runs in a browser. */
export interface DesktopApi {
  updates: {
    get(): Promise<UpdateSnapshot>
    check(): Promise<void>
    download(): Promise<void>
    install(): Promise<void>
    setAutoUpdate(autoUpdate: boolean): Promise<void>
    /** Calls back whenever anything in the snapshot changes. Returns a function that stops listening. */
    onChange(callback: (snapshot: UpdateSnapshot) => void): () => void
  }
}

declare global {
  interface Window {
    desktop?: DesktopApi
  }
}

/** One line describing the update status for the Updates menu. */
export function describeUpdateStatus(status: UpdateStatus): string {
  switch (status.state) {
    case 'unsupported':
      return 'Updates work in the installed app.'
    case 'idle':
      return 'Not checked for updates yet.'
    case 'checking':
      return 'Checking for updates…'
    case 'up-to-date':
      return "You're up to date."
    case 'available':
      return `Version ${status.version} is available.`
    case 'downloading':
      return `Downloading version ${status.version}… ${Math.floor(clampPercent(status.percent))}%`
    case 'downloaded':
      return `Version ${status.version} is ready. Restart to finish updating.`
    case 'error':
      return status.message
  }
}

/** The main button in the Updates menu. */
export type UpdateAction = 'check' | 'download' | 'install'

export function primaryUpdateAction(status: UpdateStatus): UpdateAction {
  if (status.state === 'available') return 'download'
  if (status.state === 'downloaded') return 'install'
  return 'check'
}

/** Whether the main button can be pressed right now. */
export function canRunUpdateAction(status: UpdateStatus): boolean {
  return !['unsupported', 'checking', 'downloading'].includes(status.state)
}

/** Whether there's something for the user to act on, shown as a dot on the Updates button. */
export function hasPendingUpdate(status: UpdateStatus): boolean {
  return status.state === 'available' || status.state === 'downloaded'
}

function clampPercent(percent: number): number {
  if (!Number.isFinite(percent)) return 0
  return Math.min(100, Math.max(0, percent))
}
