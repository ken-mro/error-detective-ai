import { LogEntry, ParsedLog } from '@/types'

export class LogParser {
  async parseLogFiles(): Promise<ParsedLog> {
    // In a real implementation, you would read the actual files
    // For now, we'll simulate parsing with sample data
    const entries: LogEntry[] = []
    let errorCount = 0
    let warnCount = 0
    const sources = new Set<string>()
    
    // Simulate log parsing - in real implementation, read actual files
    const sampleEntries = this.generateSampleEntries()
    entries.push(...sampleEntries)
    
    // Count entries by level
    entries.forEach(entry => {
      if (entry.level === 'error') errorCount++
      if (entry.level === 'warn') warnCount++
      if (entry.source) sources.add(entry.source)
    })

    // Find time range
    const timestamps = entries.map(e => new Date(e.timestamp)).sort()
    const start = timestamps[0] || new Date()
    const end = timestamps[timestamps.length - 1] || new Date()

    return {
      entries,
      totalEntries: entries.length,
      errorCount,
      warnCount,
      timeRange: { start, end },
      sources: Array.from(sources)
    }
  }

  parseLogContent(content: string): LogEntry[] {
    const lines = content.split('\n').filter(line => line.trim())
    const entries: LogEntry[] = []

    lines.forEach(line => {
      const entry = this.parseLogLine(line)
      if (entry) {
        entries.push(entry)
      }
    })

    return entries
  }

  private parseLogLine(line: string): LogEntry | null {
    // Try different log formats
    const formats = [
      this.parseStandardFormat,
      this.parseJSONFormat,
      this.parseNginxFormat,
      this.parseApacheFormat,
      this.parseApplicationFormat
    ]

    for (const format of formats) {
      try {
        const result = format(line)
        if (result) return result
      } catch {
        // Continue to next format
      }
   }

    return null
  }

  private parseStandardFormat(line: string): LogEntry | null {
    // Parse: [2024-06-14 12:00:00] ERROR: Error message
    const match = line.match(/^\[([^\]]+)\]\s+(\w+):\s+(.+)$/)
    if (!match) return null

    const [, timestamp, level, message] = match
    return {
      timestamp,
      level: level.toLowerCase() as LogEntry['level'],
      message: message.trim(),
      source: 'application'
    }
  }

  private parseJSONFormat(line: string): LogEntry | null {
    try {
      const json = JSON.parse(line)
      return {
        timestamp: json.timestamp || json.time || json['@timestamp'],
        level: (json.level || json.severity || 'info').toLowerCase(),
        message: json.message || json.msg || line,
        source: json.service || json.source || json.logger,
        stackTrace: json.stack || json.stackTrace,
        context: json.context || json.meta
      }
    } catch {
      return null
    }
  }

  private parseNginxFormat(line: string): LogEntry | null {
    // Parse Nginx error log format
    const match = line.match(/^(\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}) \[(\w+)\] (.+)$/)
    if (!match) return null

    const [, timestamp, level, message] = match
    return {
      timestamp,
      level: level.toLowerCase() as LogEntry['level'],
      message: message.trim(),
      source: 'nginx'
    }
  }

  private parseApacheFormat(line: string): LogEntry | null {
    // Parse Apache error log format
    const match = line.match(/^\[([^\]]+)\] \[(\w+)\] (.+)$/)
    if (!match) return null

    const [, timestamp, level, message] = match
    return {
      timestamp,
      level: level.toLowerCase() as LogEntry['level'],
      message: message.trim(),
      source: 'apache'
    }
  }

  private parseApplicationFormat(line: string): LogEntry | null {
    // Parse common application format: timestamp level message
    const match = line.match(/^(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})?)\s+(\w+)\s+(.+)$/)
    if (!match) return null

    const [, timestamp, level, message] = match
    return {
      timestamp,
      level: level.toLowerCase() as LogEntry['level'],
      message: message.trim(),
      source: 'application'
    }
  }

  private generateSampleEntries(): LogEntry[] {
    return [
      {
        timestamp: '2024-06-14T12:00:00Z',
        level: 'error',
        message: 'Database connection failed: Connection timeout after 30s',
        source: 'database',
        stackTrace: 'at Database.connect (database.js:45)\n    at UserService.getUser (user-service.js:23)',
        context: { connectionString: 'postgresql://localhost:5432/app', timeout: 30000 }
      },
      {
        timestamp: '2024-06-14T12:00:05Z',
        level: 'error',
        message: 'Failed to process user request: User not found',
        source: 'api',
        context: { userId: '12345', endpoint: '/api/users/12345' }
      },
      {
        timestamp: '2024-06-14T12:00:10Z',
        level: 'warn',
        message: 'High memory usage detected: 85% of available memory in use',
        source: 'system',
        context: { memoryUsage: 0.85, threshold: 0.8 }
      }
    ]
  }

  extractErrorPatterns(entries: LogEntry[]): string[] {
    const patterns = new Set<string>()
    
    entries.filter(e => e.level === 'error').forEach(entry => {
      // Extract common error patterns
      const message = entry.message.toLowerCase()
      
      if (message.includes('connection')) patterns.add('connection_errors')
      if (message.includes('timeout')) patterns.add('timeout_errors')
      if (message.includes('not found')) patterns.add('not_found_errors')
      if (message.includes('permission') || message.includes('unauthorized')) patterns.add('auth_errors')
      if (message.includes('memory') || message.includes('out of memory')) patterns.add('memory_errors')
      if (message.includes('disk') || message.includes('space')) patterns.add('disk_errors')
      if (message.includes('network')) patterns.add('network_errors')
    })

    return Array.from(patterns)
  }
}
