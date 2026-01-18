# 🔗 Stripe Connect Setup Guide

## Overview

The automated Stripe Connect flow is now implemented! Clients can connect their Stripe accounts themselves.

---

## Setup Steps

### 1. Enable Stripe Connect

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Settings** → **Connect** → **Settings**
3. Enable **"Connect"**
4. Set redirect URI: `https://your-app.railway.app/api/stripe/connect/callback`
5. Copy your **Connect Client ID** (starts with `ca_`)

### 2. Add Environment Variable

In Railway dashboard → Your service → Variables:

```
STRIPE_CONNECT_CLIENT_ID=ca_... (your Connect Client ID)
```

### 3. Run Database Migration

```bash
npx prisma db push
```

Or in Railway:
```bash
railway run npx prisma db push
```

---

## How It Works

### For Admins

1. Go to `/admin/settings`
2. Find your client
3. Click **"Generate Token"** button
4. Copy the dashboard URL
5. Send URL to client

### For Clients

1. Client receives dashboard URL
2. Opens URL → Client dashboard
3. Clicks **"Connect Stripe"** button
4. Redirected to Stripe OAuth
5. Authorizes connection
6. Redirected back → Done! ✅

**Result:** Stripe connected, sales tracking active!

---

## Webhook Setup

**Important:** After client connects Stripe, they need to create a webhook:

1. Client goes to their Stripe Dashboard → Webhooks
2. Clicks **"Add endpoint"**
3. URL: `https://your-app.railway.app/api/stripe/webhook?account=acct_...`
   (Replace `acct_...` with their Stripe account ID)
4. Select events:
   - `checkout.session.completed`
   - `invoice.paid`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `charge.refunded`
5. Copy webhook secret
6. Update in admin dashboard (or automate this later)

**Future Enhancement:** Auto-create webhook via Stripe API (requires additional OAuth scopes)

---

## Client Dashboard Access

**Generate client access token:**
- Admin → Settings → Client → "Generate Token"
- Copy dashboard URL
- Send to client

**Client uses:**
- Opens dashboard URL
- Can connect Stripe
- View connection status

---

## Multi-Client Webhook Handling

The webhook handler now:
- Detects which client from webhook signature
- Uses client-specific webhook secret
- Routes to correct client automatically

**Webhook URL format:**
- Single client: `https://your-app.railway.app/api/stripe/webhook`
- Multi-client: `https://your-app.railway.app/api/stripe/webhook?account=acct_...`

---

## Testing

1. Generate client token in admin
2. Open client dashboard
3. Click "Connect Stripe"
4. Complete OAuth flow
5. Verify connection status
6. Create webhook in client's Stripe
7. Test with a payment

---

## Troubleshooting

**"Stripe Connect not configured"**
- Add `STRIPE_CONNECT_CLIENT_ID` to environment variables

**OAuth fails**
- Check redirect URI matches in Stripe Dashboard
- Verify `APP_BASE_URL` is correct

**Webhook not working**
- Verify webhook URL includes `?account=acct_...`
- Check webhook secret is stored in database
- Verify events are selected in Stripe

---

## Next Steps

1. ✅ Enable Stripe Connect in Stripe Dashboard
2. ✅ Add `STRIPE_CONNECT_CLIENT_ID` to Railway
3. ✅ Run database migration
4. ✅ Generate client tokens
5. ✅ Test connection flow

---

**Your automated Stripe Connect flow is ready!** 🚀

