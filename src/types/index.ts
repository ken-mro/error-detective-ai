export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface LogEntry {
  timestamp: string
  level: 'error' | 'warn' | 'info' | 'debug'
  message: string
  source?: string
  stackTrace?: string
  context?: Record<string, any>
}

export interface AnalysisResult {
  summary?: string
  rootCause: string
  affectedComponents: string[]
  suggestedFixes: SuggestedFix[]
  unitTests: UnitTest[]
  confidence: number
  reasoning: string
  codeAnalysis?: CodeAnalysis
}

export interface SuggestedFix {
  id: string
  description: string
  priority: 'high' | 'medium' | 'low'
  type: 'code' | 'configuration' | 'infrastructure'
  code?: string
  filePath?: string
  explanation: string
}

export interface UnitTest {
  id: string
  description: string
  framework: string
  code: string
  filePath: string
}

export interface CodeAnalysis {
  affectedFiles: string[]
  potentialIssues: string[]
  dependencies: string[]
  mcpServerUsed: string[]
}

export type AIProvider = 'openai' | 'anthropic' | 'bedrock' | 'vertex'

export interface MCPServer {
  id: string
  name: string
  type: 'github' | 'gitlab' | 'filesystem' | 'code-index'
  config: Record<string, any>
  isConnected: boolean
}

export interface ParsedLog {
  entries: LogEntry[]
  totalEntries: number
  errorCount: number
  warnCount: number
  timeRange: {
    start: Date
    end: Date
  }
  sources: string[]
}
