# ✅ Railway Project Created!

Your Railway project has been created and deployment has started!

## Project Details

- **Project Name**: tracking-system
- **Project URL**: https://railway.com/project/f5baafe1-75dc-4ad6-85fa-49d3bc6e33ee
- **Status**: Deploying...

---

## Next Steps

### 1. Add PostgreSQL Database

**Option A: Via Railway Dashboard (Easiest)**
1. Go to: https://railway.com/project/f5baafe1-75dc-4ad6-85fa-49d3bc6e33ee
2. Click **"+ New"** button
3. Select **"Database"** → **"Add PostgreSQL"**
4. Railway will automatically:
   - Create the database
   - Set `DATABASE_URL` environment variable
   - Connect it to your app

**Option B: Via CLI**
```bash
# Create PostgreSQL service
npx @railway/cli service create postgresql
```

### 2. Add Environment Variables

In Railway dashboard → Your service → "Variables" tab, add:

```
ADMIN_PASSWORD=your-secure-password-here
STRIPE_SECRET_KEY=sk_live_... (or sk_test_...)
STRIPE_WEBHOOK_SECRET=whsec_...
IP_SALT=random-string-min-32-characters
```

**Note:** `DATABASE_URL` is automatically set when you add PostgreSQL.

### 3. Get Your Public URL

**Via Dashboard:**
1. Go to your service in Railway dashboard
2. Click **"Settings"** tab
3. Scroll to **"Networking"**
4. Click **"Generate Domain"**
5. Copy your URL (e.g., `https://tracking-system-production.up.railway.app`)

**Via CLI:**
```bash
npx @railway/cli domain
```

Then update `APP_BASE_URL`:
```bash
npx @railway/cli variables set APP_BASE_URL="https://your-app.railway.app"
```

### 4. Setup Database Schema

After PostgreSQL is added and deployment completes:

```bash
# Run migrations
npx @railway/cli run npx prisma db push

# Seed database
npx @railway/cli run npx prisma db seed
```

Or use Railway's web shell:
1. Go to Railway dashboard → Your service
2. Click **"Shell"** tab
3. Run:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

### 5. Configure Stripe Webhook

1. Get your Railway URL (from step 3)
2. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
3. Click **"Add endpoint"**
4. Enter: `https://your-app.railway.app/api/stripe/webhook`
5. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `invoice.paid`
   - `charge.refunded`
6. Copy the webhook signing secret
7. Update in Railway: `STRIPE_WEBHOOK_SECRET`

### 6. Test Your Deployment

1. Visit your Railway URL
2. Login at: `/login`
3. Create a test link
4. Test the link redirect

---

## Monitor Deployment

**View Logs:**
```bash
npx @railway/cli logs
```

**Or in Dashboard:**
- Go to your service
- Click **"Deployments"** → Latest deployment
- View build logs

---

## Quick Commands Reference

```bash
# View project status
npx @railway/cli status

# View logs
npx @railway/cli logs

# View environment variables
npx @railway/cli variables

# Get public URL
npx @railway/cli domain

# Run commands in Railway
npx @railway/cli run <command>

# Open shell
npx @railway/cli shell
```

---

## ✅ Checklist

- [x] Project created
- [ ] PostgreSQL database added
- [ ] Environment variables set
- [ ] Public URL generated
- [ ] Database schema pushed
- [ ] Database seeded
- [ ] Stripe webhook configured
- [ ] Tested deployment

---

## Need Help?

- **Railway Dashboard**: https://railway.com/project/f5baafe1-75dc-4ad6-85fa-49d3bc6e33ee
- **Railway Docs**: https://docs.railway.app
- **View Logs**: Check Railway dashboard or run `npx @railway/cli logs`

---

**Your project is deploying!** 🚂

Check the Railway dashboard to monitor progress and complete the setup steps above.

