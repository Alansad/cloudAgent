import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../../src/types/common'

contextBridge.exposeInMainWorld('electronAPI', {
  // 加密解密
  encrypt: (data: string) => ipcRenderer.invoke(IPC_CHANNELS.ENCRYPT, data),
  decrypt: (encryptedData: string) => ipcRenderer.invoke(IPC_CHANNELS.DECRYPT, encryptedData),

  // 系统信息
  getSystemInfo: () => ipcRenderer.invoke(IPC_CHANNELS.GET_SYSTEM_INFO),

  // 窗口控制
  minimizeWindow: () => ipcRenderer.send(IPC_CHANNELS.MINIMIZE_WINDOW),
  maximizeWindow: () => ipcRenderer.send(IPC_CHANNELS.MAXIMIZE_WINDOW),
  closeWindow: () => ipcRenderer.send(IPC_CHANNELS.CLOSE_WINDOW),

  // 网页自动化
  webAutomationAction: (action: string, params: any) => 
    ipcRenderer.invoke(IPC_CHANNELS.WEB_AUTOMATION_ACTION, action, params),

  // API调用
  apiCall: (config: any, params: any) => 
    ipcRenderer.invoke(IPC_CHANNELS.API_CALL, config, params),

  // MCP调用
  mcpCall: (config: any, capability: string, params: any) => 
    ipcRenderer.invoke(IPC_CHANNELS.MCP_CALL, config, capability, params),

  // 事件监听
  onNavigate: (callback: (path: string) => void) => {
    ipcRenderer.on(IPC_CHANNELS.NAVIGATE, (_, path) => callback(path))
  }
})

contextBridge.exposeInMainWorld('ipcRenderer', {
  invoke: ipcRenderer.invoke,
  send: ipcRenderer.send,
  on: ipcRenderer.on,
  off: ipcRenderer.removeListener,
  once: ipcRenderer.once
})
