# 💳 Stripe Setup Options

## Two Ways to Connect Stripe

### Option 1: Manual Webhook Secret (EASIEST - No Setup Needed!) ✅

**What clients do:**
1. Go to their Stripe Dashboard → Webhooks
2. Create webhook endpoint
3. Copy webhook secret
4. Paste it in their dashboard

**What you need:**
- ✅ Nothing! No environment variables needed
- ✅ Clients do it themselves
- ✅ Works immediately

**Current implementation:** This is the default! ✅

---

### Option 2: Stripe Connect OAuth (More Automated)

**What clients do:**
1. Click "Connect Stripe" button
2. Authorize via Stripe OAuth
3. Done automatically

**What you need:**
- ⚠️ `STRIPE_CONNECT_CLIENT_ID` environment variable
- ⚠️ Enable Stripe Connect in Stripe Dashboard
- ⚠️ Set redirect URI

**When to use:** If you want fully automated connection (but requires setup)

---

## Current Setup: Manual Webhook Secret (Recommended)

**Why this is better:**
- ✅ Zero setup for you
- ✅ Clients have full control
- ✅ No OAuth complexity
- ✅ Works immediately
- ✅ No environment variables needed

**How it works:**
1. Client creates webhook in their Stripe Dashboard
2. Client copies webhook secret
3. Client pastes it in their dashboard
4. Done! Sales tracking active

---

## Switching Between Options

### Use Manual (Current - Recommended):
Already set up! Clients paste webhook secret.

### Use OAuth:
1. Uncomment OAuth component in `app/client/dashboard/page.tsx`
2. Comment out `StripeConnectManual`
3. Add `STRIPE_CONNECT_CLIENT_ID` to environment variables
4. Enable Stripe Connect in Stripe Dashboard

---

## Recommendation

**Use Manual Webhook Secret (Option 1)** - It's:
- ✅ Simpler
- ✅ No setup needed
- ✅ Clients have control
- ✅ Works immediately
- ✅ No environment variables

**OAuth is only needed if:**
- You want fully automated connection
- You're building a marketplace
- You need to create checkout sessions for clients

For most use cases, **manual webhook secret is perfect!** ✅

---

## Client Instructions (Manual Method)

Send this to your clients:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Enter URL: `https://your-app.railway.app/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `invoice.paid`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `charge.refunded`
5. Click **"Add endpoint"**
6. Copy the **"Signing secret"** (starts with `whsec_`)
7. Paste it in your dashboard
8. Done! ✅

---

**Bottom line:** Manual webhook secret is easier and requires zero setup! The current implementation uses this method by default.

