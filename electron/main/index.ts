import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron'
import path from 'path'
import { encrypt, decrypt } from 'electron-safe-storage'
import { IPC_CHANNELS } from '../../src/types/common'

let mainWindow: BrowserWindow | null
let tray: Tray | null
let isDev = process.argv.includes('--dev')

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    icon: path.join(__dirname, '../../build/icon.png')
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  createTray()
  createMenu()
}

function createTray() {
  const iconPath = path.join(__dirname, '../../build/tray-icon.png')
  const trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })
  
  tray = new Tray(trayIcon)
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '打开主界面',
      click: () => mainWindow?.show()
    },
    {
      label: '设置',
      click: () => mainWindow?.webContents.send(IPC_CHANNELS.NAVIGATE, '/settings')
    },
    {
      type: 'separator'
    },
    {
      label: '退出',
      click: () => app.quit()
    }
  ])

  tray.setToolTip('Agent助手')
  tray.setContextMenu(contextMenu)

  tray.on('click', () => mainWindow?.show())
}

function createMenu() {
  if (process.platform === 'darwin') {
    const template = Menu.buildFromTemplate([
      {
        label: app.name,
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      },
      {
        label: '编辑',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'selectAll' }
        ]
      },
      {
        label: '视图',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      }
    ])
    Menu.setApplicationMenu(template)
  } else {
    Menu.setApplicationMenu(null)
  }
}

// IPC 处理
ipcMain.handle(IPC_CHANNELS.ENCRYPT, async (_, data: string) => {
  return encrypt(data)
})

ipcMain.handle(IPC_CHANNELS.DECRYPT, async (_, encryptedData: string) => {
  return decrypt(encryptedData)
})

ipcMain.handle(IPC_CHANNELS.GET_SYSTEM_INFO, async () => {
  return {
    platform: process.platform,
    version: app.getVersion()
  }
})

ipcMain.on(IPC_CHANNELS.MINIMIZE_WINDOW, () => {
  mainWindow?.minimize()
})

ipcMain.on(IPC_CHANNELS.MAXIMIZE_WINDOW, () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})

ipcMain.on(IPC_CHANNELS.CLOSE_WINDOW, () => {
  if (process.platform === 'darwin') {
    app.hide()
  } else {
    app.quit()
  }
})

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('quit', () => {
  tray?.destroy()
})
