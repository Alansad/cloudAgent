import { ipcMain } from 'electron'
import { logger } from '../../src/utils/logger'

export function registerIpcHandlers() {
  // 日志查询
  ipcMain.handle('logger:query', async (_, options: any) => {
    try {
      const logs = await logger.queryLogs(options)
      return { success: true, data: logs }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 清空日志
  ipcMain.handle('logger:clear', async (_, olderThan?: number) => {
    try {
      const success = await logger.clearLogs(olderThan)
      return { success }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
