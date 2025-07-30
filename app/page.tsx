"use client"

import { useState, useEffect } from "react"
import { Dice1, Download, Settings, Play, Github, ExternalLink, RefreshCw, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { CodeBlock } from "@/components/code-block"
import { Input } from "@/components/ui/input"
import { rollDice as rollDiceAction, listTools } from "@/app/actions/mcp-actions"

// Test Dice Roller Component
function TestDiceRoller() {
  const [sides, setSides] = useState(6)
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  // Check server status on component mount
  useEffect(() => {
    checkServerStatus()
  }, [])

  const checkServerStatus = async () => {
    setServerStatus('checking')
    try {
      // Use server action to check if MCP tools are available
      const result = await listTools()
      if (result.success) {
        setServerStatus('online')
      } else {
        setServerStatus('offline')
      }
    } catch {
      setServerStatus('offline')
    }
  }

  const rollDice = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // Use server action to call MCP dice rolling logic
      const result = await rollDiceAction(sides)
      
      if (result.success && result.result) {
        setResult(result.result.content[0].text)
      } else if (result.error) {
        setError(result.error.message || 'An error occurred')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Dice1 className="h-5 w-5" />
            <span>MCP Server Interface</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-sm">
              {serverStatus === 'checking' && (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="text-muted-foreground">Checking...</span>
                </>
              )}
              {serverStatus === 'online' && (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-green-600 dark:text-green-400">Server Online</span>
                </>
              )}
              {serverStatus === 'offline' && (
                <>
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-600 dark:text-red-400">Server Offline</span>
                </>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={checkServerStatus}
              disabled={serverStatus === 'checking'}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Test the dice rolling functionality using server actions that call the same logic as the MCP handler at /api/[transport].
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {serverStatus === 'offline' && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">Server Not Running</h4>
            <p className="text-sm text-red-600 dark:text-red-400">
              Make sure you have started the development server with <code className="bg-red-500/10 px-1 rounded">npm run dev</code>
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="sides" className="block text-sm font-medium mb-2">
              Number of sides (minimum 2):
            </label>
            <div className="flex space-x-2">
              <Input
                id="sides"
                type="number"
                min="2"
                max="1000"
                value={sides}
                onChange={(e) => setSides(parseInt(e.target.value) || 2)}
                className="w-32"
              />
              <div className="flex space-x-1">
                {[2, 4, 6, 8, 10, 12, 20, 100].map((presetSides) => (
                  <Button
                    key={presetSides}
                    variant={sides === presetSides ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSides(presetSides)}
                  >
                    d{presetSides}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <Button
            onClick={rollDice}
            disabled={loading || serverStatus !== 'online' || sides < 2}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Rolling...
              </>
            ) : (
              <>
                <Dice1 className="h-4 w-4 mr-2" />
                Roll d{sides}
              </>
            )}
          </Button>

          {result && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">Result:</h4>
              <p className="text-lg font-mono text-green-600 dark:text-green-400">{result}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">Error:</h4>
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Test Different Scenarios:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSides(6)
                setTimeout(rollDice, 100)
              }}
              disabled={loading || serverStatus !== 'online'}
            >
              Quick d6
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSides(20)
                setTimeout(rollDice, 100)
              }}
              disabled={loading || serverStatus !== 'online'}
            >
              Quick d20
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSides(2)
                setTimeout(rollDice, 100)
              }}
              disabled={loading || serverStatus !== 'online'}
            >
              Coin Flip
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSides(100)
                setTimeout(rollDice, 100)
              }}
              disabled={loading || serverStatus !== 'online'}
            >
              d100
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>This test interface calls a simplified test API endpoint for debugging.</p>
          <p>The main MCP server endpoint is at /api/[transport] (e.g., /api/sse).</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Home() {
  const claudeConfig = `{
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
}`

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Dice1 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Roll Dice MCP Server</h1>
              <p className="text-muted-foreground text-sm">Model Context Protocol for Claude Desktop</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" asChild>
              <a href="https://github.com/gocallum/rolldice-mcpserver" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4 mr-2" />
                GitHub
              </a>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            ✨ MCP Server Ready
          </Badge>
          <h2 className="text-4xl font-bold mb-4">
            Add Dice Rolling to Claude Desktop
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A powerful Model Context Protocol server that lets you roll dice of any size directly within Claude Desktop conversations.
          </p>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="setup" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Setup Guide</span>
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center space-x-2">
              <Dice1 className="h-4 w-4" />
              <span>Test Server</span>
            </TabsTrigger>
            <TabsTrigger value="usage" className="flex items-center space-x-2">
              <Play className="h-4 w-4" />
              <span>How to Play</span>
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center space-x-2">
              <Dice1 className="h-4 w-4" />
              <span>About</span>
            </TabsTrigger>
          </TabsList>

          {/* Setup Guide Tab */}
          <TabsContent value="setup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download className="h-5 w-5" />
                  <span>Step 1: Install Claude Desktop</span>
                </CardTitle>
                <CardDescription>
                  First, you&apos;ll need to download and install Claude Desktop on your computer.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Windows</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>Visit the Claude Desktop download page</li>
                        <li>Download the Windows installer (.exe)</li>
                        <li>Run the installer and follow the prompts</li>
                        <li>Launch Claude Desktop from Start Menu</li>
                      </ol>
                      <Button className="mt-4 w-full" asChild>
                        <a href="https://claude.ai/download" target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          Download for Windows
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">macOS</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>Visit the Claude Desktop download page</li>
                        <li>Download the macOS installer (.dmg)</li>
                        <li>Open the DMG and drag Claude to Applications</li>
                        <li>Launch Claude Desktop from Applications</li>
                      </ol>
                      <Button className="mt-4 w-full" asChild>
                        <a href="https://claude.ai/download" target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          Download for macOS
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Step 2: Start the MCP Server</span>
                </CardTitle>
                <CardDescription>
                  Make sure this MCP server is running on your local machine.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  Run this command in your terminal to start the server:
                </p>
                <CodeBlock title="Terminal Command">npm run dev</CodeBlock>
                <p className="mt-4 text-sm text-muted-foreground">
                  The server should now be running at <code className="bg-muted px-1 rounded">http://localhost:3000</code>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Step 3: Configure Claude Desktop</span>
                </CardTitle>
                <CardDescription>
                  Add the MCP server configuration to Claude Desktop.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Configuration File Location:</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Windows:</p>
                        <CodeBlock language="text">%APPDATA%\Claude\claude_desktop_config.json</CodeBlock>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">macOS:</p>
                        <CodeBlock language="text">~/Library/Application Support/Claude/claude_desktop_config.json</CodeBlock>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Configuration Content:</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Copy and paste this JSON configuration into your Claude Desktop config file:
                    </p>
                    <CodeBlock language="json" title="claude_desktop_config.json">
                      {claudeConfig}
                    </CodeBlock>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                    <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-2">Important Notes:</h4>
                    <ul className="text-sm space-y-1 text-amber-600 dark:text-amber-400">
                      <li>• If the config file doesn&apos;t exist, create it</li>
                      <li>• Make sure the server is running before using Claude Desktop</li>
                      <li>• You may need to enable Developer mode in Claude Desktop settings</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Play className="h-5 w-5" />
                  <span>Step 4: Restart Claude Desktop</span>
                </CardTitle>
                <CardDescription>
                  Restart Claude Desktop to load the new MCP server configuration.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Completely close Claude Desktop</li>
                  <li>Reopen Claude Desktop</li>
                  <li>Look for a hammer icon (🔨) in the bottom right of the input box</li>
                  <li>The hammer icon indicates MCP tools are available</li>
                </ol>
                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm text-green-600 dark:text-green-400">
                    ✅ If you see the hammer icon, you&apos;re ready to start rolling dice!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Test Server Tab */}
          <TabsContent value="test" className="space-y-6">
            {/* MCP Protocol Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>About MCP Protocol & Server Actions</span>
                </CardTitle>
                <CardDescription>
                  Understanding how the Model Context Protocol works and how this web interface connects to it.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">What is MCP (Model Context Protocol)?</h4>
                    <p className="text-sm text-muted-foreground">
                      MCP is a protocol that allows AI assistants like Claude to securely connect to external tools and data sources. 
                      It defines a standardized way for AI models to discover available tools, understand their capabilities, and execute them safely.
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">How the MCP Server Works</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• <strong>Transport Layer:</strong> The server at <code className="bg-muted px-1 rounded">/api/[transport]</code> handles different connection types (SSE, stdio, etc.)</p>
                      <p>• <strong>Tool Registration:</strong> Tools like <code className="bg-muted px-1 rounded">roll_dice</code> are registered with schemas defining their inputs</p>
                      <p>• <strong>JSON-RPC Protocol:</strong> All communication uses JSON-RPC 2.0 for method calls and responses</p>
                      <p>• <strong>Type Safety:</strong> Uses Zod schemas for runtime validation of tool parameters</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Web Interface Bridge</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>
                        This web interface uses <strong>Next.js Server Actions</strong> that call shared dice rolling logic. 
                        Both the MCP server and web interface use the exact same <code className="bg-muted px-1 rounded">rollDice()</code> function from <code className="bg-muted px-1 rounded">/lib/dice.ts</code>.
                      </p>
                      <p className="mt-2">
                        <strong>Benefits:</strong> Identical validation, randomness algorithm, output format, and tool definitions - true single source of truth.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      <strong>💡 Technical Note:</strong> The MCP handler at <code className="bg-muted px-1 rounded">/api/[transport]</code> and server actions both import the same 
                      dice logic from <code className="bg-muted px-1 rounded">lib/dice.ts</code>, ensuring absolute consistency between Claude Desktop and web testing.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <TestDiceRoller />
          </TabsContent>

          {/* Usage Guide Tab */}
          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Dice1 className="h-5 w-5" />
                  <span>How to Roll Dice with Claude</span>
                </CardTitle>
                <CardDescription>
                  Once configured, you can ask Claude to roll dice in natural language.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Example Commands:</h4>
                  <div className="grid gap-4">
                    <Card className="p-4">
                      <p className="font-medium text-sm mb-2">Basic dice roll:</p>
                      <p className="text-muted-foreground italic">&quot;Roll a 6-sided die&quot;</p>
                      <Separator className="my-2" />
                      <p className="text-sm">🎲 You rolled a 4!</p>
                    </Card>
                    
                    <Card className="p-4">
                      <p className="font-medium text-sm mb-2">D&amp;D style:</p>
                      <p className="text-muted-foreground italic">&quot;Roll a d20 for me&quot;</p>
                      <Separator className="my-2" />
                      <p className="text-sm">🎲 You rolled a 17!</p>
                    </Card>
                    
                    <Card className="p-4">
                      <p className="font-medium text-sm mb-2">Custom dice:</p>
                      <p className="text-muted-foreground italic">&quot;Can you roll a 100-sided die?&quot;</p>
                      <Separator className="my-2" />
                      <p className="text-sm">🎲 You rolled a 73!</p>
                    </Card>
                    
                    <Card className="p-4">
                      <p className="font-medium text-sm mb-2">In conversation:</p>
                      <p className="text-muted-foreground italic">&quot;I need to make a decision. Roll a coin (2-sided die)&quot;</p>
                      <Separator className="my-2" />
                      <p className="text-sm">🎲 You rolled a 1!</p>
                    </Card>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Supported Dice Types:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[2, 4, 6, 8, 10, 12, 20, 100].map((sides) => (
                      <Badge key={sides} variant="outline" className="justify-center py-2">
                        d{sides}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    + Any custom number of sides (minimum 2)
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Use Cases:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start space-x-2">
                      <span className="text-primary">•</span>
                      <span><strong>Tabletop Gaming:</strong> Roll dice for D&D, Pathfinder, or other RPGs</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-primary">•</span>
                      <span><strong>Decision Making:</strong> Use dice to make random choices</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-primary">•</span>
                      <span><strong>Probability Teaching:</strong> Demonstrate random number generation</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-primary">•</span>
                      <span><strong>Game Development:</strong> Test random mechanics and balance</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About This MCP Server</CardTitle>
                <CardDescription>
                  Learn more about the Model Context Protocol and this implementation.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">What is MCP?</h4>
                  <p className="text-sm text-muted-foreground">
                    The Model Context Protocol (MCP) is a standard protocol that enables AI assistants like Claude 
                    to securely connect with external data sources and tools. This creates a more powerful and 
                    flexible AI experience.
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold mb-2">Features</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Roll dice with any number of sides (minimum 2)</li>
                    <li>• Natural language interface via Claude</li>
                    <li>• Built with TypeScript and Next.js</li>
                    <li>• Uses mcp-handler for HTTP-based MCP protocol</li>
                    <li>• Easy deployment to Vercel or other platforms</li>
                    <li>• Open source and MIT licensed</li>
                  </ul>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold mb-2">Author</h4>
                  <p className="text-sm text-muted-foreground">
                    Created by{" "}
                    <a 
                      href="https://github.com/gocallum" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-primary hover:underline font-medium"
                    >
                      Callum Bir
                    </a>
                    . This project is open source and available on GitHub for contributions and improvements.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Connect with me on{" "}
                    <a 
                      href="https://www.linkedin.com/in/callumbir/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-primary hover:underline font-medium"
                    >
                      LinkedIn
                    </a>
                    {" "}for updates and discussions about MCP development.
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold mb-2">Technical Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Protocol:</strong> Model Context Protocol</p>
                      <p><strong>Transport:</strong> HTTP with mcp-remote bridge</p>
                      <p><strong>Framework:</strong> Next.js 15</p>
                    </div>
                    <div>
                      <p><strong>Language:</strong> TypeScript</p>
                      <p><strong>Validation:</strong> Zod schemas</p>
                      <p><strong>UI:</strong> shadcn/ui components</p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex space-x-4">
                  <Button variant="outline" asChild>
                    <a href="https://modelcontextprotocol.io/" target="_blank" rel="noopener noreferrer">
                      Learn about MCP
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="https://github.com/gocallum/rolldice-mcpserver" target="_blank" rel="noopener noreferrer">
                      View Source Code
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Built with Next.js, shadcn/ui, and the Model Context Protocol</p>
          <p className="mt-1">
            Created by{" "}
            <a 
              href="https://github.com/gocallum" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary hover:underline"
            >
              Callum Bir
            </a>
            {" "}• Open source on{" "}
            <a 
              href="https://github.com/gocallum/rolldice-mcpserver" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary hover:underline"
            >
              GitHub
            </a>
            {" "}• Connect on{" "}
            <a 
              href="https://www.linkedin.com/in/callumbir/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary hover:underline"
            >
              LinkedIn
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
