# 🚂 Railway Dashboard - Step by Step

You're in the Railway dashboard! Follow these steps:

## Step 1: Find Your App Service

In the Railway dashboard, you should see:
- **Postgres** service (the database) ✅ Already added
- **Your app service** (might be named "tracking-system" or similar)

**If you don't see your app service:**
- Look for a service with your code (it should be deploying)
- Or check if there's a deployment in progress

---

## Step 2: Add Environment Variables

1. **Click on your APP service** (not the Postgres service)
2. Click the **"Variables"** tab
3. Click **"+ New Variable"** for each of these:

   ```
   Variable Name: ADMIN_PASSWORD
   Value: your-secure-password-here
   ```

   ```
   Variable Name: STRIPE_SECRET_KEY
   Value: sk_test_... (or sk_live_...)
   ```

   ```
   Variable Name: STRIPE_WEBHOOK_SECRET
   Value: whsec_... (get from Stripe dashboard)
   ```

   ```
   Variable Name: IP_SALT
   Value: any-random-string-at-least-32-characters-long
   ```

**Important:** `DATABASE_URL` is automatically set by Railway - you don't need to add it!

---

## Step 3: Get Your Public URL

1. Still in your **APP service**
2. Click the **"Settings"** tab
3. Scroll down to **"Networking"** section
4. Click **"Generate Domain"** button
5. Copy the URL (looks like: `https://tracking-system-production-xxxx.up.railway.app`)

6. Go back to **"Variables"** tab
7. Add one more variable:

   ```
   Variable Name: APP_BASE_URL
   Value: https://your-copied-url-here.railway.app
   ```

---

## Step 4: Wait for Deployment to Complete

1. Click the **"Deployments"** tab
2. Watch the latest deployment
3. Wait until it says **"Deployed"** or **"Active"** (green checkmark)
4. If it fails, check the logs for errors

---

## Step 5: Setup Database Schema

After deployment is complete:

### Option A: Using Railway Web Shell (Easiest)

1. In your **APP service**, click the **"Shell"** tab
2. Run these commands one by one:

   ```bash
   npx prisma db push
   ```

   Wait for it to complete, then:

   ```bash
   npx prisma db seed
   ```

### Option B: Using Railway CLI

In your terminal (on your computer):

```bash
cd "/Users/tomastomasson/Tracking system"
npx @railway/cli run npx prisma db push
npx @railway/cli run npx prisma db seed
```

---

## Step 6: Test Your App

1. Go back to **"Settings"** → **"Networking"**
2. Copy your public URL
3. Open it in a new browser tab
4. You should see your app!
5. Try logging in at: `https://your-url.railway.app/login`

---

## Step 7: Configure Stripe Webhook (If Using Stripe)

1. Copy your app URL from Step 3
2. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
3. Click **"Add endpoint"**
4. Enter: `https://your-app-url.railway.app/api/stripe/webhook`
5. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `invoice.paid`
   - `charge.refunded`
6. Click **"Add endpoint"**
7. Copy the **"Signing secret"** (starts with `whsec_`)
8. Go back to Railway → Your app service → Variables
9. Update `STRIPE_WEBHOOK_SECRET` with the secret you copied

---

## ✅ Checklist

- [ ] Found your app service in Railway
- [ ] Added `ADMIN_PASSWORD` variable
- [ ] Added `STRIPE_SECRET_KEY` variable
- [ ] Added `STRIPE_WEBHOOK_SECRET` variable
- [ ] Added `IP_SALT` variable
- [ ] Generated public domain
- [ ] Added `APP_BASE_URL` variable
- [ ] Deployment completed successfully
- [ ] Ran `npx prisma db push`
- [ ] Ran `npx prisma db seed`
- [ ] Tested app in browser
- [ ] Configured Stripe webhook (if needed)

---

## 🆘 Troubleshooting

**Can't find app service?**
- Check if there's a deployment in progress
- Look for any service that's not "Postgres"
- Check the "Deployments" tab

**Deployment failed?**
- Click on the failed deployment
- Check the logs for errors
- Common issues:
  - Missing environment variables
  - Build errors
  - Database connection issues

**Database connection error?**
- Make sure Postgres service is running (green status)
- Verify `DATABASE_URL` is automatically set (check Variables tab)
- Try redeploying after adding all variables

**App not loading?**
- Check if deployment is complete
- Verify `APP_BASE_URL` is set correctly
- Check logs in Railway dashboard

---

## 📞 Need Help?

- **Railway Docs**: https://docs.railway.app
- **View Logs**: Click on your service → Deployments → Latest → View Logs
- **Railway Status**: Check Railway status page if having issues

---

**You're doing great!** Follow these steps and your app will be live! 🚀
