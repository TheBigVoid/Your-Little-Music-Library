// Checks GitHub Releases for new versions of the app and installs them (Windows installer builds).
//
// With automatic updates on (the default), new versions download in the background and install the next time
// the app closes, or straight away if the user clicks "Restart to update". With them off, the app still checks,
// but asks before downloading.
const { app, BrowserWindow, ipcMain } = require('electron')
const fs = require('node:fs')
const path = require('node:path')

const CHECK_INTERVAL_MS = 4 * 60 * 60 * 1000
const FIRST_CHECK_DELAY_MS = 10 * 1000

const settingsFile = () => path.join(app.getPath('userData'), 'update-settings.json')

function readSettings() {
  try {
    const saved = JSON.parse(fs.readFileSync(settingsFile(), 'utf8'))
    return { autoUpdate: saved.autoUpdate !== false }
  } catch {
    return { autoUpdate: true }
  }
}

function writeSettings(settings) {
  try {
    fs.mkdirSync(path.dirname(settingsFile()), { recursive: true })
    fs.writeFileSync(settingsFile(), JSON.stringify(settings))
  } catch (error) {
    console.error('Could not save update settings:', error)
  }
}

/**
 * Updates work in the installed (packaged) app. In development they're off, unless a dev-app-update.yml file in
 * the project root points the updater at a test server.
 */
function updatesSupported() {
  if (app.isPackaged) return true
  return fs.existsSync(path.join(app.getAppPath(), 'dev-app-update.yml'))
}

function setUpUpdates() {
  const supported = updatesSupported()
  let settings = readSettings()
  /** Mirrors UpdateStatus in src/lib/updates.ts. */
  let status = { state: supported ? 'idle' : 'unsupported' }
  let updater = null

  const snapshot = () => ({ version: app.getVersion(), autoUpdate: settings.autoUpdate, status })

  const setStatus = (next) => {
    status = next
    for (const win of BrowserWindow.getAllWindows()) win.webContents.send('updates:changed', snapshot())
  }

  if (supported) {
    // Loaded lazily so a broken updater can never stop the app itself from starting.
    const { autoUpdater } = require('electron-updater')
    updater = autoUpdater
    updater.autoDownload = settings.autoUpdate
    updater.autoInstallOnAppQuit = true
    updater.forceDevUpdateConfig = !app.isPackaged
    updater.logger = console

    updater.on('checking-for-update', () => setStatus({ state: 'checking' }))
    updater.on('update-not-available', () => setStatus({ state: 'up-to-date', checkedAt: Date.now() }))
    updater.on('update-available', (info) =>
      setStatus(
        updater.autoDownload
          ? { state: 'downloading', version: info.version, percent: 0 }
          : { state: 'available', version: info.version },
      ),
    )
    updater.on('download-progress', (progress) => {
      if (status.state === 'downloading') setStatus({ ...status, percent: progress.percent })
    })
    updater.on('update-downloaded', (info) => setStatus({ state: 'downloaded', version: info.version }))
    updater.on('error', (error) => setStatus(errorStatus(error)))
  }

  /** Checks for an update. Errors are reported through the status, never thrown. */
  const check = async () => {
    if (!updater) return
    // Don't interrupt a download in progress or throw away one that's ready to install.
    if (['checking', 'downloading', 'downloaded'].includes(status.state)) return
    try {
      await updater.checkForUpdates()
    } catch (error) {
      setStatus(errorStatus(error))
    }
  }

  ipcMain.handle('updates:get', () => snapshot())
  ipcMain.handle('updates:check', () => check())
  ipcMain.handle('updates:download', async () => {
    if (!updater || status.state !== 'available') return
    setStatus({ state: 'downloading', version: status.version, percent: 0 })
    try {
      await updater.downloadUpdate()
    } catch (error) {
      setStatus(errorStatus(error))
    }
  })
  ipcMain.handle('updates:install', () => {
    if (!updater || status.state !== 'downloaded') return
    // Runs the installer silently, then reopens the app.
    setImmediate(() => updater.quitAndInstall(true, true))
  })
  ipcMain.handle('updates:set-auto', (_event, autoUpdate) => {
    settings = { autoUpdate: Boolean(autoUpdate) }
    writeSettings(settings)
    if (updater) updater.autoDownload = settings.autoUpdate
    setStatus(status)
    // Turning automatic updates on picks up a version that was waiting for the user to click "Download".
    if (settings.autoUpdate && status.state === 'available') {
      setStatus({ state: 'downloading', version: status.version, percent: 0 })
      updater.downloadUpdate().catch((error) => setStatus(errorStatus(error)))
    }
  })

  if (updater) {
    // Always check: with automatic updates off, the user is told about new versions but nothing downloads.
    setTimeout(check, FIRST_CHECK_DELAY_MS)
    setInterval(check, CHECK_INTERVAL_MS)
  }
}

function errorStatus(error) {
  const message = String(error?.message ?? error)
  // Nothing has been released yet, so this is the newest version there is.
  if (/No published versions/i.test(message)) return { state: 'up-to-date', checkedAt: Date.now() }
  if (/ENOTFOUND|ECONNREFUSED|ETIMEDOUT|ECONNRESET|EAI_AGAIN|ERR_INTERNET_DISCONNECTED|net::/i.test(message)) {
    return { state: 'error', message: "Couldn't reach the update server. Check your internet connection." }
  }
  if (/latest\.yml|404/.test(message)) {
    return { state: 'error', message: "Couldn't find the update files for the latest version." }
  }
  return { state: 'error', message: 'Something went wrong while updating. Try again later.' }
}

module.exports = { setUpUpdates }
