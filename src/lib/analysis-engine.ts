import { AnalysisResult, ParsedLog, SuggestedFix, UnitTest } from '@/types'
import { AIProviderManager } from './ai-provider-manager'
import { MCPManager } from './mcp-manager'
import { LogParser } from './log-parser'

interface AnalysisRequest {
  userMessage: string
  logs?: ParsedLog | null
  includeFixes?: boolean
  includeTests?: boolean
  includeCodeAnalysis?: boolean
}

export class AnalysisEngine {
  constructor(
    private aiProvider: AIProviderManager,
    private mcpManager: MCPManager,
    private logParser: LogParser
  ) {}

  async analyze(request: AnalysisRequest): Promise<AnalysisResult> {
    const {
      userMessage,
      logs,
      includeFixes = true,
      includeTests = true,
      includeCodeAnalysis = true
    } = request

    // Build analysis prompt
    const prompt = this.buildAnalysisPrompt(userMessage, logs)
    
    // Get AI analysis
    const aiResponse = await this.aiProvider.generateAnalysis(prompt)
    
    // Parse AI response to extract structured data
    const analysisResult = this.parseAIResponse(aiResponse)
    
    // Enhance with code analysis if requested
    if (includeCodeAnalysis && logs) {
      const codeAnalysis = await this.performCodeAnalysis(logs, analysisResult.rootCause)
      analysisResult.codeAnalysis = codeAnalysis
    }

    // Generate fixes if requested
    if (includeFixes) {
      const fixes = await this.generateFixes(analysisResult.rootCause, logs)
      analysisResult.suggestedFixes = fixes
    }

    // Generate tests if requested
    if (includeTests && analysisResult.suggestedFixes.length > 0) {
      const tests = await this.generateUnitTests(analysisResult.suggestedFixes)
      analysisResult.unitTests = tests
    }

    return analysisResult
  }

