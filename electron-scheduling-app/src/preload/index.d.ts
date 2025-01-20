import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    // electron: ElectronAPI
    context: {
      locale: string
    }
    electronAPI: {
      sendText(inputText: string, oldJSON: string|null): unknown
    }
  }
}
