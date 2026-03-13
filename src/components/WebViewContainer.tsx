import React, { useRef, useEffect, useState } from 'react'
import { Button, Space, Alert, Spin } from 'antd'
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

    const handleDidStartLoading = () => {
      setIsLoading(true)
      setError(null)
    }

    const handleDidStopLoading = () => {
      setIsLoading(false)
      setPageTitle(webview.getTitle())
      if (state.authToken) {
        webAutomationService.injectToken(state.authToken)
      }
    }

    const handleDidFailLoad = (event: any) => {
      if (event.errorCode === -3) return
      setIsLoading(false)
      setError(`页面加载失败: ${event.errorDescription} (错误码: ${event.errorCode})`)
    }

    const handleDomReady = () => {
      webAutomationService.setWebview(webview)
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
        ; void 0
      `)
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'agent-message') {
        console.log('收到网页消息:', event.data.data)
      }
    }

    webview.addEventListener('did-start-loading', handleDidStartLoading)
    webview.addEventListener('did-stop-loading', handleDidStopLoading)
    webview.addEventListener('did-fail-load', handleDidFailLoad)
    webview.addEventListener('dom-ready', handleDomReady)
    window.addEventListener('message', handleMessage)

    return () => {
      webview.removeEventListener('did-start-loading', handleDidStartLoading)
      webview.removeEventListener('did-stop-loading', handleDidStopLoading)
      webview.removeEventListener('did-fail-load', handleDidFailLoad)
      webview.removeEventListener('dom-ready', handleDomReady)
      window.removeEventListener('message', handleMessage)
    }
  }, [state.authToken])

  const handleReload = () => webviewRef.current?.reload()

  const handleGoHome = () => webviewRef.current?.loadURL(state.webUrl)

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 32px)', display: 'flex', flexDirection: 'column', border: '1px solid #f0f0f0', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
      {/* 工具栏 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
        <Space>
          <span style={{ fontWeight: 500 }}>{pageTitle || '云管家工作台'}</span>
          {isLoading && <Spin size="small" />}
        </Space>
        <Space>
          <Button icon={<HomeOutlined />} size="small" onClick={handleGoHome}>首页</Button>
          <Button icon={<ReloadOutlined />} size="small" onClick={handleReload} loading={isLoading}>刷新</Button>
        </Space>
      </div>

      {/* webview 区域 */}
      <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {error && (
          <Alert
            message="加载异常"
            description={error}
            type="error"
            showIcon
            action={<Button size="small" onClick={handleReload}>重试</Button>}
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
      </div>
    </div>
  )
}
