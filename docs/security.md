# Security Architecture

## Threat Model

| Threat | Mitigation |
|--------|------------|
| Unauthorized admin access | RBAC + middleware |
| Injection (NoSQL/XSS) | Zod validation + sanitization |
| CSRF | NextAuth + SameSite cookies |
| Brute force login | Rate limiting |
| File upload abuse | MIME validation + size limits + Cloudinary |
| Data exposure | Field-level response filtering |
| Session hijacking | Secure, HttpOnly, SameSite=Lax cookies |

## Authentication — NextAuth v5

### Providers

- **Credentials** — email/password for admin/faculty
- **Google OAuth** — optional student SSO (env-gated)

### Session Strategy

JWT sessions with 24-hour expiry, refresh on activity.

```typescript
// lib/auth/auth.config.ts
export const authConfig = {
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  pages: { signIn: "/login" },
};
```

### Roles (RBAC)

| Role | Permissions |
|------|-------------|
| `visitor` | Search, explore, navigate (no auth required) |
| `student` | + save preferences |
| `faculty` | + update own profile/status |
| `admin` | + CRUD entities, notices, imports |
| `superadmin` | + user management, audit logs |

## Authorization Layers

```
1. Middleware (route protection)
2. API route guards (requireRole)
3. Server Action guards (requireAuth + requireRole)
4. Database query scoping (department filter for faculty role)
```

### Middleware Protected Routes

```
/admin/*     → admin, superadmin
/api/admin/* → admin, superadmin
/api/upload  → admin, faculty
```

## Input Validation — Zod

Every API input and Server Action payload validated:

```typescript
const createFacultySchema = z.object({
  name: z.string().min(2).max(255).trim(),
  email: z.string().email().optional(),
  department: z.string().min(1).max(255),
  roomNumber: z.string().min(1).max(50),
  position: z.object({
    x: z.number().finite(),
    y: z.number().finite(),
    z: z.number().finite(),
  }),
});
```

## Sanitization

- **HTML content** (notices): `sanitize-html` whitelist
- **Search queries**: escape regex special chars
- **File names**: slugified on upload
- **MongoDB queries**: no raw user input in `$where`

## Rate Limiting

In-memory sliding window (production: Upstash Redis recommended).

| Endpoint | Limit |
|----------|-------|
| `/api/auth/*` | 10 req/min per IP |
| `/api/search` | 60 req/min per IP |
| `/api/admin/*` | 30 req/min per user |
| Server Actions (mutations) | 20 req/min per user |

Implementation: `lib/security/rate-limit.ts`

## Environment Validation

Startup validation via Zod in `lib/env.ts`:

```typescript
const envSchema = z.object({
  MONGODB_URI: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
});
```

App fails fast on missing/invalid env vars.

## Upload Security

```typescript
const ALLOWED_MIME_TYPES = [
  "image/jpeg", "image/png", "image/webp",
  "application/pdf",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
```

- Virus scanning: Cloudinary built-in
- No direct filesystem writes
- Signed upload URLs for client-side uploads

## Audit Logging

All admin mutations logged to `audit_logs`:

```typescript
await auditLog({
  userId: session.user.id,
  action: "faculty.update",
  resource: "faculty",
  resourceId: facultyId,
  metadata: { fields: ["status"] },
  ip: request.headers.get("x-forwarded-for"),
});
```

## API Security Headers

Via `next.config.ts`:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=()
```

## Sensitive Data Policy

- Passwords: bcrypt (cost 12), never logged
- API keys: environment variables only
- Faculty contact: visible to authenticated users only (configurable)
- Internal IDs: ObjectId, never sequential integers exposed

## Security Checklist (Pre-Deploy)

- [ ] `NEXTAUTH_SECRET` rotated for production
- [ ] MongoDB IP whitelist configured
- [ ] CORS restricted to production domain
- [ ] Rate limiting enabled
- [ ] Audit logging verified
- [ ] No `.env` in repository
- [ ] CSP headers configured
- [ ] Dependency audit (`npm audit`)
