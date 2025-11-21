# Vercel Firewall Configuration Guide

## Overview
This document describes the recommended Vercel Firewall configurations for the OAuth 2.1 authenticated MCP rolldice server.

**Note:** Vercel Firewall is available on Pro and Enterprise plans. For Hobby tier, Arcjet provides equivalent protection at the application layer.

---

## Configuration Strategy

### Defense in Depth Approach
```
Layer 1: Vercel Edge Firewall (Infrastructure)
   ↓
Layer 2: Arcjet Protection (Application)
   ↓
Layer 3: OAuth 2.1 Authentication (Identity)
   ↓
Layer 4: MCP Tool Execution (Business Logic)
```

---

## Recommended Rules

### 1. IP-Based Rules

#### Allow Known Good IPs (Optional)
```json
{
  "name": "Allow Corporate IPs",
  "description": "Whitelist trusted development/admin IPs",
  "action": "allow",
  "conditions": {
    "ip": [
      "203.0.113.0/24",
      "198.51.100.0/24"
    ]
  },
  "priority": 1
}
```

**When to use:** 
- Internal development teams
- Known partner integrations
- Admin access restrictions

#### Block Known Bad IPs
```json
{
  "name": "Block Malicious IPs",
  "description": "Block confirmed attackers from incident response",
  "action": "deny",
  "conditions": {
    "ip": [
      "192.0.2.50",
      "192.0.2.51"
    ]
  },
  "priority": 2
}
```

**Maintenance:** Review monthly, remove expired blocks

---

### 2. Geographic Rules

#### Block High-Risk Regions (Optional)
```json
{
  "name": "Geographic Restrictions",
  "description": "Block regions with no legitimate users",
  "action": "deny",
  "conditions": {
    "country": ["XX", "YY"]
  },
  "priority": 3
}
```

**⚠️ Warning:** Only use if you have clear business reason
- May block legitimate users traveling
- Can appear discriminatory
- Consider alternatives (rate limiting, MFA)

#### Allow Primary Markets
```json
{
  "name": "Allow Primary Regions",
  "description": "Fast path for known user regions",
  "action": "allow",
  "conditions": {
    "country": ["US", "CA", "GB", "AU"]
  },
  "priority": 1
}
```

---

### 3. Path-Based Rules

#### Protect OAuth Endpoints
```json
{
  "name": "OAuth Endpoint Rate Limit",
  "description": "Extra protection for auth endpoints",
  "action": "rate_limit",
  "conditions": {
    "path": [
      "/api/auth/*",
      "/.well-known/*"
    ]
  },
  "rateLimit": {
    "requests": 100,
    "window": "1m"
  },
  "priority": 4
}
```

#### MCP Endpoint Protection
```json
{
  "name": "MCP API Protection",
  "description": "Rate limit MCP traffic at edge",
  "action": "rate_limit",
  "conditions": {
    "path": ["/api/*"]
  },
  "rateLimit": {
    "requests": 300,
    "window": "5m"
  },
  "priority": 5
}
```

**Note:** More granular rate limiting handled by Arcjet at application layer

---

### 4. User-Agent Rules

#### Block Suspicious Bots
```json
{
  "name": "Block Bad Bots",
  "description": "Block known malicious user agents",
  "action": "deny",
  "conditions": {
    "userAgent": [
      "*sqlmap*",
      "*nikto*",
      "*masscan*",
      "*nmap*"
    ]
  },
  "priority": 6
}
```

#### Challenge Suspicious Patterns
```json
{
  "name": "Challenge Generic Bots",
  "description": "CAPTCHA for suspicious but not confirmed bad",
  "action": "challenge",
  "conditions": {
    "userAgent": [
      "python-requests*",
      "curl*",
      "wget*"
    ]
  },
  "exceptions": {
    "path": ["/api/mcp"]
  },
  "priority": 7
}
```

**⚠️ Important:** Exclude `/api/mcp` from UA blocking as legitimate clients use programmatic access

---

## DDoS Protection

### Automatic Mitigation (Pro/Enterprise)
Vercel automatically detects and mitigates:
- Volumetric attacks (bandwidth exhaustion)
- Protocol attacks (SYN floods)
- Application layer attacks (HTTP floods)

