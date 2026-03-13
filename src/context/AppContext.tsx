import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { ExecutionMode, ChatMessage, ApiMapping, McpConfig, SystemInfo } from '../types/common'
import apiMapping from '../config/apiMapping.json'
import mcpConfig from '../config/mcpConfig.json'

interface AppState {
  systemInfo: SystemInfo | null
  executionMode: ExecutionMode
  chatHistory: ChatMessage[]
  apiMappings: ApiMapping[]
  mcpConfigs: McpConfig[]
  authToken: string | null
  webUrl: string
  isLoading: boolean
}

type AppAction =
  | { type: 'SET_SYSTEM_INFO'; payload: SystemInfo }
  | { type: 'SET_EXECUTION_MODE'; payload: ExecutionMode }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'CLEAR_CHAT_HISTORY' }
  | { type: 'ADD_API_MAPPING'; payload: ApiMapping }
  | { type: 'UPDATE_API_MAPPING'; payload: ApiMapping }
  | { type: 'DELETE_API_MAPPING'; payload: string }
  | { type: 'ADD_MCP_CONFIG'; payload: McpConfig }
  | { type: 'UPDATE_MCP_CONFIG'; payload: McpConfig }
  | { type: 'DELETE_MCP_CONFIG'; payload: string }
  | { type: 'SET_AUTH_TOKEN'; payload: string | null }
  | { type: 'SET_WEB_URL'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }

const initialState: AppState = {
  systemInfo: null,
  executionMode: ExecutionMode.AUTO,
  chatHistory: [],
  apiMappings: apiMapping as ApiMapping[],
  mcpConfigs: mcpConfig as McpConfig[],
  authToken: null,
  webUrl: 'https://workspace.example.com',
  isLoading: false
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_SYSTEM_INFO':
      return { ...state, systemInfo: action.payload }
    case 'SET_EXECUTION_MODE':
      return { ...state, executionMode: action.payload }
    case 'ADD_CHAT_MESSAGE':
      return { ...state, chatHistory: [...state.chatHistory, action.payload] }
    case 'CLEAR_CHAT_HISTORY':
      return { ...state, chatHistory: [] }
    case 'ADD_API_MAPPING':
      return { ...state, apiMappings: [...state.apiMappings, action.payload] }
    case 'UPDATE_API_MAPPING':
      return {
        ...state,
        apiMappings: state.apiMappings.map(item => 
          item.id === action.payload.id ? action.payload : item
        )
      }
    case 'DELETE_API_MAPPING':
      return {
        ...state,
        apiMappings: state.apiMappings.filter(item => item.id !== action.payload)
      }
    case 'ADD_MCP_CONFIG':
      return { ...state, mcpConfigs: [...state.mcpConfigs, action.payload] }
    case 'UPDATE_MCP_CONFIG':
      return {
        ...state,
        mcpConfigs: state.mcpConfigs.map(item => 
          item.id === action.payload.id ? action.payload : item
        )
      }
    case 'DELETE_MCP_CONFIG':
      return {
        ...state,
        mcpConfigs: state.mcpConfigs.filter(item => item.id !== action.payload)
      }
    case 'SET_AUTH_TOKEN':
      return { ...state, authToken: action.payload }
    case 'SET_WEB_URL':
      return { ...state, webUrl: action.payload }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    default:
      return state
  }
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // 加载本地存储的配置
  useEffect(() => {
    const savedApiMappings = localStorage.getItem('apiMappings')
    const savedMcpConfigs = localStorage.getItem('mcpConfigs')
    const savedWebUrl = localStorage.getItem('webUrl')
    const savedExecutionMode = localStorage.getItem('executionMode')

    if (savedApiMappings) {
      ;(JSON.parse(savedApiMappings) as ApiMapping[]).forEach(item => {
        dispatch({ type: 'ADD_API_MAPPING', payload: item })
      })
    }
    if (savedMcpConfigs) {
      ;(JSON.parse(savedMcpConfigs) as McpConfig[]).forEach(item => {
        dispatch({ type: 'ADD_MCP_CONFIG', payload: item })
      })
    }
    if (savedWebUrl) {
      dispatch({ type: 'SET_WEB_URL', payload: savedWebUrl })
    }
    if (savedExecutionMode) {
      dispatch({ type: 'SET_EXECUTION_MODE', payload: savedExecutionMode as ExecutionMode })
    }
  }, [])

  // 保存配置到本地存储
  useEffect(() => {
    localStorage.setItem('apiMappings', JSON.stringify(state.apiMappings))
    localStorage.setItem('mcpConfigs', JSON.stringify(state.mcpConfigs))
    localStorage.setItem('webUrl', state.webUrl)
    localStorage.setItem('executionMode', state.executionMode)
  }, [state.apiMappings, state.mcpConfigs, state.webUrl, state.executionMode])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}