  private buildAnalysisPrompt(userMessage: string, logs?: ParsedLog | null): string {
    let prompt = `You are an expert system administrator and software engineer specializing in root cause analysis of system errors and incidents.

User's incident description:
${userMessage}

`

    if (logs && logs.entries.length > 0) {
      prompt += `Log Analysis Context:
- Total log entries: ${logs.totalEntries}
- Error count: ${logs.errorCount}
- Warning count: ${logs.warnCount}
- Time range: ${logs.timeRange.start.toISOString()} to ${logs.timeRange.end.toISOString()}
- Sources: ${logs.sources.join(', ')}

Recent Error Log Entries:
${logs.entries
  .filter(entry => entry.level === 'error')
  .slice(0, 10)
  .map(entry => `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}${entry.source ? ` (Source: ${entry.source})` : ''}${entry.stackTrace ? `\nStack: ${entry.stackTrace}` : ''}`)
  .join('\n\n')}

Recent Warning Log Entries:
${logs.entries
  .filter(entry => entry.level === 'warn')
  .slice(0, 5)
  .map(entry => `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}${entry.source ? ` (Source: ${entry.source})` : ''}`)
  .join('\n\n')}

Error Patterns Detected:
${this.logParser.extractErrorPatterns(logs.entries).join(', ')}

`
    }

    prompt += `Please analyze this incident and provide a comprehensive root cause analysis. Your response should be in the following JSON format:

{
  "summary": "Brief summary of the analysis",
  "rootCause": "The primary root cause of the issue",
  "affectedComponents": ["component1", "component2"],
  "confidence": 0.95,
  "reasoning": "Detailed explanation of how you arrived at this conclusion, including analysis of log patterns, timing, and system behavior",
  "immediateActions": ["action1", "action2"],
  "preventionMeasures": ["measure1", "measure2"]
}

Focus on:
1. Identifying the primary root cause based on log patterns and user description
2. Determining which system components are affected
3. Providing a confidence score (0.0 to 1.0) for your analysis
4. Explaining your reasoning process clearly
5. Suggesting immediate actions to resolve the issue
6. Recommending prevention measures for the future

Be specific and actionable in your recommendations.`

    return prompt
  }

  private parseAIResponse(response: string): AnalysisResult {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const parsed = JSON.parse(jsonMatch[0])
      
      return {
        rootCause: parsed.rootCause || 'Unable to determine root cause',
        affectedComponents: parsed.affectedComponents || [],
        suggestedFixes: [],
        unitTests: [],
        confidence: parsed.confidence || 0.5,
        reasoning: parsed.reasoning || 'Analysis completed',
        codeAnalysis: undefined
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error)
      
      // Fallback: create a basic analysis result
      return {
        rootCause: 'Error analysis completed, but response parsing failed',
        affectedComponents: [],
        suggestedFixes: [],
        unitTests: [],
        confidence: 0.3,
        reasoning: response,
        codeAnalysis: undefined
      }
    }
  }

  private async performCodeAnalysis(logs: ParsedLog, rootCause: string) {
    const connectedServers = this.mcpManager.getConnectedServers()
    
    if (connectedServers.length === 0) {
      return {
        affectedFiles: [],
        potentialIssues: ['No MCP servers connected for code analysis'],
        dependencies: [],
        mcpServerUsed: []
      }
    }

    const affectedFiles: string[] = []
    const potentialIssues: string[] = []
    const dependencies: string[] = []
    const mcpServerUsed: string[] = []

    // Extract keywords from logs and root cause for code search
    const searchTerms = this.extractSearchTerms(logs, rootCause)
    
    for (const server of connectedServers) {
      try {
        mcpServerUsed.push(server.name)
        
        for (const term of searchTerms) {
          const results = await this.mcpManager.searchCode(term, server.id)
          
          results.forEach(result => {
            if (result.path && !affectedFiles.includes(result.path)) {
              affectedFiles.push(result.path)
            }
          })
        }
      } catch (error) {
        console.error(`Code analysis failed for server ${server.name}:`, error)
        potentialIssues.push(`Failed to analyze code in ${server.name}`)
      }
    }

    return {
      affectedFiles: affectedFiles.slice(0, 20), // Limit results
      potentialIssues,
      dependencies,
      mcpServerUsed
    }
  }

  private extractSearchTerms(logs: ParsedLog, rootCause: string): string[] {
    const terms = new Set<string>()
    
    // Extract from root cause
    const rootCauseWords = rootCause.toLowerCase().match(/\b\w{3,}\b/g) || []
    rootCauseWords.forEach(word => {
      if (!['the', 'and', 'or', 'but', 'error', 'issue'].includes(word)) {
        terms.add(word)
      }
    })
    
    // Extract from error messages
    logs.entries
      .filter(entry => entry.level === 'error')
      .slice(0, 5)
      .forEach(entry => {
        const words = entry.message.toLowerCase().match(/\b\w{3,}\b/g) || []
        words.forEach(word => {
          if (!['the', 'and', 'or', 'but', 'error', 'failed'].includes(word)) {
            terms.add(word)
          }
        })
      })
    
    return Array.from(terms).slice(0, 10) // Limit search terms
  }

  private async generateFixes(rootCause: string, logs?: ParsedLog | null): Promise<SuggestedFix[]> {
    const fixPrompt = `Based on the root cause analysis: "${rootCause}"

${logs ? `And the following error patterns:
${this.logParser.extractErrorPatterns(logs.entries).join(', ')}` : ''}

Generate 3-5 specific code fixes or configuration changes to resolve this issue. For each fix, provide:

1. A clear description of what needs to be changed
2. The priority level (high/medium/low)
3. The type of fix (code/configuration/infrastructure)
4. Actual code examples where applicable
5. The file path where the fix should be applied
6. A detailed explanation of why this fix addresses the root cause

Format your response as a JSON array of fix objects:

[
  {
    "description": "Fix description",
    "priority": "high|medium|low",
    "type": "code|configuration|infrastructure",
    "code": "actual code to implement",
    "filePath": "path/to/file.ts",
    "explanation": "Why this fix addresses the issue"
  }
]`

    try {
      const response = await this.aiProvider.generateAnalysis(fixPrompt)
      const jsonMatch = response.match(/\[[\s\S]*\]/)
      
      if (jsonMatch) {
        const fixes = JSON.parse(jsonMatch[0])
        return fixes.map((fix: any, index: number) => ({
          id: `fix-${index}`,
          description: fix.description || 'Generated fix',
          priority: fix.priority || 'medium',
          type: fix.type || 'code',
          code: fix.code,
          filePath: fix.filePath,
          explanation: fix.explanation || 'Generated fix explanation'
        }))
      }
    } catch (error) {
      console.error('Failed to generate fixes:', error)
    }

    // Fallback fixes
    return [
      {
        id: 'fix-1',
        description: 'Add error handling and retry logic',
        priority: 'high',
        type: 'code',
        explanation: 'Implement proper error handling to gracefully handle failures and prevent cascading issues'
      }
    ]
  }

  private async generateUnitTests(fixes: SuggestedFix[]): Promise<UnitTest[]> {
    const tests: UnitTest[] = []
    
    for (const fix of fixes.slice(0, 3)) { // Generate tests for first 3 fixes
      if (fix.code && fix.filePath) {
        const testPrompt = `Generate a comprehensive unit test for this fix:

Fix Description: ${fix.description}
File Path: ${fix.filePath}
Code:
${fix.code}

Generate a unit test that:
1. Tests the main functionality
2. Tests error conditions
3. Tests edge cases
4. Uses appropriate testing framework (Jest/Mocha for TypeScript/JavaScript, pytest for Python)

Format as JSON:
{
  "description": "Test description",
  "framework": "jest|mocha|pytest",
  "code": "complete test code",
  "filePath": "path/to/test/file"
}`

        try {
          const response = await this.aiProvider.generateAnalysis(testPrompt)
          const jsonMatch = response.match(/\{[\s\S]*\}/)
          
          if (jsonMatch) {
            const test = JSON.parse(jsonMatch[0])
            tests.push({
              id: `test-${fix.id}`,
              description: test.description || `Test for ${fix.description}`,
              framework: test.framework || 'jest',
              code: test.code || '// Test code generation failed',
              filePath: test.filePath || fix.filePath.replace(/\.ts$/, '.test.ts')
            })
          }
        } catch (error) {
          console.error('Failed to generate test for fix:', fix.id, error)
        }
      }
    }

    return tests
  }
}
