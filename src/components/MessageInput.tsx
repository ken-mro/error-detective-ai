'use client'

import { useState, useRef, useCallback } from 'react'
import { Send, Mic, Square } from 'lucide-react'

interface MessageInputProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
}

export function MessageInput({ onSendMessage, disabled = false }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (message.trim() && !disabled) {
        onSendMessage(message.trim())
        setMessage('')
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto'
        }
      }
    },
    [message, onSendMessage, disabled]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit(e)
      }
    },
    [handleSubmit]
  )

  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessage(e.target.value)
      
      // Auto-resize textarea
      const textarea = e.target
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    },
    []
  )

  const toggleRecording = useCallback(() => {
    setIsRecording(!isRecording)
    // TODO: Implement voice recording functionality
  }, [isRecording])

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "Analyzing..." : "Describe the incident or ask about the error logs..."}
            disabled={disabled}
            className="w-full min-h-[44px] max-h-[120px] px-3 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            rows={1}
          />
          
          <button
            type="button"
            onClick={toggleRecording}
            disabled={disabled}
            className={`absolute right-2 top-2 p-1.5 rounded-md transition-colors ${
              isRecording
                ? 'text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20'
                : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>
        
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="flex-shrink-0 p-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Press Enter to send, Shift+Enter for new line
      </div>
    </form>
  )
}
