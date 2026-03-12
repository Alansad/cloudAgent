# 本地化Agent助手软件

跨平台桌面端本地化Agent助手，支持「网页自动化」+「后端接口/MCP服务调用」双执行模式，基于Electron + React + TypeScript开发。

## 📚 快速导航
| 文档 | 适用人群 | 说明 |
|------|----------|------|
| [📖 用户使用手册](USER_MANUAL.md) | 普通用户 | 零基础也能看懂的使用指南，包含安装、配置、使用全流程 |
| [⚙️ 技术设计文档](TECH_DESIGN.md) | 开发者 | 详细的架构设计、实现原理、扩展开发指南 |
| [✅ 测试指南](TEST_GUIDE.md) | 测试/开发 | 完整的测试用例集和测试方法 |
| [📦 部署分发指南](DEPLOY_GUIDE.md) | 运维/开发 | 打包、签名、分发全流程说明 |
| [🎯 Demo演示](demo/README.md) | 所有用户 | 快速体验功能，包含Mock服务器和演示用例 |
| [✨ 代码质量报告](CODE_QUALITY.md) | 开发者 | 代码规范、优化说明、最佳实践 |


## ✨ 核心功能

### 🖥️ 客户端特性
- 支持Windows 7/10/11、macOS 10.15+（兼容Intel/M系列芯片）
- 适配系统操作习惯：macOS顶部菜单栏、Windows任务栏托盘
- 内置WebView容器，稳定加载云管家工作台
- 客户端与网页身份自动打通，实现免登
- 内存占用控制：Windows ≤2GB，macOS ≤1.5GB

### 🤖 AI Agent双执行模式
#### 模式1：接口/MCP调用（优先）
- 支持HTTP/HTTPS接口调用（GET/POST/PUT/DELETE）
- 支持MCP（Model Context Protocol）服务调用
- 多种鉴权方式：Token、API Key、Basic Auth、OAuth2.0
- 可配置化「业务动作-接口」映射库，可视化配置面板
- 智能重试机制，超时自动重试（可配置重试次数/间隔）
- 敏感信息本地加密存储，保障数据安全

#### 模式2：网页自动化（降级）
- 直接操控Electron内嵌WebView完成点击、输入、选择、导出等操作
- 智能元素定位，异常自动重试
- 操作日志记录，支持回溯

#### 模式切换
- 自动模式：优先调用接口/MCP，无对应接口自动降级为网页自动化
- 手动模式：支持用户强制指定执行模式

### 📦 安装分发
- 一键打包为Windows exe、macOS dmg安装包
- 双击安装，无需配置任何开发环境，所有依赖内置
- 支持自定义安装路径，自动创建桌面/开始菜单快捷方式
- 安装包体积优化，提供代码签名方案解决系统安全拦截问题

## 🛠️ 技术栈

| 模块 | 技术选型 | 版本要求 |
|---------------------|-----------------------------------|---------------------------|
| 跨平台客户端框架 | Electron | ≥28.0.0 |
| 前端UI框架 | React + Ant Design | React≥18.2.0，Ant Design≥5.12.0 |
| 打包工具 | Electron Builder | ≥24.6.4 |
| 网页容器 | Electron WebView | 内置Chromium内核 |
| 通信机制 | Electron IPC + PostMessage | - |
| AI Agent核心 | LangChain.js | ≥0.1.0 |
| 远端大模型调用 | @langchain/openai/@langchain/aliyun | 适配OpenAI/通义千问 |
| 网页自动化 | Playwright | ≥1.40.0 |
| 后端接口/MCP调用 | Axios + 自定义MCP客户端 | Axios≥1.6.2 |
| 本地存储 | localStorage + SQLite | - |
| 加密存储 | electron-safe-storage | ≥0.1.1 |
| 构建工具 | Vite | ≥5.0.0 |
| 编程语言 | TypeScript | ≥5.2.2 |

## 🚀 快速开始

### 环境要求
- Node.js ≥ 18.0.0
- npm ≥ 9.0.0

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 生产构建
```bash
npm run build
```
构建产物将输出到 `dist/` 目录，包含Windows和macOS安装包。

## 📁 项目结构

