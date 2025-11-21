# MCP OAuth Server - Incident Response Runbook

## Overview
This runbook provides step-by-step procedures for responding to security incidents affecting the OAuth 2.1 authenticated MCP rolldice server.

**Last Updated:** January 2025  
**Version:** 1.0  
**Owner:** Security Team  
**Review Frequency:** Quarterly

---

## 1. Token Compromise Incident

### Scenario: Leaked or Stolen OAuth Token

**Indicators:**
- Unusual API usage patterns from authenticated sessions
- Requests from unexpected geographic locations
- Multiple concurrent sessions for single user
- Arcjet rate limit violations from authenticated users

**Detection:**
```bash
# Check Vercel logs for suspicious activity
vercel logs --since 1h | grep "✅ Google ID token verified"

# Look for multiple IPs with same token
vercel logs | grep "Token preview" | sort | uniq -c
```

**Immediate Response Steps:**

1. **Identify Affected User (< 5 minutes)**
   ```bash
   # Extract user email from logs
   vercel logs | grep "email:" | grep "<suspicious_pattern>"
   ```

2. **Block Further Access (< 10 minutes)**
   - Token invalidation: Google ID tokens expire automatically (typically 1 hour)
   - No manual revocation needed for short-lived tokens
   - For immediate blocking: Add temporary IP block in Vercel Firewall

3. **Assess Impact (< 30 minutes)**
   - Review all tool invocations by affected user:
     ```bash
     vercel logs --since 24h | grep "rolled by <user_email>"
     ```
   - Check for data exfiltration attempts
   - Verify no unauthorized modifications

4. **Notify Affected User (< 1 hour)**
   - Email template: "We detected unusual activity on your account..."
   - Recommend: Log out of all Google sessions, review recent activity
   - Request: Re-authenticate with fresh token

**Recovery Steps:**

1. **Strengthen Monitoring**
   - Lower Arcjet rate limits temporarily:
     ```typescript
     tokenBucket({
       capacity: 20, // Reduced from 60
       refillRate: 5, // Reduced from 10
     })
     ```

2. **Deploy Updated Rules**
   ```bash
   git commit -am "Tighten rate limits after incident"
   git push origin main
   # Vercel auto-deploys
   ```

3. **Verify Resolution**
   - Monitor for 24 hours post-incident
   - Confirm no further suspicious activity
   - Restore normal rate limits if clear

**Documentation:**
- Record incident in security log
- Document timeline and actions taken
- Update detection rules if new patterns found

---

## 2. Brute Force Attack

### Scenario: Repeated Failed Authentication Attempts

**Indicators:**
- Multiple 401 responses from same IP
- Arcjet bot detection triggers
- High volume of requests without valid Bearer token

**Detection:**
```bash
# Check for 401 patterns
vercel logs | grep "❌ No valid Authorization header" | wc -l

# Identify attacker IPs
vercel logs | grep "Bearer token provided: false" | grep -oP '\d+\.\d+\.\d+\.\d+' | sort | uniq -c | sort -rn
```

**Immediate Response Steps:**

1. **Verify Arcjet Blocking (< 5 minutes)**
   ```bash
   # Check if Arcjet already handled it
   vercel logs | grep "Arcjet blocked request"
   ```

2. **Manual IP Block if Needed (< 10 minutes)**
   - Navigate to Vercel Dashboard → Project → Firewall
   - Add IP addresses to blocklist
   - Set expiration (24-48 hours initially)

3. **Review Attack Pattern (< 30 minutes)**
   - Determine if coordinated (multiple IPs)
   - Check if valid tokens were attempted
   - Assess scale and duration

**Recovery Steps:**

1. **Enhance Bot Detection**
   ```typescript
   detectBot({
     mode: "LIVE",
     block: ["AUTOMATED"], // More aggressive
   })
   ```

2. **Add Challenge for Suspicious Patterns**
   ```typescript
   detectBot({
     mode: "LIVE",
     allow: ["CATEGORY:SEARCH_ENGINE"],
     deny: ["AUTOMATED", "LIKELY_AUTOMATED"],
   })
   ```

3. **Review and Remove Temporary Blocks**
   - After 48 hours, review Vercel Firewall rules
   - Remove temporary blocks for IPs showing no further activity
   - Keep permanent blocks for confirmed attackers

---

## 3. DDoS Attack

### Scenario: High Volume Legitimate-Looking Traffic

**Indicators:**
- Arcjet rate limits triggering frequently
- Multiple 429 responses
- Vercel function execution hitting limits
- Slow response times across all users

**Detection:**
```bash
# Check rate limit violations
vercel logs --since 30m | grep "rate_limit_exceeded" | wc -l

# Monitor Vercel function metrics
vercel inspect <deployment-url>
```

**Immediate Response Steps:**

1. **Verify DDoS vs Legitimate Spike (< 5 minutes)**
   - Check if traffic pattern is organic (social media spike, etc.)
   - Review geographic distribution
   - Verify if authenticated users affected

