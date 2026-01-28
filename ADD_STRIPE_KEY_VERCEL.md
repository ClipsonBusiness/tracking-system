# How to Add Stripe Secret Key to Vercel

## The Problem
You're getting this error:
```
"You did not provide an API key. You need to provide your API key in the Authorization header..."
```

This means `STRIPE_SECRET_KEY` is not set in your Vercel environment variables.

## Quick Fix (5 minutes)

### Step 1: Get Your Stripe Live Secret Key

1. Go to: https://dashboard.stripe.com
2. **Make sure you're in LIVE MODE** (toggle top right)
3. Go to: **Developers** → **API keys**
4. Copy your **Secret key** (starts with `sk_live_...`)
   - ⚠️ **Important**: Use LIVE mode key since you're testing with live mode!

### Step 2: Add to Vercel

1. Go to: https://vercel.com/dashboard
2. Select your project: **tracking-system** (or whatever it's named)
3. Go to: **Settings** → **Environment Variables**
4. Click **"Add New"**
5. Fill in:
   - **Name**: `STRIPE_SECRET_KEY`
   - **Value**: `sk_live_...` (paste your live secret key)
   - **Environment**: Select all (Production, Preview, Development)
6. Click **"Save"**

### Step 3: Redeploy

After adding the variable:

1. Go to **Deployments** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
   - OR
4. Make a small change and push to trigger auto-deploy

### Step 4: Test Again

1. Go back to: `https://clipsonaffiliates.com/admin/test-stripe`
2. Try creating a checkout again
3. Should work now! ✅

## Important Notes

### Live Mode vs Test Mode

- **Live Mode Key**: `sk_live_...` → Charges real money
- **Test Mode Key**: `sk_test_...` → No real charges

**Since you're testing with live mode:**
- ✅ Use `sk_live_...` key
- ✅ Use live mode price ID (`price_...` from live mode)
- ⚠️ You will be charged real money!

### Security

- ✅ Never commit `STRIPE_SECRET_KEY` to git
- ✅ Only add it in Vercel environment variables
- ✅ Keep it secret!

## Current Environment Variables Checklist

Make sure you have these in Vercel:

- [x] `DATABASE_URL` - PostgreSQL connection string
- [x] `ADMIN_PASSWORD` - Your admin password
- [x] `APP_BASE_URL` - `https://clipsonaffiliates.com`
- [x] `NEXT_PUBLIC_APP_BASE_URL` - `https://clipsonaffiliates.com`
- [x] `IP_SALT` - Random secure string
- [ ] **`STRIPE_SECRET_KEY`** - ⬅️ **ADD THIS ONE!**
- [ ] `STRIPE_WEBHOOK_SECRET` - Webhook secret (if using)

## Troubleshooting

### Still getting error after adding?
- Make sure you redeployed after adding the variable
- Check that the variable name is exactly `STRIPE_SECRET_KEY` (case-sensitive)
- Verify you copied the entire key (they're long!)

### Using wrong key?
- If testing with live mode → use `sk_live_...`
- If testing with test mode → use `sk_test_...`
- Make sure the key matches the mode you're testing in

### Can't find API keys in Stripe?
- Make sure you're logged into the correct Stripe account
- Check that you're in the right mode (Live vs Test)
- Go to: Developers → API keys (in left sidebar)

