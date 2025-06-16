import { MCPServer } from '@/types'

interface CodeSearchResult {
  path: string
  content: string
  repository?: string
  line?: number
}

interface RepositoryInfo {
  name: string
  url: string
  description?: string
  language?: string
}

interface MCPClientConfig {
  token?: string
  baseUrl?: string
  indexPath?: string
  languages?: string[]
}

interface MCPClient {
  connect(): Promise<void>
  disconnect(): Promise<void>
  listFiles(path?: string): Promise<string[]>
  readFile(path: string): Promise<string>
  searchCode(query: string): Promise<CodeSearchResult[]>
  getRepositoryInfo(): Promise<RepositoryInfo>
}

export class MCPManager {
  private servers: Map<string, MCPServer> = new Map()
  private clients: Map<string, MCPClient> = new Map()

  constructor() {
    this.initializeDefaultServers()
  }

  private initializeDefaultServers() {
    const defaultServers: MCPServer[] = [
      {
        id: 'github',
        name: 'GitHub MCP',
        type: 'github',
        config: {
          token: process.env.GITHUB_TOKEN || '',
          baseUrl: 'https://api.github.com'
        },
        isConnected: false
      },
      {
        id: 'gitlab',
        name: 'GitLab MCP',
        type: 'gitlab',
        config: {
          token: process.env.GITLAB_TOKEN || '',
          baseUrl: 'https://gitlab.com/api/v4'
        },
        isConnected: false
      },
      {
        id: 'code-index',
        name: 'Code Index MCP',
        type: 'code-index',
        config: {
          indexPath: '/tmp/code-index',
          languages: ['typescript', 'javascript', 'python']
        },
        isConnected: false
      }
    ]

    defaultServers.forEach(server => {
      this.servers.set(server.id, server)
    })
  }

  async connectServer(serverId: string): Promise<boolean> {
    const server = this.servers.get(serverId)
    if (!server) {
      throw new Error(`Server ${serverId} not found`)
    }

    try {
      let client: MCPClient

      switch (server.type) {
        case 'github':
          client = new GitHubMCPClient(server.config)
          break
        case 'gitlab':
          client = new GitLabMCPClient(server.config)
          break
        case 'code-index':
          client = new CodeIndexMCPClient(server.config)
          break
        default:
          throw new Error(`Unsupported server type: ${server.type}`)
      }

      await client.connect()
      this.clients.set(serverId, client)
      
      server.isConnected = true
      this.servers.set(serverId, server)
      
      return true
    } catch (error) {
      console.error(`Failed to connect to ${serverId}:`, error)
      return false
    }
  }

  async disconnectServer(serverId: string): Promise<void> {
    const client = this.clients.get(serverId)
    if (client) {
      await client.disconnect()
      this.clients.delete(serverId)
    }

    const server = this.servers.get(serverId)
    if (server) {
      server.isConnected = false
      this.servers.set(serverId, server)
    }
  }

  async searchCode(query: string, serverId?: string): Promise<CodeSearchResult[]> {
    const results: CodeSearchResult[] = []
    
    if (serverId) {
      const client = this.clients.get(serverId)
      if (client) {
        const serverResults = await client.searchCode(query)
        results.push(...serverResults)
      }
    } else {
      // Search across all connected servers
      for (const [id, client] of this.clients) {
        try {
          const serverResults = await client.searchCode(query)
          results.push(...serverResults.map(result => ({ ...result, source: id })))
        } catch (error) {
          console.error(`Failed to search in ${id}:`, error)
        }
      }
    }

    return results
  }

  async getFileContent(path: string, serverId: string): Promise<string> {
    const client = this.clients.get(serverId)
    if (!client) {
      throw new Error(`Client ${serverId} not connected`)
    }

    return await client.readFile(path)
  }

  async listFiles(serverId: string, path?: string): Promise<string[]> {
    const client = this.clients.get(serverId)
    if (!client) {
      throw new Error(`Client ${serverId} not connected`)
    }

    return await client.listFiles(path)
  }

  getConnectedServers(): MCPServer[] {
    return Array.from(this.servers.values()).filter(server => server.isConnected)
  }

