// IPC 通信频道
export const IPC_CHANNELS = {
  ENCRYPT: 'encrypt',
  DECRYPT: 'decrypt',
  GET_SYSTEM_INFO: 'get-system-info',
  MINIMIZE_WINDOW: 'minimize-window',
  MAXIMIZE_WINDOW: 'maximize-window',
  CLOSE_WINDOW: 'close-window',
  NAVIGATE: 'navigate',
  WEB_AUTOMATION_ACTION: 'web-automation-action',
  API_CALL: 'api-call',
  MCP_CALL: 'mcp-call'
} as const

// 执行模式
export enum ExecutionMode {
  AUTO = 'auto',
  API = 'api',
  MCP = 'mcp',
  WEB = 'web',
  ASK = 'ask'
}

// 接口映射配置
export interface ApiMapping {
  id: string
  action: string
  description: string
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  authType: 'none' | 'token' | 'apiKey' | 'basic' | 'oauth2'
  authConfig?: {
    tokenKey?: string
    apiKey?: string
    username?: string
    password?: string
    oauth2Url?: string
  }
  paramsSchema: Record<string, any>
  responseSchema: Record<string, any>
  retryConfig?: {
    maxRetries: number
    retryDelay: number
  }
  timeout: number
}

// MCP 服务配置
export interface McpConfig {
  id: string
  name: string
  endpoint: string
  authType: 'none' | 'token' | 'apiKey'
  authConfig?: {
    token?: string
    apiKey?: string
  }
  capabilities: string[]
  timeout: number
}

// 网页自动化步骤
export interface WebStep {
  action: 'click' | 'type' | 'select' | 'wait' | 'navigate' | 'extract'
  selector: string
  value?: string
  timeout?: number
  description?: string
}

// Agent 执行结果
export interface AgentResult {
  mode: ExecutionMode
  success: boolean
  message: string
  data?: any
  error?: string
  steps?: WebStep[]
  executionTime: number
}

// 对话消息
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  executionResult?: AgentResult
}

// 系统信息
export interface SystemInfo {
  platform: 'win32' | 'darwin' | 'linux'
  version: string
}
