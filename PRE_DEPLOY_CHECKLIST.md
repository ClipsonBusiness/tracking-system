# ✅ Pre-Deployment Checklist

## Before You Deploy

### 1. Switch to PostgreSQL ⚠️ REQUIRED

**Current:** Using SQLite (won't work in production)
**Action:** Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

### 2. Get PostgreSQL Database

**Free Options:**
- [Neon](https://neon.tech) - Recommended, easiest setup
- [Supabase](https://supabase.com) - Free tier, good docs
- [Vercel Postgres](https://vercel.com/storage/postgres) - If using Vercel
- [Railway](https://railway.app) - Free tier available

**Copy your connection string** (you'll need it for environment variables)

### 3. Prepare Environment Variables

Create a list of your production values:

```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
ADMIN_PASSWORD=your-secure-password-here
STRIPE_SECRET_KEY=sk_live_... (or sk_test_... for testing)
STRIPE_WEBHOOK_SECRET=whsec_... (get from Stripe dashboard)
APP_BASE_URL=https://your-app.vercel.app
IP_SALT=random-string-min-32-chars
```

### 4. Test Locally with PostgreSQL (Optional but Recommended)

```bash
# Update .env with PostgreSQL connection string
DATABASE_URL="postgresql://..."

# Generate Prisma client
npm run db:generate

# Push schema
npm run db:push

# Seed database
npm run db:seed

# Test locally
npm run dev
```

### 5. Commit Your Code

```bash
git add .
git commit -m "Ready for deployment"
git push
```

### 6. Deploy!

Follow `DEPLOY_QUICK.md` for 5-minute deployment guide.

---

## After Deployment

- [ ] Database migrations run successfully
- [ ] Database seeded
- [ ] Admin login works
- [ ] Can create links
- [ ] Links redirect correctly
- [ ] Stripe webhook configured
- [ ] Test webhook endpoint

---

## Quick Commands Reference

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Build for production
npm run build

# Start production server
npm run start
```
