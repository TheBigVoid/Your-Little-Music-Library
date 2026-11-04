// Gives the page a small, safe API for app updates. The page never gets direct access to Node or Electron.
// Shape mirrors DesktopApi in src/lib/updates.ts.
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('desktop', {
  updates: {
    get: () => ipcRenderer.invoke('updates:get'),
    check: () => ipcRenderer.invoke('updates:check'),
    download: () => ipcRenderer.invoke('updates:download'),
    install: () => ipcRenderer.invoke('updates:install'),
    setAutoUpdate: (autoUpdate) => ipcRenderer.invoke('updates:set-auto', Boolean(autoUpdate)),
    onChange: (callback) => {
      const listener = (_event, snapshot) => callback(snapshot)
      ipcRenderer.on('updates:changed', listener)
      return () => ipcRenderer.removeListener('updates:changed', listener)
    },
  },
})
