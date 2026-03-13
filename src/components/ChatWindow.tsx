import React, { useState, useRef, useEffect } from 'react'
import { List, Input, Button, Card, Typography, Alert, Tag } from 'antd'
import { SendOutlined, ClearOutlined, LoadingOutlined } from '@ant-design/icons'
import { useAppContext } from '../context/AppContext'
import { LLMService } from '../api/llm'
import { apiClient } from '../api/apiClient'
import { webAutomationService } from '../api/webAutomation'
import { ExecutionMode, ChatMessage, AgentResult } from '../types/common'
import dayjs from 'dayjs'

const { Text, Paragraph } = Typography
const { TextArea } = Input

export const ChatWindow: React.FC = () => {
  const { state, dispatch } = useAppContext()
  const [inputValue, setInputValue] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.chatHistory])

  const handleSend = async () => {
    if (!inputValue.trim() || isProcessing) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: Date.now()
    }

    dispatch({ type: 'ADD_CHAT_MESSAGE', payload: userMessage })
    setInputValue('')
    setIsProcessing(true)

    try {
      // 初始化LLM服务（实际应该从配置中读取）
      const llmConfig = {
        provider: 'codeplan' as const,
        apiKey: localStorage.getItem('llmApiKey') || '',
        model: 'codeplan-3.5'
      }

      if (!llmConfig.apiKey) {
        throw new Error('请先在设置页面配置大模型API密钥')
      }

      const llmService = new LLMService(llmConfig)
      
      // 处理用户输入
      const agentResponse = await llmService.processUserInput(
        userMessage.content,
        state.apiMappings,
        state.executionMode
      )

      let executionResult: AgentResult | undefined
      const startTime = Date.now()

      if (agentResponse.mode === ExecutionMode.ASK) {
        // 需要询问用户
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: agentResponse.content || '请提供更多信息',
          timestamp: Date.now()
        }
        dispatch({ type: 'ADD_CHAT_MESSAGE', payload: assistantMessage })
        return
      }

      if (agentResponse.mode === ExecutionMode.API && agentResponse.action) {
        // 执行API调用
        const apiMapping = state.apiMappings.find(m => m.action === agentResponse.action)
        if (!apiMapping) {
          throw new Error(`未找到对应的API映射: ${agentResponse.action}`)
        }

        const apiResult = await apiClient.callApi(apiMapping, agentResponse.params || {})
        
        executionResult = {
          mode: ExecutionMode.API,
          success: apiResult.success,
          message: apiResult.success ? 'API调用成功' : 'API调用失败',
          data: apiResult.data,
          error: apiResult.error,
          executionTime: Date.now() - startTime
        }
      } else if (agentResponse.mode === ExecutionMode.WEB && agentResponse.steps) {
        // 执行网页自动化
        const webResult = await webAutomationService.executeSteps(agentResponse.steps)
        
        executionResult = {
          mode: ExecutionMode.WEB,
          success: webResult.success,
          message: webResult.success ? '网页自动化执行成功' : '网页自动化执行失败',
          data: webResult.data,
          error: webResult.error,
          steps: agentResponse.steps,
          executionTime: Date.now() - startTime
        }
      }

      // 生成自然语言回复
      let responseContent = ''
      if (executionResult) {
        if (executionResult.success) {
          responseContent = await llmService.generateNaturalResponse(executionResult.data, userMessage.content)
        } else {
          responseContent = `操作失败: ${executionResult.error}`
        }
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: Date.now(),
        executionResult
      }

      dispatch({ type: 'ADD_CHAT_MESSAGE', payload: assistantMessage })

    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `处理失败: ${error.message}`,
        timestamp: Date.now()
      }
      dispatch({ type: 'ADD_CHAT_MESSAGE', payload: errorMessage })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClear = () => {
    dispatch({ type: 'CLEAR_CHAT_HISTORY' })
  }

  const renderMessageItem = (item: ChatMessage) => (
    <List.Item
      style={{
        justifyContent: item.role === 'user' ? 'flex-end' : 'flex-start',
        padding: '8px 0'
      }}
    >
      <Card
        size="small"
        style={{
          maxWidth: '70%',
          background: item.role === 'user' ? '#e6f7ff' : '#fff',
          borderColor: item.role === 'user' ? '#91d5ff' : '#d9d9d9'
        }}
      >
        <div style={{ marginBottom: 8 }}>
          <Tag color={item.role === 'user' ? 'blue' : 'green'}>
            {item.role === 'user' ? '你' : '助手'}
          </Tag>
          <Text type="secondary" style={{ fontSize: '12px', marginLeft: 8 }}>
            {dayjs(item.timestamp).format('HH:mm:ss')}
          </Text>
        </div>
        
        <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
          {item.content}
        </Paragraph>

        {item.executionResult && (
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #f0f0f0' }}>
            <Alert
              type={item.executionResult.success ? 'success' : 'error'}
              message={
                <div style={{ fontSize: '12px' }}>
                  <Text strong>执行模式:</Text> {item.executionResult.mode}
                  <Text type="secondary" style={{ marginLeft: 16 }}>
                    耗时: {item.executionResult.executionTime}ms
                  </Text>
                </div>
              }
              description={
                item.executionResult.error || 
                (item.executionResult.data ? JSON.stringify(item.executionResult.data, null, 2) : undefined)
              }
              showIcon
            />
          </div>
        )}
      </Card>
    </List.Item>
  )

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>AI 助手</Typography.Title>
        <Button 
          icon={<ClearOutlined />} 
          size="small" 
          onClick={handleClear}
          disabled={state.chatHistory.length === 0}
        >
          清空对话
        </Button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', marginBottom: 16 }}>
        <List
          dataSource={state.chatHistory}
          renderItem={renderMessageItem}
          locale={{ emptyText: '暂无对话记录，开始你的提问吧' }}
        />
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <TextArea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="输入你的问题..."
          autoSize={{ minRows: 2, maxRows: 4 }}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          disabled={isProcessing}
        />
        <Button
          type="primary"
          icon={isProcessing ? <LoadingOutlined spin /> : <SendOutlined />}
          onClick={handleSend}
          disabled={!inputValue.trim() || isProcessing}
          style={{ height: 'auto' }}
        >
          发送
        </Button>
      </div>
    </div>
  )
}