### Manual Triggers
```json
{
  "name": "Emergency DDoS Mode",
  "description": "Activated during confirmed DDoS",
  "action": "challenge",
  "conditions": {
    "path": ["/*"]
  },
  "enabled": false,
  "priority": 999
}
```

**Usage:** Enable manually during attack, disable after mitigation

---

## Configuration via Vercel Dashboard

### Step-by-Step Setup

1. **Navigate to Firewall**
   ```
   Vercel Dashboard → Project → Settings → Firewall
   ```

2. **Enable Firewall**
   - Requires Pro or Enterprise plan
   - Toggle "Enable Firewall" switch

3. **Add Rules**
   - Click "Add Rule"
   - Configure as shown in JSON examples above
   - Test each rule before saving

4. **Set Priority**
   - Lower number = higher priority
   - Allow rules should have priority < deny rules
   - Rate limit rules typically lowest priority

5. **Testing**
   ```bash
   # Test blocked IP
   curl -X POST https://rolldice-mcpserver-nu.vercel.app/api/mcp \
     --interface <blocked_ip>
   # Expected: 403 Forbidden

   # Test rate limit
   for i in {1..150}; do
     curl -s -o /dev/null -w "%{http_code}\n" \
       https://rolldice-mcpserver-nu.vercel.app/.well-known/oauth-protected-resource
     sleep 0.1
   done
   # Expected: 429 after threshold
   ```

---

## Configuration via vercel.json

```json
{
  "firewall": {
    "rules": [
      {
        "name": "Block Malicious IPs",
        "action": "deny",
        "priority": 1,
        "conditions": {
          "ip": ["192.0.2.50"]
        }
      },
      {
        "name": "Rate Limit OAuth",
        "action": "rate_limit",
        "priority": 10,
        "conditions": {
          "path": ["/api/auth/*"]
        },
        "rateLimit": {
          "requests": 100,
          "window": "1m"
        }
      }
    ]
  }
}
```

**Note:** Not all firewall features available in vercel.json - use Dashboard for full functionality

---

## Monitoring and Alerts

### Firewall Metrics
Available in Vercel Dashboard → Analytics → Firewall:
- Blocked requests by rule
- Top blocked IPs
- Geographic distribution of blocks
- Rule effectiveness over time

### Recommended Alerts
1. **High Block Rate**
   - Trigger: >100 blocks/minute
   - Action: Review for DDoS or misconfigured rule

2. **New Blocked IPs**
   - Trigger: First time an IP is blocked
   - Action: Investigate if legitimate user affected

3. **Rule Changes**
   - Trigger: Any firewall rule modified
   - Action: Audit log review for unauthorized changes

### Integration with External Systems
```bash
# Export logs via Vercel API
curl "https://api.vercel.com/v2/deployments/<deployment-id>/events" \
  -H "Authorization: Bearer <vercel_token>" \
  | jq '.events[] | select(.type == "firewall")'

# Send to SIEM
# Parse and forward to Splunk, Datadog, etc.
```

---

## Cost Considerations

### Vercel Pricing Tiers
| Tier | Firewall | DDoS Protection | Custom Rules |
|------|----------|-----------------|--------------|
| Hobby | ❌ | Basic (automatic) | - |
| Pro | ✅ | Enhanced | 100 rules |
| Enterprise | ✅ | Advanced | Unlimited |

### Cost-Effective Alternatives
For Hobby tier or cost-conscious deployments:
- **Arcjet** provides similar protection at application layer
- **Cloudflare** can front Vercel for edge protection
- **AWS WAF** if deploying elsewhere

---

## Arcjet vs Vercel Firewall

### Feature Comparison
| Feature | Arcjet | Vercel Firewall | Recommendation |
|---------|--------|-----------------|----------------|
| Rate Limiting | ✅ Granular | ✅ Edge-based | Use both for defense in depth |
| Bot Detection | ✅ Advanced | ✅ Basic | Prefer Arcjet for MCP endpoints |
| Shield/WAF | ✅ Included | ✅ Pro+ only | Arcjet sufficient for most cases |
| Cost | Free tier available | Pro+ only ($20+/month) | Start with Arcjet |
| Configuration | Code-based | Dashboard/API | Arcjet easier for devs |

