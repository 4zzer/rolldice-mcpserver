import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, FileText, BookOpen } from "lucide-react"

export function HeroSection() {
  return (
    <div className="text-center mb-12">
      <Badge variant="secondary" className="mb-4">
        🔒 OAuth 2.1 Secured MCP Server
      </Badge>
      <h2 className="text-4xl font-bold mb-4">
        Production-Ready Secured Roll Dice MCP Server
      </h2>
      <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
        Enterprise-grade security with OAuth 2.1 authentication, Arcjet protection, and comprehensive monitoring.
      </p>
      
      {/* Quick Links */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <Button asChild variant="default" size="lg">
          <a href="/mcp-security" className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Documentation
          </a>
        </Button>
        <Button asChild variant="outline" size="lg">
          <a href="https://github.com/4zzer/rolldice-mcpserver/blob/main/docs/INCIDENT_RESPONSE_RUNBOOK.md" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Incident Response Runbook
          </a>
        </Button>
        <Button asChild variant="outline" size="lg">
          <a href="https://github.com/4zzer/rolldice-mcpserver/blob/main/docs/VERCEL_FIREWALL.md" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Firewall Configuration
          </a>
        </Button>
      </div>

      {/* Key Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto text-left">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            🔐 OAuth 2.1 Authentication
          </h3>
          <p className="text-sm text-muted-foreground">
            Google ID token verification with PKCE support and RFC 8414/9728 compliance
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            🛡️ Arcjet Protection
          </h3>
          <p className="text-sm text-muted-foreground">
            Shield, bot detection, and rate limiting (60 req/min) to prevent abuse
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            📊 Complete Documentation
          </h3>
          <p className="text-sm text-muted-foreground">
            Security architecture, incident response runbook, and operational guides
          </p>
        </div>
      </div>
    </div>
  )
}
