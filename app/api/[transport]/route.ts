// app/api/[transport]/route.ts - MCP 2025-06-18 OAuth 2.1 Compliant with Arcjet Protection

import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/next";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { createMcpHandler } from "mcp-handler";
import { type NextRequest, NextResponse } from "next/server";
import { verifyGoogleToken } from "@/lib/auth";
import { rollDice, rollDiceTool } from "@/lib/dice";

console.log("🚀 Initializing MCP OAuth 2.1 Rolldice Server (Specification 2025-06-18)");

// Arcjet security configuration
const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    // Shield: Protect against common attacks
    shield({
      mode: "LIVE",
    }),
    // Bot detection: Block automated attacks
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE"], // Allow legitimate search engine bots
    }),
    // Rate limiting: Token bucket algorithm
    tokenBucket({
      mode: "LIVE",
      characteristics: ["userId", "ip"],
      refillRate: 10, // Refill 10 tokens per interval
      interval: 60, // Every 60 seconds
      capacity: 60, // Maximum 60 tokens
    }),
  ],
});

// Type definitions for better type safety
interface ToolExtra {
  requestInfo?: {
    headers?: {
      authorization?: string;
    };
  };
}

// Store auth context for current request
let currentAuthInfo: AuthInfo | null = null;

// Create auth-aware tool wrapper
function createAuthenticatedTool(toolFunction: typeof rollDice) {
  return async (args: { sides: number }, extra?: ToolExtra) => {
    // Extract auth info from the request headers if currentAuthInfo is not available
    let authInfo = currentAuthInfo;

    if (!authInfo && extra?.requestInfo?.headers?.authorization) {
      const authHeader = extra.requestInfo.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        try {
          // Create a mock request object for verifyGoogleToken
          const mockRequest = {
            headers: new Map([["authorization", authHeader]]),
            url: "http://localhost:3000/api/mcp",
            method: "POST",
          };
          authInfo =
            (await verifyGoogleToken(
              mockRequest as unknown as Request,
              token,
            )) || null;
        } catch (error) {
          console.log("Auth extraction failed:", error);
        }
      }
    }

    // Use the dice rolling logic
    const result = toolFunction(args.sides);
    
    // Add auth info if available
    if (authInfo?.extra?.email) {
      return {
        content: [
          {
            type: "text" as const,
            text: `${result.text} (rolled by ${authInfo.extra.name || authInfo.extra.email})`,
          },
        ],
      };
    }
    
    return {
      content: [result],
    };
  };
}

// Create the base MCP handler
const baseHandler = createMcpHandler(
  (server) => {
    console.log("📋 Registering MCP tools with OAuth 2.1 authentication");
    // Register tools with auth context injection
    server.tool(
      rollDiceTool.name,
      rollDiceTool.description,
      rollDiceTool.schema,
      createAuthenticatedTool(rollDice),
    );
  },
  {
    serverInfo: {
      name: "rolldice-secure",
      version: "1.0.0",
    },
    capabilities: {
      tools: {
        listChanged: false,
      },
      resources: {
        subscribe: false,
        listChanged: false,
      },
    },
  },
  {
    basePath: "/api",
    maxDuration: 60,
    verboseLogs: true,
  },
);

// MCP Authorization Specification compliant wrapper with Arcjet protection
async function mcpAuthHandler(request: NextRequest) {
  // Apply Arcjet security checks
  const decision = await aj.protect(request, {
    userId: request.headers.get("authorization")?.substring(7, 50) || "anonymous",
    ip: request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "unknown",
    requested: 1, // Request 1 token from the token bucket
  });

  console.log("🛡️ Arcjet Decision:", decision.conclusion);

  if (decision.isDenied()) {
    console.log("❌ Arcjet blocked request:", decision.reason);
    
    if (decision.reason.isRateLimit()) {
      return new NextResponse(
        JSON.stringify({
          error: "rate_limit_exceeded",
          message: "Too many requests. Please slow down.",
          retryAfter: decision.reason.resetTime
            ? Math.ceil((decision.reason.resetTime.getTime() - Date.now()) / 1000)
            : 60,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": decision.reason.resetTime
              ? Math.ceil((decision.reason.resetTime.getTime() - Date.now()) / 1000).toString()
              : "60",
          },
        },
      );
    }

    if (decision.reason.isBot()) {
      return new NextResponse(
        JSON.stringify({
          error: "forbidden",
          message: "Automated requests are not allowed",
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Generic shield block
    return new NextResponse(
      JSON.stringify({
        error: "forbidden",
        message: "Request blocked by security policy",
      }),
      {
        status: 403,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  console.log("=== MCP OAUTH 2.1 TOKEN VERIFICATION ===");

  const authHeader = request.headers.get("authorization");
  console.log("Bearer token provided:", !!authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌ No valid Authorization header found");
    console.log(
      "📋 Sending 401 with WWW-Authenticate header (MCP Specification compliance)",
    );

    // RFC 9728: WWW-Authenticate header must point to protected resource metadata
    const protectedResourceUrl = `${request.nextUrl.origin}/.well-known/oauth-protected-resource`;

    return new NextResponse(
      JSON.stringify({
        error: "unauthorized",
        message: "Bearer token required",
        details:
          "This MCP server requires OAuth 2.1 authentication. Use the protected resource metadata to discover authorization servers.",
      }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          // RFC 9728 Section 5.1: WWW-Authenticate Response
          "WWW-Authenticate": `Bearer realm="MCP Server", resource="${protectedResourceUrl}"`,
        },
      },
    );
  }

  const token = authHeader.substring(7); // Remove 'Bearer '
  console.log("Token length:", token.length);
  console.log("Token preview:", `${token.substring(0, 50)}...`);

  try {
    // Verify the Google ID token with enhanced MCP 2025-06-18 validation
    const authInfo = await verifyGoogleToken(request, token);

    if (!authInfo) {
      console.log("❌ Token verification failed - no auth info returned");
      return new NextResponse(
        JSON.stringify({
          error: "invalid_token",
          message: "Token verification failed",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            "WWW-Authenticate": 'Bearer error="invalid_token"',
          },
        },
      );
    }

    console.log("✅ Google ID token verified successfully");
    console.log("User info:", {
      clientId: authInfo.clientId || "unknown",
      scopes: authInfo.scopes || [],
      email: authInfo.extra?.email || "unknown",
      provider: authInfo.extra?.provider || "unknown",
    });

    // Store auth info for tools to access
    currentAuthInfo = authInfo;

    // Token is valid, proceed to MCP handler
    const response = await baseHandler(request);

    // Clear auth info after request
    currentAuthInfo = null;

    return response;
  } catch (error) {
    console.error("💥 Token verification error:", error);
    return new NextResponse(
      JSON.stringify({
        error: "server_error",
        message: "Token verification failed",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}

console.log("✅ MCP OAuth 2.1 server initialized with compliance features:");
console.log("  - OAuth 2.1 token verification");
console.log("  - Resource parameter validation");
console.log("  - Token audience validation");
console.log("  - WWW-Authenticate headers on 401 (RFC 9728)");
console.log("  - Protected resource metadata endpoint");
console.log("  - Authorization server metadata endpoint");
console.log("  - Arcjet Shield protection (LIVE mode)");
console.log("  - Arcjet Bot detection (LIVE mode)");
console.log("  - Arcjet Rate limiting: 10 req/min (token bucket)");

export { mcpAuthHandler as GET, mcpAuthHandler as POST };