```
├── build/                      # 打包资源（图标、背景图）
├── dist/                       # 打包输出目录（自动生成）
├── electron/                   # Electron主进程代码
│   └── main/
│       ├── index.ts            # 主进程入口（窗口创建、系统适配）
│       ├── ipc.ts              # IPC通信注册
│       └── tray.ts             # 系统托盘配置
├── src/                        # React渲染进程代码
│   ├── api/                    # 核心调用模块
│   │   ├── llm.ts              # 大模型API调用
│   │   ├── webAutomation.ts    # 网页自动化
│   │   ├── apiClient.ts        # 后端接口调用核心
│   │   └── mcpClient.ts        # MCP服务调用核心
│   ├── components/             # 通用组件
│   │   ├── ChatWindow.tsx      # AI对话窗口
│   │   ├── WebViewContainer.tsx # 网页容器
│   │   ├── ApiConfig.tsx       # 接口配置面板
│   │   ├── McpConfigForm.tsx   # MCP配置表单
│   │   └── ModeSwitch.tsx      # 执行模式切换组件
│   ├── config/                 # 配置文件
│   │   ├── apiMapping.json     # 业务动作-接口映射库
│   │   └── mcpConfig.json      # MCP服务配置
│   ├── context/                # React Context
│   │   └── AppContext.tsx      # 全局状态管理
│   ├── pages/                  # 页面组件
│   │   ├── MainPage.tsx        # 主界面
│   │   └── SettingsPage.tsx    # 设置页
│   ├── types/                  # TypeScript类型定义
│   │   └── common.ts           # 通用类型定义
│   ├── utils/                  # 工具函数
│   │   ├── auth.ts             # 接口鉴权处理
│   │   ├── encrypt.ts          # 加密存储
│   │   └── ipc.ts              # IPC通信封装
│   ├── App.tsx                 # 应用入口组件
│   └── main.tsx                # React入口
├── package.json                # 项目配置
├── vite.config.ts              # Vite配置
├── tsconfig.json               # TypeScript配置
└── README.md                   # 项目说明
```

## ⚙️ 配置说明

### 1. 大模型配置
在设置页面配置大模型API密钥，目前支持：
- OpenAI系列模型
- 阿里通义千问系列模型

### 2. API映射配置
在「设置-API映射配置」中可增删改查业务动作与接口的映射关系，配置项包括：
- 业务动作名称：如"导出订单报表"
- 接口地址：支持路径参数（如`/orders/{orderId}`）
- 请求方法：GET/POST/PUT/DELETE
- 鉴权方式：无/Token/API Key/Basic Auth/OAuth2.0
- 参数Schema：请求参数格式定义
- 重试配置：最大重试次数、重试间隔

### 3. MCP服务配置
在「设置-MCP服务配置」中可配置MCP服务信息，配置项包括：
- 服务名称：如"财务MCP服务"
- 服务地址：MCP服务端点
- 鉴权方式：无/Token/API Key
- 服务能力：该MCP提供的能力列表

## 🧪 测试用例

### 功能测试
1. **接口调用测试**
   - 输入："导出2026年3月的订单报表"
   - 预期：Agent判断可通过接口执行，调用导出接口，返回下载链接

2. **网页自动化测试**
   - 输入："在系统中创建一个新客户，姓名张三，电话13800138000"
   - 预期：Agent生成自动化步骤，操控WebView完成表单填写和提交

3. **模式切换测试**
   - 设置为"接口优先"模式，输入无对应接口的需求
   - 预期：Agent提示无对应接口，询问是否使用网页自动化

4. **异常测试**
   - 输入："导出不存在的报表"
   - 预期：Agent返回友好的错误提示，说明失败原因

### 性能测试
- 接口调用响应时间 ≤5秒
- 简单网页自动化操作 ≤30秒
- 内存占用：Windows ≤2GB，macOS ≤1.5GB

## 📦 打包分发

### Windows打包
```bash
npm run build:win
```
生成的exe安装包位于 `dist/` 目录，支持自定义安装路径、自动创建快捷方式。

### macOS打包
```bash
npm run build:mac
```
生成的dmg安装包位于 `dist/` 目录，兼容Intel和M系列芯片。

### 代码签名（解决系统拦截）
1. Windows：购买代码签名证书，在package.json中配置
2. macOS：申请苹果开发者账号，配置签名和公证

## ❓ 常见问题

### Q1：安装包被杀毒软件拦截怎么办？
A：这是因为没有代码签名，可通过以下方式解决：
- 临时方案：在杀毒软件中添加信任
- 永久方案：购买代码签名证书对安装包进行签名

### Q2：macOS提示"无法打开，因为无法验证开发者"怎么办？
A：打开"系统设置-隐私与安全性"，允许该应用运行，或使用codesign对应用进行签名。

### Q3：网页自动化元素定位失败怎么办？
A：检查元素选择器是否正确，可增加等待时间，或使用更稳定的定位方式（如ID、data-*属性）。

### Q4：接口调用返回401错误怎么办？
A：检查认证Token是否有效，在设置页面重新配置认证信息。

## 📝 更新日志

### v1.0.0
- ✅ 基础Electron客户端框架
- ✅ 双执行模式核心逻辑
- ✅ AI对话窗口
- ✅ WebView容器与自动化
- ✅ 接口/MCP配置面板
- ✅ 打包配置与分发支持

## 📄 许可证
MIT License
