import { WebStep } from '../types/common'

export class WebAutomationService {
  private webview: Electron.WebviewTag | null = null

  setWebview(webview: Electron.WebviewTag) {
    this.webview = webview
  }

  async executeSteps(steps: WebStep[]): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!this.webview) {
      return {
        success: false,
        error: 'WebView 未初始化'
      }
    }

    try {
      const results = []
      for (const step of steps) {
        const result = await this.executeStep(step)
        results.push(result)
        
        if (!result.success) {
          return {
            success: false,
            error: `步骤执行失败: ${step.description || step.action}，错误: ${result.error}`
          }
        }
      }

      return {
        success: true,
        data: results
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '网页自动化执行失败'
      }
    }
  }

  private async executeStep(step: WebStep): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!this.webview) {
      return { success: false, error: 'WebView 未初始化' }
    }

    const timeout = step.timeout || 5000

    try {
      switch (step.action) {
        case 'navigate':
          await this.webview.loadURL(step.selector)
          await this.waitForPageLoad()
          return { success: true }

        case 'click':
          await this.waitForSelector(step.selector, timeout)
          await this.webview.executeJavaScript(`
            document.querySelector('${step.selector}').click()
          `)
          return { success: true }

        case 'type':
          await this.waitForSelector(step.selector, timeout)
          await this.webview.executeJavaScript(`
            const input = document.querySelector('${step.selector}')
            input.value = '${step.value}'
            input.dispatchEvent(new Event('input'))
            input.dispatchEvent(new Event('change'))
          `)
          return { success: true }

        case 'select':
          await this.waitForSelector(step.selector, timeout)
          await this.webview.executeJavaScript(`
            const select = document.querySelector('${step.selector}')
            select.value = '${step.value}'
            select.dispatchEvent(new Event('change'))
          `)
          return { success: true }

        case 'wait':
          await new Promise(resolve => setTimeout(resolve, parseInt(step.selector) || 1000))
          return { success: true }

        case 'extract':
          await this.waitForSelector(step.selector, timeout)
          const data = await this.webview.executeJavaScript(`
            document.querySelector('${step.selector}').textContent
          `)
          return { success: true, data }

        default:
          return { success: false, error: `不支持的操作类型: ${step.action}` }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || `执行操作失败: ${step.action}`
      }
    }
  }

  private async waitForPageLoad(): Promise<void> {
    if (!this.webview) return

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('页面加载超时'))
      }, 30000)

      const handleLoadStop = () => {
        this.webview?.removeEventListener('did-stop-loading', handleLoadStop)
        clearTimeout(timeout)
        resolve()
      }

      this.webview!.addEventListener('did-stop-loading', handleLoadStop)
    })
  }

  private async waitForSelector(selector: string, timeout: number = 5000): Promise<void> {
    if (!this.webview) return

    const startTime = Date.now()
    
    while (Date.now() - startTime < timeout) {
      const exists = await this.webview.executeJavaScript(`
        document.querySelector('${selector}') !== null
      `)
      
      if (exists) {
        return
      }
      
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    throw new Error(`元素未找到: ${selector}`)
  }

  async injectToken(token: string): Promise<void> {
    if (!this.webview) return

    await this.webview.executeJavaScript(`
      window.localStorage.setItem('token', '${token}')
      window.sessionStorage.setItem('token', '${token}')
      document.cookie = 'token=${token}; path=/'
    `)
  }

  async getPageStatus(): Promise<{ loaded: boolean; url: string; title: string }> {
    if (!this.webview) {
      return { loaded: false, url: '', title: '' }
    }

    return {
      loaded: this.webview.isLoading() === false,
      url: this.webview.getURL(),
      title: this.webview.getTitle()
    }
  }
}

export const webAutomationService = new WebAutomationService()
