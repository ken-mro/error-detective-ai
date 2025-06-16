import { AIProvider } from '@/types'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { vertex } from '@ai-sdk/google-vertex'
import { bedrock } from '@ai-sdk/amazon-bedrock'
import { generateText, streamText } from 'ai'

export class AIProviderManager {
  private provider: AIProvider
  private apiKey: string

  constructor(provider: AIProvider, apiKey: string) {
    this.provider = provider
    this.apiKey = apiKey
  }

  private getModel() {
    switch (this.provider) {
      case 'openai':
        const openaiClient = createOpenAI({
          apiKey: this.apiKey
        })
        return openaiClient('gpt-4')
      case 'anthropic':
        const anthropicClient = createAnthropic({
          apiKey: this.apiKey
        })
        return anthropicClient('claude-3-5-sonnet-20241022')
      case 'vertex':
        return vertex('gemini-1.5-pro')
      case 'bedrock':
        return bedrock('anthropic.claude-3-sonnet-20240229-v1:0')
      default:
        throw new Error(`Unsupported AI provider: ${this.provider}`)
    }
  }

  async generateAnalysis(prompt: string): Promise<string> {
    try {
      const model = this.getModel()
      
      const { text } = await generateText({
        model,
        prompt,
        maxTokens: 4000,
        temperature: 0.1,
      })

      return text
    } catch (error) {
      console.error('AI generation error:', error)
      throw new Error(`Failed to generate analysis with ${this.provider}`)
    }
  }

  async streamAnalysis(prompt: string) {
    try {
      const model = this.getModel()
      
      return streamText({
        model,
        prompt,
        maxTokens: 4000,
        temperature: 0.1,
      })
    } catch (error) {
      console.error('AI streaming error:', error)
      throw new Error(`Failed to stream analysis with ${this.provider}`)
    }
  }

  getProviderName(): string {
    const names = {
      openai: 'OpenAI',
      anthropic: 'Anthropic Claude',
      vertex: 'Google Vertex AI',
      bedrock: 'Amazon Bedrock'
    }
    return names[this.provider]
  }
}
