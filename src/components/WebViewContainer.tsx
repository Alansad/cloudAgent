import React, { useRef, useEffect, useState } from 'react'
import { Card, Button, Space, Alert, Spin } from 'antd'
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons'
import { useAppContext } from '../context/AppContext'
import { webAutomationService } from '../api/webAutomation'

export const WebViewContainer: React.FC = () => {
  const { state } = useAppContext()
  const webviewRef = useRef<Electron.WebviewTag>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pageTitle, setPageTitle] = useState('')

  useEffect(() => {
    const webview = webviewRef.current
    if (!webview) return

    // 注册事件监听
    const handleDidStartLoading = () => {
      setIsLoading(true)
      setError(null)
    }

    const handleDidStopLoading = () => {
      setIsLoading(false)
      setPageTitle(webview.getTitle())
      
      // 注入token
      if (state.authToken) {
        webAutomationService.injectToken(state.authToken)
      }
    }

    const handleDidFailLoad = (event: any) => {
      setIsLoading(false)
      setError(`页面加载失败: ${event.errorDescription} (错误码: ${event.errorCode})`)
    }

    const handleDomReady = () => {
      // 页面DOM加载完成
      webAutomationService.setWebview(webview)
      
      // 注入通信桥
      webview.executeJavaScript(`
        window.agentBridge = {
          sendMessage: (data) => {
            window.postMessage({ type: 'agent-message', data }, '*')
          },
          onMessage: (callback) => {
            window.addEventListener('message', (event) => {
              if (event.data.type === 'agent-command') {
                callback(event.data.data)
              }
            })
          }
        }
      `)
    }

    webview.addEventListener('did-start-loading', handleDidStartLoading)
    webview.addEventListener('did-stop-loading', handleDidStopLoading)
    webview.addEventListener('did-fail-load', handleDidFailLoad)
    webview.addEventListener('dom-ready', handleDomReady)

    // 监听来自网页的消息
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'agent-message') {
        console.log('收到网页消息:', event.data.data)
        // 处理来自网页的消息
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      webview.removeEventListener('did-start-loading', handleDidStartLoading)
      webview.removeEventListener('did-stop-loading', handleDidStopLoading)
      webview.removeEventListener('did-fail-load', handleDidFailLoad)
      webview.removeEventListener('dom-ready', handleDomReady)
      window.removeEventListener('message', handleMessage)
    }
  }, [state.authToken])

  const handleReload = () => {
    const webview = webviewRef.current
    if (webview) {
      webview.reload()
    }
  }

  const handleGoHome = () => {
    const webview = webviewRef.current
    if (webview) {
      webview.loadURL(state.webUrl)
    }
  }

  return (
    <Card
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      title={
        <Space>
          {pageTitle || '云管家工作台'}
          {isLoading && <Spin size="small" />}
        </Space>
      }
      extra={
        <Space>
          <Button 
            icon={<HomeOutlined />} 
            size="small" 
            onClick={handleGoHome}
          >
            首页
          </Button>
          <Button 
            icon={<ReloadOutlined />} 
            size="small" 
            onClick={handleReload}
            loading={isLoading}
          >
            刷新
          </Button>
        </Space>
      }
      bodyStyle={{ flex: 1, padding: 0, overflow: 'hidden' }}
    >
      {error && (
        <Alert
          message="加载异常"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={handleReload}>
              重试
            </Button>
          }
          style={{ margin: 16 }}
        />
      )}
      
      <webview
        ref={webviewRef}
        src={state.webUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: error ? 'none' : 'block'
        }}
        allowpopups={false}
        partition="persist:agent"
      />
    </Card>
  )
}