2. **Activate Aggressive Rate Limiting (< 10 minutes)**
   ```typescript
   tokenBucket({
     capacity: 10, // Emergency limit
     refillRate: 2,
     interval: 60,
   })
   ```

3. **Enable Vercel DDoS Protection (< 15 minutes)**
   - Vercel Pro/Enterprise: Automatic mitigation
   - Free/Hobby: May need to upgrade temporarily

4. **Consider Maintenance Mode (< 30 minutes)**
   If attack overwhelms infrastructure:
   ```typescript
   // Add to route.ts temporarily
   return new NextResponse("Service temporarily unavailable", {
     status: 503,
     headers: { "Retry-After": "900" }, // 15 minutes
   });
   ```

**Recovery Steps:**

1. **Gradual Rate Limit Restoration**
   - Start with conservative limits
   - Monitor for 1 hour between adjustments
   - Return to normal over 24-48 hours

2. **Post-Incident Analysis**
   - Export Vercel logs for full attack window
   - Identify attack vectors and patterns
   - Update Arcjet rules based on findings

3. **Update Response Plan**
   - Document new attack patterns
   - Add automated alerting if not present
   - Consider upgrading Vercel plan if limits hit

---

## 4. OAuth Configuration Error

### Scenario: Misconfigured OAuth Settings Breaking Authentication

**Indicators:**
- All authentication attempts failing
- Error: "Token verification failed"
- Google OAuth errors in logs

**Detection:**
```bash
# Check for verification errors
vercel logs | grep "💥 Token verification error"

# Verify environment variables are set
vercel env ls
```

**Immediate Response Steps:**

1. **Check Environment Variables (< 5 minutes)**
   ```bash
   # Verify on Vercel
   vercel env ls | grep GOOGLE_CLIENT

   # Test locally
   cat .env.local | grep GOOGLE_CLIENT
   ```

2. **Verify Google Cloud Console Settings (< 10 minutes)**
   - Navigate to: https://console.cloud.google.com/apis/credentials
   - Check OAuth 2.0 Client ID configuration
   - Verify redirect URIs include production URL
   - Confirm client secret hasn't been rotated

3. **Test Authentication Flow (< 15 minutes)**
   ```bash
   # Get a fresh Google ID token
   # Use Google OAuth Playground or Claude Desktop

   # Test with curl
   curl -X POST https://rolldice-mcpserver-nu.vercel.app/api/mcp \
     -H "Authorization: Bearer <fresh_token>" \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
   ```

**Recovery Steps:**

1. **Fix Configuration Issue**
   - Update environment variables if incorrect:
     ```bash
     vercel env add GOOGLE_CLIENT_ID production
     # Enter correct value
     ```
   
   - Or update Google Cloud Console if redirect URIs wrong
   
2. **Redeploy if Needed**
   ```bash
   # Force redeploy to pick up env var changes
   vercel --prod
   ```

3. **Verify Resolution**
   ```bash
   # Test discovery endpoints
   curl https://rolldice-mcpserver-nu.vercel.app/.well-known/oauth-protected-resource

   # Test with valid token
   # Should return 200, not 401/500
   ```

4. **Prevent Recurrence**
   - Document current working configuration
   - Set up monitoring for env var changes
   - Add pre-deployment checklist for OAuth settings

---

## 5. Arcjet Service Disruption

### Scenario: Arcjet API Unavailable or Rate Limiting Broken

**Indicators:**
- Requests not being rate limited (unexpected high volume succeeds)
- Arcjet errors in logs: "Failed to connect to Arcjet"
- Shield not blocking obviously malicious requests

**Detection:**
```bash
# Check for Arcjet errors
vercel logs | grep "Arcjet"

# Verify protection is working
curl -X POST https://rolldice-mcpserver-nu.vercel.app/api/mcp \
  -H "Authorization: Bearer test" \
  -d '{"test":"malicious<script>alert(1)</script>"}'
# Should be blocked by Shield
```

**Immediate Response Steps:**

1. **Verify Arcjet Status (< 5 minutes)**
   - Check https://status.arcjet.com
   - Verify ARCJET_KEY is correct in Vercel env vars
   - Test from local dev environment

2. **Assess Impact (< 10 minutes)**
   - Are requests being processed without protection?
   - Has there been an uptick in suspicious activity?
   - Check if OAuth is still functioning (primary security layer)

3. **Decision: Fail Open or Fail Closed (< 15 minutes)**
   
   **Option A: Fail Open (Continue Service)**
   - OAuth authentication still provides protection
   - Monitor closely for abuse
   - Acceptable if Arcjet downtime expected to be brief (<1 hour)

   **Option B: Fail Closed (Maintenance Mode)**
   - If OAuth also compromised or high-value target
   - Deploy emergency maintenance mode
   - Only if critical security risk

