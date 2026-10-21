# Auth & Security Design

> This document defines the complete authentication system, authorization model, and security policies. Every endpoint, every route, and every data access pattern is covered.

---

## 0. Threat Model

> Complete this section before filling in any other section. Security controls (rate limits,
> auth checks, data isolation rules) in Sections 1–6 must be traceable to a named threat actor
> or a named asset in this section. A control with no traceable threat is security theater.

### Protected Assets

List the data assets this product holds, ranked by the severity of their compromise:

| Asset | Compromise impact | Who legitimately accesses it |
| ----- | ----------------- | ---------------------------- |
| [e.g., user financial data] | [e.g., enables fraud, triggers regulatory breach] | [authenticated user, admin] |
| [e.g., session tokens] | [e.g., full account takeover] | [server only — never exposed to client] |
| [Add all assets] | | |

### Threat Actors

Name every plausible attacker for this product. Generic names are not sufficient — describe
what they are attempting and what access they start with:

- **Unauthenticated attacker:** No credentials. Attempting to read any data or enumerate
  accounts via the auth endpoints (credential stuffing, brute force, registration probing).
- **Authenticated-but-malicious user:** Has a legitimate account. Attempting to read or
  modify another user's data by guessing or brute-forcing resource IDs (horizontal
  privilege escalation).
- **Compromised admin account:** Attacker holds admin credentials obtained via phishing
  or credential reuse. Attempting bulk data exfiltration or silent modification.
- **[Add any product-specific actor — e.g., a competitor scraping pricing data, a former
  employee with a revoked token that has not yet expired]**

### Trust Boundaries

Define what each layer is trusted to assert, and what the next layer must independently verify:

| Boundary | Trusted to provide | Must independently verify |
| -------- | ------------------ | ------------------------- |
| Client → API | Request body fields, URL params, auth cookie | Auth identity (UID from token, never from body); all business rule constraints |
| API → Database | Authenticated UID, validated field values | Firestore security rules / row-level security enforce independently of API layer |
| [Add any additional boundary — e.g., third-party webhook → API] | | |

### Auth Provider Failure Mode

State the behavior of this product if the auth provider (Firebase Auth / Supabase Auth / etc.)
becomes unavailable:

- **New sign-ins:** [Cannot proceed — auth provider is required. Show maintenance message;
  do not expose a 500 error to the user.]
