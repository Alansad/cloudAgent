const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const app = express()
const PORT = 3001

app.use(cors())
app.use(bodyParser.json())

// Mock API 接口
const apiMappings = [
  {
    id: 'export-order-report',
    action: '导出订单报表',
    endpoint: '/api/reports/orders',
    method: 'POST',
    authType: 'token'
  },
  {
    id: 'query-user-info',
    action: '查询用户信息',
    endpoint: '/api/users/:userId',
    method: 'GET',
    authType: 'token'
  },
  {
    id: 'create-order',
    action: '创建订单',
    endpoint: '/api/orders',
    method: 'POST',
    authType: 'token'
  }
]

// Mock MCP 服务
const mcpServices = [
  {
    id: 'finance-mcp',
    name: '财务MCP服务',
    endpoint: '/mcp/finance',
    capabilities: ['financial-analysis', 'budget-calculation', 'tax-calculation']
  }
]

// 中间件：验证Token
app.use((req, res, next) => {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // 简单Mock验证，任何非空Token都通过
    next()
  } else if (req.path.startsWith('/mcp/')) {
    // MCP服务验证API Key
    const apiKey = req.headers['x-api-key']
    if (apiKey) {
      next()
    } else {
      return res.status(401).json({
        success: false,
        error: '缺少API Key'
      })
    }
  } else if (req.path === '/api/login') {
    // 登录接口不需要验证
    next()
  } else {
    return res.status(401).json({
      success: false,
      error: '身份验证失败'
    })
  }
})

// 登录接口
app.post('/api/login', (req, res) => {
  const { username, password } = req.body
  if (username === 'admin' && password === '123456') {
    res.json({
      success: true,
      token: 'mock-token-' + Date.now(),
      user: {
        id: '1',
        name: '管理员',
        role: 'admin'
      }
    })
  } else {
    res.status(401).json({
      success: false,
      error: '用户名或密码错误'
    })
  }
})

// 导出订单报表
app.post('/api/reports/orders', (req, res) => {
  const { startDate, endDate, format = 'excel' } = req.body
  
  // 模拟处理延迟
  setTimeout(() => {
    res.json({
      success: true,
      data: {
        fileUrl: `https://example.com/reports/orders_${startDate}_${endDate}.${format}`,
        fileName: `订单报表_${startDate}_${endDate}.${format}`,
        size: 1024 * 1024 * 2.5, // 2.5MB
        totalOrders: 1256,
        totalAmount: 1256800.50,
        generatedAt: new Date().toISOString()
      }
    })
  }, 1500) // 模拟1.5秒处理时间
})

// 查询用户信息
app.get('/api/users/:userId', (req, res) => {
  const { userId } = req.params
  
  res.json({
    success: true,
    data: {
      id: userId,
      name: userId === '1' ? '张三' : userId === '2' ? '李四' : '王五',
      email: `user${userId}@example.com`,
      phone: `1380013800${userId}`,
      registerTime: '2025-01-15T10:30:00Z',
      level: 'VIP'
    }
  })
})

// 创建订单
app.post('/api/orders', (req, res) => {
  const { productId, quantity, amount, customerId } = req.body
  
  setTimeout(() => {
    res.json({
      success: true,
      data: {
        orderId: 'ORD' + Date.now(),
        status: 'created',
        createTime: new Date().toISOString(),
        productId,
        quantity,
        amount,
        customerId
      }
    })
  }, 1000)
})

// MCP 健康检查
app.get('/mcp/finance/v1/health', (req, res) => {
  res.json({
    success: true,
    status: 'running',
    version: '1.0.0'
  })
})

// MCP 能力列表
app.get('/mcp/finance/v1/capabilities', (req, res) => {
  res.json({
    success: true,
    capabilities: ['financial-analysis', 'budget-calculation', 'tax-calculation']
  })
})

// MCP 执行能力
app.post('/mcp/finance/v1/capabilities/:capability/execute', (req, res) => {
  const { capability } = req.params
  const { params } = req.body
  
  setTimeout(() => {
    switch (capability) {
      case 'financial-analysis':
        res.json({
          success: true,
          result: {
            analysisId: 'FA-' + Date.now(),
            period: params.period || '2026-03',
            revenue: 1250000,
            cost: 850000,
            profit: 400000,
            profitMargin: '32%',
            suggestions: [
              '建议优化供应链成本，预计可提升利润率5%',
              '高价值客户占比提升至60%，建议重点维护',
              '营销费用ROI有所下降，建议调整投放策略'
            ]
          }
        })
        break
      
      case 'budget-calculation':
        res.json({
          success: true,
          result: {
            budgetId: 'BG-' + Date.now(),
            department: params.department || '市场部',
            quarter: params.quarter || 'Q1-2026',
            totalBudget: 500000,
            allocated: 380000,
            remaining: 120000,
            items: [
              { name: '广告投放', amount: 200000, used: 180000 },
              { name: '活动经费', amount: 150000, used: 120000 },
              { name: '人员成本', amount: 150000, used: 80000 }
            ]
          }
        })
        break
      
      case 'tax-calculation':
        res.json({
          success: true,
          result: {
            calculationId: 'TAX-' + Date.now(),
            period: params.period || '2026-03',
            revenue: params.revenue || 1000000,
            deductible: params.deductible || 400000,
            taxableAmount: 600000,
            taxRate: '25%',
            taxAmount: 150000,
            dueDate: '2026-04-15',
            suggestions: [
              '可申请研发费用加计扣除，预计减免税额30000元',
              '符合小微企业税收优惠政策，可进一步降低税率'
            ]
          }
        })
        break
      
      default:
        res.status(404).json({
          success: false,
          error: '能力不存在'
        })
    }
  }, 2000)
})

// 接口列表
app.get('/api/config/mappings', (req, res) => {
  res.json({
    success: true,
    data: apiMappings
  })
})

// MCP服务列表
app.get('/api/config/mcp-services', (req, res) => {
  res.json({
    success: true,
    data: mcpServices
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Mock服务器已启动，运行在 http://localhost:${PORT}`)
  console.log('')
  console.log('📋 可用API接口：')
  apiMappings.forEach(api => {
    console.log(`  ${api.method} ${api.endpoint} - ${api.action}`)
  })
  console.log('')
  console.log('🤖 可用MCP服务：')
  mcpServices.forEach(mcp => {
    console.log(`  ${mcp.name} - 能力：${mcp.capabilities.join(', ')}`)
  })
  console.log('')
  console.log('🔑 测试账号：admin / 123456')
  console.log('🔑 测试Token：任意非空字符串即可')
  console.log('🔑 MCP测试API Key：任意非空字符串即可')
})
