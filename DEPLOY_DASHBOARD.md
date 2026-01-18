# 🚀 Deploy via Railway Dashboard (Right Now!)

## Current Status
✅ Logged in as: clipsonbusiness@gmail.com
✅ Project: tracking-system
✅ Postgres service exists

---

## Step 1: Open Railway Dashboard

**Go to:** https://railway.app/project

**Or direct link to your project:**
https://railway.app/project/tracking-system

---

## Step 2: Check Your Services

You should see:
- ✅ **Postgres** service (database)
- ❓ **App/Web** service (your Next.js app)

**If you DON'T have an App service:**
1. Click **"+ New"** button
2. Select **"GitHub Repo"** (if you have GitHub connected)
   - OR select **"Empty Project"** then **"Deploy from GitHub"**
3. Choose your repository
4. Railway will auto-detect Next.js ✅

**If you DO have an App service:**
- Click on it to continue

---

## Step 3: Push Database Schema

**In Railway Dashboard:**

1. Click on your **APP service** (not Postgres)
2. Click **"Shell"** tab (or "Deployments" → "Shell")
3. In the terminal, run:
   ```bash
   npx prisma db push
   ```
4. Wait for ✅ success message

**Alternative (if Shell doesn't work):**
- Go to **Postgres** service
- Click **"Data"** tab
- Use the built-in SQL editor (but `prisma db push` is easier)

---

## Step 4: Add Environment Variables

**In Railway Dashboard:**

1. Click on your **APP service**
2. Click **"Variables"** tab
3. Add these variables:

   ```
   ADMIN_PASSWORD=your-secure-password-here
   STRIPE_SECRET_KEY=sk_test_... (your Stripe key)
   STRIPE_WEBHOOK_SECRET=whsec_... (optional - clients add their own)
   APP_BASE_URL=https://your-app.railway.app (get from Settings → Networking)
   IP_SALT=random-secure-string-at-least-32-characters
   ```

**Note:** `DATABASE_URL` is automatically set by Railway ✅

**To get APP_BASE_URL:**
1. Go to **APP service** → **Settings** tab
2. Scroll to **"Networking"**
3. Click **"Generate Domain"** (if not already done)
4. Copy the URL (e.g., `https://tracking-system-production-xxxx.up.railway.app`)
5. Paste it as `APP_BASE_URL`

---

## Step 5: Deploy

**If connected to GitHub:**
- Just push to your repo:
  ```bash
  git add .
  git commit -m "Deploy to Railway"
  git push
  ```
- Railway will auto-deploy! ✅

**If NOT connected to GitHub:**
1. In Railway Dashboard → **APP service**
2. Click **"Settings"** tab
3. Scroll to **"Source"**
4. Click **"Connect GitHub"**
5. Select your repository
6. Railway will deploy automatically ✅

---

## Step 6: Test Your Deployment

1. Wait for deployment to complete (check **"Deployments"** tab)
2. Click on your app URL (from Settings → Networking)
3. Go to `/login`
4. Login with your `ADMIN_PASSWORD`
5. Create a test client
6. Generate token
7. Test client dashboard

---

## Step 7: Create Your First Client

1. Go to `/admin/settings`
2. You should see "Default Client" or create a new one
3. Click **"Generate Token"**
4. Copy the **"Get Started URL"**
5. Open it in a new tab to test the client onboarding

---

## ✅ You're Live!

Your tracking system is now deployed and ready to use! 🎉

---

## Quick Troubleshooting

**Database errors?**
- Make sure Postgres service is running
- Check that `DATABASE_URL` is set (should be automatic)
- Run `npx prisma db push` in the Shell tab

**App not loading?**
- Check deployment status in "Deployments" tab
- View logs in "Logs" tab
- Verify all environment variables are set

**Can't find Shell tab?**
- Make sure you're in the APP service (not Postgres)
- Try "Deployments" → "Shell" or "Settings" → "Shell"

---

## Next Steps

1. ✅ Test admin dashboard
2. ✅ Create your first client
3. ✅ Generate client token
4. ✅ Test client onboarding flow
5. ✅ Start tracking! 🚀

---

**Ready? Let's go!** 🚀

