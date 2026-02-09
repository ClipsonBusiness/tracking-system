# 💳 Stripe Setup for Sales Tracking

## Quick Answer

**It depends on who processes the payments:**

### Scenario 1: Your Clients Process Their Own Payments ✅

**What you need:**
- Access to configure webhook in **client's Stripe account**
- The webhook signing secret from **client's Stripe account**

**How it works:**
1. Client processes payments through their own Stripe account
2. You configure webhook in **their** Stripe dashboard
3. Webhook sends events to your tracking server
4. You track conversions and attribute to affiliates

**What client needs to do:**
1. Go to their Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-app.railway.app/api/stripe/webhook`
3. Select events (see below)
4. Give you the webhook signing secret (`whsec_...`)
5. You add it to Railway as `STRIPE_WEBHOOK_SECRET`

**What you need from client:**
- Webhook signing secret (`whsec_...`)
- That's it! You don't need their Stripe secret key

---

### Scenario 2: You Process Payments for Clients

**What you need:**
- Your own Stripe account
- Your Stripe secret key (`sk_live_...` or `sk_test_...`)
- Your webhook signing secret

**How it works:**
1. You create checkout sessions using your Stripe account
2. Payments go through your Stripe account
3. Webhook configured in **your** Stripe dashboard
4. You track everything in your system

**Setup:**
- Use your own `STRIPE_SECRET_KEY`
- Use your own `STRIPE_WEBHOOK_SECRET`
- Configure webhook in your Stripe dashboard

---

## Which Scenario Are You In?

### If clients have their own Stripe accounts:
- ✅ **EASIEST**: Each client configures webhook in their Stripe account
- ✅ You just need the webhook secret from each client
- ✅ No need for their Stripe secret keys
- ⚠️ **Challenge**: Multiple webhook secrets (one per client)

### If you process payments for clients:
- ✅ Single Stripe account (yours)
- ✅ Single webhook secret
- ✅ Full control
- ⚠️ You handle all payments

---

## Current System Setup

**Right now, the system uses:**
- `STRIPE_SECRET_KEY` - For creating checkout sessions (if you process payments)
- `STRIPE_WEBHOOK_SECRET` - For verifying webhook events (from whoever processes payments)

**For tracking sales, you need:**
- Webhook configured in the Stripe account that processes payments
- The webhook signing secret from that account

---

## Multi-Client Setup (Advanced)

If you have multiple clients with different Stripe accounts:

### Option 1: Separate Webhook Endpoints (Recommended)

Create separate webhook endpoints per client:
- `/api/stripe/webhook/client1`
- `/api/stripe/webhook/client2`

Each uses different `STRIPE_WEBHOOK_SECRET`

### Option 2: Single Endpoint with Client Detection

Modify webhook handler to:
1. Detect which client based on webhook data
2. Use client-specific webhook secret
3. Store in database per client

**Current system:** Uses single webhook secret (works for one Stripe account)

---

## What You Need Right Now

### For Railway Environment Variables:

**If clients process their own payments:**
```
STRIPE_SECRET_KEY=sk_test_... (your test key, or leave empty if not creating sessions)
STRIPE_WEBHOOK_SECRET=whsec_... (from CLIENT's Stripe account)
```

**If you process payments:**
```
STRIPE_SECRET_KEY=sk_live_... (your Stripe key)
STRIPE_WEBHOOK_SECRET=whsec_... (from YOUR Stripe account)
```

---

## Webhook Events Needed

In Stripe Dashboard → Webhooks → Add endpoint, select:

- ✅ `checkout.session.completed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `invoice.paid` (most important for revenue tracking)
- ✅ `charge.refunded`

---

## Step-by-Step: Client Setup

**If your client processes their own payments:**

1. **Tell your client:**
   - "I need to set up webhook tracking in your Stripe account"
   - "Go to Stripe Dashboard → Webhooks → Add endpoint"
   - "Enter: `https://your-app.railway.app/api/stripe/webhook`"
   - "Select these events: [list above]"
   - "Send me the webhook signing secret"

2. **Client does:**
   - Configures webhook in their Stripe
   - Sends you the secret (`whsec_...`)

3. **You do:**
   - Add `STRIPE_WEBHOOK_SECRET` to Railway
   - Redeploy if needed
   - Test webhook

---

## Testing Without Client Stripe

**You can test with your own Stripe test account:**

1. Create Stripe test account (free)
2. Get test webhook secret
3. Use test mode for development
4. Switch to client's live account for production

---

## Summary

**To track sales, you need:**
- ✅ Webhook configured in the Stripe account that processes payments
- ✅ Webhook signing secret from that account
- ❌ **NOT** the Stripe secret key (unless you're creating checkout sessions)

**For each client:**
- If they process payments → They configure webhook → Give you the secret
- If you process payments → You configure webhook → Use your secret

---

## Quick Decision Tree

```
Do clients have their own Stripe accounts?
├─ YES → Client configures webhook → Give you webhook secret
└─ NO → You process payments → Use your Stripe account
```

---

**Bottom line:** You need the **webhook secret** from whoever processes the payments. You don't need their Stripe secret key unless you're creating checkout sessions for them.
