import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../src/types/common'
import { apiClient } from '../../src/api/apiClient'
import { mcpClient } from '../../src/api/mcpClient'
import { webAutomationService } from '../../src/api/webAutomation'
import { logger } from '../../src/utils/logger'

export function registerIpcHandlers() {
  // API调用
  ipcMain.handle(IPC_CHANNELS.API_CALL, async (_, config: any, params: any) => {
    try {
      logger.info('api_call', `调用API: ${config.action}`, { config, params })
      const result = await apiClient.callApi(config, params)
      logger.info('api_call', `API调用${result.success ? '成功' : '失败'}: ${config.action}`, result)
      return result
    } catch (error: any) {
      logger.error('api_call', `API调用异常: ${config.action}`, { error: error.message })
      return {
        success: false,
        error: error.message
      }
    }
  })

  // MCP调用
  ipcMain.handle(IPC_CHANNELS.MCP_CALL, async (_, config: any, capability: string, params: any) => {
    try {
      logger.info('mcp_call', `调用MCP能力: ${capability}`, { config, params })
      const result = await mcpClient.callMcp(config, capability, params)
      logger.info('mcp_call', `MCP调用${result.success ? '成功' : '失败'}: ${capability}`, result)
      return result
    } catch (error: any) {
      logger.error('mcp_call', `MCP调用异常: ${capability}`, { error: error.message })
      return {
        success: false,
        error: error.message
      }
    }
  })

  // 网页自动化操作
  ipcMain.handle(IPC_CHANNELS.WEB_AUTOMATION_ACTION, async (_, action: string, params: any) => {
    try {
      logger.info('web_automation', `执行网页操作: ${action}`, params)
      
      switch (action) {
        case 'executeSteps':
          const result = await webAutomationService.executeSteps(params.steps)
          logger.info('web_automation', `网页操作${result.success ? '成功' : '失败'}: ${action}`, result)
          return result
        case 'injectToken':
          await webAutomationService.injectToken(params.token)
          return { success: true }
        case 'getPageStatus':
          const status = await webAutomationService.getPageStatus()
          return { success: true, data: status }
        default:
          return {
            success: false,
            error: `不支持的操作: ${action}`
          }
      }
    } catch (error: any) {
      logger.error('web_automation', `网页操作异常: ${action}`, { error: error.message })
      return {
        success: false,
        error: error.message
      }
    }
  })

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
