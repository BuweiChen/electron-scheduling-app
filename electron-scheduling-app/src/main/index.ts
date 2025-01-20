import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { MongoClient, ServerApiVersion } from 'mongodb'
import fetchLLMResponse from './lib/lib'
import icon from '../../resources/icon.png?asset'
import * as dotenv from 'dotenv'
dotenv.config()

const db_password = process.env.DB_PASSWORD
const uri = `mongodb+srv://buweichen:${db_password}@cluster0.iwhnd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
console.log(uri)

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

async function storeJsonToDb(json: object): Promise<void> {
  try {
    await client.connect()
    // Reference the database and collection
    const database = client.db('db1')
    const collection = database.collection('collection1') // Replace 'myCollection' with your collection name

    // Insert the JSON object into the collection
    const result = await collection.insertOne(json)

    console.log(`JSON inserted with _id: ${result.insertedId}`)
  } catch (error) {
    console.error('Error storing JSON to DB:', error)
  } finally {
    // Close the database connection
    await client.close()
  }
}

async function resetCollection(): Promise<void> {
  try {
    await client.connect()
    // Reference the database and collection
    const database = client.db('db1')
    const collection = database.collection('collection1')

    // Delete all documents in the collection
    const result = await collection.deleteMany({})

    console.log(`Deleted ${result.deletedCount} documents from the collection`)
  } catch (error) {
    console.error('Error resetting collection:', error)
  } finally {
    // Close the database connection
    await client.close()
  }
}

async function run() {
  try {
    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 })
    console.log('Pinged your deployment. You successfully connected to MongoDB!')
  } catch (error) {
    console.error('An error occurred while connecting to MongoDB:', error)
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close()
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
  run().catch(console.dir)
  const LLM_API_URL = process.env.LLM_API_URL || 'http://localhost:1234/v1/chat/completions'

  ipcMain.handle('process-text', async (event, input: string, oldJSON: string | null) => {
    // Here you will integrate the LLM API (e.g., GPT, etc.)
    // Example: Send the input to your LLM endpoint and return the JSON response
    const jsonResponse = await fetchLLMResponse(input, LLM_API_URL, oldJSON) // Stub function
    return jsonResponse
  })

  ipcMain.handle('save-db', async (event, json: string) => {
    // Here you will save the JSON to your MongoDB database
    const jsonObject = JSON.parse(json)
    await storeJsonToDb(jsonObject)
  })

  ipcMain.handle('reset-db', async () => {
    // Here you will reset the MongoDB collection
    await resetCollection()
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
