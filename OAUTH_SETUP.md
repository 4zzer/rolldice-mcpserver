# OAuth 2.1 Authentication Setup (MCP 2025-06-18 Compliant)

This rolldice MCP server implements OAuth 2.1 authentication following the MCP 2025-06-18 specification using Google as the identity provider.

## Prerequisites

From Phase 1 (mcp-auth-demo), you should have:
- Google Cloud Console project created
- OAuth 2.0 credentials configured
- `GOOGLE_CLIENT_ID` from Google Cloud Console
- Understanding of OAuth 2.1 + MCP authentication flow

## Local Setup

1. Copy the environment variables template:
```bash
cp .env.local.example .env.local
```

2. Add your Google OAuth Client ID to `.env.local`:
```env
GOOGLE_CLIENT_ID=your_actual_client_id.apps.googleusercontent.com

# Optional: For development testing without auth
# SKIP_AUTH=true
```

**Note:** No `GOOGLE_CLIENT_SECRET` is needed - this server verifies Google ID tokens directly using Google's public keys.

3. Start the development server:
```bash
pnpm dev
```

## Production Deployment

1. Deploy to Vercel:
```bash
vercel --prod
```

2. Add environment variables in Vercel project settings:
   - `GOOGLE_CLIENT_ID` (your Google OAuth client ID)

3. The server will automatically use Vercel's production URL for OAuth discovery endpoints

## MCP Client Configuration

### VS Code MCP Extension

The VS Code MCP extension automatically discovers OAuth 2.1 endpoints and handles authentication.

Add to `.vscode/mcp.json`:
```json
{
  "servers": {
    "secure-rolldice": {
      "type": "http",
      "url": "https://your-secure-rolldice.vercel.app/api/mcp"
    },
    "secure-rolldice-local": {
      "type": "http",
      "url": "http://localhost:3000/api/mcp"
    }
  }
}
```

### Claude Desktop

Claude Desktop uses `mcp-remote` for HTTP-based MCP servers with OAuth.

Add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "secure-rolldice": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://your-secure-rolldice.vercel.app/api/mcp"
      ]
    }
  }
}
```

Both clients will:
1. Discover OAuth endpoints via `/.well-known/oauth-protected-resource`
2. Initiate OAuth 2.1 authorization code flow with PKCE
3. Handle token exchange and storage automatically
4. Include Bearer tokens in all MCP requests

## Testing

### Development Mode (Skip Auth)

For quick local testing without OAuth:
```env
# In .env.local
SKIP_AUTH=true
```

This bypasses authentication completely in development.

### Production Testing

1. Start your server: `pnpm dev`
2. Access via VS Code MCP extension or Claude Desktop
3. You'll see an OAuth login prompt in your browser
4. Complete Google authentication
5. Try: "roll a d20" or "roll 2d6"
6. The response will include your authenticated user name

### Verifying Authentication

Unauthenticated requests return:
```json
{
  "error": "unauthorized",
  "message": "Bearer token required"
}
```

With status `401` and `WWW-Authenticate` header (RFC 9728 compliant).

## OAuth 2.1 Discovery Endpoints

The server implements MCP 2025-06-18 specification:

- **`/.well-known/oauth-authorization-server`**  
  Authorization server metadata (RFC 8414) with OAuth 2.1 compliance indicators

- **`/.well-known/oauth-protected-resource`**  
  Protected resource metadata (RFC 9728) for MCP client discovery

## Security Features

✅ **OAuth 2.1 Compliance**
- Authorization code flow only (no implicit flow)
- PKCE support (S256 and plain)
- Query parameters only (no hash fragments)

✅ **MCP 2025-06-18 Specification**
- Resource parameter validation (RFC 8707)
- Token audience validation
- Proper WWW-Authenticate headers (RFC 9728)
- Bearer token authentication

✅ **Google OAuth Integration**
- ID token verification (JWT with RS256)
- Access token support via UserInfo API
- Email, name, and profile picture extraction
- Token expiration handling

✅ **Development Tools**
- Skip auth mode for local testing
- Development token injection
- Comprehensive logging
- CORS headers for browser testing
