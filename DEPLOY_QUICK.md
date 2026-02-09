# ⚡ Quick Deploy (5 Minutes)

## 1. Get PostgreSQL Database (Free)

Choose one:
- **Neon**: https://neon.tech (easiest, free tier)
- **Supabase**: https://supabase.com (free tier)
- **Vercel Postgres**: https://vercel.com/storage/postgres (if using Vercel)

Copy your connection string (looks like: `postgresql://user:pass@host/dbname`)

## 2. Update Prisma Schema

Change `prisma/schema.prisma` line 9-11:
```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

## 3. Deploy to Vercel

**Via Dashboard:**
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repo
4. Add these environment variables:
   ```
   DATABASE_URL=postgresql://... (from step 1)
   ADMIN_PASSWORD=your-secure-password
   STRIPE_SECRET_KEY=sk_live_... (or sk_test_...)
   STRIPE_WEBHOOK_SECRET=whsec_...
   APP_BASE_URL=https://your-app.vercel.app
   IP_SALT=random-string-123
   ```
5. Click "Deploy"

**Via CLI:**
```bash
npm i -g vercel
vercel login
vercel
# Follow prompts, add env vars
```

## 4. Setup Database

After deployment, run:
```bash
vercel link
npx prisma db push
npx prisma db seed
```

Or use Vercel's database dashboard to run migrations.

## 5. Configure Stripe Webhook

1. Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-app.vercel.app/api/stripe/webhook`
3. Select events: `checkout.session.completed`, `invoice.paid`, etc.
4. Copy webhook secret
5. Update `STRIPE_WEBHOOK_SECRET` in Vercel

## ✅ Done!

Your app is live at: `https://your-app.vercel.app`

---

**Need help?** See `DEPLOY.md` for detailed instructions.
