import { NextRequest, NextResponse } from 'next/server'
import { AIProviderManager } from '@/lib/ai-provider-manager'
import { MCPManager } from '@/lib/mcp-manager'
import { LogParser } from '@/lib/log-parser'
import { AnalysisEngine } from '@/lib/analysis-engine'

export async function POST(request: NextRequest) {
  try {
    const { message, logs, provider, apiKey } = await request.json()

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      )
    }

    // Initialize AI provider
    const aiProvider = new AIProviderManager(provider, apiKey)
    
    // Initialize MCP manager
    const mcpManager = new MCPManager()
    
    // Initialize log parser
    const logParser = new LogParser()
    
    // Initialize analysis engine
    const analysisEngine = new AnalysisEngine(aiProvider, mcpManager, logParser)

    // Parse logs if provided
    let parsedLogs = null
    if (logs && logs.length > 0) {
      // In a real implementation, you'd read the actual log files
      // For now, we'll simulate this
      parsedLogs = await logParser.parseLogFiles(logs)
    }

    // Perform analysis
    const analysis = await analysisEngine.analyze({
      userMessage: message,
      logs: parsedLogs,
      includeFixes: true,
      includeTests: true,
      includeCodeAnalysis: true
    })

    return NextResponse.json({
      analysis: analysis.summary || analysis.reasoning,
      rootCause: analysis.rootCause,
      affectedComponents: analysis.affectedComponents,
      suggestedFixes: analysis.suggestedFixes,
      unitTests: analysis.unitTests,
      confidence: analysis.confidence,
      reasoning: analysis.reasoning,
      codeAnalysis: analysis.codeAnalysis
    })

  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to perform analysis' },
      { status: 500 }
    )
  }
}
