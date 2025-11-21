import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function MCPSecurityPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">MCP Security Architecture</h1>
        <p className="text-muted-foreground text-lg">
          Comprehensive security implementation for OAuth 2.1 authenticated MCP server
        </p>
      </div>

      {/* Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🛡️ Security Overview
          </CardTitle>
          <CardDescription>
            Multi-layered security approach following industry best practices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">OAuth 2.1</h3>
              <p className="text-sm text-muted-foreground">
                Modern authentication with Google ID tokens, PKCE support, and strict token validation
              </p>
              <Badge className="mt-2" variant="default">RFC 9728</Badge>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Arcjet Protection</h3>
              <p className="text-sm text-muted-foreground">
                Shield, bot detection, and rate limiting to prevent abuse and attacks
              </p>
              <Badge className="mt-2" variant="default">LIVE Mode</Badge>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Structured Logging</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive audit trail of authentication attempts and security events
              </p>
              <Badge className="mt-2" variant="default">Vercel Logs</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* OAuth 2.1 Architecture */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>🔐 OAuth 2.1 Authentication Architecture</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Discovery Endpoints (RFC 8414)</h3>
            <div className="bg-muted rounded-lg p-4 font-mono text-sm space-y-2">
              <div>
                <Badge variant="outline">GET</Badge>{" "}
                <code>/.well-known/oauth-authorization-server</code>
              </div>
              <div>
                <Badge variant="outline">GET</Badge>{" "}
                <code>/.well-known/oauth-protected-resource</code>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Returns authorization server metadata and protected resource configuration
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">Token Verification Flow</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Client requests MCP endpoint with <code>Authorization: Bearer &lt;token&gt;</code></li>
              <li>Server validates Google ID token using google-auth-library</li>
              <li>Verifies token audience matches expected client ID</li>
              <li>Validates resource parameter if present (RFC 8707)</li>
              <li>Extracts user identity (email, name, provider)</li>
              <li>Injects auth context into tool execution</li>
            </ol>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">Key Security Features</h3>
            <ul className="space-y-2 text-sm">
              <li>✅ <strong>PKCE Support:</strong> Protects authorization code flow</li>
              <li>✅ <strong>Token Introspection:</strong> Real-time validation with Google</li>
              <li>✅ <strong>Audience Validation:</strong> Prevents token substitution attacks</li>
              <li>✅ <strong>Resource Parameter:</strong> RFC 8707 compliance for resource indicators</li>
              <li>✅ <strong>WWW-Authenticate Headers:</strong> RFC 9728 compliant error responses</li>
              <li>✅ <strong>Secure Token Storage:</strong> Tokens never logged or persisted</li>
            </ul>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-950 border-l-4 border-yellow-500 p-4 text-sm">
            <p className="font-semibold mb-1">⚠️ MCP Client Support Status</p>
            <p className="text-muted-foreground">
              Note: As of January 2025, <code>mcp-remote</code> has limited OAuth support. 
              The server is fully OAuth 2.1 compliant, but client tooling is still evolving. 
              Direct API testing with valid Google ID tokens is recommended.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Arcjet Configuration */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>🛡️ Arcjet Security Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Protection Rules</h3>
            <div className="space-y-3">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Shield Protection</h4>
                  <Badge>LIVE</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Protects against common web attacks including SQL injection, XSS, 
                  and suspicious payloads. Automatically blocks malicious requests.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Bot Detection</h4>
                  <Badge>LIVE</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Identifies and blocks automated attacks while allowing legitimate search 
                  engine bots. Uses behavioral analysis and fingerprinting.
                </p>
                <div className="mt-2 text-xs">
                  <strong>Allowed:</strong> <code>CATEGORY:SEARCH_ENGINE</code>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Rate Limiting (Token Bucket)</h4>
                  <Badge>LIVE</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Token bucket algorithm prevents abuse while allowing legitimate burst traffic.
                </p>
                <div className="bg-muted rounded p-3 text-xs font-mono space-y-1">
                  <div><strong>Capacity:</strong> 60 tokens</div>
                  <div><strong>Refill Rate:</strong> 10 tokens per interval</div>
                  <div><strong>Interval:</strong> 60 seconds</div>
                  <div><strong>Characteristics:</strong> userId + IP address</div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Effective limit: ~60 requests per minute per authenticated user/IP
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">Response Codes</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">429</Badge>
                <span>Rate limit exceeded - includes Retry-After header</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">403</Badge>
                <span>Bot detected or shield blocked - request rejected</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logging and Monitoring */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>📊 Logging and Monitoring</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Logged Events</h3>
            <div className="bg-muted rounded-lg p-4 space-y-2 text-sm font-mono">
              <div>🚀 Server initialization and configuration</div>
              <div>🛡️ Arcjet security decisions (ALLOW/DENY/CHALLENGE)</div>
              <div>🔐 OAuth token verification attempts</div>
              <div>✅ Successful authentications with user identity</div>
              <div>❌ Failed authentication attempts</div>
              <div>🎲 Tool invocations with authenticated user context</div>
              <div>💥 Error conditions and stack traces</div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">Log Analysis</h3>
            <p className="text-sm text-muted-foreground mb-2">
              All logs are available in Vercel deployment logs and can be queried using:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Vercel Dashboard → Project → Logs</li>
              <li>Filter by deployment or time range</li>
              <li>Search for specific patterns (e.g., ❌, Arcjet blocked)</li>
              <li>Export for external SIEM integration if needed</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">Alerting Strategy</h3>
            <div className="space-y-2 text-sm">
              <li>Monitor rate limit violations for potential DDoS</li>
              <li>Track failed authentication attempts for brute force</li>
              <li>Alert on unusual bot detection patterns</li>
              <li>Set up Vercel Integrations for Slack/email notifications</li>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environment Configuration */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>⚙️ Environment Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Required Environment Variables</h3>
            <div className="bg-muted rounded-lg p-4 font-mono text-sm space-y-2">
              <div><code>GOOGLE_CLIENT_ID</code> - Google OAuth 2.0 client ID</div>
              <div><code>GOOGLE_CLIENT_SECRET</code> - Google OAuth client secret</div>
              <div><code>ARCJET_KEY</code> - Arcjet API key for protection rules</div>
              <div><code>NEXT_PUBLIC_BASE_URL</code> - Production URL for redirects</div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500 p-4 text-sm">
            <p className="font-semibold mb-1">💡 Security Best Practices</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>✓ Never commit secrets to git repository</li>
              <li>✓ Use Vercel environment variables for production</li>
              <li>✓ Rotate credentials regularly (quarterly recommended)</li>
              <li>✓ Use separate credentials for dev/staging/production</li>
              <li>✓ Enable Vercel Environment Protection for production</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Additional Resources */}
      <Card>
        <CardHeader>
          <CardTitle>📚 Additional Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>
              <strong>MCP Specification:</strong>{" "}
              <a 
                href="https://spec.modelcontextprotocol.io/specification/2025-06-18/authentication/" 
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                OAuth 2.1 Authentication (2025-06-18)
              </a>
            </div>
            <div>
              <strong>RFC 8414:</strong>{" "}
              <a 
                href="https://datatracker.ietf.org/doc/html/rfc8414" 
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                OAuth 2.0 Authorization Server Metadata
              </a>
            </div>
            <div>
              <strong>RFC 9728:</strong>{" "}
              <a 
                href="https://datatracker.ietf.org/doc/html/rfc9728" 
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                OAuth 2.0 Token Authentication
              </a>
            </div>
            <div>
              <strong>Arcjet Documentation:</strong>{" "}
              <a 
                href="https://docs.arcjet.com/" 
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Next.js Protection Guide
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
