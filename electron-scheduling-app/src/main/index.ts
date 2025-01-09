import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import fetchLLMResponse from './lib/lib'
import icon from '../../resources/icon.png?asset'
import mysql from 'mysql2/promise'
import * as dotenv from 'dotenv'
dotenv.config()
console.log('Loaded environment variables:', {
  dbHost: process.env.DB_HOST,
  llmApiUrl: process.env.LLM_API_URL
})

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306
}

const connectToDatabase = async () => {
  try {
    const connection = await mysql.createConnection(dbConfig)
    console.log('Connected to the MySQL database')
    return connection
  } catch (error) {
    console.error('Error connecting to the database:', error)
    throw error
  }
}

const fetchAllPersons = async () => {
  const connection = await connectToDatabase()

  try {
    const [rows] = await connection.execute('SELECT * FROM Persons')
    console.log('Fetched rows:', rows)
    return rows
  } catch (error) {
    console.error('Error fetching rows:', error)
    throw error
  } finally {
    await connection.end()
  }
}

const addPerson = async (name: string) => {
  const connection = await connectToDatabase()

  try {
    const [result] = await connection.execute<mysql.ResultSetHeader>(
      'INSERT INTO Persons (name) VALUES (?)',
      [name]
    )
    console.log('Inserted person with ID:', result.insertId)
    return result.insertId
  } catch (error) {
    console.error('Error inserting data:', error)
    throw error
  } finally {
    await connection.end()
  }
}

// Clear all data in the database
const clearDatabase = async () => {
  const connection = await connectToDatabase()

  try {
    await connection.execute('DELETE FROM Persons')
    console.log('All data cleared from the Persons table')
  } catch (error) {
    console.error('Error clearing data:', error)
    throw error
  } finally {
    await connection.end()
  }
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    center: true,
    title: 'ElectroSchedule',
    frame: false,
    vibrancy: 'under-window',
    visualEffectState: 'active',
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 15, y: 10 },
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()
  // addPerson('Alice')
  fetchAllPersons()
  clearDatabase()

  const LLM_API_URL = process.env.LLM_API_URL || 'http://localhost:1234/v1/chat/completions'

  ipcMain.handle('process-text', async (event, input: string) => {
    // Here you will integrate the LLM API (e.g., GPT, etc.)
    // Example: Send the input to your LLM endpoint and return the JSON response
    const jsonResponse = await fetchLLMResponse(input, LLM_API_URL) // Stub function
    return jsonResponse
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
