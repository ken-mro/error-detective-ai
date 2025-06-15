'use client'

import { ChatInterface } from '@/components/ChatInterface'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Error Detective AI
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            AI-powered root cause analysis for system errors and logs
          </p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6 h-[calc(100vh-120px)]">
        <ChatInterface />
      </main>
    </div>
  );
}
