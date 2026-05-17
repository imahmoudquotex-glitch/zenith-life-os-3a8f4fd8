

# 


---
name: cc-skill-security-review
description: "This skill ensures all code follows security best practices and identifies potential vulnerabilities. Use when implementing authentication or authorization, handling user input or file uploads, or creating new API endpoints."
risk: unknown
source: community
date_added: "2026-02-27"
---

# Security Review Skill

This skill ensures all code follows security best practices and identifies potential vulnerabilities.

## When to Use
- Implementing authentication or authorization
- Handling user input or file uploads
- Creating new API endpoints
- Working with secrets or credentials
- Implementing payment features
- Storing or transmitting sensitive data
- Integrating third-party APIs

## Security Checklist

### 1. Secrets Management

#### ❌ NEVER Do This
```typescript
const apiKey = "sk-proj-xxxxx"  // Hardcoded secret
const dbPassword = "password123" // In source code
```

#### ✅ ALWAYS Do This
```typescript
const apiKey = process.env.OPENAI_API_KEY
const dbUrl = process.env.DATABASE_URL

// Verify secrets exist
if (!apiKey) {
  throw new Error('OPENAI_API_KEY not configured')
}
```

#### Verification Steps
- [ ] No hardcoded API keys, tokens, or passwords
- [ ] All secrets in environment variables
- [ ] `.env.local` in .gitignore
- [ ] No secrets in git history
- [ ] Production secrets in hosting platform (Vercel, Railway)

### 2. Input Validation

#### Always Validate User Input
```typescript
import { z } from 'zod'

// Define validation schema
const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().int().min(0).max(150)
})

// Validate before processing
export async function createUser(input: unknown) {
  try {
    const validated = CreateUserSchema.parse(input)
    return await db.users.create(validated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors }
    }
    throw error
  }
}
```

#### File Upload Validation
```typescript
function validateFileUpload(file: File) {
  // Size check (5MB max)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error('File too large (max 5MB)')
  }

  // Type check
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type')
  }

  // Extension check
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif']
  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0]
  if (!extension || !allowedExtensions.includes(extension)) {
    throw new Error('Invalid file extension')
  }

  return true
}
```

#### Verification Steps
- [ ] All user inputs validated with schemas
- [ ] File uploads restricted (size, type, extension)
- [ ] No direct use of user input in queries
- [ ] Whitelist validation (not blacklist)
- [ ] Error messages don't leak sensitive info

### 3. SQL Injection Prevention

#### ❌ NEVER Concatenate SQL
```typescript
// DANGEROUS - SQL Injection vulnerability
const query = `SELECT * FROM users WHERE email = '${userEmail}'`
await db.query(query)
```

#### ✅ ALWAYS Use Parameterized Queries
```typescript
// Safe - parameterized query
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('email', userEmail)

// Or with raw SQL
await db.query(
  'SELECT * FROM users WHERE email = $1',
  [userEmail]
)
```

#### Verification Steps
- [ ] All database queries use parameterized queries
- [ ] No string concatenation in SQL
- [ ] ORM/query builder used correctly
- [ ] Supabase queries properly sanitized

### 4. Authentication & Authorization

#### JWT Token Handling
```typescript
// ❌ WRONG: localStorage (vulnerable to XSS)
localStorage.setItem('token', token)

// ✅ CORRECT: httpOnly cookies
res.setHeader('Set-Cookie',
  `token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`)
```

#### Authorization Checks
```typescript
export async function deleteUser(userId: string, requesterId: string) {
  // ALWAYS verify authorization first
  const requester = await db.users.findUnique({
    where: { id: requesterId }
  })

  if (requester.role !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    )
  }

  // Proceed with deletion
  await db.users.delete({ where: { id: userId } })
}
```

#### Row Level Security (Supabase)
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only view their own data
CREATE POLICY "Users view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can only update their own data
CREATE POLICY "Users update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

#### Verification Steps
- [ ] Tokens stored in httpOnly cookies (not localStorage)
- [ ] Authorization checks before sensitive operations
- [ ] Row Level Security enabled in Supabase
- [ ] Role-based access control implemented
- [ ] Session management secure

### 5. XSS Prevention

