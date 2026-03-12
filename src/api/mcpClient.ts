import axios from 'axios'
import { McpConfig } from '../types/common'
import { decrypt } from '../utils/encrypt'

export class McpClient {
  private async getAuthHeader(authType: string, authConfig?: any): Promise<Record<string, string>> {
    switch (authType) {
      case 'token':
        const token = await decrypt(authConfig?.token || '')
        return { Authorization: `Bearer ${token}` }
      case 'apiKey':
        const apiKey = await decrypt(authConfig?.apiKey || '')
        return { 'X-API-Key': apiKey }
      default:
        return {}
    }
  }

  async callMcp(
    mcpConfig: McpConfig,
    capability: string,
    params: Record<string, any>
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    const { endpoint, authType, authConfig, timeout } = mcpConfig

    try {
      const headers = await this.getAuthHeader(authType, authConfig)

      const response = await axios.post(
        `${endpoint}/v1/capabilities/${capability}/execute`,
        {
          params,
          context: {
            timestamp: Date.now(),
            version: '1.0.0'
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          timeout
        }
      )

      if (response.data.success) {
        return {
          success: true,
          data: response.data.result
        }
      } else {
        return {
          success: false,
          error: response.data.error || 'MCP服务执行失败'
        }
      }
    } catch (error: any) {
      console.error('MCP调用失败:', error)
      let errorMessage = 'MCP服务调用失败'
      
      if (error.response) {
        const status = error.response.status
        if (status === 401) {
          errorMessage = '身份验证失败，请检查MCP服务配置'
        } else if (status === 403) {
          errorMessage = '没有权限访问该MCP服务'
        } else if (status === 404) {
          errorMessage = 'MCP服务或能力不存在'
        } else if (status >= 500) {
          errorMessage = 'MCP服务内部错误，请稍后重试'
        } else {
          errorMessage = error.response.data?.error || error.message
        }
      } else if (error.request) {
        errorMessage = '网络请求失败，请检查网络连接和MCP服务地址'
      } else {
        errorMessage = error.message
      }

      return {
        success: false,
        error: errorMessage
      }
    }
  }

  async listCapabilities(mcpConfig: McpConfig): Promise<{ success: boolean; capabilities?: string[]; error?: string }> {
    const { endpoint, authType, authConfig, timeout } = mcpConfig

    try {
      const headers = await this.getAuthHeader(authType, authConfig)

      const response = await axios.get(
        `${endpoint}/v1/capabilities`,
        {
          headers,
          timeout
        }
      )

      return {
        success: true,
        capabilities: response.data.capabilities || []
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async getHealth(mcpConfig: McpConfig): Promise<{ success: boolean; status?: string; version?: string; error?: string }> {
    try {
      const headers = await this.getAuthHeader(mcpConfig.authType, mcpConfig.authConfig)

      const response = await axios.get(
        `${mcpConfig.endpoint}/v1/health`,
        {
          headers,
          timeout: 5000
        }
      )

      return {
        success: true,
        status: response.data.status,
        version: response.data.version
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }
}

export const mcpClient = new McpClient()
