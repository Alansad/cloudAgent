import React, { useState } from 'react'
import { Layout, Tabs, Form, Input, Button, Card, Space, Table, Modal, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons'
import { useAppContext } from '../context/AppContext'
import { ApiMapping, McpConfig } from '../types/common'
import { ApiConfigForm } from '../components/ApiConfigForm'
import { McpConfigForm } from '../components/McpConfigForm'

const { Content } = Layout
const { TabPane } = Tabs

export const SettingsPage: React.FC = () => {
  const { state, dispatch } = useAppContext()
  const [form] = Form.useForm()
  const [apiModalVisible, setApiModalVisible] = useState(false)
  const [mcpModalVisible, setMcpModalVisible] = useState(false)
  const [editingApi, setEditingApi] = useState<ApiMapping | null>(null)
  const [editingMcp, setEditingMcp] = useState<McpConfig | null>(null)

  // 通用设置
  const handleSaveGeneral = () => {
    form.validateFields().then(values => {
      dispatch({ type: 'SET_WEB_URL', payload: values.webUrl })
      localStorage.setItem('llmApiKey', values.llmApiKey)
      localStorage.setItem('authToken', values.authToken)
      message.success('设置已保存')
    })
  }

  // API 配置相关
  const handleAddApi = () => {
    setEditingApi(null)
    setApiModalVisible(true)
  }

  const handleEditApi = (record: ApiMapping) => {
    setEditingApi(record)
    setApiModalVisible(true)
  }

  const handleDeleteApi = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个API映射吗？',
      onOk: () => {
        dispatch({ type: 'DELETE_API_MAPPING', payload: id })
        message.success('删除成功')
      }
    })
  }

  const handleSaveApi = (apiMapping: ApiMapping) => {
    if (editingApi) {
      dispatch({ type: 'UPDATE_API_MAPPING', payload: apiMapping })
      message.success('API配置已更新')
    } else {
      dispatch({ type: 'ADD_API_MAPPING', payload: { ...apiMapping, id: Date.now().toString() } })
      message.success('API配置已添加')
    }
    setApiModalVisible(false)
  }

  // MCP 配置相关
  const handleAddMcp = () => {
    setEditingMcp(null)
    setMcpModalVisible(true)
  }

  const handleEditMcp = (record: McpConfig) => {
    setEditingMcp(record)
    setMcpModalVisible(true)
  }

  const handleDeleteMcp = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个MCP配置吗？',
      onOk: () => {
        dispatch({ type: 'DELETE_MCP_CONFIG', payload: id })
        message.success('删除成功')
      }
    })
  }

  const handleSaveMcp = (mcpConfig: McpConfig) => {
    if (editingMcp) {
      dispatch({ type: 'UPDATE_MCP_CONFIG', payload: mcpConfig })
      message.success('MCP配置已更新')
    } else {
      dispatch({ type: 'ADD_MCP_CONFIG', payload: { ...mcpConfig, id: Date.now().toString() } })
      message.success('MCP配置已添加')
    }
    setMcpModalVisible(false)
  }

  const apiColumns = [
    { title: '业务动作', dataIndex: 'action', key: 'action', width: 150 },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: '接口地址', dataIndex: 'endpoint', key: 'endpoint', ellipsis: true },
    { title: '请求方法', dataIndex: 'method', key: 'method', width: 80 },
    { title: '鉴权方式', dataIndex: 'authType', key: 'authType', width: 100 },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, record: ApiMapping) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditApi(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDeleteApi(record.id)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ]

  const mcpColumns = [
    { title: '服务名称', dataIndex: 'name', key: 'name', width: 150 },
    { title: '服务地址', dataIndex: 'endpoint', key: 'endpoint', ellipsis: true },
    { title: '鉴权方式', dataIndex: 'authType', key: 'authType', width: 100 },
    {
      title: '能力',
      dataIndex: 'capabilities',
      key: 'capabilities',
      render: (caps: string[]) => caps.join(', ')
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, record: McpConfig) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditMcp(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDeleteMcp(record.id)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ]

  return (
    <Layout style={{ padding: 24, minHeight: '100vh' }}>
      <Content>
        <Card title="系统设置" style={{ marginBottom: 24 }}>
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              webUrl: state.webUrl,
              llmApiKey: localStorage.getItem('llmApiKey') || '',
              authToken: localStorage.getItem('authToken') || ''
            }}
          >
            <Form.Item
              label="云管家工作台地址"
              name="webUrl"
              rules={[{ required: true, message: '请输入工作台地址' }]}
            >
              <Input placeholder="http://test.trusteeship.link.lianjia.com" />
            </Form.Item>

            <Form.Item
              label="大模型API密钥"
              name="llmApiKey"
              rules={[{ required: true, message: '请输入API密钥' }]}
            >
              <Input.Password placeholder="sk-xxx" />
            </Form.Item>

            <Form.Item
              label="系统认证Token"
              name="authToken"
            >
              <Input.Password placeholder="可选，登录后自动填充" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveGeneral}>
                保存设置
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Tabs defaultActiveKey="api">
          <TabPane tab="API映射配置" key="api">
            <Card
              extra={
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddApi}>
                  新增API映射
                </Button>
              }
            >
              <Table
                columns={apiColumns}
                dataSource={state.apiMappings}
                rowKey="id"
                pagination={false}
                scroll={{ y: 400 }}
              />
            </Card>
          </TabPane>

          <TabPane tab="MCP服务配置" key="mcp">
            <Card
              extra={
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddMcp}>
                  新增MCP服务
                </Button>
              }
            >
              <Table
                columns={mcpColumns}
                dataSource={state.mcpConfigs}
                rowKey="id"
                pagination={false}
                scroll={{ y: 400 }}
              />
            </Card>
          </TabPane>
        </Tabs>

        <Modal
          title={editingApi ? '编辑API映射' : '新增API映射'}
          open={apiModalVisible}
          onCancel={() => setApiModalVisible(false)}
          footer={null}
          width={800}
          destroyOnClose
        >
          <ApiConfigForm
            initialData={editingApi}
            onSave={handleSaveApi}
            onCancel={() => setApiModalVisible(false)}
          />
        </Modal>

        <Modal
          title={editingMcp ? '编辑MCP服务' : '新增MCP服务'}
          open={mcpModalVisible}
          onCancel={() => setMcpModalVisible(false)}
          footer={null}
          width={700}
          destroyOnClose
        >
          <McpConfigForm
            initialData={editingMcp}
            onSave={handleSaveMcp}
            onCancel={() => setMcpModalVisible(false)}
          />
        </Modal>
      </Content>
    </Layout>
  )
}