### Recommended Hybrid Approach
```
Vercel Firewall (if available):
├── Geographic restrictions
├── Known bad IP blocks
└── Emergency DDoS rules

Arcjet (always):
├── Rate limiting (application-aware)
├── Bot detection (MCP-specific)
└── Shield (attack prevention)

OAuth 2.1 (always):
└── Identity-based access control
```

---

## Testing Scenarios

### Test Rate Limiting
```bash
#!/bin/bash
# test-rate-limit.sh

ENDPOINT="https://rolldice-mcpserver-nu.vercel.app/.well-known/oauth-protected-resource"
REQUESTS=150

echo "Sending $REQUESTS requests to test rate limit..."
for i in $(seq 1 $REQUESTS); do
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $ENDPOINT)
  echo "Request $i: $RESPONSE"
  
  if [ "$RESPONSE" == "429" ]; then
    echo "✅ Rate limit triggered at request $i"
    exit 0
  fi
  
  sleep 0.1
done

echo "❌ Rate limit NOT triggered after $REQUESTS requests"
exit 1
```

### Test IP Blocking
```bash
#!/bin/bash
# test-ip-block.sh

# Add test IP to firewall blocklist first
TEST_IP="192.0.2.50"  # TEST-NET-1, safe for testing

echo "Testing from blocked IP: $TEST_IP"
curl -X POST https://rolldice-mcpserver-nu.vercel.app/api/mcp \
  --interface $TEST_IP \
  -H "Authorization: Bearer test" \
  -v

# Expected: 403 Forbidden from Vercel Firewall
```

### Test Geographic Blocking
```bash
#!/bin/bash
# test-geo-block.sh

# Use VPN or proxy to test from blocked region
# This is simulation only - actual test requires VPN

echo "Simulating request from blocked country..."
curl -X POST https://rolldice-mcpserver-nu.vercel.app/api/mcp \
  -H "X-Forwarded-For: <ip_from_blocked_country>" \
  -H "Authorization: Bearer test"

# Note: X-Forwarded-For can be spoofed, real Vercel uses
# actual connection IP from edge nodes
```

---

## Incident Response Integration

### During Active Attack
1. **Check Vercel Firewall Status**
   ```
   Dashboard → Analytics → Firewall
   ```

2. **Add Emergency Block**
   ```json
   {
     "name": "Emergency Block - Attack Source",
     "action": "deny",
     "conditions": {
       "ip": ["<attacker_ip_range>"]
     },
     "priority": 1
   }
   ```

3. **Enable Challenge Mode**
   ```json
   {
     "name": "Global Challenge During Attack",
     "action": "challenge",
     "conditions": {
       "path": ["/*"]
     },
     "priority": 999
   }
   ```

4. **Monitor Effectiveness**
   - Watch blocked request count
   - Verify legitimate users can still access
   - Adjust rules as needed

### Post-Attack Cleanup
1. Review temporary rules (24-48 hours post-attack)
2. Convert confirmed attackers to permanent blocks
3. Remove challenge mode if enabled
4. Document attack patterns for future prevention

---

## Best Practices

### ✅ Do
- Start with monitoring mode before enforcing
- Test each rule thoroughly
- Document why each rule exists
- Review rules monthly
- Use allow lists sparingly
- Combine with application-layer protection (Arcjet)

### ❌ Don't
- Block entire countries without legal requirement
- Set rate limits too aggressive (blocks legitimate users)
- Forget to set expiration on temporary blocks
- Rely solely on Vercel Firewall (need defense in depth)
- Block common user agents without exceptions

---

## Additional Resources

- [Vercel Firewall Documentation](https://vercel.com/docs/security/firewall)
- [Vercel DDoS Protection](https://vercel.com/docs/security/ddos-protection)
- [OWASP WAF Best Practices](https://owasp.org/www-community/Web_Application_Firewall)
- [Arcjet Next.js Guide](https://docs.arcjet.com/get-started/nextjs)

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Review Schedule:** Quarterly or after major incidents
