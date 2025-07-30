# 🎲 Roll Dice MCP Server

A beautiful web application and Model Context Protocol (MCP) server that brings dice rolling functionality directly to Claude Desktop. Built with Next.js, shadcn/ui, and the MCP Handler library with server actions for seamless web testing.

![Roll Dice MCP Server](https://via.placeholder.com/800x400/0f0f0f/ffffff?text=Roll+Dice+MCP+Server)

## ✨ Features

- 🎲 **Roll Any Dice**: Support for any number of sides (minimum 2) - d4, d6, d20, d100, or custom
- 🌐 **Beautiful Web Interface**: Modern, responsive UI with detailed setup instructions
- 🔄 **Server Actions Integration**: Web interface uses the same logic as the MCP server
- 🌙 **Dark/Light Mode**: Toggle between themes with dark mode as default
- 📋 **Copy-to-Clipboard**: Easy configuration copying for Claude Desktop setup
- 🔧 **Multiple Transports**: Supports SSE, stdio, and other MCP transport protocols
- 🚀 **Vercel Ready**: Optimized for deployment on Vercel platform
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices
- 🧠 **Educational**: Detailed explanations of MCP protocol and architecture

## 🖥️ Live Demo

Visit the live application: [Your Vercel URL here]

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/gocallum/rolldice-mcpserver.git
cd rolldice-mcpserver
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The application will be available at:
- **Web Interface**: `http://localhost:3000` (setup instructions, documentation, and testing)
- **MCP Endpoint**: `http://localhost:3000/api/[transport]` (for Claude Desktop)

## 🤖 Setting Up with Claude Desktop

The web interface at `http://localhost:3000` provides detailed, step-by-step instructions with copy-to-clipboard functionality. Here's the quick version:

### 1. Install Claude Desktop
Download from [claude.ai/download](https://claude.ai/download)

### 2. Configure MCP Connection
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
- **`app/api/[transport]/route.ts`**: MCP server endpoint using mcp-handler + shared logic
- **`app/actions/mcp-actions.ts`**: Server actions that use the shared dice logic
- **`app/page.tsx`**: Beautiful web interface with setup instructions and testing
- **`components/`**: Reusable shadcn/ui components for the interface

### Web Interface Benefits

The web interface uses **Next.js Server Actions** that import the same shared logic as the MCP server:
- ✅ Same Zod schema validation (`lib/dice.ts`)
- ✅ Identical randomness algorithm (single `rollDice()` function)
- ✅ Consistent output formatting (same result structure)
- ✅ Shared tool definitions (same name, description, schema)
- ✅ True single source of truth architecture
- **MCP Tools**: `roll_dice` tool with Zod validation for parameters

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

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/) components
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with CSS variables
- **MCP Integration**: [mcp-handler](https://www.npmjs.com/package/mcp-handler) for HTTP-based MCP protocol
- **MCP Bridge**: [mcp-remote](https://www.npmjs.com/package/mcp-remote) for Claude Desktop connectivity
- **Validation**: [Zod](https://zod.dev/) for type-safe parameter validation
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes) for dark/light mode
- **Icons**: [Lucide React](https://lucide.dev/) for beautiful icons
- **Deployment**: [Vercel](https://vercel.com/) platform

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

## 📚 Learn More

- **[Model Context Protocol](https://modelcontextprotocol.io/)** - Official MCP documentation
- **[mcp-handler](https://www.npmjs.com/package/mcp-handler)** - The HTTP-based MCP handler used in this project
- **[mcp-remote](https://www.npmjs.com/package/mcp-remote)** - Bridge tool for Claude Desktop connectivity
- **[Claude Desktop](https://claude.ai/download)** - Download and setup guide
- **[Next.js Documentation](https://nextjs.org/docs)** - Learn about the framework

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

Created by **[Callum Bir](https://github.com/gocallum)**

⭐ If you find this project useful, please consider giving it a star on GitHub!

---

*Built with ❤️ using Next.js, shadcn/ui, and the Model Context Protocol*
