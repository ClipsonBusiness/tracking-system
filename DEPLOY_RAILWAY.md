# 🚂 Deploy to Railway

Railway makes deployment super easy with built-in PostgreSQL and automatic deployments!

## Step 1: Prepare Your Code

### Switch to PostgreSQL

Update `prisma/schema.prisma` line 9-11:
```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

Or run:
```bash
./switch-to-postgres.sh
```

### Commit Your Code

```bash
git add .
git commit -m "Ready for Railway deployment"
git push
```

---

## Step 2: Deploy to Railway

### Option A: Deploy from GitHub (Recommended)

1. **Go to Railway**: https://railway.app
2. **Sign in** with GitHub
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your repository**
6. **Railway will auto-detect Next.js** ✅

### Option B: Deploy via Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

---

## Step 3: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will automatically:
   - Create the database
   - Set `DATABASE_URL` environment variable
   - Connect it to your app

**That's it!** No need to manually set `DATABASE_URL` - Railway does it automatically.

---

## Step 4: Add Environment Variables

In your Railway project dashboard:

1. Go to your **service** (your app)
2. Click **"Variables"** tab
3. Add these environment variables:

```
ADMIN_PASSWORD=your-secure-password-here
STRIPE_SECRET_KEY=sk_live_... (or sk_test_...)
STRIPE_WEBHOOK_SECRET=whsec_...
APP_BASE_URL=https://your-app.railway.app (Railway will provide this)
IP_SALT=random-string-min-32-chars
```

**Note:** `DATABASE_URL` is automatically set by Railway when you add the PostgreSQL database.

---

## Step 5: Setup Database Schema

After deployment, Railway will automatically run `npm install` which includes `prisma generate` (via postinstall script).

Then run migrations:

**Option A: Via Railway Dashboard**
1. Go to your service
2. Click "Deployments" → Latest deployment
3. Click "View Logs"
4. Use the terminal in Railway dashboard

**Option B: Via Railway CLI**
```bash
railway link
railway run npx prisma db push
railway run npx prisma db seed
```

**Option C: Via Railway Shell**
1. In Railway dashboard, click "Shell" tab
2. Run:
```bash
npx prisma db push
npx prisma db seed
```

---

## Step 6: Get Your Public URL

1. In Railway dashboard, go to your service
2. Click **"Settings"** tab
3. Scroll to **"Networking"**
4. Click **"Generate Domain"** (or use custom domain)
5. Copy your URL (e.g., `https://your-app.railway.app`)

Update `APP_BASE_URL` in environment variables with this URL.

---

## Step 7: Configure Stripe Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Enter your webhook URL: `https://your-app.railway.app/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `invoice.paid`
   - `charge.refunded`
5. Copy the **webhook signing secret**
6. Update `STRIPE_WEBHOOK_SECRET` in Railway environment variables
7. Click **"Redeploy"** in Railway to apply changes

---

## Step 8: Test Your Deployment

1. Visit: `https://your-app.railway.app`
2. Login at: `https://your-app.railway.app/login`
3. Create a test link
4. Test the link: `https://your-app.railway.app/xxxxx`
5. Verify it redirects correctly

---

## Railway-Specific Features

### Automatic Deployments
- Railway automatically deploys when you push to GitHub
- No manual deployment needed!

### Database Backups
- Railway automatically backs up your PostgreSQL database
- View backups in Railway dashboard → Database → Backups

### Custom Domain
1. In Railway dashboard → Settings → Networking
2. Click "Custom Domain"
3. Add your domain (e.g., `tracking.yourdomain.com`)
4. Follow DNS instructions Railway provides

### Monitoring
- View logs in Railway dashboard
- Check metrics (CPU, memory, requests)
- Set up alerts if needed

---

## Troubleshooting

### Build Fails?
- Check Railway logs: Dashboard → Deployments → View Logs
- Verify `package.json` has all dependencies
- Ensure Node.js version is 18+ (Railway auto-detects)

### Database Connection Error?
- Verify PostgreSQL database is added to your project
- Check `DATABASE_URL` is set (should be automatic)
- Try redeploying: Dashboard → Deployments → Redeploy

### Environment Variables Not Working?
- Make sure you added them to the **service** (not the database)
- Click "Redeploy" after adding variables
- Check variable names match exactly (case-sensitive)

### Webhook Not Working?
- Verify `APP_BASE_URL` matches your Railway URL
- Check `STRIPE_WEBHOOK_SECRET` is correct
- Test with Stripe CLI: `stripe listen --forward-to https://your-app.railway.app/api/stripe/webhook`

---

## Railway Pricing

- **Free tier**: $5 credit/month (usually enough for small apps)
- **Hobby**: $5/month (if you exceed free tier)
- **Pro**: $20/month (for production apps)

PostgreSQL database is included in your plan.

---

## Quick Commands Reference

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to existing project
railway link

# View logs
railway logs

# Run commands
railway run npm run db:push
railway run npm run db:seed

# Open shell
railway shell

# Deploy
railway up
```

---

## ✅ Deployment Checklist

- [ ] Switched to PostgreSQL in `prisma/schema.prisma`
- [ ] Committed and pushed code to GitHub
- [ ] Created Railway project
- [ ] Added PostgreSQL database
- [ ] Added all environment variables
- [ ] Ran database migrations (`prisma db push`)
- [ ] Seeded database (`prisma db seed`)
- [ ] Got public URL from Railway
- [ ] Updated `APP_BASE_URL` with Railway URL
- [ ] Configured Stripe webhook
- [ ] Tested admin login
- [ ] Tested link creation
- [ ] Tested link redirects

---

## Need Help?

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Check logs in Railway dashboard

---

**That's it!** Your app should be live on Railway! 🚂
