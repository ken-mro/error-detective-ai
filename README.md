# Error Detective AI

An AI-powered chat application for root cause analysis of system errors and logs. This application uses advanced AI models and Model Context Protocol (MCP) servers to analyze error logs, examine source code, and provide comprehensive incident analysis with suggested fixes and unit tests.

## Features

- 🤖 **Multi-AI Provider Support**: OpenAI, Anthropic Claude, Amazon Bedrock, Google Vertex AI
- 📊 **Intelligent Log Parsing**: Supports multiple log formats (.log files)
- 🔍 **Source Code Analysis**: Integrates with GitHub, GitLab, and code-index MCP servers
- 💡 **Root Cause Analysis**: AI-powered detection of error causes and affected components
- 🛠️ **Automated Fix Suggestions**: Code fixes with priority levels and explanations
- 🧪 **Unit Test Generation**: Automatic test creation for suggested fixes
- 💬 **Interactive Chat Interface**: Real-time conversation with the AI agent
- 🎨 **Modern UI**: Beautiful, responsive interface with dark mode support

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- API key for at least one AI provider (OpenAI, Anthropic, etc.)
- Optional: GitHub/GitLab tokens for source code analysis

### Installation

1. **Clone and setup**:
   ```bash
   git clone <your-repo>
   cd error-detective-ai
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

3. **Run the application**:
   ```bash
   npm run dev
   ```

4. **Open in browser**: http://localhost:3000

## Configuration

### AI Providers

Configure one or more AI providers in your `.env.local`:

```env
# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Google Vertex AI
GOOGLE_CLOUD_PROJECT=your-project
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json

# Amazon Bedrock
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
```

### MCP Servers

Enable source code analysis by configuring MCP servers:

```env
# GitHub
GITHUB_TOKEN=ghp_...

# GitLab
GITLAB_TOKEN=glpat-...
```

## Usage

### 1. Upload Log Files
- Drag and drop `.log` files or click to upload
- Supports various log formats (JSON, standard, nginx, apache, etc.)
- Multiple files can be uploaded simultaneously

### 2. Configure AI Provider
- Click the settings icon to open configuration
- Select your preferred AI provider
- Enter your API key (stored locally, never sent to external servers)
- Enable MCP servers for code analysis

### 3. Describe the Incident
- Type a description of the problem or incident
- Be specific about symptoms, timing, and affected functionality
- The AI will analyze logs and provide comprehensive results

### 4. Review Analysis Results
- **Root Cause**: Primary cause identification with confidence score
- **Suggested Fixes**: Prioritized code and configuration changes
- **Unit Tests**: Automatically generated tests for fixes
- **Code Analysis**: Affected files and components (when MCP enabled)

## Supported Log Formats

The application can parse various log formats:

- **Standard**: `[2024-06-14 12:00:00] ERROR: Error message`
- **JSON**: `{"timestamp":"2024-06-14T12:00:00Z","level":"error","message":"..."}`
- **Nginx**: `2024/06/14 12:00:00 [error] Error message`
- **Apache**: `[Wed Jun 14 12:00:00 2024] [error] Error message`
- **Application**: `2024-06-14T12:00:00Z ERROR Error message`

## MCP Server Integration

The application supports multiple Model Context Protocol servers:

- **GitHub MCP**: Analyze GitHub repositories
- **GitLab MCP**: Analyze GitLab repositories  
- **Code Index MCP**: Local code indexing and search

These servers enable the AI to examine source code, understand system architecture, and provide more accurate root cause analysis.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Routes     │    │   AI Providers  │
│   (Next.js)     │◄──►│   (Next.js)      │◄──►│   (Multi)       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       
         │                       ▼                       
         │              ┌──────────────────┐              
         │              │   Core Services  │              
         └─────────────►│                  │              
                        │ • Log Parser     │              
                        │ • MCP Manager    │              
                        │ • Analysis Engine│              
                        └──────────────────┘              
                                 │                        
                                 ▼                        
                        ┌──────────────────┐              
                        │   MCP Servers    │              
                        │ • GitHub         │              
                        │ • GitLab         │              
                        │ • Code Index     │              
                        └──────────────────┘              
```

## Development

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/analyze/       # Analysis API endpoint
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── ChatInterface.tsx  # Main chat component
│   ├── FileUpload.tsx     # File upload
│   ├── MessageList.tsx    # Message display
│   ├── MessageInput.tsx   # Message input
│   ├── AnalysisResults.tsx# Results display
│   └── SettingsPanel.tsx  # Configuration
├── lib/                   # Core services
│   ├── ai-provider-manager.ts
│   ├── mcp-manager.ts
│   ├── log-parser.ts
│   └── analysis-engine.ts
└── types/                 # TypeScript types
    └── index.ts
```

### Adding New AI Providers

1. Update the `AIProvider` type in `types/index.ts`
2. Add provider configuration in `ai-provider-manager.ts`
3. Update the settings panel UI

### Adding New MCP Servers

1. Create a new client class implementing `MCPClient`
2. Add server configuration in `mcp-manager.ts`
3. Update the settings panel

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review example log files and configurations
