# 📋 Step-by-Step: What You Need to Do

## ✅ What's Already Working

**Click Tracking:** ✅ **FIXED AND WORKING**
- Link clicks are now being tracked automatically
- When someone visits `clipsonexclusive.com/?ref=hancn`, the click is recorded
- No additional action needed for click tracking

## ⚠️ What Still Needs to Be Done

**Sales Tracking:** ⚠️ **REQUIRES CLIENT ACTION**

Sales tracking will work once the client adds code to their Stripe checkout. Here's what needs to happen:

---

## Step-by-Step Instructions for Sales Tracking

### Step 1: Verify Click Tracking is Working ✅

1. Visit: `https://clipsonexclusive.com/?ref=hancn`
2. Check the clipper dashboard - you should see clicks being recorded
3. ✅ **If clicks appear:** Click tracking is working!

### Step 2: Ensure Stripe Webhook is Configured ✅

1. Go to Stripe Dashboard → Webhooks
2. Verify endpoint exists: `https://www.clipsonaffiliates.com/api/stripe/webhook`
3. Verify events are selected:
   - ✅ `checkout.session.completed`
   - ✅ `invoice.paid` (most important for subscriptions)
   - ✅ `charge.refunded` (optional)
4. Copy the webhook signing secret (starts with `whsec_`)
5. Add it to the client setup form (Section 4B)

### Step 3: Add Code to Stripe Checkout (REQUIRED) ⚠️

**This is the critical step that makes sales tracking work.**

Your developer needs to:

1. **Read the `ca_affiliate_id` cookie** in your backend checkout code
2. **Pass it to Stripe checkout session metadata**

#### Code Example (Node.js/Express):

```javascript
// Server-side helper to read affiliate cookie
function getAffiliateId(req) {
  const cookie = req.headers.cookie
    ?.split('; ')
    .find(row => row.startsWith('ca_affiliate_id='));
  return cookie ? decodeURIComponent(cookie.split('=')[1]) : '';
}

// Inside your backend checkout endpoint
const affiliateId = getAffiliateId(req);

const session = await stripe.checkout.sessions.create({
  // ... your existing checkout config (line_items, mode, success_url, etc.) ...
  metadata: {
    ca_affiliate_id: affiliateId || '',
  },
  subscription_data: {
    metadata: {
      ca_affiliate_id: affiliateId || '',
    },
  },
});
```

#### Code Example (Next.js API Route):

```typescript
import { NextRequest } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  // Read cookie from request headers
  const cookies = request.headers.get('cookie') || '';
  const affiliateId = cookies
    .split('; ')
    .find(row => row.startsWith('ca_affiliate_id='))
    ?.split('=')[1] || '';

  const session = await stripe.checkout.sessions.create({
    // ... your existing checkout config ...
    metadata: {
      ca_affiliate_id: affiliateId,
    },
    subscription_data: {
      metadata: {
        ca_affiliate_id: affiliateId,
      },
    },
  });

  return Response.json({ sessionId: session.id });
}
```

### Step 4: Test Sales Tracking 🧪

1. **Visit an affiliate link:** `https://clipsonexclusive.com/?ref=hancn`
2. **Complete a test purchase** (use Stripe test mode)
3. **Check the clipper dashboard** - the sale should appear within a few seconds
4. **Verify revenue is tracked** - check the "Total Revenue" in the dashboard

---

## How It Works

### Click Tracking Flow:
1. User visits: `clipsonexclusive.com/?ref=hancn`
2. Script sets cookie: `ca_affiliate_id=hancn`
3. Script sends beacon: `POST /track?ref=hancn&beacon=true`
4. ✅ Click is recorded in database

### Sales Tracking Flow:
1. User visits: `clipsonexclusive.com/?ref=hancn` (cookie is set)
2. User goes to checkout
3. **Your backend reads `ca_affiliate_id` cookie**
4. **Your backend passes it to Stripe metadata**
5. User completes purchase
6. Stripe sends webhook: `invoice.paid`
7. System matches `ca_affiliate_id` to the link
8. ✅ Sale is recorded and attributed to the affiliate

---

## What Happens If You Skip Step 3?

- ✅ **Clicks will still be tracked** (working now)
- ❌ **Sales will NOT be attributed** to affiliates
- ❌ **Revenue will NOT appear** in clipper dashboards
- ❌ **Affiliates won't get credit** for sales

---

## Quick Checklist

- [ ] Click tracking is working (test with `?ref=hancn`)
- [ ] Stripe webhook is configured
- [ ] Webhook secret is added to client setup form
- [ ] Developer has added code to read `ca_affiliate_id` cookie
- [ ] Developer has added code to pass it to Stripe checkout metadata
- [ ] Test purchase completed successfully
- [ ] Sale appears in clipper dashboard

---

## Need Help?

If sales aren't tracking after adding the code:

1. **Check Stripe webhook logs** - verify events are being received
2. **Check server logs** - look for `ca_affiliate_id` in webhook handler
3. **Verify cookie exists** - check browser DevTools → Application → Cookies
4. **Test with direct link** - visit `clipsonexclusive.com/?ref=hancn` before checkout
