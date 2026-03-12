# Demo 演示指南

本目录提供了Mock服务器和演示用例，用于快速体验Agent助手的双执行模式功能。

## 🚀 快速启动Demo

### 1. 启动Mock服务器
```bash
# 安装依赖
npm install express cors body-parser

# 启动Mock服务器
node demo/mock-server.js
```

启动成功后会显示：
```
🚀 Mock服务器已启动，运行在 http://localhost:3001

📋 可用API接口：
  POST /api/reports/orders - 导出订单报表
  GET /api/users/:userId - 查询用户信息
  POST /api/orders - 创建订单

🤖 可用MCP服务：
  财务MCP服务 - 能力：financial-analysis, budget-calculation, tax-calculation

🔑 测试账号：admin / 123456
🔑 测试Token：任意非空字符串即可
🔑 MCP测试API Key：任意非空字符串即可
```

### 2. 配置Agent助手
打开Agent助手 → 设置页面，配置以下信息：

#### 通用配置
- 云管家工作台地址：`http://localhost:3001`（或你的实际工作台地址）
- 大模型API密钥：配置你的通义千问/OpenAI API Key
- 系统认证Token：随便输入任意字符串（Mock服务器不验证）

#### API映射配置
新增以下API映射（已默认配置，可直接使用）：
1. **导出订单报表**
   - 接口地址：`http://localhost:3001/api/reports/orders`
   - 请求方法：POST
   - 鉴权方式：Token
   - 参数Schema：
     ```json
     {
       "startDate": "string (YYYY-MM-DD)",
       "endDate": "string (YYYY-MM-DD)",
       "format": "string (excel/csv) = excel"
     }
     ```

2. **查询用户信息**
   - 接口地址：`http://localhost:3001/api/users/{userId}`
   - 请求方法：GET
   - 鉴权方式：Token

3. **创建订单**
   - 接口地址：`http://localhost:3001/api/orders`
   - 请求方法：POST
   - 鉴权方式：Token
   - 参数Schema：
     ```json
     {
       "productId": "string",
       "quantity": "number",
       "amount": "number",
       "customerId": "string"
     }
     ```

#### MCP服务配置
新增以下MCP服务（已默认配置，可直接使用）：
1. **财务MCP服务**
   - 服务地址：`http://localhost:3001/mcp/finance`
   - 鉴权方式：API Key
   - API Key：随便输入任意字符串
   - 服务能力：`financial-analysis, budget-calculation, tax-calculation`

## 🎯 演示用例

### 用例1：API调用演示（导出订单报表）
**执行模式**：智能模式 / 接口优先

**输入指令**：
```
导出2026年3月的订单报表，格式为excel
```

**预期执行过程**：
1. Agent理解需求，判断可通过API执行
2. 调用 `POST http://localhost:3001/api/reports/orders` 接口
3. 接口返回报表下载地址和统计数据
4. Agent生成自然语言回复，包含报表信息

**示例回复**：
```
✅ 2026年3月订单报表导出成功！
📊 报表信息：
- 文件名称：订单报表_2026-03-01_2026-03-31.excel
- 文件大小：2.5MB
- 总订单数：1256单
- 总金额：1,256,800.50元
- 下载地址：https://example.com/reports/orders_2026-03-01_2026-03-31.excel
```

---

### 用例2：API调用演示（查询用户信息）
**输入指令**：
```
查询用户ID为1的详细信息
```

**预期执行过程**：
1. Agent识别需要调用"查询用户信息"接口
2. 自动填充userId=1，调用 `GET http://localhost:3001/api/users/1`
3. 返回用户详细信息

**示例回复**：
```
✅ 用户信息查询成功：
👤 用户ID：1
📛 姓名：张三
📧 邮箱：user1@example.com
📱 电话：13800138001
📅 注册时间：2025-01-15
💎 会员等级：VIP
```

---

### 用例3：MCP服务调用演示（财务分析）
**输入指令**：
```
帮我做2026年3月的财务分析
```

**预期执行过程**：
1. Agent判断属于财务分析能力，调用财务MCP服务
2. MCP返回财务分析结果和建议
3. Agent整理后回复

**示例回复**：
```
✅ 2026年3月财务分析完成：
📊 核心数据：
- 营业收入：1,250,000元
- 成本支出：850,000元
- 净利润：400,000元
- 利润率：32%

💡 优化建议：
1. 建议优化供应链成本，预计可提升利润率5%
2. 高价值客户占比提升至60%，建议重点维护
3. 营销费用ROI有所下降，建议调整投放策略
```

---

### 用例4：MCP服务调用演示（税费计算）
**输入指令**：
```
计算2026年3月的税费，营收100万，可抵扣40万
```

**预期执行过程**：
1. Agent识别需要调用税费计算能力
2. 传入营收和抵扣参数调用MCP服务
3. 返回计算结果和节税建议

**示例回复**：
```
✅ 2026年3月税费计算完成：
💰 计税信息：
- 营业收入：1,000,000元
- 可抵扣金额：400,000元
- 应纳税所得额：600,000元
- 适用税率：25%
- 应缴税额：150,000元
- 申报截止日期：2026-04-15

💡 节税建议：
1. 可申请研发费用加计扣除，预计减免税额30,000元
2. 符合小微企业税收优惠政策，可进一步降低税率
```

---

### 用例5：网页自动化演示
**执行模式**：网页操作

**输入指令**：
```
打开用户管理页面，搜索用户ID为2的用户信息
```

**预期执行过程**：
1. Agent生成网页自动化步骤：
   - 步骤1：导航到 /users 页面
   - 步骤2：在搜索框输入用户ID 2
   - 步骤3：点击搜索按钮
   - 步骤4：提取用户信息
2. 操控WebView自动执行上述步骤
3. 返回执行结果

## 🔧 自定义Demo

你可以根据需要修改 `mock-server.js` 文件，添加更多Mock接口和MCP能力：

### 添加新的API接口
在 `apiMappings` 数组中添加新的接口配置，然后添加对应的路由处理：
```javascript
app.post('/api/your/custom/path', (req, res) => {
  // 处理逻辑
  res.json({
    success: true,
    data: { /* 返回数据 */ }
  })
})
```

### 添加新的MCP能力
在 `mcpServices[0].capabilities` 中添加能力名称，然后在MCP执行路由中添加对应的case处理。

## 📝 注意事项

1. Mock服务器仅用于演示，生产环境请替换为真实的后端接口和MCP服务
2. 演示时确保Mock服务器和Agent助手同时运行
3. 如果需要测试网页自动化功能，请配置真实的工作台地址或启动一个测试网页服务
4. 大模型API密钥需要自行配置，确保能正常调用大模型服务
