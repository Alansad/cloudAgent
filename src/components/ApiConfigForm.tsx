import React from 'react'
import { Form, Input, Select, InputNumber, Switch, Button, Space } from 'antd'
import { ApiMapping } from '../types/common'

const { Option } = Select
const { TextArea } = Input

interface ApiConfigFormProps {
  initialData?: ApiMapping | null
  onSave: (data: ApiMapping) => void
  onCancel: () => void
}

export const ApiConfigForm: React.FC<ApiConfigFormProps> = ({
  initialData,
  onSave,
  onCancel
}) => {
  const [form] = Form.useForm()

  const handleSubmit = () => {
    form.validateFields().then(values => {
      onSave(values as ApiMapping)
    })
  }

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialData || {
        method: 'POST',
        authType: 'none',
        timeout: 10000,
        retryConfig: {
          maxRetries: 0,
          retryDelay: 1000
        }
      }}
    >
      <Form.Item
        label="业务动作名称"
        name="action"
        rules={[{ required: true, message: '请输入业务动作名称' }]}
      >
        <Input placeholder="例如：导出订单报表" />
      </Form.Item>

      <Form.Item
        label="动作描述"
        name="description"
        rules={[{ required: true, message: '请输入动作描述' }]}
      >
        <TextArea rows={2} placeholder="描述这个接口的作用和使用场景" />
      </Form.Item>

      <Form.Item
        label="接口地址"
        name="endpoint"
        rules={[{ required: true, message: '请输入接口地址' }]}
      >
        <Input placeholder="https://api.example.com/orders/{orderId}" />
      </Form.Item>

      <Form.Item
        label="请求方法"
        name="method"
        rules={[{ required: true, message: '请选择请求方法' }]}
      >
        <Select>
          <Option value="GET">GET</Option>
          <Option value="POST">POST</Option>
          <Option value="PUT">PUT</Option>
          <Option value="DELETE">DELETE</Option>
        </Select>
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
          <Option value="basic">Basic Auth</Option>
          <Option value="oauth2">OAuth2.0</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="请求参数Schema"
        name="paramsSchema"
        rules={[{ required: true, message: '请输入参数Schema' }]}
      >
        <TextArea
          rows={4}
          placeholder='{"startDate": "string (YYYY-MM-DD)", "endDate": "string (YYYY-MM-DD)"}'
        />
      </Form.Item>

      <Form.Item
        label="响应参数Schema"
        name="responseSchema"
        rules={[{ required: true, message: '请输入响应Schema' }]}
      >
        <TextArea
          rows={4}
          placeholder='{"orderId": "string", "status": "string"}'
        />
      </Form.Item>

      <Form.Item label="超时时间(毫秒)" name="timeout">
        <InputNumber min={1000} max={300000} step={1000} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item label="启用重试" name={['retryConfig', 'enabled']}>
        <Switch />
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.retryConfig?.enabled !== currentValues.retryConfig?.enabled
        }
      >
        {({ getFieldValue }) =>
          getFieldValue(['retryConfig', 'enabled']) ? (
            <>
              <Form.Item label="最大重试次数" name={['retryConfig', 'maxRetries']}>
                <InputNumber min={1} max={10} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item label="重试间隔(毫秒)" name={['retryConfig', 'retryDelay']}>
                <InputNumber min={100} max={10000} step={100} style={{ width: '100%' }} />
              </Form.Item>
            </>
          ) : null
        }
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