- **Existing sessions:** [Describe — e.g., "Existing session cookies remain valid until
  expiry since verification requires a live check, so existing sessions also fail."]
- **Degraded-mode decision:** [Can users access any read-only content while auth is down?
  Yes/No, and why.]

---

## 1. Authentication Method

### Primary Auth

- **Method:** [Email/Password | OAuth (Google/Apple/GitHub) | Magic Link | Phone/SMS]
- **Provider:** [Firebase Auth | Supabase Auth | NextAuth | Custom JWT]
- **Session type:** [JWT in httpOnly cookie | Bearer token | Session cookie]
- **Token expiry:** [Access token: X minutes | Refresh token: X days]
- **Token refresh strategy:** [Silent refresh | Refresh endpoint | Auto-refresh on 401]

### Auth Flows

#### Sign Up

1. User enters [email + password / phone number / OAuth]
2. [Validation rules — e.g., password min 8 chars, must contain uppercase and number]
3. [What happens after signup — email verification? Redirect to onboarding?]
4. [What data is created — user document, default settings, etc.]

#### Sign In

1. User enters [credentials]
2. [Token is issued and stored in httpOnly cookie / localStorage / secure storage]
3. [Redirect destination — dashboard / last visited page]
4. [Failed login behavior — error message, lockout after X attempts?]

#### Sign Out

1. [Token is invalidated / cookie is cleared]
2. [Redirect to login page]
3. [Any cleanup — clear local cache, disconnect real-time listeners]

#### Forgot Password

1. User enters email
2. [Reset email is sent with a time-limited link / code]
3. [Link/code expires after X minutes]
4. [Password reset requirements]

#### Email Verification (if applicable)

1. [Verification email is sent on signup]
2. [User clicks link / enters code]
3. [What happens if not verified — limited access? Reminder emails?]

---

## 2. Authorization Model

### Roles

| Role               | Description                 | How Assigned                   |
| ------------------ | --------------------------- | ------------------------------ |
| `user`             | Standard authenticated user | Default on signup              |
| `admin`            | Full system access          | Manually assigned via [method] |
| [additional roles] | [description]               | [how assigned]                 |

### Permission Matrix

| Resource     | Guest | User (own data) | User (others' data) | Admin               |
| ------------ | ----- | --------------- | ------------------- | ------------------- |
| [Resource 1] | ✗     | Read, Write     | ✗                   | Read, Write, Delete |
| [Resource 2] | Read  | Read, Write     | ✗                   | Read, Write, Delete |
| [Resource 3] | ✗     | ✗               | ✗                   | Read, Write         |

---

## 3. Protected Routes

### Frontend Route Protection

| Route Pattern         | Auth Required              | Role Required | Redirect If Unauthorized |
| --------------------- | -------------------------- | ------------- | ------------------------ |
| `/login`, `/register` | No (redirect if logged in) | —             | Dashboard                |
| `/dashboard/*`        | Yes                        | user          | `/login`                 |
| `/admin/*`            | Yes                        | admin         | `/403` or `/dashboard`   |
| `/api/*`              | Yes (via middleware)       | varies        | 401 JSON response        |

### Middleware Implementation

**If Next.js:**
Use Next.js middleware at `middleware.ts` to check auth token on every request. Validate the token server-side. Redirect unauthenticated users to `/login`. Redirect unauthorized users (wrong role) to `/403`.

**If Flutter:**
Use a navigation guard / GoRouter redirect. Check auth state from the auth provider. Redirect to login screen if not authenticated.

**If React Native:**
Use a navigation container with auth state checks. Show auth stack if not logged in, app stack if logged in.

---

## 4. API Security

### Authentication on Every Endpoint

- Every API endpoint MUST check for a valid auth token before doing anything
- If no token or invalid token → return `401 Unauthorized`
- If valid token but wrong role → return `403 Forbidden`
- Extract `userId` from the token, never trust client-sent `userId`

### Rate Limiting

| Endpoint Category                | Limit        | Window          | Response When Exceeded   |
| -------------------------------- | ------------ | --------------- | ------------------------ |
| Auth endpoints (login, register) | [X] requests | per [Y] minutes | 429 + retry-after header |
| Read endpoints (list, get)       | [X] requests | per [Y] minutes | 429                      |
| Write endpoints (create, update) | [X] requests | per [Y] minutes | 429                      |
| Delete endpoints                 | [X] requests | per [Y] minutes | 429                      |
| Export/heavy endpoints           | [X] requests | per [Y] hours   | 429                      |

### Data Isolation

- Every database query MUST include `userId == authenticatedUserId`
- Never allow a user to access, modify, or delete another user's data
- Admin endpoints must verify admin role before execution

### Input Validation

- Validate ALL input on the server side (never trust client validation alone)
- Sanitize text inputs to prevent XSS
- Validate email formats, phone formats, date formats
- Enforce max lengths on all string fields
- Validate enum values against allowed lists
- Reject unexpected fields in request bodies

---

## 5. Data Security

### Sensitive Data Handling

- Passwords: hashed with [bcrypt/argon2], never stored in plain text
- API keys: stored in environment variables, never in client code or git
- Tokens: stored in [httpOnly cookies / secure storage], never in localStorage (web)
- PII (names, emails): encrypted at rest if required by compliance
- Financial data: stored as integers (cents/kobo), validated server-side

### Audit Trail

- Log all authentication events (login, logout, failed attempts)
- Log all data modifications (create, update, delete) with before/after state
- Log all admin actions
- Never log passwords, tokens, or full credit card numbers

### Environment Variables

```
# Auth
[AUTH_PROVIDER]_API_KEY=
[AUTH_PROVIDER]_PROJECT_ID=

# Database
DATABASE_URL=

# Storage
STORAGE_BUCKET=

# Email (if applicable)
SMTP_HOST=
SMTP_USER=
SMTP_PASSWORD=

# Third-party APIs
[SERVICE]_API_KEY=
```

---

## 6. Security Headers (Web)

- `Content-Security-Policy`: restrict script sources
- `X-Frame-Options`: DENY (prevent clickjacking)
- `X-Content-Type-Options`: nosniff
- `Strict-Transport-Security`: enforce HTTPS
- `Referrer-Policy`: strict-origin-when-cross-origin
