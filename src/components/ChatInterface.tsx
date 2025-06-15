'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, Send, FileText, Settings, Brain, Code, TestTube } from 'lucide-react'
import { FileUpload } from './FileUpload'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { AnalysisResults } from './AnalysisResults'
import { SettingsPanel } from './SettingsPanel'
import { Message, AnalysisResult, AIProvider } from '@/types'
import { toast } from 'react-hot-toast'

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [uploadedLogs, setUploadedLogs] = useState<File[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [aiProvider, setAiProvider] = useState<AIProvider>('openai')
  const [apiKey, setApiKey] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleFileUpload = useCallback((files: File[]) => {
    const logFiles = files.filter(file => file.name.endsWith('.log'))
    if (logFiles.length === 0) {
      toast.error('Please upload .log files only')
      return
    }
    setUploadedLogs(prev => [...prev, ...logFiles])
    toast.success(`Uploaded ${logFiles.length} log file(s)`)
  }, [])

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsAnalyzing(true)

    try {
      // Add AI processing logic here
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          logs: uploadedLogs.map(file => file.name),
          provider: aiProvider,
          apiKey
        }),
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const result = await response.json()
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.analysis,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
      setAnalysisResults(result)
      
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error('Failed to analyze. Please check your settings.')
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I encountered an error while analyzing. Please check your API settings and try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsAnalyzing(false)
      scrollToBottom()
    }
  }, [uploadedLogs, aiProvider, apiKey])

  const handleRemoveLog = useCallback((index: number) => {
    setUploadedLogs(prev => prev.filter((_, i) => i !== index))
    toast.success('Log file removed')
  }, [])

  return (
    <div className="flex h-full gap-6">
      {/* Left Panel - Chat */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Error Analysis Chat</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* File Upload Section */}
        <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <FileUpload onFilesUploaded={handleFileUpload} />
          
          {uploadedLogs.length > 0 && (
            <div className="mt-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Uploaded Log Files:
              </h3>
              <div className="space-y-2">
                {uploadedLogs.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded border"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveLog(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <MessageList messages={messages} isAnalyzing={isAnalyzing} />
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t dark:border-gray-700">
          <MessageInput onSendMessage={handleSendMessage} disabled={isAnalyzing} />
        </div>
      </div>

      {/* Right Panel - Results & Settings */}
      <div className="w-96 space-y-4">
        {showSettings && (
          <SettingsPanel
            aiProvider={aiProvider}
            apiKey={apiKey}
            onProviderChange={setAiProvider}
            onApiKeyChange={setApiKey}
            onClose={() => setShowSettings(false)}
          />
        )}
        
        {analysisResults && (
          <AnalysisResults results={analysisResults} />
        )}
      </div>
    </div>
  )
}
