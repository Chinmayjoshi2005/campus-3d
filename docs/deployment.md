# Deployment Architecture

## Platform

**Hosting:** Vercel (Next.js 15 App Router)  
**Database:** MongoDB Atlas (M10+ for production)  
**Media:** Cloudinary CDN  
**DNS:** Custom domain with Vercel SSL

## Environments

| Environment | Branch | URL |
|-------------|--------|-----|
| Development | local | `localhost:3000` |
| Preview | PR branches | `*.vercel.app` |
| Production | `main` | `campusguide.college.edu` |

## CI/CD Pipeline

```
git push → Vercel Build → ESLint → TypeScript → Next.js Build → Deploy
                ↓
         Husky pre-commit (local)
         ├── lint-staged (ESLint + Prettier)
         └── typecheck
```

### `vercel.json`

```json
{
  "framework": "nextjs",
  "regions": ["bom1"],
  "headers": [
    {
      "source": "/models/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

Region `bom1` (Mumbai) for India-based college — adjust as needed.

## Environment Variables

### Required (Production)

```env
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=<32+ char random>
NEXTAUTH_URL=https://campusguide.college.edu
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Optional

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
UPSTASH_REDIS_URL=...        # production rate limiting
NEXT_PUBLIC_APP_URL=...
```

## MongoDB Atlas Setup

1. Create M10 cluster in Mumbai (ap-south-1) or nearest
2. Database user with readWrite on `campusguide` database
3. Network access: Vercel IP ranges + dev IPs
4. Create indexes via `database/scripts/create-indexes.ts`
5. Enable backup (continuous cloud backup)

## Asset Deployment

Static assets in `public/` deployed to Vercel Edge CDN:

| Asset | Path | Cache |
|-------|------|-------|
| Campus GLB | `/models/campus.glb` | 1 year immutable |
| Character GLB | `/models/character.glb` | 1 year immutable |
| Draco WASM | `/draco/` | 1 year immutable |
| Textures | `/textures/` | 1 year immutable |

Large GLB updates: consider Cloudinary or separate CDN bucket if > 50MB.

## Build Configuration

```typescript
// next.config.ts
const nextConfig = {
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  images: {
    remotePatterns: [{ hostname: 'res.cloudinary.com' }],
  },
  experimental: {
    optimizePackageImports: ['@react-three/drei', 'lucide-react'],
  },
};
```

## Performance Targets (Lighthouse)

| Category | Target |
|----------|--------|
| Performance | > 90 |
| Accessibility | > 95 |
| Best Practices | > 95 |
| SEO | > 90 |

### Strategies

- Landing page: no 3D (static RSC)
- Campus page: dynamic import 3D canvas
- Font: `next/font` with display swap
- Images: Cloudinary auto-format/auto-quality

## Monitoring

| Tool | Purpose |
|------|---------|
| Vercel Analytics | Web vitals |
| Vercel Speed Insights | RUM performance |
| MongoDB Atlas Monitoring | DB performance |
| Cloudinary Analytics | Media usage |
| Custom audit_logs | Admin action tracking |

## Rollback Strategy

- Vercel instant rollback to previous deployment
- MongoDB point-in-time recovery
- GLB versioned: `campus.glb?v={hash}` cache bust on model updates

## Deployment Checklist

- [ ] Environment variables set in Vercel dashboard
- [ ] MongoDB indexes created
- [ ] Seed data imported
- [ ] Navigation graph validated
- [ ] SSL certificate active
- [ ] Rate limiting configured
- [ ] `NEXTAUTH_SECRET` unique per environment
- [ ] Cloudinary upload presets configured
- [ ] Custom domain DNS propagated
- [ ] Lighthouse audit passed
- [ ] Mobile smoke test completed

## Local Development

```bash
# Install dependencies
cd web-platform && npm install

# Setup env
cp .env.example .env.local

# Seed database
npm run db:seed

# Create indexes
npm run db:indexes

# Dev server
npm run dev
```

## Docker (Optional Self-Host)

Not primary target. Vercel is the deployment platform. Docker compose provided in `docs/docker-compose.yml` for air-gapped deployments if needed.
