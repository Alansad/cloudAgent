# 部署分发指南

## 一、环境准备

### 1. 开发环境
- Node.js 18.0.0 或更高版本
- npm 9.0.0 或更高版本
- Windows / macOS 开发机器（对应目标平台）

### 2. 代码签名证书（可选，推荐）
为了解决系统安全拦截问题，建议购买代码签名证书：
- **Windows**：购买代码签名证书（EV证书最佳）
- **macOS**：苹果开发者账号（99美元/年），用于签名和公证

## 二、开发构建

### 1. 依赖安装
```bash
# 安装项目依赖
npm install

# 验证依赖安装
npm list --depth=0
```

### 2. 开发模式运行
```bash
npm run dev
```
这会同时启动Vite开发服务器和Electron客户端，支持热更新。

### 3. 生产构建
```bash
# 全平台构建（Windows + macOS）
npm run build

# 仅构建Windows版本
npm run build:win

# 仅构建macOS版本
npm run build:mac
```

构建产物将输出到 `dist/` 目录。

## 三、打包配置优化

### 1. package.json 配置说明
```json
{
  "build": {
    "appId": "com.agent.assistant",  // 应用唯一标识
    "productName": "Agent助手",      // 应用名称
    "directories": {
      "output": "dist"               // 输出目录
    },
    "files": [
      "dist/**/*",
      "dist-electron/**/*"
    ],
    "asar": true,                    // 启用asar打包，优化体积和启动速度
    "npmRebuild": true,              // 自动重建原生模块
    "nodeGypRebuild": false
  }
}
```

### 2. 体积优化
- 启用asar压缩：减少文件数量，提高启动速度
- 排除无用依赖：在package.json的build.files中指定需要包含的文件
- 压缩资源文件：图标、图片等资源提前压缩
- 使用electron-builder的配置优化：
  ```json
  "build": {
    "compression": "maximum",  // 最大压缩比
    "removePackageScripts": true,
    "removePackageKeywords": true
  }
  ```

### 3. 优化后的体积目标
- Windows exe安装包：≤200MB
- macOS dmg安装包：≤180MB

## 四、代码签名配置

### 1. Windows 签名配置
```json
"build": {
  "win": {
    "target": "nsis",
    "icon": "build/icon.ico",
    "sign": true,
    "certificateFile": "path/to/your/certificate.pfx",
    "certificatePassword": "your-cert-password",
    "publisherName": "Your Company Name"
  }
}
```

### 2. macOS 签名和公证配置
```json
"build": {
  "mac": {
    "target": "dmg",
    "icon": "build/icon.icns",
    "category": "public.app-category.productivity",
    "hardenedRuntime": true,
    "gatekeeperAssess": false,
    "entitlements": "build/entitlements.plist",
    "entitlementsInherit": "build/entitlements.plist"
  },
  "afterSign": "scripts/notarize.js"
}
```

#### entitlements.plist 示例：
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.security.cs.allow-jit</key>
  <true/>
  <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
  <true/>
  <key>com.apple.security.cs.disable-library-validation</key>
  <true/>
</dict>
</plist>
```

#### 公证脚本 scripts/notarize.js：
```javascript
const { notarize } = require('@electron/notarize')

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context
  if (electronPlatformName !== 'darwin') return

  const appName = context.packager.appInfo.productFilename

  return await notarize({
    appBundleId: 'com.agent.assistant',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_ID_PASSWORD,
    teamId: process.env.APPLE_TEAM_ID,
  })
}
```

## 五、安装包自定义

### 1. Windows 安装程序自定义
```json
"build": {
  "nsis": {
    "oneClick": false,                  // 禁用一键安装
    "allowToChangeInstallationDirectory": true,  // 允许自定义安装路径
    "createDesktopShortcut": true,      // 创建桌面快捷方式
    "createStartMenuShortcut": true,    // 创建开始菜单快捷方式
    "language": "2052",                 // 中文界面
    "shortcutName": "Agent助手",
    "installerIcon": "build/installer-icon.ico",
    "uninstallerIcon": "build/uninstaller-icon.ico",
    "license": "build/license.txt"      // 许可协议
  }
}
```

### 2. macOS dmg 自定义
```json
"build": {
  "dmg": {
    "title": "Agent助手 安装",
    "icon": "build/icon.icns",
    "background": "build/dmg-background.png",
    "iconSize": 100,
    "contents": [
      { "x": 380, "y": 280, "type": "link", "path": "/Applications" },
      { "x": 130, "y": 280, "type": "file" }
    ],
    "window": {
      "width": 540,
      "height": 380
    }
  }
}
```

## 六、分发渠道

### 1. 官网分发
- 将安装包上传到官网下载页面
- 提供版本更新日志和校验和（SHA256）
- 配置CDN加速下载

### 2. 企业内部分发
- 上传到企业内部文件服务器
- 配置组策略自动部署
- 使用企业应用商店分发

### 3. 自动更新配置
集成electron-updater实现自动更新：
```bash
npm install electron-updater
```

主进程添加更新逻辑：
```typescript
import { autoUpdater } from 'electron-updater'

// 配置更新服务器地址
autoUpdater.setFeedURL('https://update.example.com/')

// 检查更新
autoUpdater.checkForUpdatesAndNotify()
```

## 七、部署检查清单

### 开发阶段
- ✅ 依赖安装成功
- ✅ 开发模式正常运行
- ✅ 所有功能测试通过
- ✅ 性能指标符合要求

### 构建阶段
- ✅ 生产构建无错误
- ✅ 安装包体积符合要求
- ✅ 安装包可正常安装
- ✅ 安装后应用可正常启动

### 签名阶段（可选）
- ✅ Windows代码签名配置正确
- ✅ macOS签名和公证配置正确
- ✅ 签名后的安装包无系统拦截警告

### 分发阶段
- ✅ 安装包上传到分发渠道
- ✅ 下载链接可正常访问
- ✅ 下载速度符合预期
- ✅ 版本更新机制正常工作

## 八、常见问题

### Q1：构建失败，提示node-gyp错误
A：这是因为原生模块需要重新编译，确保安装了对应平台的编译工具：
- Windows：安装Visual Studio Build Tools和Python
- macOS：安装Xcode Command Line Tools：`xcode-select --install`

### Q2：Windows安装包被杀毒软件误删
A：这是常见的误报，解决方案：
1. 提交安装包到杀毒软件厂商的白名单
2. 使用EV代码签名证书，可以大幅降低误报率
3. 在安装说明中告知用户添加信任

### Q3：macOS提示"无法打开，因为苹果无法检查它是否包含恶意软件"
A：这是因为应用没有签名和公证，解决方案：
1. 右键点击应用，选择"打开"，可以临时绕过
2. 系统设置 → 隐私与安全性 → 允许从以下位置下载的App → 选择"仍要打开"
3. 购买苹果开发者账号，对应用进行签名和公证，彻底解决

### Q4：安装包体积过大
A：优化方案：
1. 启用最大压缩比
2. 排除不需要的依赖和资源文件
3. 使用electron-builder的配置优化
4. 考虑使用更轻量的依赖替代

## 九、版本发布流程

1. **版本号更新**：修改package.json中的version字段
2. **更新日志**：编写CHANGELOG.md，说明本次更新内容
3. **构建测试**：在各个平台进行构建和测试
4. **代码签名**：对安装包进行签名和公证
5. **上传分发**：将安装包上传到分发渠道
6. **发布通知**：通过官网、邮件等渠道通知用户更新