**Recovery Steps:**

1. **Monitor Arcjet Status**
   - Subscribe to status page updates
   - Test periodically for restoration

2. **When Service Restored:**
   - Verify all rules working:
     ```bash
     # Test rate limiting
     for i in {1..70}; do
       curl -X POST https://rolldice-mcpserver-nu.vercel.app/api/mcp \
         -H "Authorization: Bearer <valid_token>" \
         -H "Content-Type: application/json"
       sleep 0.5
     done
     # Should see 429 after ~60 requests
     ```

3. **Review Logs During Outage**
   - Check for any abuse during protection gap
   - Identify if any bad actors need blocking
   - Document any security events

---

## Escalation Procedures

### Level 1: Individual Contributor (You)
**Handle:**
- Single token compromise
- Small-scale brute force
- Configuration errors
- Routine incidents

**Escalate if:**
- Unable to resolve in 1 hour
- Impact to multiple users
- Requires infrastructure changes

### Level 2: Team Lead / Senior Engineer
**Handle:**
- Coordinated attacks
- DDoS requiring plan changes
- OAuth provider issues
- Multiple concurrent incidents

**Escalate if:**
- Major service disruption (>30 min)
- Data breach suspected
- Legal/compliance implications

### Level 3: Security Team / Management
**Handle:**
- Major breaches
- Legal obligations (reporting)
- Public disclosure
- Vendor coordination (Vercel, Google, Arcjet)

---

## Communication Templates

### User Notification (Token Compromise)
```
Subject: Security Alert - Unusual Activity Detected

Dear [User],

We detected unusual activity on your account at [timestamp]. Out of an 
abundance of caution, we're recommending the following actions:

1. Review your recent Google account activity
2. Log out of all devices and sign back in
3. Re-authenticate with our MCP server using Claude Desktop

We have temporarily enhanced monitoring on your account. If you did not 
perform these actions, please reply to this email immediately.

Technical details: [brief description without exposing vulnerabilities]

Security Team
```

### Internal Status Update
```
Status: [RED/YELLOW/GREEN]
Incident: [Brief title]
Start Time: [timestamp]
Current Duration: [X minutes/hours]

Impact:
- [Number] users affected
- [Service status]

Actions Taken:
- [Bullet list]

Next Steps:
- [Planned actions]
- ETA to resolution: [estimate]

Contact: [Your name/contact]
```

---

## Post-Incident Review Checklist

Within 24 hours of resolution:
- [ ] Document complete incident timeline
- [ ] Identify root cause
- [ ] List all actions taken
- [ ] Assess response effectiveness
- [ ] Identify what worked well
- [ ] Identify what could improve

Within 1 week:
- [ ] Update runbook with lessons learned
- [ ] Implement preventive measures
- [ ] Brief team on incident and learnings
- [ ] Update monitoring/alerting if gaps found
- [ ] Schedule follow-up review (30 days)

---

## Emergency Contacts

| Role | Contact | Availability |
|------|---------|--------------|
| Primary On-Call | [Your contact] | 24/7 |
| Team Lead | [Contact] | Business hours |
| Vercel Support | support@vercel.com | 24/7 (Pro/Enterprise) |
| Google Cloud Support | [Console link] | Per support plan |
| Arcjet Support | support@arcjet.com | Business hours |

---

## Quick Reference Commands

```bash
# Check recent errors
vercel logs --since 1h | grep "❌"

# Monitor live
vercel logs --follow

# Test OAuth
curl https://rolldice-mcpserver-nu.vercel.app/.well-known/oauth-protected-resource

# Check environment
vercel env ls

# Deploy emergency fix
git commit -am "Emergency fix" && git push

# Rollback deployment
vercel rollback <previous-deployment-url>
```

---

## Appendix: Testing Scenarios

### Simulated Token Compromise
```bash
# Use old/expired token repeatedly
curl -X POST https://rolldice-mcpserver-nu.vercel.app/api/mcp \
  -H "Authorization: Bearer <expired_token>" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"roll_dice","arguments":{"sides":6}}}'

# Expected: 401 Unauthorized
```

### Simulated Rate Limit
```bash
# Rapid fire requests
for i in {1..100}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST https://rolldice-mcpserver-nu.vercel.app/api/mcp \
    -H "Authorization: Bearer <valid_token>"
  sleep 0.1
done

# Expected: Initial 200s, then 429s after limit
```

### Simulated Malicious Payload
```bash
# SQL injection attempt (should be blocked by Shield)
curl -X POST https://rolldice-mcpserver-nu.vercel.app/api/mcp \
  -H "Authorization: Bearer <valid_token>" \
  -H "Content-Type: application/json" \
  -d '{"test":"1 OR 1=1--"}'

# Expected: 403 Forbidden from Arcjet Shield
```

---

**Document Version:** 1.0  
**Last Reviewed:** January 2025  
**Next Review:** April 2025
