'use client'

import { useState } from 'react'
import { AIProvider } from '@/types'
import { X, Key, Server, Check } from 'lucide-react'

interface SettingsPanelProps {
  aiProvider: AIProvider
  apiKey: string
  onProviderChange: (provider: AIProvider) => void
  onApiKeyChange: (apiKey: string) => void
  onClose: () => void
}

const AI_PROVIDERS = [
  { id: 'openai' as const, name: 'OpenAI', description: 'GPT-4 and GPT-3.5' },
  { id: 'anthropic' as const, name: 'Anthropic', description: 'Claude 3.5 Sonnet' },
  { id: 'bedrock' as const, name: 'Amazon Bedrock', description: 'AWS managed AI models' },
  { id: 'vertex' as const, name: 'Google Vertex AI', description: 'Google Cloud AI' }
]

export function SettingsPanel({
  aiProvider,
  apiKey,
  onProviderChange,
  onApiKeyChange,
  onClose
}: SettingsPanelProps) {
  const [tempApiKey, setTempApiKey] = useState(apiKey)
  const [mcpServers, setMcpServers] = useState([
    { name: 'GitHub', type: 'github', connected: false },
    { name: 'GitLab', type: 'gitlab', connected: false },
    { name: 'Code Index MCP', type: 'code-index', connected: false }
  ])

  const handleSaveApiKey = () => {
    onApiKeyChange(tempApiKey)
  }

  const toggleMcpServer = (index: number) => {
    setMcpServers(prev => prev.map((server, i) => 
      i === index ? { ...server, connected: !server.connected } : server
    ))
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border dark:border-gray-700">
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* AI Provider Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            AI Provider
          </label>
          <div className="space-y-2">
            {AI_PROVIDERS.map((provider) => (
              <div
                key={provider.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  aiProvider === provider.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
                onClick={() => onProviderChange(provider.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {provider.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {provider.description}
                    </div>
                  </div>
                  {aiProvider === provider.id && (
                    <Check className="w-5 h-5 text-blue-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* API Key */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Key className="w-4 h-4 inline mr-1" />
            API Key
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              placeholder="Enter your API key..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            />
            <button
              onClick={handleSaveApiKey}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Save
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Your API key is stored locally and never sent to our servers.
          </p>
        </div>

        {/* MCP Servers */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            <Server className="w-4 h-4 inline mr-1" />
            MCP Servers
          </label>
          <div className="space-y-2">
            {mcpServers.map((server, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border dark:border-gray-600 rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {server.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Type: {server.type}
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={server.connected}
                    onChange={() => toggleMcpServer(index)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Enable MCP servers to analyze source code from different repositories.
          </p>
        </div>

        {/* Additional Settings */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Analysis Options
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Include code suggestions
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Generate unit tests
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Analyze dependencies
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
