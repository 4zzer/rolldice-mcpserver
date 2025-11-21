# 🎲 Roll Dice MCP Server - OAuth 2.1 Secured Edition

**Production-grade MCP server demonstrating enterprise security best practices**

A fully secured Model Context Protocol (MCP) server showcasing OAuth 2.1 authentication, Arcjet protection, and comprehensive security monitoring. Built as a reference implementation for the Agent Security Advanced workshop.

[![Security](https://img.shields.io/badge/Security-OAuth%202.1-green.svg)](https://spec.modelcontextprotocol.io/specification/2025-06-18/authentication/)
[![Protection](https://img.shields.io/badge/Protection-Arcjet-blue.svg)](https://arcjet.com)
[![Deployed](https://img.shields.io/badge/Deployed-Vercel-black.svg)](https://vercel.com)

![Roll Dice MCP Server](https://via.placeholder.com/800x400/0f0f0f/ffffff?text=Secured+Roll+Dice+MCP+Server)

## 🔒 Security Architecture

This server implements **defense-in-depth security**:

1. **OAuth 2.1 Authentication** - Google ID token verification with PKCE support
2. **Arcjet Protection** - Shield, bot detection, and rate limiting
3. **Structured Logging** - Comprehensive audit trail of security events
4. **Incident Response** - Battle-tested runbook for security incidents

### Security Features

- 🔐 **OAuth 2.1 Compliant**: Following MCP Specification 2025-06-18
- 🛡️ **Arcjet Shield**: Protection against common web attacks
- 🤖 **Bot Detection**: Behavioral analysis and fingerprinting
- ⏱️ **Rate Limiting**: Token bucket algorithm (60 req/min)
- 📊 **Security Monitoring**: Real-time logging of authentication and attacks
- 📋 **RFC 8414 Discovery**: Authorization server metadata endpoints
- 🔍 **Token Introspection**: Real-time validation with Google
- 🚨 **Incident Response**: Complete runbook for security events

📚 **[View Full Security Documentation →](/mcp-security)**

## ✨ Application Features

- 🎲 **Roll Any Dice**: Support for any number of sides (minimum 2) - d4, d6, d20, d100, or custom
- 🌐 **Beautiful Web Interface**: Modern, responsive UI with security documentation
- 🔄 **Server Actions Integration**: Web interface uses the same secured logic
- 🌙 **Dark/Light Mode**: Toggle between themes with dark mode as default
- 📋 **Copy-to-Clipboard**: Easy configuration copying for Claude Desktop setup
- 🔧 **Multiple Transports**: Supports SSE, stdio, and other MCP transport protocols
- 🚀 **Vercel Ready**: Optimized for production deployment
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices

## 🖥️ Live Demo

**Production Instance:** https://rolldice-mcpserver-nu.vercel.app

**Security Documentation:** https://rolldice-mcpserver-nu.vercel.app/mcp-security

## 🚀 Quick Start

### Prerequisites

Before starting, you need:
- Node.js 22+ and pnpm
- Google Cloud Console account (for OAuth)
- Arcjet account (for protection)

### 1. Clone and Install

```bash
git clone https://github.com/4zzer/rolldice-mcpserver.git
cd rolldice-mcpserver
pnpm install
```

### 2. Configure Environment Variables

Create `.env.local`:

```bash
# Google OAuth 2.1 Configuration
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here

# Arcjet Protection
ARCJET_KEY=your_arcjet_key_here

# Production URL (for redirect URI validation)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Get Google OAuth Credentials:**
1. Visit https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Add redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `http://localhost:3000/oauth/callback`
   - Your production URL + same paths

**Get Arcjet Key:**
1. Sign up at https://arcjet.com
2. Create new site
3. Copy API key from dashboard

### 3. Start Development Server

```bash
pnpm dev
```

The application will be available at:
- **Web Interface**: `http://localhost:3000` (setup instructions, documentation, and testing)
- **MCP Endpoint**: `http://localhost:3000/api/mcp` (OAuth 2.1 protected)
- **Security Docs**: `http://localhost:3000/mcp-security`

### 4. Deploy to Vercel

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Settings → Environment Variables → Add all from .env.local
```

## 🤖 Setting Up with Claude Desktop

⚠️ **Important:** As of January 2025, Claude Desktop's `mcp-remote` has limited OAuth support. This server is fully compliant with MCP OAuth 2.1 specification, but client tooling is still evolving.

### Current Testing Methods

1. **Direct API Testing** (Recommended)
   ```bash
   # Get Google ID token (use OAuth Playground or valid client)
   TOKEN="your_google_id_token_here"

   # Test MCP endpoint
   curl -X POST http://localhost:3000/api/mcp \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
   ```

2. **Web Interface Testing**
   - Visit `http://localhost:3000`
   - Use built-in test interface (if authenticated)

3. **Claude Desktop Config** (Experimental)
   The web interface provides configuration templates, but note that OAuth flow may not complete successfully with current mcp-remote version.

### 1. Install Claude Desktop
Download from [claude.ai/download](https://claude.ai/download)

### 2. Configure MCP Connection (Experimental)
Add this to your Claude Desktop config file:

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`  
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "rolldice": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "http://localhost:3000/api/mcp"
      ]
    }
  }
}
```

### 3. Restart Claude Desktop
Look for the hammer icon (🔨) in the input box - this indicates MCP tools are available!

### 4. Start Rolling!
Ask Claude natural language questions like:
- "Roll a 6-sided die"
- "Roll a d20 for my D&D character"
- "Can you roll a 100-sided die?"

## 🏗️ How It Works

This application uses **mcp-handler** to provide seamless integration between web applications and AI assistants like Claude Desktop.

### Architecture

```
Claude Desktop → Transport Protocol → /api/[transport] → Shared Dice Logic (/lib/dice.ts)
Web Interface → Server Actions → Shared Dice Logic (/lib/dice.ts)
```

1. **Claude Desktop** connects via various transport protocols (SSE, stdio, etc.)
2. **Transport Layer** handles the MCP protocol communication
3. **MCP Handler** processes tool calls and invokes shared dice logic
4. **Shared Logic** (`/lib/dice.ts`) contains the single source of truth for validation and randomness
5. **Server Actions** (for web) call the same shared dice logic directly

### Key Components

- **`lib/dice.ts`**: Shared dice rolling logic, schema, and tool definitions
- **`lib/auth.ts`**: OAuth 2.1 token verification with Google
- **`lib/oauth-utils.ts`**: OAuth utilities for error handling and logging
- **`app/api/[transport]/route.ts`**: MCP server endpoint with OAuth + Arcjet protection
- **`app/actions/mcp-actions.ts`**: Server actions that use the shared dice logic
- **`app/page.tsx`**: Beautiful web interface with setup instructions
- **`app/mcp-security/page.tsx`**: Comprehensive security documentation
- **`components/`**: Reusable shadcn/ui components for the interface

### Security Flow

```
Request → Arcjet Protection → OAuth 2.1 Verification → MCP Tool Execution
   ↓            ↓                     ↓                       ↓
Shield    Rate Limit        Google Token        Authenticated
Bot Block  60 req/min       Validation          User Context
```

### Web Interface Benefits

The web interface uses **Next.js Server Actions** that import the same shared logic as the MCP server:
- ✅ Same Zod schema validation (`lib/dice.ts`)
- ✅ Identical randomness algorithm (single `rollDice()` function)
- ✅ Consistent output formatting (same result structure)
- ✅ Shared tool definitions (same name, description, schema)
- ✅ True single source of truth architecture
- ✅ OAuth-aware tool execution with user attribution
- **MCP Tools**: `roll_dice` tool with OAuth authentication and user context

## 🚀 Deployment to Vercel

### Option 1: Deploy Button (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/gocallum/rolldice-mcpserver)

### Option 2: Manual Deployment

1. **Connect to Vercel**:
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Update Claude Desktop Config**:
   Replace `http://localhost:3000` with your Vercel URL:
   ```json
   {
     "mcpServers": {
       "rolldice": {
         "command": "npx",
         "args": [
           "-y",
           "mcp-remote",
           "https://your-app.vercel.app/api/mcp"
         ]
       }
     }
   }
   ```

3. **Restart Claude Desktop** to use the deployed version

## 🛠️ Technology Stack

### Core Framework
- **Framework**: [Next.js 15](https://nextjs.org/) with App Router and Turbopack
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/) components
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with CSS variables
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes) for dark/light mode
- **Icons**: [Lucide React](https://lucide.dev/) for beautiful icons

### MCP Protocol
- **MCP Integration**: [mcp-handler](https://www.npmjs.com/package/mcp-handler) for HTTP-based MCP protocol
- **MCP Spec**: Following 2025-06-18 OAuth 2.1 specification
- **MCP Bridge**: [mcp-remote](https://www.npmjs.com/package/mcp-remote) for Claude Desktop connectivity

### Security
- **OAuth 2.1**: [google-auth-library](https://www.npmjs.com/package/google-auth-library) for token verification
- **Arcjet**: [Shield, Bot Detection, Rate Limiting](https://arcjet.com)
- **Validation**: [Zod](https://zod.dev/) for type-safe parameter validation

### Infrastructure
- **Deployment**: [Vercel](https://vercel.com/) platform with edge functions
- **Monitoring**: Vercel logs and analytics
- **CI/CD**: Automatic deployment from GitHub

## 🎯 Use Cases

- **🎮 Tabletop Gaming**: Perfect for D&D, Pathfinder, and other RPGs
- **🤔 Decision Making**: Use dice rolls to make random choices
- **📚 Education**: Demonstrate probability and random number generation
- **🎲 Game Development**: Test random mechanics and game balance
- **🎪 Fun & Entertainment**: Add randomness to conversations with Claude

## 🤝 Contributing

Contributions are welcome! This project is open source and MIT licensed.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📚 Documentation

### Security Documentation
- **[Security Architecture](/mcp-security)** - Complete security implementation details
- **[Incident Response Runbook](/docs/INCIDENT_RESPONSE_RUNBOOK.md)** - Step-by-step security incident procedures
- **[Vercel Firewall Guide](/docs/VERCEL_FIREWALL.md)** - Infrastructure-level protection configuration

### Technical Resources
- **[Model Context Protocol](https://modelcontextprotocol.io/)** - Official MCP documentation
- **[MCP OAuth 2.1 Spec](https://spec.modelcontextprotocol.io/specification/2025-06-18/authentication/)** - Authentication specification
- **[mcp-handler](https://www.npmjs.com/package/mcp-handler)** - The HTTP-based MCP handler used in this project
- **[mcp-remote](https://www.npmjs.com/package/mcp-remote)** - Bridge tool for Claude Desktop connectivity
- **[Arcjet Documentation](https://docs.arcjet.com/)** - Protection and rate limiting guide
- **[RFC 8414](https://datatracker.ietf.org/doc/html/rfc8414)** - OAuth 2.0 Authorization Server Metadata
- **[RFC 9728](https://datatracker.ietf.org/doc/html/rfc9728)** - OAuth 2.0 Token Authentication

## 🔒 Security Considerations

This project demonstrates **production-grade security** for MCP servers:

### What's Implemented
✅ OAuth 2.1 authentication with Google  
✅ PKCE support for authorization code flow  
✅ Token introspection and validation  
✅ Rate limiting (60 req/min per user/IP)  
✅ Bot detection and blocking  
✅ Shield protection against attacks  
✅ Structured security logging  
✅ Incident response procedures  

### What's NOT Implemented (Considerations for Production)
- Multi-provider OAuth (only Google currently)
- Token refresh flow (relies on short-lived ID tokens)
- User session management
- Audit trail persistence (logs only in Vercel)
- Automated alerting (manual monitoring required)

**For production deployments**, consider:
- Adding monitoring and alerting (Datadog, Sentry, etc.)
- Implementing token refresh for longer sessions
- Adding more OAuth providers (GitHub, Microsoft, etc.)
- Setting up SIEM integration for security logs
- Configuring Vercel Firewall (Pro/Enterprise)
- Regular security audits and penetration testing

## 📊 Week 8 Deliverable Checklist

This implementation satisfies all requirements for the Agent Security Advanced workshop:

- ✅ **OAuth 2.1 Implementation**: Google authentication with full RFC compliance
- ✅ **Arcjet Integration**: Shield, bot detection, and rate limiting
- ✅ **Logging**: Comprehensive structured logging of security events
- ✅ **Incident Response Runbook**: Complete procedures for common incidents
- ✅ **Documentation**: Security architecture and operational guides
- ✅ **Production Deployment**: Live at https://rolldice-mcpserver-nu.vercel.app
- ✅ **Testing**: Discovery endpoints and OAuth flow verified

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 👨‍💻 Authors

**Original Author**: [Callum Bir](https://github.com/gocallum)  
**Security Implementation**: [4zzer](https://github.com/4zzer)

Based on the Agent Security Advanced workshop by [AusBiz Consulting](https://aiagents.ausbizconsulting.com.au/).

⭐ If you find this project useful, please consider giving it a star on GitHub!

---

*Built with ❤️ using Next.js, shadcn/ui, OAuth 2.1, and Arcjet Security*


