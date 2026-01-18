# 🚀 Deploy Right Now - Step by Step

## Current Status
✅ Code is ready
✅ Database schema updated
✅ All features implemented

---

## Step 1: Push Database Schema to Railway

**In Railway Dashboard:**
1. Go to your project: https://railway.com/project/f5baafe1-75dc-4ad6-85fa-49d3bc6e33ee
2. Click on your **APP service** (not Postgres)
3. Click **"Shell"** tab
4. Run:
   ```bash
   npx prisma db push
   ```
5. Wait for it to complete ✅

**Or via CLI:**
```bash
railway run npx prisma db push
```

---

## Step 2: Add Environment Variables

**In Railway Dashboard:**
1. Go to your **APP service**
2. Click **"Variables"** tab
3. Add these (if not already added):

   ```
   ADMIN_PASSWORD=your-secure-password-here
   STRIPE_SECRET_KEY=sk_test_... (or sk_live_...)
   STRIPE_WEBHOOK_SECRET=whsec_... (optional - clients will add their own)
   APP_BASE_URL=https://your-app.railway.app (get from Railway settings)
   IP_SALT=random-string-32-chars-minimum
   ```

**Note:** `DATABASE_URL` is automatically set by Railway ✅

---

## Step 3: Get Your Public URL

**In Railway Dashboard:**
1. Go to your **APP service**
2. Click **"Settings"** tab
3. Scroll to **"Networking"**
4. Click **"Generate Domain"** (if not already done)
5. Copy your URL (e.g., `https://tracking-system-production-xxxx.up.railway.app`)

**Update APP_BASE_URL:**
1. Go back to **"Variables"** tab
2. Update `APP_BASE_URL` with your Railway URL

---

## Step 4: Seed Database (Optional)

**In Railway Shell:**
```bash
npx prisma db seed
```

Or skip this - you can create clients manually in admin dashboard.

---

## Step 5: Test Your Deployment

1. Visit your Railway URL
2. Go to `/login`
3. Login with your `ADMIN_PASSWORD`
4. Create a test client
5. Generate token for client
6. Test client dashboard

---

## Step 6: Create Your First Client

1. Go to `/admin/settings`
2. You should see "Default Client"
3. Click **"Generate Token"**
4. Copy the **"Get Started URL"**
5. Open it in a new tab to test

---

## ✅ You're Live!

Your tracking system is now deployed and ready to use!

**Next:**
- Create clients in admin dashboard
- Generate tokens and send Get Started URLs
- Clients connect Stripe themselves
- Start tracking! 🎉

---

## Quick Commands Reference

```bash
# View logs
railway logs

# Open shell
railway shell

# Run migrations
railway run npx prisma db push

# Seed database
railway run npx prisma db seed

# View variables
railway variables
```

---

## Troubleshooting

**Database errors?**
- Make sure PostgreSQL is added to your project
- Check `DATABASE_URL` is set (should be automatic)
- Run `railway run npx prisma db push`

**App not loading?**
- Check deployment status in Railway
- View logs: `railway logs`
- Verify all environment variables are set

**Webhook not working?**
- Clients need to add their own webhook secrets
- Guide them through Get Started page

---

**Let's deploy!** 🚀

