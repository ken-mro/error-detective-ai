import { AIProvider } from '@/types'
import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
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
        return openai('gpt-4', {
          apiKey: this.apiKey
        })
      case 'anthropic':
        return anthropic('claude-3-5-sonnet-20241022', {
          apiKey: this.apiKey
        })
      case 'vertex':
        return vertex('gemini-1.5-pro', {
          // Vertex AI configuration would go here
        })
      case 'bedrock':
        return bedrock('anthropic.claude-3-sonnet-20240229-v1:0', {
          // Bedrock configuration would go here
        })
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
