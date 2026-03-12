import React from 'react'
import { Segmented, Space, Typography } from 'antd'
import { RocketOutlined, ApiOutlined, GlobalOutlined, RobotOutlined } from '@ant-design/icons'
import { useAppContext } from '../context/AppContext'
import { ExecutionMode } from '../types/common'

const { Text } = Typography

export const ModeSwitch: React.FC = () => {
  const { state, dispatch } = useAppContext()

  const handleModeChange = (value: ExecutionMode) => {
    dispatch({ type: 'SET_EXECUTION_MODE', payload: value })
  }

  const modeOptions = [
    {
      label: (
        <Space>
          <RocketOutlined />
          <span>智能模式</span>
        </Space>
      ),
      value: ExecutionMode.AUTO,
      title: '自动选择最优执行方式，优先调用接口/MCP，失败降级为网页自动化'
    },
    {
      label: (
        <Space>
          <ApiOutlined />
          <span>接口优先</span>
        </Space>
      ),
      value: ExecutionMode.API,
      title: '强制使用接口/MCP方式执行，无对应接口时询问用户'
    },
    {
      label: (
        <Space>
          <GlobalOutlined />
          <span>网页操作</span>
        </Space>
      ),
      value: ExecutionMode.WEB,
      title: '强制使用网页自动化方式执行'
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <Text strong>执行模式</Text>
      </div>
      <Segmented
        options={modeOptions}
        value={state.executionMode}
        onChange={handleModeChange}
        block
      />
      <Text type="secondary" style={{ fontSize: '12px', marginTop: 4, display: 'block' }}>
        {modeOptions.find(m => m.value === state.executionMode)?.title}
      </Text>
    </div>
  )
}
