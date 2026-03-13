import type { IpcRendererEvent } from 'electron'
import { IPC_CHANNELS } from '../types/common'

// ipcRenderer 由 preload.ts 通过 contextBridge 暴露到 window 上
const nativeIpc = (window as any).ipcRenderer as {
  invoke: (channel: string, ...args: any[]) => Promise<any>
  send: (channel: string, ...args: any[]) => void
  on: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) => void
  off: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) => void
  once: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) => void
}

export interface IpcResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

class IpcService {
  private listeners: Map<string, (event: IpcRendererEvent, ...args: any[]) => void> = new Map()

  async invoke<T = any>(channel: string, ...args: any[]): Promise<T> {
    try {
      return await nativeIpc.invoke(channel, ...args)
    } catch (error) {
      console.error(`IPC调用失败 [${channel}]:`, error)
      throw error
    }
  }

  send(channel: string, ...args: any[]): void {
    nativeIpc.send(channel, ...args)
  }

  on(channel: string, callback: (event: IpcRendererEvent, ...args: any[]) => void): void {
    if (this.listeners.has(channel)) {
      this.off(channel)
    }

    const listener = (event: IpcRendererEvent, ...args: any[]) => {
      callback(event, ...args)
    }

    nativeIpc.on(channel, listener)
    this.listeners.set(channel, listener)
  }

  off(channel: string): void {
    const listener = this.listeners.get(channel)
    if (listener) {
      nativeIpc.off(channel, listener)
      this.listeners.delete(channel)
    }
  }

  once(channel: string, callback: (event: IpcRendererEvent, ...args: any[]) => void): void {
    nativeIpc.once(channel, callback)
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

  navigate(path: string) {
    return this.send(IPC_CHANNELS.NAVIGATE, path)
  }
}

export const ipcRenderer = new IpcService()
