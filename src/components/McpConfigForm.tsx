import React from 'react'
import { Form, Input, Select, InputNumber, Button, Space, Tag } from 'antd'
import { McpConfig } from '../types/common'

const { Option } = Select
const { TextArea } = Input

interface McpConfigFormProps {
  initialData?: McpConfig | null
  onSave: (data: McpConfig) => void
  onCancel: () => void
}

export const McpConfigForm: React.FC<McpConfigFormProps> = ({
  initialData,
  onSave,
  onCancel
}) => {
  const [form] = Form.useForm()

  const handleSubmit = () => {
    form.validateFields().then(values => {
      // 处理capabilities字段，分割为数组
      if (typeof values.capabilities === 'string') {
        values.capabilities = values.capabilities.split(',').map((item: string) => item.trim())
      }
      onSave(values as McpConfig)
    })
  }

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialData ? {
        ...initialData,
        capabilities: initialData.capabilities.join(', ')
      } : {
        authType: 'none',
        timeout: 20000,
        capabilities: ''
      }}
    >
      <Form.Item
        label="服务名称"
        name="name"
        rules={[{ required: true, message: '请输入服务名称' }]}
      >
        <Input placeholder="例如：财务MCP服务" />
      </Form.Item>

      <Form.Item
        label="服务地址"
        name="endpoint"
        rules={[{ required: true, message: '请输入服务地址' }]}
      >
        <Input placeholder="https://mcp.example.com/finance" />
      </Form.Item>

      <Form.Item
        label="鉴权方式"
        name="authType"
        rules={[{ required: true, message: '请选择鉴权方式' }]}
      >
        <Select>
          <Option value="none">无鉴权</Option>
          <Option value="token">Bearer Token</Option>
          <Option value="apiKey">API Key</Option>
        </Select>
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.authType !== currentValues.authType
        }
      >
        {({ getFieldValue }) => {
          const authType = getFieldValue('authType')
          if (authType === 'token') {
            return (
              <Form.Item
                label="Token"
                name={['authConfig', 'token']}
                rules={[{ required: true, message: '请输入Token' }]}
              >
                <Input.Password placeholder="Bearer Token" />
              </Form.Item>
            )
          } else if (authType === 'apiKey') {
            return (
              <Form.Item
                label="API Key"
                name={['authConfig', 'apiKey']}
                rules={[{ required: true, message: '请输入API Key' }]}
              >
                <Input.Password placeholder="API Key" />
              </Form.Item>
            )
          }
          return null
        }}
      </Form.Item>

      <Form.Item
        label="服务能力"
        name="capabilities"
        rules={[{ required: true, message: '请输入服务能力' }]}
        help="多个能力用英文逗号分隔"
      >
        <TextArea
          rows={3}
          placeholder="例如：financial-analysis, budget-calculation, tax-calculation"
        />
      </Form.Item>

      <Form.Item label="超时时间(毫秒)" name="timeout">
        <InputNumber min={1000} max={300000} step={1000} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={handleSubmit}>
            保存
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}
