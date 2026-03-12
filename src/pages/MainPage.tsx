import React from 'react'
import { Layout, Row, Col } from 'antd'
import { ChatWindow } from '../components/ChatWindow'
import { WebViewContainer } from '../components/WebViewContainer'
import { ModeSwitch } from '../components/ModeSwitch'

const { Sider, Content } = Layout

export const MainPage: React.FC = () => {
  return (
    <Layout style={{ height: '100vh' }}>
      <Sider 
        width={400} 
        style={{ 
          background: '#f0f2f5', 
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid #e8e8e8'
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <ModeSwitch />
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <ChatWindow />
        </div>
      </Sider>
      
      <Content style={{ padding: 16, background: '#fff' }}>
        <WebViewContainer />
      </Content>
    </Layout>
  )
}
