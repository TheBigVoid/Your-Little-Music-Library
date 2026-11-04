// Electron entry point: opens the built web app (dist/) in a desktop window.
const { app, BrowserWindow, Menu, nativeTheme, shell } = require('electron')
const path = require('node:path')
const { setUpUpdates } = require('./updater.cjs')

// In development, `npm run app:dev` points this at the Vite dev server.
const devServerUrl = process.env.VITE_DEV_SERVER_URL

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 420,
    minHeight: 500,
    title: 'Your Little Music Library',
    // Matches --bg in src/index.css so there's no flash before the page paints.
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#0e1013' : '#f5f6f8',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  })

  win.once('ready-to-show', () => win.show())

  // Dropping a file outside the drop handler would otherwise make the window navigate to that file.
  win.webContents.on('will-navigate', (event, url) => {
    if (devServerUrl && url.startsWith(devServerUrl)) return
    event.preventDefault()
  })

  // Open any external links in the default browser instead of a new app window.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) shell.openExternal(url)
    return { action: 'deny' }
  })

  if (devServerUrl) {
    win.loadURL(devServerUrl)
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }
}

// Only allow one window; launching the app again focuses the existing one.
if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => {
    const [win] = BrowserWindow.getAllWindows()
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
  })

  app.whenReady().then(() => {
    if (!devServerUrl) Menu.setApplicationMenu(null)
    setUpUpdates()
    createWindow()
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
}
