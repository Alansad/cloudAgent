import { useEffect } from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { AppProvider } from './context/AppContext'
import { MainPage } from './pages/MainPage'
import { SettingsPage } from './pages/SettingsPage'
import { ipcRenderer } from './utils/ipc'
import { IPC_CHANNELS } from './types/common'

function App() {
  // 监听主进程导航事件
  useEffect(() => {
    ipcRenderer.on(IPC_CHANNELS.NAVIGATE, (_, path: string) => {
      window.location.hash = path
    })

    return () => {
      ipcRenderer.off(IPC_CHANNELS.NAVIGATE)
    }
  }, [])

  return (
    <ConfigProvider locale={zhCN}>
      <AppProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Router>
      </AppProvider>
    </ConfigProvider>
  )
}

export default App
