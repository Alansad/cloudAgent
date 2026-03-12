import { IpcRendererEvent, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../types/common'

export interface IpcResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

class IpcService {
  private listeners: Map<string, (event: IpcRendererEvent, ...args: any[]) => void> = new Map()

  /**
   * 调用主进程方法
   * @param channel 频道名
   * @param args 参数
   * @returns Promise<T>
   */
  async invoke<T = any>(channel: string, ...args: any[]): Promise<T> {
    try {
      return await ipcRenderer.invoke(channel, ...args)
    } catch (error) {
      console.error(`IPC调用失败 [${channel}]:`, error)
      throw error
    }
  }

  /**
   * 发送消息到主进程，不需要返回
   * @param channel 频道名
   * @param args 参数
   */
  send(channel: string, ...args: any[]): void {
    ipcRenderer.send(channel, ...args)
  }

  /**
   * 监听主进程消息
   * @param channel 频道名
   * @param callback 回调函数
   */
  on(channel: string, callback: (event: IpcRendererEvent, ...args: any[]) => void): void {
    // 避免重复监听
    if (this.listeners.has(channel)) {
      this.off(channel)
    }
    
    const listener = (event: IpcRendererEvent, ...args: any[]) => {
      callback(event, ...args)
    }
    
    ipcRenderer.on(channel, listener)
    this.listeners.set(channel, listener)
  }

  /**
   * 移除监听
   * @param channel 频道名
   */
  off(channel: string): void {
    const listener = this.listeners.get(channel)
    if (listener) {
      ipcRenderer.removeListener(channel, listener)
      this.listeners.delete(channel)
    }
  }

  /**
   * 监听一次主进程消息
   * @param channel 频道名
   * @param callback 回调函数
   */
  once(channel: string, callback: (event: IpcRendererEvent, ...args: any[]) => void): void {
    ipcRenderer.once(channel, callback)
  }

  // 快捷方法
  minimizeWindow(): void {
    this.send(IPC_CHANNELS.MINIMIZE_WINDOW)
  }

  maximizeWindow(): void {
    this.send(IPC_CHANNELS.MAXIMIZE_WINDOW)
  }

  closeWindow(): void {
    this.send(IPC_CHANNELS.CLOSE_WINDOW)
  }

  async getSystemInfo() {
    return this.invoke(IPC_CHANNELS.GET_SYSTEM_INFO)
  }

  async navigate(path: string) {
    return this.send(IPC_CHANNELS.NAVIGATE, path)
  }
}

export const ipcRenderer = new IpcService()
