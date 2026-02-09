# 🚀 Deployment Guide

## Quick Deploy to Vercel (Recommended)

### Step 1: Prepare Your Code

1. **Switch to PostgreSQL** (SQLite won't work in production):
   ```bash
   # Update prisma/schema.prisma - change datasource to:
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Get a PostgreSQL database:**
   - **Free options:**
     - [Vercel Postgres](https://vercel.com/storage/postgres) (free tier)
     - [Neon](https://neon.tech) (free tier)
     - [Supabase](https://supabase.com) (free tier)
     - [Railway](https://railway.app) (free tier)

3. **Update `.env` with production values:**
   ```bash
   DATABASE_URL="postgresql://user:password@host:5432/dbname"
   ADMIN_PASSWORD="your-secure-password-here"
   STRIPE_SECRET_KEY="sk_live_..." # Use live key for production
   STRIPE_WEBHOOK_SECRET="whsec_..."
   APP_BASE_URL="https://your-app.vercel.app" # Your Vercel URL
   IP_SALT="generate-random-string-here"
   ```

### Step 2: Deploy to Vercel

**Option A: Via Vercel Dashboard (Easiest)**

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your Git repository (GitHub/GitLab/Bitbucket)
4. Vercel will auto-detect Next.js
5. Add environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `ADMIN_PASSWORD`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `APP_BASE_URL`
   - `IP_SALT`
6. Click "Deploy"

**Option B: Via CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts, add environment variables when asked
```

### Step 3: Setup Database

After deployment, run database migrations:

```bash
# Connect to your Vercel project
vercel link

# Run migrations (Vercel will use your DATABASE_URL env var)
npx prisma db push

# Seed database
npx prisma db seed
```

Or use Vercel's database dashboard to run SQL directly.

### Step 4: Configure Stripe Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your webhook URL: `https://your-app.vercel.app/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `invoice.paid`
   - `charge.refunded`
5. Copy the webhook signing secret
6. Update `STRIPE_WEBHOOK_SECRET` in Vercel environment variables

### Step 5: Test Your Deployment

1. Visit: `https://your-app.vercel.app`
2. Login at: `https://your-app.vercel.app/login`
3. Create a test link
4. Test the link: `https://your-app.vercel.app/xxxxx`
5. Verify it redirects correctly

---

## Alternative: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Add PostgreSQL database (Railway will auto-create)
5. Add environment variables
6. Deploy!

---

## Alternative: Deploy to Render

1. Go to [render.com](https://render.com)
2. Create new "Web Service"
3. Connect GitHub repository
4. Add PostgreSQL database
5. Add environment variables
6. Deploy!

---

## Post-Deployment Checklist

- [ ] Database migrations run successfully
- [ ] Database seeded with initial data
- [ ] Admin login works
- [ ] Can create links
- [ ] Links redirect correctly
- [ ] Stripe webhook configured
- [ ] Test webhook with Stripe CLI or dashboard
- [ ] Custom domain configured (if using)
- [ ] SSL certificate active (automatic on Vercel)

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `ADMIN_PASSWORD` | Admin dashboard password | `my-secure-password-123` |
| `STRIPE_SECRET_KEY` | Stripe secret key (live or test) | `sk_live_...` or `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | `whsec_...` |
| `APP_BASE_URL` | Your app's public URL | `https://your-app.vercel.app` |
| `IP_SALT` | Random string for IP hashing | `random-salt-string-123` |

---

## Troubleshooting

**Database connection errors?**
- Verify `DATABASE_URL` is correct
- Check database is accessible from Vercel
- Ensure database allows connections from Vercel IPs

**Build fails?**
- Check Node.js version (should be 18+)
- Verify all dependencies are in `package.json`
- Check build logs in Vercel dashboard

**Webhook not working?**
- Verify webhook URL is correct
- Check `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- Test with Stripe CLI: `stripe listen --forward-to https://your-app.vercel.app/api/stripe/webhook`

---

## Need Help?

- Check Vercel docs: https://vercel.com/docs
- Check Prisma docs: https://www.prisma.io/docs
- Check Stripe docs: https://stripe.com/docs