  getAllServers(): MCPServer[] {
    return Array.from(this.servers.values())
  }
}

// GitHub MCP Client Implementation
class GitHubMCPClient implements MCPClient {
  private config: MCPClientConfig
  private baseUrl: string

  constructor(config: MCPClientConfig) {
    this.config = config
    this.baseUrl = config.baseUrl || 'https://api.github.com'
  }

  async connect(): Promise<void> {
    // Test connection with a simple API call
    const response = await fetch(`${this.baseUrl}/user`, {
      headers: {
        'Authorization': `token ${this.config.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to connect to GitHub API')
    }
  }

  async disconnect(): Promise<void> {
    // Nothing to do for REST API
  }

  async listFiles(path = ''): Promise<string[]> {
    // This would implement GitHub repository file listing
    console.log('GitHub listFiles not implemented for path:', path);
    return []
  }

  async readFile(path: string): Promise<string> {
    // This would implement GitHub file reading
    console.log('GitHub readFile not implemented for path:', path);
    return ''
  }

  async searchCode(query: string): Promise<CodeSearchResult[]> {
    const response = await fetch(`${this.baseUrl}/search/code?q=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `token ${this.config.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })

    if (!response.ok) {
      throw new Error('GitHub code search failed')
    }

    const data = await response.json()
    return (data.items || []).map((item: {
      path: string
      text_matches?: Array<{
        fragment?: string
        matches?: Array<{ indices?: number[] }>
      }>
      repository?: { full_name: string }
    }) => ({
      path: item.path,
      content: item.text_matches?.[0]?.fragment || '',
      repository: item.repository?.full_name,
      line: item.text_matches?.[0]?.matches?.[0]?.indices?.[0]
    }))
  }

  async getRepositoryInfo(): Promise<RepositoryInfo> {
    // Implementation for getting repository information
    return {
      name: 'GitHub Repository',
      url: this.baseUrl
    }
  }
}

// GitLab MCP Client Implementation
class GitLabMCPClient implements MCPClient {
  private config: MCPClientConfig
  private baseUrl: string

  constructor(config: MCPClientConfig) {
    this.config = config
    this.baseUrl = config.baseUrl || 'https://gitlab.com/api/v4'
  }

  async connect(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/user`, {
      headers: {
        'Authorization': `Bearer ${this.config.token}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to connect to GitLab API')
    }
  }

  async disconnect(): Promise<void> {
    // Nothing to do for REST API
  }

  async listFiles(path = ''): Promise<string[]> {
    console.log('GitLab listFiles not implemented for path:', path);
    return []
  }

  async readFile(path: string): Promise<string> {
    console.log('GitLab readFile not implemented for path:', path);
    return ''
  }

  async searchCode(query: string): Promise<CodeSearchResult[]> {
    // Implementation for GitLab code search
    console.log('GitLab searchCode not implemented for query:', query);
    return []
  }

  async getRepositoryInfo(): Promise<RepositoryInfo> {
    return {
      name: 'GitLab Repository',
      url: this.baseUrl
    }
  }
}

// Code Index MCP Client Implementation
class CodeIndexMCPClient implements MCPClient {
  private config: MCPClientConfig

  constructor(config: MCPClientConfig) {
    this.config = config
  }

  async connect(): Promise<void> {
    // Implementation for code index connection
  }

  async disconnect(): Promise<void> {
    // Implementation for code index disconnection
  }

  async listFiles(path = ''): Promise<string[]> {
    console.log('CodeIndex listFiles not implemented for path:', path);
    return []
  }

  async readFile(path: string): Promise<string> {
    console.log('CodeIndex readFile not implemented for path:', path);
    return ''
  }

  async searchCode(query: string): Promise<CodeSearchResult[]> {
    // Implementation for local code index search
    console.log('CodeIndex searchCode not implemented for query:', query);
    return []
  }

  async getRepositoryInfo(): Promise<RepositoryInfo> {
    return {
      name: 'Code Index',
      url: this.config.indexPath || '/tmp/code-index'
    }
  }
}
