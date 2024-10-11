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
    sendText: (input: string) => ipcRenderer.invoke('process-text', input)
  })
} catch (error) {
  console.log(error)
}