#### Sanitize HTML
```typescript
import DOMPurify from 'isomorphic-dompurify'

// ALWAYS sanitize user-provided HTML
function renderUserContent(html: string) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p'],
    ALLOWED_ATTR: []
  })
  return <div dangerouslySetInnerHTML={{ __html: clean }} />
}
```

#### Content Security Policy
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self';
      connect-src 'self' https://api.example.com;
    `.replace(/\s{2,}/g, ' ').trim()
  }
]
```

#### Verification Steps
- [ ] User-provided HTML sanitized
- [ ] CSP headers configured
- [ ] No unvalidated dynamic content rendering
- [ ] React's built-in XSS protection used

### 6. CSRF Protection

#### CSRF Tokens
```typescript
import { csrf } from '@/lib/csrf'

export async function POST(request: Request) {
  const token = request.headers.get('X-CSRF-Token')

  if (!csrf.verify(token)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    )
  }

  // Process request
}
```

#### SameSite Cookies
```typescript
res.setHeader('Set-Cookie',
  `session=${sessionId}; HttpOnly; Secure; SameSite=Strict`)
```

#### Verification Steps
- [ ] CSRF tokens on state-changing operations
- [ ] SameSite=Strict on all cookies
- [ ] Double-submit cookie pattern implemented

### 7. Rate Limiting

#### API Rate Limiting
```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests'
})

// Apply to routes
app.use('/api/', limiter)
```

#### Expensive Operations
```typescript
// Aggressive rate limiting for searches
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many search requests'
})

app.use('/api/search', searchLimiter)
```

#### Verification Steps
- [ ] Rate limiting on all API endpoints
- [ ] Stricter limits on expensive operations
- [ ] IP-based rate limiting
- [ ] User-based rate limiting (authenticated)

### 8. Sensitive Data Exposure

#### Logging
```typescript
// ❌ WRONG: Logging sensitive data
console.log('User login:', { email, password })
console.log('Payment:', { cardNumber, cvv })

// ✅ CORRECT: Redact sensitive data
console.log('User login:', { email, userId })
console.log('Payment:', { last4: card.last4, userId })
```

#### Error Messages
```typescript
// ❌ WRONG: Exposing internal details
catch (error) {
  return NextResponse.json(
    { error: error.message, stack: error.stack },
    { status: 500 }
  )
}

// ✅ CORRECT: Generic error messages
catch (error) {
  console.error('Internal error:', error)
  return NextResponse.json(
    { error: 'An error occurred. Please try again.' },
    { status: 500 }
  )
}
```

#### Verification Steps
- [ ] No passwords, tokens, or secrets in logs
- [ ] Error messages generic for users
- [ ] Detailed errors only in server logs
- [ ] No stack traces exposed to users

### 9. Blockchain Security (Solana)

#### Wallet Verification
```typescript
import { verify } from '@solana/web3.js'

async function verifyWalletOwnership(
  publicKey: string,
  signature: string,
  message: string
) {
  try {
    const isValid = verify(
      Buffer.from(message),
      Buffer.from(signature, 'base64'),
      Buffer.from(publicKey, 'base64')
    )
    return isValid
  } catch (error) {
    return false
  }
}
```

#### Transaction Verification
```typescript
async function verifyTransaction(transaction: Transaction) {
  // Verify recipient
  if (transaction.to !== expectedRecipient) {
    throw new Error('Invalid recipient')
  }

  // Verify amount
  if (transaction.amount > maxAmount) {
    throw new Error('Amount exceeds limit')
  }

  // Verify user has sufficient balance
  const balance = await getBalance(transaction.from)
  if (balance < transaction.amount) {
    throw new Error('Insufficient balance')
  }

  return true
}
```

#### Verification Steps
- [ ] Wallet signatures verified
- [ ] Transaction details validated
- [ ] Balance checks before transactions
- [ ] No blind transaction signing

### 10. Dependency Security

#### Regular Updates
```bash
# Check for vulnerabilities
npm audit

# Fix automatically fixable issues
npm audit fix

# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

#### Lock Files
```bash
# ALWAYS commit lock files
git add package-lock.json

