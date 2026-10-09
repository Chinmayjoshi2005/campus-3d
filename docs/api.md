# API Architecture

## Design Principles

- **RESTful** route handlers under `app/api/`
- **Server Actions** for admin mutations (form submissions)
- **Zod** validation on every input
- **Consistent response envelope**
- **Rate limited** public endpoints

## Response Envelope

```typescript
// Success
{ "success": true, "data": T }

// Error
{ "success": false, "error": { "code": string, "message": string } }
```

## Public Endpoints

### Search

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/search?q={query}&type={type}` | Unified search |

**Query params:**
- `q` — search string (min 2 chars)
- `type` — optional filter: `faculty|room|department|lab|office|all`

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "faculty_001",
        "type": "faculty",
        "title": "Dr. Sharma",
        "subtitle": "Computer Science · C203 · Floor 2",
        "department": "Computer Science",
        "roomNumber": "C203",
        "floor": 2,
        "position": { "x": 12, "y": 0, "z": -8 }
      }
    ],
    "total": 1
  }
}
```

### Navigation

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/navigation/path` | Generate route |
| GET | `/api/navigation/nodes` | Public node list (cached) |

### Campus Data

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/faculty` | List faculty (paginated) |
| GET | `/api/faculty/[slug]` | Faculty detail |
| GET | `/api/rooms` | List rooms |
| GET | `/api/rooms/[roomNumber]` | Room detail |
| GET | `/api/departments` | List departments |
| GET | `/api/notices` | Published notices |

### Analytics (Public, Anonymous)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/analytics/event` | Track interaction events |

## Authenticated Endpoints

### Auth

| Method | Path | Description |
|--------|------|-------------|
| * | `/api/auth/[...nextauth]` | NextAuth handlers |

### Faculty Self-Service

| Method | Path | Role | Description |
|--------|------|------|-------------|
| PATCH | `/api/faculty/me/status` | faculty | Update availability |

## Admin Endpoints

All require `admin` or `superadmin` role.

### CRUD

| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/api/admin/faculty` | List/create faculty |
| GET/PATCH/DELETE | `/api/admin/faculty/[id]` | Faculty CRUD |
| GET/POST | `/api/admin/rooms` | Room management |
| GET/PATCH/DELETE | `/api/admin/rooms/[id]` | Room CRUD |
| GET/POST | `/api/admin/departments` | Department management |
| GET/POST | `/api/admin/notices` | Notice management |
| GET/PATCH/DELETE | `/api/admin/notices/[id]` | Notice CRUD |
| GET/POST | `/api/admin/events` | Event management |
| GET/POST | `/api/admin/navigation/nodes` | Nav node CRUD |
| GET/POST | `/api/admin/navigation/edges` | Nav edge CRUD |

### Import/Export

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/admin/import/json` | Bulk JSON import |
| GET | `/api/admin/export/json?type={type}` | Export dataset |

### Upload

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/upload` | Cloudinary signed upload |

### Analytics Dashboard

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/analytics/overview` | Dashboard metrics |
| GET | `/api/admin/analytics/search` | Top searches |
| GET | `/api/admin/analytics/navigation` | Route stats |

## Server Actions

Located in `src/app/admin/actions/` and `src/app/(auth)/actions/`:

```typescript
"use server";

export async function createFaculty(formData: FormData) {
  const session = await requireRole("admin");
  const parsed = createFacultySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten() };
  
  const faculty = await facultyService.create(parsed.data);
  await auditLog({ ... });
  revalidatePath("/admin/faculty");
  return { success: true, data: faculty };
}
```

## Pagination

```typescript
// Query: ?page=1&limit=20&sort=name&order=asc
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

## Caching Strategy

| Endpoint | Cache |
|----------|-------|
| `/api/departments` | `revalidate: 3600` |
| `/api/navigation/nodes` | `revalidate: 300` |
| `/api/search` | no cache |
| `/api/admin/*` | no cache |

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `VALIDATION_ERROR` | 400 | Zod validation failed |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Insufficient role |
| `NOT_FOUND` | 404 | Resource missing |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unhandled error |

## Webhook (Future)

Cloudinary upload completion webhook for async document processing.
