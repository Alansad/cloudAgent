import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { ApiMapping } from '../types/common'
import { encrypt, decrypt } from '../utils/encrypt'

export class ApiClient {
  private async getAuthHeader(authType: string, authConfig?: any): Promise<Record<string, string>> {
    switch (authType) {
      case 'token':
        const token = await decrypt(localStorage.getItem('authToken') || '')
        return { Authorization: `Bearer ${token}` }
      case 'apiKey':
        const apiKey = await decrypt(authConfig?.apiKey || '')
        return { 'X-API-Key': apiKey }
      case 'basic':
        const username = authConfig?.username || ''
        const password = await decrypt(authConfig?.password || '')
        const basicAuth = btoa(`${username}:${password}`)
        return { Authorization: `Basic ${basicAuth}` }
      case 'oauth2':
        // OAuth2 实现
        const oauthToken = await this.getOAuth2Token(authConfig?.oauth2Url)
        return { Authorization: `Bearer ${oauthToken}` }
      default:
        return {}
    }
  }

  private async getOAuth2Token(tokenUrl: string): Promise<string> {
    // 简化实现，实际需要处理OAuth2流程
    const token = localStorage.getItem('oauth2Token')
    if (token) {
      return decrypt(token)
    }
    throw new Error('OAuth2 token not found')
  }

  private replaceUrlParams(url: string, params: Record<string, any>): string {
    return url.replace(/{(\w+)}/g, (_, key) => {
      if (params[key] === undefined) {
        throw new Error(`Missing required parameter: ${key}`)
      }
      const value = params[key]
      delete params[key]
      return value
    })
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async callApi(
    apiMapping: ApiMapping,
    params: Record<string, any>
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    const { endpoint, method, authType, authConfig, retryConfig, timeout } = apiMapping
    
    try {
      const url = this.replaceUrlParams(endpoint, params)
      const headers = await this.getAuthHeader(authType, authConfig)
      
      const requestConfig: AxiosRequestConfig = {
        url,
        method: method.toLowerCase() as any,
        headers,
        timeout,
        validateStatus: (status) => status >= 200 && status < 300
      }

      if (method === 'GET') {
        requestConfig.params = params
      } else {
        requestConfig.data = params
      }

      const maxRetries = retryConfig?.maxRetries || 0
      const retryDelay = retryConfig?.retryDelay || 1000

      let lastError: any
      for (let i = 0; i <= maxRetries; i++) {
        try {
          const response: AxiosResponse = await axios(requestConfig)
          return {
            success: true,
            data: response.data
          }
        } catch (error) {
          lastError = error
          if (i < maxRetries) {
            await this.sleep(retryDelay * Math.pow(2, i)) // 指数退避
            continue
          }
          throw error
        }
      }

      throw lastError
    } catch (error: any) {
      console.error('API调用失败:', error)
      let errorMessage = 'API调用失败'
      
      if (error.response) {
        const status = error.response.status
        if (status === 401) {
          errorMessage = '身份验证失败，请检查登录状态'
        } else if (status === 403) {
          errorMessage = '没有权限执行此操作'
        } else if (status === 404) {
          errorMessage = '接口不存在'
        } else if (status >= 500) {
          errorMessage = '服务器错误，请稍后重试'
        } else {
          errorMessage = error.response.data?.message || error.message
        }
      } else if (error.request) {
        errorMessage = '网络请求失败，请检查网络连接'
      } else {
        errorMessage = error.message
      }

      return {
        success: false,
        error: errorMessage
      }
    }
  }
}

export const apiClient = new ApiClient()