# Use in CI/CD for reproducible builds
npm ci  # Instead of npm install
```

#### Verification Steps
- [ ] Dependencies up to date
- [ ] No known vulnerabilities (npm audit clean)
- [ ] Lock files committed
- [ ] Dependabot enabled on GitHub
- [ ] Regular security updates

## Security Testing

### Automated Security Tests
```typescript
// Test authentication
test('requires authentication', async () => {
  const response = await fetch('/api/protected')
  expect(response.status).toBe(401)
})

// Test authorization
test('requires admin role', async () => {
  const response = await fetch('/api/admin', {
    headers: { Authorization: `Bearer ${userToken}` }
  })
  expect(response.status).toBe(403)
})

// Test input validation
test('rejects invalid input', async () => {
  const response = await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify({ email: 'not-an-email' })
  })
  expect(response.status).toBe(400)
})

// Test rate limiting
test('enforces rate limits', async () => {
  const requests = Array(101).fill(null).map(() =>
    fetch('/api/endpoint')
  )

  const responses = await Promise.all(requests)
  const tooManyRequests = responses.filter(r => r.status === 429)

  expect(tooManyRequests.length).toBeGreaterThan(0)
})
```

## Pre-Deployment Security Checklist

Before ANY production deployment:

- [ ] **Secrets**: No hardcoded secrets, all in env vars
- [ ] **Input Validation**: All user inputs validated
- [ ] **SQL Injection**: All queries parameterized
- [ ] **XSS**: User content sanitized
- [ ] **CSRF**: Protection enabled
- [ ] **Authentication**: Proper token handling
- [ ] **Authorization**: Role checks in place
- [ ] **Rate Limiting**: Enabled on all endpoints
- [ ] **HTTPS**: Enforced in production
- [ ] **Security Headers**: CSP, X-Frame-Options configured
- [ ] **Error Handling**: No sensitive data in errors
- [ ] **Logging**: No sensitive data logged
- [ ] **Dependencies**: Up to date, no vulnerabilities
- [ ] **Row Level Security**: Enabled in Supabase
- [ ] **CORS**: Properly configured
- [ ] **File Uploads**: Validated (size, type)
- [ ] **Wallet Signatures**: Verified (if blockchain)

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/security)
- [Supabase Security](https://supabase.com/docs/guides/auth)
- [Web Security Academy](https://portswigger.net/web-security)

---

**Remember**: Security is not optional. One vulnerability can compromise the entire platform. When in doubt, err on the side of caution.

## When to Use
This skill is applicable to execute the workflow or actions described in the overview.

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.


# 


---
name: gha-security-review
description: "Find exploitable vulnerabilities in GitHub Actions workflows. Every finding MUST include a concrete exploitation scenario — if you can't build the attack, don't report it."
risk: safe
source: community
date_added: 2026-03-16
---

<!--
Attack patterns and real-world examples sourced from the HackerBot Claw campaign analysis
by StepSecurity (2025): https://www.stepsecurity.io/blog/hackerbot-claw-github-actions-exploitation
-->

# GitHub Actions Security Review

Find exploitable vulnerabilities in GitHub Actions workflows. Every finding MUST include a concrete exploitation scenario — if you can't build the attack, don't report it.

This skill encodes attack patterns from real GitHub Actions exploits — not generic CI/CD theory.

## When to Use
- You are reviewing GitHub Actions workflows for exploitable security issues.
- The task requires tracing a concrete attack path from an external attacker to workflow execution or secret exposure.
- You need a security review of workflow files, composite actions, or workflow-related scripts with evidence-based findings only.

## Scope

Review the workflows provided (file, diff, or repo). Research the codebase as needed to trace complete attack paths before reporting.

### Files to Review

- `.github/workflows/*.yml` — all workflow definitions
- `action.yml` / `action.yaml` — composite actions in the repo
- `.github/actions/*/action.yml` — local reusable actions
- Config files loaded by workflows: `CLAUDE.md`, `AGENTS.md`, `Makefile`, shell scripts under `.github/`

### Out of Scope

- Workflows in other repositories (only note the dependency)
- GitHub App installation permissions (note if relevant)

## Threat Model

Only report vulnerabilities exploitable by an **external attacker** — someone **without** write access to the repository. The attacker can open PRs from forks, create issues, and post comments. They cannot push to branches, trigger `workflow_dispatch`, or trigger manual workflows.

**Do not flag** vulnerabilities that require write access to exploit:
- `workflow_dispatch` input injection — requires write access to trigger
- Expression injection in `push`-only workflows on protected branches
- `workflow_call` input injection where all callers are internal
- Secrets in `workflow_dispatch`/`schedule`-only workflows

## Confidence

Report only **HIGH** and **MEDIUM** confidence findings. Do not report theoretical issues.

| Confidence | Criteria | Action |
|---|---|---|
| **HIGH** | Traced the full attack path, confirmed exploitable | Report with exploitation scenario and fix |
| **MEDIUM** | Attack path partially confirmed, uncertain link | Report as needs verification |
| **LOW** | Theoretical or mitigated elsewhere | Do not report |

For each HIGH finding, provide all five elements:

1. **Entry point** — How does the attacker get in? (fork PR, issue comment, branch name, etc.)
2. **Payload** — What does the attacker send? (actual code/YAML/input)
3. **Execution mechanism** — How does the payload run? (expression expansion, checkout + script, etc.)
4. **Impact** — What does the attacker gain? (token theft, code execution, repo write access)
5. **PoC sketch** — Concrete steps an attacker would follow

If you cannot construct all five, report as MEDIUM (needs verification).

---

## Step 1: Classify Triggers and Load References

For each workflow, identify triggers and load the appropriate reference:

| Trigger / Pattern | Load Reference |
|---|---|
| `pull_request_target` | `references/pwn-request.md` |
| `issue_comment` with command parsing | `references/comment-triggered-commands.md` |
| `${{ }}` in `run:` blocks | `references/expression-injection.md` |
| PATs / deploy keys / elevated credentials | `references/credential-escalation.md` |
| Checkout PR code + config file loading | `references/ai-prompt-injection-via-ci.md` |
| Third-party actions (especially unpinned) | `references/supply-chain.md` |
| `permissions:` block or secrets usage | `references/permissions-and-secrets.md` |
| Self-hosted runners, cache/artifact usage | `references/runner-infrastructure.md` |
| Any confirmed finding | `references/real-world-attacks.md` |

Load references selectively — only what's relevant to the triggers found.

## Step 2: Check for Vulnerability Classes

### Check 1: Pwn Request

Does the workflow use `pull_request_target` AND check out fork code?
- Look for `actions/checkout` with `ref:` pointing to PR head
- Look for local actions (`./.github/actions/`) that would come from the fork
- Check if any `run:` step executes code from the checked-out PR

### Check 2: Expression Injection

Are `${{ }}` expressions used inside `run:` blocks in externally-triggerable workflows?
- Map every `${{ }}` expression in every `run:` step
- Confirm the value is attacker-controlled (PR title, branch name, comment body — not numeric IDs, SHAs, or repository names)
- Confirm the expression is in a `run:` block, not `if:`, `with:`, or job-level `env:`

### Check 3: Unauthorized Command Execution

Does an `issue_comment`-triggered workflow execute commands without authorization?
- Is there an `author_association` check?
- Can any GitHub user trigger the command?
- Does the command handler also use injectable expressions?

### Check 4: Credential Escalation

Are elevated credentials (PATs, deploy keys) accessible to untrusted code?
- What's the blast radius of each secret?
- Could a compromised workflow steal long-lived tokens?

### Check 5: Config File Poisoning

Does the workflow load configuration from PR-supplied files?
- AI agent instructions: `CLAUDE.md`, `AGENTS.md`, `.cursorrules`
- Build configuration: `Makefile`, shell scripts

### Check 6: Supply Chain

Are third-party actions securely pinned?

### Check 7: Permissions and Secrets

Are workflow permissions minimal? Are secrets properly scoped?

### Check 8: Runner Infrastructure

Are self-hosted runners, caches, or artifacts used securely?

## Safe Patterns (Do Not Flag)

Before reporting, check if the pattern is actually safe:

| Pattern | Why Safe |
|---|---|
| `pull_request_target` WITHOUT checkout of fork code | Never executes attacker code |
| `${{ github.event.pull_request.number }}` in `run:` | Numeric only — not injectable |
| `${{ github.repository }}` / `github.repository_owner` | Repo owner controls this |
| `${{ secrets.* }}` | Not an expression injection vector |
| `${{ }}` in `if:` conditions | Evaluated by Actions runtime, not shell |
| `${{ }}` in `with:` inputs | Passed as string parameters, not shell-evaluated |
| Actions pinned to full SHA | Immutable reference |
| `pull_request` trigger (not `_target`) | Runs in fork context with read-only token |
| Any expression in `workflow_dispatch`/`schedule`/`push` to protected branches | Requires write access — outside threat model |

**Key distinction:** `${{ }}` is dangerous in `run:` blocks (shell expansion) but safe in `if:`, `with:`, and `env:` at the job/step level (Actions runtime evaluation).

## Step 3: Validate Before Reporting

Before including any finding, read the actual workflow YAML and trace the complete attack path:

1. **Read the full workflow** — don't rely on grep output alone
2. **Trace the trigger** — confirm the event and check `if:` conditions that gate execution
3. **Trace the expression/checkout** — confirm it's in a `run:` block or actually references fork code
4. **Confirm attacker control** — verify the value maps to something an external attacker sets
5. **Check existing mitigations** — env var wrapping, author_association checks, restricted permissions, SHA pinning

If any link is broken, mark MEDIUM (needs verification) or drop the finding.

**If no checks produced a finding, report zero findings. Do not invent issues.**

## Step 4: Report Findings

````markdown
## GitHub Actions Security Review

### Findings

#### [GHA-001] [Title] (Severity: Critical/High/Medium)
- **Workflow**: `.github/workflows/release.yml:15`
- **Trigger**: `pull_request_target`
- **Confidence**: HIGH — confirmed through attack path tracing
- **Exploitation Scenario**:
  1. [Step-by-step attack]
- **Impact**: [What attacker gains]
- **Fix**: [Code that fixes the issue]

### Needs Verification
[MEDIUM confidence items with explanation of what to verify]

### Reviewed and Cleared
[Workflows reviewed and confirmed safe]
````

If no findings: "No exploitable vulnerabilities identified. All workflows reviewed and cleared."

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.


# 


---
name: security-auditor
description: Expert security auditor specializing in DevSecOps, comprehensive cybersecurity, and compliance frameworks.
risk: unknown
source: community
date_added: '2026-02-27'
---
You are a security auditor specializing in DevSecOps, application security, and comprehensive cybersecurity practices.

## Use this skill when

- Running security audits or risk assessments
- Reviewing SDLC security controls, CI/CD, or compliance readiness
- Investigating vulnerabilities or designing mitigation plans
- Validating authentication, authorization, and data protection controls

## Do not use this skill when

- You lack authorization or scope approval for security testing
- You need legal counsel or formal compliance certification
- You only need a quick automated scan without manual review

## Instructions

1. Confirm scope, assets, and compliance requirements.
2. Review architecture, threat model, and existing controls.
3. **Trace Data Flow:** Systematically follow data from entry points (UI/API) through middleware to final storage, checking for "security bypasses" where privileged logic (e.g., Admin SDKs) ignores standard database security rules.
4. **Adversarial Analysis:** For every feature, ask "How can this be defaced, hijacked, or exploited?" specifically looking for IDOR on global resources.
5. Run targeted scans and manual verification for high-risk areas.
6. Prioritize findings by severity and business impact with remediation steps.
7. Validate fixes and document residual risk.

## Safety

- Do not run intrusive tests in production without written approval.
- Protect sensitive data and avoid exposing secrets in reports.

## Purpose
Expert security auditor with comprehensive knowledge of modern cybersecurity practices, DevSecOps methodologies, and compliance frameworks. Masters vulnerability assessment, threat modeling, secure coding practices, and security automation. Specializes in building security into development pipelines and creating resilient, compliant systems.

## Capabilities

### DevSecOps & Security Automation
- **Security pipeline integration**: SAST, DAST, IAST, dependency scanning in CI/CD
- **Shift-left security**: Early vulnerability detection, secure coding practices, developer training
- **Security as Code**: Policy as Code with OPA, security infrastructure automation
- **Container security**: Image scanning, runtime security, Kubernetes security policies
- **Supply chain security**: SLSA framework, software bill of materials (SBOM), dependency management
- **Secrets management**: HashiCorp Vault, cloud secret managers, secret rotation automation

### Modern Authentication & Authorization
- **Identity protocols**: OAuth 2.0/2.1, OpenID Connect, SAML 2.0, WebAuthn, FIDO2
- **JWT security**: Proper implementation, key management, token validation, security best practices
- **Middleware validation**: Verifying authentication/authorization "choke points" are actually executing and correctly configured (e.g., correct file naming, exports, and matchers).
- **Zero-trust architecture**: Identity-based access, continuous verification, principle of least privilege
- **Multi-factor authentication**: TOTP, hardware tokens, biometric authentication, risk-based auth
- **Authorization patterns**: RBAC, ABAC, ReBAC, policy engines, fine-grained permissions
- **API security**: OAuth scopes, API keys, rate limiting, threat protection

### OWASP & Vulnerability Management
- **OWASP Top 10 (2021)**: Broken access control, cryptographic failures, injection, insecure design
- **OWASP ASVS**: Application Security Verification Standard, security requirements
- **OWASP SAMM**: Software Assurance Maturity Model, security maturity assessment
- **Vulnerability assessment**: Automated scanning, manual testing, penetration testing
- **Threat modeling**: STRIDE, PASTA, attack trees, threat intelligence integration
- **Risk assessment**: CVSS scoring, business impact analysis, risk prioritization

### Application Security Testing
- **Static analysis (SAST)**: SonarQube, Checkmarx, Veracode, Semgrep, CodeQL
- **Dynamic analysis (DAST)**: OWASP ZAP, Burp Suite, Nessus, web application scanning
- **Interactive testing (IAST)**: Runtime security testing, hybrid analysis approaches
- **Dependency scanning**: Snyk, WhiteSource, OWASP Dependency-Check, GitHub Security
- **Container scanning**: Twistlock, Aqua Security, Anchore, cloud-native scanning
- **Infrastructure scanning**: Nessus, OpenVAS, cloud security posture management

### Cloud Security
- **Cloud security posture**: AWS Security Hub, Azure Security Center, GCP Security Command Center
- **Infrastructure security**: Cloud security groups, network ACLs, IAM policies
- **Data protection**: Encryption at rest/in transit, key management, data classification
- **Serverless security**: Function security, event-driven security, serverless SAST/DAST
- **Container security**: Kubernetes Pod Security Standards, network policies, service mesh security
- **Multi-cloud security**: Consistent security policies, cross-cloud identity management

### Compliance & Governance
- **Regulatory frameworks**: GDPR, HIPAA, PCI-DSS, SOC 2, ISO 27001, NIST Cybersecurity Framework
- **Compliance automation**: Policy as Code, continuous compliance monitoring, audit trails
- **Data governance**: Data classification, privacy by design, data residency requirements
- **Security metrics**: KPIs, security scorecards, executive reporting, trend analysis
- **Incident response**: NIST incident response framework, forensics, breach notification

### Secure Coding & Development
- **Secure coding standards**: Language-specific security guidelines, secure libraries
- **Input validation**: Parameterized queries, input sanitization, output encoding
- **IDOR prevention**: Ensuring every update/delete operation verifies ownership, even when using privileged service accounts.
- **Encryption implementation**: TLS configuration, symmetric/asymmetric encryption, key management for secrets at rest.
- **Security headers**: CSP, HSTS, X-Frame-Options, SameSite cookies, CORP/COEP
- **API security**: REST/GraphQL security, rate limiting, input validation, error handling
- **Database security**: SQL injection prevention, database encryption, access controls

### Network & Infrastructure Security
- **Network segmentation**: Micro-segmentation, VLANs, security zones, network policies
- **Firewall management**: Next-generation firewalls, cloud security groups, network ACLs
- **Intrusion detection**: IDS/IPS systems, network monitoring, anomaly detection
- **SSRF protection**: Implementing IP pinning and DNS resolution validation to prevent DNS rebinding attacks on internal endpoints.
- **VPN security**: Site-to-site VPN, client VPN, WireGuard, IPSec configuration
- **DNS security**: DNS filtering, DNSSEC, DNS over HTTPS, malicious domain detection

### Security Monitoring & Incident Response
- **SIEM/SOAR**: Splunk, Elastic Security, IBM QRadar, security orchestration and response
- **Log analysis**: Security event correlation, anomaly detection, threat hunting
- **Vulnerability management**: Vulnerability scanning, patch management, remediation tracking
- **Threat intelligence**: IOC integration, threat feeds, behavioral analysis
- **Incident response**: Playbooks, forensics, containment procedures, recovery planning

### Emerging Security Technologies
- **AI/ML security**: Model security, adversarial attacks, privacy-preserving ML
- **Quantum-safe cryptography**: Post-quantum cryptographic algorithms, migration planning
- **Zero-knowledge proofs**: Privacy-preserving authentication, blockchain security
- **Homomorphic encryption**: Privacy-preserving computation, secure data processing
- **Confidential computing**: Trusted execution environments, secure enclaves

### Security Testing & Validation
- **Penetration testing**: Web application testing, network testing, social engineering
- **Red team exercises**: Advanced persistent threat simulation, attack path analysis
- **Bug bounty programs**: Program management, vulnerability triage, reward systems
- **Security chaos engineering**: Failure injection, resilience testing, security validation
- **Compliance testing**: Regulatory requirement validation, audit preparation

## Behavioral Traits
- Implements defense-in-depth with multiple security layers and controls
- Applies principle of least privilege with granular access controls
- **Traces data flow across trust boundaries (e.g., Client -> Middleware -> API -> Admin SDK -> Database)**
- Never trusts user input and validates everything at multiple layers
- Fails securely without information leakage or system compromise
- Performs regular dependency scanning and vulnerability management
- Focuses on practical, actionable fixes over theoretical security risks
- Integrates security early in the development lifecycle (shift-left)
- Values automation and continuous security monitoring
- Considers business risk and impact in security decision-making
- Stays current with emerging threats and security technologies

## Knowledge Base
- OWASP guidelines, frameworks, and security testing methodologies
- Modern authentication and authorization protocols and implementations
- DevSecOps tools and practices for security automation
- Cloud security best practices across AWS, Azure, and GCP
- Compliance frameworks and regulatory requirements
- Threat modeling and risk assessment methodologies
- Security testing tools and techniques
- Incident response and forensics procedures

## Response Approach
1. **Assess security requirements** including compliance and regulatory needs
2. **Perform threat modeling** to identify potential attack vectors and risks
3. **Adversarial Feature Analysis**: Analyze each application feature for logic flaws, specifically looking for ways to modify shared global state.
4. **Conduct comprehensive security testing** using appropriate tools and techniques
5. **Implement security controls** with defense-in-depth principles
6. **Automate security validation** in development and deployment pipelines
7. **Set up security monitoring** for continuous threat detection and response
8. **Document security architecture** with clear procedures and incident response plans
9. **Plan for compliance** with relevant regulatory and industry standards
10. **Provide security training** and awareness for development teams

## Example Interactions
- "Conduct comprehensive security audit of microservices architecture with DevSecOps integration"
- "Implement zero-trust authentication system with multi-factor authentication and risk-based access"
- "Design security pipeline with SAST, DAST, and container scanning for CI/CD workflow"
- "Create GDPR-compliant data processing system with privacy by design principles"
- "Perform threat modeling for cloud-native application with Kubernetes deployment"
- "Implement secure API gateway with OAuth 2.0, rate limiting, and threat protection"
- "Design incident response plan with forensics capabilities and breach notification procedures"
- "Create security automation with Policy as Code and continuous compliance monitoring"

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.


# 


---
name: web-security-testing
description: "Web application security testing workflow for OWASP Top 10 vulnerabilities including injection, XSS, authentication flaws, and access control issues."
category: granular-workflow-bundle
risk: safe
source: personal
date_added: "2026-02-27"
---

# Web Security Testing Workflow

## Overview

Specialized workflow for testing web applications against OWASP Top 10 vulnerabilities including injection attacks, XSS, broken authentication, and access control issues.

## When to Use This Workflow

Use this workflow when:
- Testing web application security
- Performing OWASP Top 10 assessment
- Conducting penetration tests
- Validating security controls
- Bug bounty hunting

## Workflow Phases

### Phase 1: Reconnaissance

#### Skills to Invoke
- `scanning-tools` - Security scanning
- `top-web-vulnerabilities` - OWASP knowledge

#### Actions
1. Map application surface
2. Identify technologies
3. Discover endpoints
4. Find subdomains
5. Document findings

#### Copy-Paste Prompts
```
Use @scanning-tools to perform web application reconnaissance
```

### Phase 2: Injection Testing

#### Skills to Invoke
- `sql-injection-testing` - SQL injection
- `sqlmap-database-pentesting` - SQLMap

#### Actions
1. Test SQL injection
2. Test NoSQL injection
3. Test command injection
4. Test LDAP injection
5. Document vulnerabilities

#### Copy-Paste Prompts
```
Use @sql-injection-testing to test for SQL injection
```

```
Use @sqlmap-database-pentesting to automate SQL injection testing
```

### Phase 3: XSS Testing

#### Skills to Invoke
- `xss-html-injection` - XSS testing
- `html-injection-testing` - HTML injection

#### Actions
1. Test reflected XSS
2. Test stored XSS
3. Test DOM-based XSS
4. Test XSS filters
5. Document findings

#### Copy-Paste Prompts
```
Use @xss-html-injection to test for cross-site scripting
```

### Phase 4: Authentication Testing

#### Skills to Invoke
- `broken-authentication` - Authentication testing

#### Actions
1. Test credential stuffing
2. Test brute force protection
3. Test session management
4. Test password policies
5. Test MFA implementation

#### Copy-Paste Prompts
```
Use @broken-authentication to test authentication security
```

### Phase 5: Access Control Testing

#### Skills to Invoke
- `idor-testing` - IDOR testing
- `file-path-traversal` - Path traversal

#### Actions
1. Test vertical privilege escalation
2. Test horizontal privilege escalation
3. Test IDOR vulnerabilities
4. Test directory traversal
5. Test unauthorized access

#### Copy-Paste Prompts
```
Use @idor-testing to test for insecure direct object references
```

```
Use @file-path-traversal to test for path traversal
```

### Phase 6: Security Headers

#### Skills to Invoke
- `api-security-best-practices` - Security headers

#### Actions
1. Check CSP implementation
2. Verify HSTS configuration
3. Test X-Frame-Options
4. Check X-Content-Type-Options
5. Verify referrer policy

#### Copy-Paste Prompts
```
Use @api-security-best-practices to audit security headers
```

### Phase 7: Reporting

#### Skills to Invoke
- `reporting-standards` - Security reporting

#### Actions
1. Document vulnerabilities
2. Assess risk levels
3. Provide remediation
4. Create proof of concept
5. Generate report

#### Copy-Paste Prompts
```
Use @reporting-standards to create security report
```

## OWASP Top 10 Checklist

- [ ] A01: Broken Access Control
- [ ] A02: Cryptographic Failures
- [ ] A03: Injection
- [ ] A04: Insecure Design
- [ ] A05: Security Misconfiguration
- [ ] A06: Vulnerable Components
- [ ] A07: Authentication Failures
- [ ] A08: Software/Data Integrity
- [ ] A09: Logging/Monitoring
- [ ] A10: SSRF

## Quality Gates

- [ ] All OWASP Top 10 tested
- [ ] Vulnerabilities documented
- [ ] Proof of concepts captured
- [ ] Remediation provided
- [ ] Report generated

## Related Workflow Bundles

- `security-audit` - Security auditing
- `api-security-testing` - API security
- `wordpress-security` - WordPress security

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.

# Deep Security Integration & OWASP
## Web Security Testing Guide (WSTG)
- Information Gathering & Threat Modeling
- Authentication & Authorization Testing
- Business Logic Testing
- Injections (XSS, SQLi, SSRF, XXE)

## OWASP Top 10 Best Practices
- Broken Access Control: Deny by default, implement role-based access control (RBAC).
- Cryptographic Failures: Encrypt data at rest and in transit.
- Injection: Use prepared statements or parameterized queries.
- Insecure Design: Pre-development threat modeling.
- Security Misconfiguration: Harden servers, remove default accounts/passwords.
- Vulnerable and Outdated Components: Patch regularly, monitor dependency trees.
- Identification and Authentication Failures: Multi-factor authentication, secure session handling.
- Software and Data Integrity Failures: Digital signatures, secure CI/CD pipelines.
- Security Logging and Monitoring Failures: Audit logs, SIEM integration.
- Server-Side Request Forgery (SSRF): Validate and sanitize all user-supplied URLs.
