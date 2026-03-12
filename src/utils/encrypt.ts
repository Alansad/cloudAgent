import { ipcRenderer } from './ipc'
import { IPC_CHANNELS } from '../types/common'

/**
 * 加密数据，使用Electron主进程的安全存储
 * @param data 要加密的明文
 * @returns 加密后的字符串
 */
export async function encrypt(data: string): Promise<string> {
  try {
    return await ipcRenderer.invoke(IPC_CHANNELS.ENCRYPT, data)
  } catch (error) {
    console.error('加密失败:', error)
    // 降级处理，使用简单编码（生产环境建议移除）
    return btoa(data)
  }
}

/**
 * 解密数据
 * @param encryptedData 加密后的字符串
 * @returns 解密后的明文
 */
export async function decrypt(encryptedData: string): Promise<string> {
  if (!encryptedData) return ''
  
  try {
    return await ipcRenderer.invoke(IPC_CHANNELS.DECRYPT, encryptedData)
  } catch (error) {
    console.error('解密失败:', error)
    // 降级处理
    try {
      return atob(encryptedData)
    } catch {
      return encryptedData
    }
  }
}

/**
 * 加密存储到localStorage
 * @param key 存储键名
 * @param data 要存储的数据
 */
export async function setEncryptedItem(key: string, data: string): Promise<void> {
  const encrypted = await encrypt(data)
  localStorage.setItem(key, encrypted)
}

/**
 * 从localStorage解密获取数据
 * @param key 存储键名
 * @returns 解密后的数据
 */
export async function getEncryptedItem(key: string): Promise<string | null> {
  const encrypted = localStorage.getItem(key)
  if (!encrypted) return null
  
  return decrypt(encrypted)
}

/**
 * 从localStorage移除加密数据
 * @param key 存储键名
 */
export function removeEncryptedItem(key: string): void {
  localStorage.removeItem(key)
}
