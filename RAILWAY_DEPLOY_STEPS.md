# 🚀 Deploy Steps - Right Now!

## Current Status (from your dashboard):
✅ Postgres is **Online** and working
⚠️ `tracking-system` has **1 change** pending
❌ Previous deployment **failed** (17 hours ago)

---

## Step 1: Check What Changed

**In Railway Dashboard:**
1. Click **"Details"** button (next to "Apply 1 change")
2. See what the change is
3. This helps us understand what needs to be deployed

---

## Step 2: Push Database Schema

**Before deploying, we need to set up the database tables:**

1. Click on the **`tracking-system`** service block
2. Click **"Shell"** tab (or "Deployments" → "Shell")
3. Run this command:
   ```bash
   npx prisma db push
   ```
4. Wait for ✅ success message

**This creates all the tables (Client, Link, Click, etc.)**

---

## Step 3: Add Environment Variables

**Before deploying, add required variables:**

1. Click on **`tracking-system`** service
2. Click **"Variables"** tab
3. Add these variables:

   ```
   ADMIN_PASSWORD=your-secure-password-here
   STRIPE_SECRET_KEY=sk_test_... (your Stripe test key)
   STRIPE_WEBHOOK_SECRET=whsec_... (optional - clients add their own)
   APP_BASE_URL=https://tracking-system-production-xxxx.up.railway.app
   IP_SALT=random-secure-string-at-least-32-characters-long
   ```

**To get APP_BASE_URL:**
- Go to **Settings** tab → **Networking**
- Copy your Railway URL
- Paste it as `APP_BASE_URL`

**Note:** `DATABASE_URL` should already be set automatically ✅

---

## Step 4: Deploy!

**Now deploy the app:**

1. Go back to **Architecture** view
2. Click the **"Deploy"** button (or press `⇧+Enter`)
3. Wait for deployment to complete
4. Watch the logs in real-time

---

## Step 5: Check Deployment Status

**After deployment:**

1. Check **"Deployments"** tab to see if it succeeded
2. If it failed, check **"Logs"** tab for errors
3. Common issues:
   - Missing environment variables → Add them in Variables tab
   - Database connection error → Check DATABASE_URL is set
   - Build errors → Check logs for specific errors

---

## Step 6: Test Your App

**Once deployed successfully:**

1. Go to **Settings** → **Networking**
2. Copy your app URL
3. Open it in a new tab
4. Go to `/login`
5. Login with your `ADMIN_PASSWORD`
6. Test creating a client and generating links

---

## Quick Troubleshooting

**If deployment fails again:**

1. **Check Logs tab** - Look for error messages
2. **Common fixes:**
   - Missing `DATABASE_URL` → Should be auto-set, but check Variables tab
   - Missing `ADMIN_PASSWORD` → Add it in Variables tab
   - Prisma errors → Run `npx prisma generate` in Shell, then redeploy
   - Build errors → Check that all dependencies are in `package.json`

**If you see database errors:**
- Make sure you ran `npx prisma db push` in Step 2
- Check that Postgres service is still Online

---

## Next Steps After Successful Deployment

1. ✅ Test admin dashboard (`/admin`)
2. ✅ Create your first client (`/admin/settings`)
3. ✅ Generate client token
4. ✅ Test client onboarding (`/client/get-started`)
5. ✅ Start tracking! 🎉

---

**Let's do it!** 🚀
