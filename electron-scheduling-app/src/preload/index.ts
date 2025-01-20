import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

if (!process.contextIsolated) {
  throw new Error('contextIsolation must be enabled in the BrowserWindow')
}

try {
  contextBridge.exposeInMainWorld('context', {
    locale: navigator.language
  })
  contextBridge.exposeInMainWorld('electronAPI', {
    sendText: (input: string, oldJSON: string | null) =>
      ipcRenderer.invoke('process-text', input, oldJSON),
    saveDB: (json: string) => ipcRenderer.invoke('save-db', json),
    resetDB: () => ipcRenderer.invoke('reset-db')
  })
} catch (error) {
  console.log(error)
}
