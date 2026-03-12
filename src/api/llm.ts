import { ChatOpenAI } from '@langchain/openai'
import { ChatAlibabaTongyi } from '@langchain/aliyun'
import { BaseMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'
import { ExecutionMode, ApiMapping, WebStep } from '../types/common'

interface LLMConfig {
  provider: 'openai' | 'tongyi'
  apiKey: string
  model: string
  baseUrl?: string
}

interface AgentResponse {
  mode: ExecutionMode
  action?: string
  params?: Record<string, any>
  apiConfig?: any
  steps?: WebStep[]
  content?: string
}

export class LLMService {
  private model: ChatOpenAI | ChatAlibabaTongyi

  constructor(config: LLMConfig) {
    if (config.provider === 'openai') {
      this.model = new ChatOpenAI({
        openAIApiKey: config.apiKey,
        modelName: config.model,
        temperature: 0,
        configuration: {
          baseURL: config.baseUrl
        }
      })
    } else {
      this.model = new ChatAlibabaTongyi({
        alibabaApiKey: config.apiKey,
        modelName: config.model,
        temperature: 0
      })
    }
  }

  async processUserInput(
    userInput: string,
    apiMappings: ApiMapping[],
    executionMode: ExecutionMode
  ): Promise<AgentResponse> {
    const systemPrompt = `
你是"云管家工作台"的AI助手，需完成以下任务：
1. 理解用户自然语言需求；
2. 根据当前执行模式判断执行方式：
   - 如模式为auto：判断该需求是否可通过「后端接口/MCP服务」执行（参考接口映射库）；
   - 如模式为api：强制使用接口执行，若无对应接口则返回ask模式询问用户；
   - 如模式为mcp：强制使用MCP服务执行，若无对应服务则返回ask模式询问用户；
   - 如模式为web：强制使用网页自动化执行。
3. 若可通过接口/MCP执行：输出JSON格式，包含mode="api/mcp"、action（业务动作）、params（接口请求参数）、apiConfig（接口地址/鉴权/方法）；
4. 若不可通过接口/MCP执行：输出JSON格式，包含mode="web"、steps（网页自动化步骤数组，每个步骤包含action/selector/value/description字段）；
5. 若需求不明确或缺少必要参数，输出JSON格式，包含mode="ask"、content（需要确认的问题）。

接口映射库：
${JSON.stringify(apiMappings, null, 2)}

用户需求：${userInput}
当前执行模式：${executionMode}

输出仅返回JSON，无多余文字，不要包含markdown标记。
`

    const messages: BaseMessage[] = [
      new SystemMessage(systemPrompt),
      new HumanMessage(userInput)
    ]

    try {
      const response = await this.model.invoke(messages)
      const content = response.content as string
      
      // 清理响应内容，确保是纯JSON
      const cleanedContent = content.replace(/```json|```/g, '').trim()
      return JSON.parse(cleanedContent) as AgentResponse
    } catch (error) {
      console.error('LLM处理失败:', error)
      return {
        mode: ExecutionMode.ASK,
        content: '抱歉，我暂时无法理解您的需求，请重新描述。'
      }
    }
  }

  async generateNaturalResponse(result: any, userInput: string): Promise<string> {
    const prompt = `
用户的需求是：${userInput}
执行结果是：${JSON.stringify(result)}

请将执行结果转换为自然语言回复，简洁明了，重点突出。如果执行成功，说明结果；如果失败，说明原因和建议。
`

    try {
      const response = await this.model.invoke([new HumanMessage(prompt)])
      return response.content as string
    } catch (error) {
      return '操作已完成，但生成自然语言回复失败，请查看详细结果。'
    }
  }
}
