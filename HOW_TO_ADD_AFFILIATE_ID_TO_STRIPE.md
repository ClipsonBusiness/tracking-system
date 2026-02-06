# How to Add Affiliate ID to Stripe Checkout - Step by Step

## Overview

You need to read the `ca_affiliate_id` cookie (set by the tracking script) and pass it to Stripe checkout metadata. This must be done in your **backend code** (server-side), not in the browser.

---

## Step-by-Step Instructions

### Step 1: Find Your Stripe Checkout Code

Locate where you create Stripe Checkout Sessions in your codebase. This is usually:
- A backend API route (e.g., `/api/create-checkout`, `/api/checkout`)
- A server-side function that calls `stripe.checkout.sessions.create()`

### Step 2: Add Cookie Reading Function

Add this helper function to read the cookie from the request:

#### For Next.js API Routes:

```typescript
// Helper function to read affiliate cookie
function getAffiliateId(req: NextRequest): string {
  const cookies = req.headers.get('cookie') || '';
  const cookie = cookies
    .split('; ')
    .find(row => row.startsWith('ca_affiliate_id='));
  return cookie ? decodeURIComponent(cookie.split('=')[1]) : '';
}
```

#### For Express.js:

```javascript
// Helper function to read affiliate cookie
function getAffiliateId(req) {
  const cookies = req.headers.cookie || '';
  const cookie = cookies
    .split('; ')
    .find(row => row.startsWith('ca_affiliate_id='));
  return cookie ? decodeURIComponent(cookie.split('=')[1]) : '';
}
```

#### For Node.js with raw HTTP:

```javascript
// Helper function to read affiliate cookie
function getAffiliateId(headers) {
  const cookies = headers.cookie || '';
  const cookie = cookies
    .split('; ')
    .find(row => row.startsWith('ca_affiliate_id='));
  return cookie ? decodeURIComponent(cookie.split('=')[1]) : '';
}
```

### Step 3: Modify Your Stripe Checkout Code

Find your existing `stripe.checkout.sessions.create()` call and add the metadata:

#### Before (Your Current Code):

```javascript
const session = await stripe.checkout.sessions.create({
  line_items: [
    {
      price: 'price_1234567890',
      quantity: 1,
    },
  ],
  mode: 'payment',
  success_url: 'https://yoursite.com/success',
  cancel_url: 'https://yoursite.com/cancel',
});
```

#### After (With Affiliate ID):

```javascript
// Read the affiliate ID from cookie
const affiliateId = getAffiliateId(req); // Use the helper function from Step 2

const session = await stripe.checkout.sessions.create({
  line_items: [
    {
      price: 'price_1234567890',
      quantity: 1,
    },
  ],
  mode: 'payment',
  success_url: 'https://yoursite.com/success',
  cancel_url: 'https://yoursite.com/cancel',
  // ADD THIS: Pass affiliate ID to metadata
  metadata: {
    ca_affiliate_id: affiliateId || '',
  },
});
```

### Step 4: For Subscriptions (If Applicable)

If you have subscriptions, also add it to `subscription_data.metadata`:

```javascript
const affiliateId = getAffiliateId(req);

const session = await stripe.checkout.sessions.create({
  line_items: [
    {
      price: 'price_1234567890',
      quantity: 1,
    },
  ],
  mode: 'subscription', // or 'payment'
  success_url: 'https://yoursite.com/success',
  cancel_url: 'https://yoursite.com/cancel',
  metadata: {
    ca_affiliate_id: affiliateId || '',
  },
  // ADD THIS for subscriptions:
  subscription_data: {
    metadata: {
      ca_affiliate_id: affiliateId || '',
    },
  },
});
```

---

## Complete Examples by Framework

### Example 1: Next.js API Route

**File: `app/api/create-checkout/route.ts`** (or `pages/api/create-checkout.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Helper function to read affiliate cookie
function getAffiliateId(req: NextRequest): string {
  const cookies = req.headers.get('cookie') || '';
  const cookie = cookies
    .split('; ')
    .find(row => row.startsWith('ca_affiliate_id='));
  return cookie ? decodeURIComponent(cookie.split('=')[1]) : '';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { priceId } = body;

    // Read affiliate ID from cookie
    const affiliateId = getAffiliateId(request);

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.APP_URL}/success`,
      cancel_url: `${process.env.APP_URL}/cancel`,
      metadata: {
        ca_affiliate_id: affiliateId || '',
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### Example 2: Express.js Route

**File: `routes/checkout.js`** (or similar)

```javascript
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

// Helper function to read affiliate cookie
function getAffiliateId(req) {
  const cookies = req.headers.cookie || '';
  const cookie = cookies
    .split('; ')
    .find(row => row.startsWith('ca_affiliate_id='));
  return cookie ? decodeURIComponent(cookie.split('=')[1]) : '';
}

router.post('/create-checkout', async (req, res) => {
  try {
    const { priceId } = req.body;

    // Read affiliate ID from cookie
    const affiliateId = getAffiliateId(req);

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.APP_URL}/success`,
      cancel_url: `${process.env.APP_URL}/cancel`,
      metadata: {
        ca_affiliate_id: affiliateId || '',
      },
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### Example 3: Serverless Function (Vercel/Netlify)

**File: `api/create-checkout.js`**

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Helper function to read affiliate cookie
function getAffiliateId(headers) {
  const cookies = headers.cookie || '';
  const cookie = cookies
    .split('; ')
    .find(row => row.startsWith('ca_affiliate_id='));
  return cookie ? decodeURIComponent(cookie.split('=')[1]) : '';
}

exports.handler = async (event) => {
  try {
    const { priceId } = JSON.parse(event.body);

    // Read affiliate ID from cookie
    const affiliateId = getAffiliateId(event.headers);

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.APP_URL}/success`,
      cancel_url: `${process.env.APP_URL}/cancel`,
      metadata: {
        ca_affiliate_id: affiliateId || '',
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ sessionId: session.id }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
```

---

## Testing

### Step 1: Test Cookie is Set

1. Visit: `https://clipsonexclusive.com/?ref=hancn`
2. Open DevTools → Application → Cookies
3. Verify `ca_affiliate_id=hancn` exists

### Step 2: Test Checkout Includes Metadata

1. Go through checkout flow
2. Check Stripe Dashboard → Payments → [Your Payment]
3. Look at "Metadata" section
4. Should see: `ca_affiliate_id: hancn`

### Step 3: Test Sale Tracking

1. Complete a test purchase
2. Check clipper dashboard
3. Sale should appear within a few seconds

---

## Troubleshooting

### Cookie Not Being Read

**Problem:** `affiliateId` is empty

**Solutions:**
- Make sure you're reading from `req.headers.cookie` (not `req.cookies`)
- Check cookie name is exactly `ca_affiliate_id` (case-sensitive)
- Verify cookie exists in browser DevTools

### Metadata Not Appearing in Stripe

**Problem:** Metadata not showing in Stripe Dashboard

**Solutions:**
- Make sure you're passing `metadata` object (not `meta`)
- Check that `ca_affiliate_id` key is correct
- Verify you're creating a new checkout session (not using Payment Links)

### Sales Not Tracking

**Problem:** Sales not appearing in dashboard

**Solutions:**
- Verify webhook is configured (should show "✔ Stripe Configured")
- Check Stripe webhook logs for `invoice.paid` events
- Verify metadata is in checkout session (check Stripe Dashboard)
- Check server logs for webhook handler errors

---

## Quick Checklist

- [ ] Added cookie reading function
- [ ] Modified Stripe checkout code to read cookie
- [ ] Added `metadata.ca_affiliate_id` to checkout session
- [ ] Added `subscription_data.metadata.ca_affiliate_id` (if using subscriptions)
- [ ] Tested cookie exists after visiting affiliate link
- [ ] Tested checkout includes metadata in Stripe Dashboard
- [ ] Tested sale appears in clipper dashboard

---

## Need Help?

If you're stuck:
1. Check your framework's documentation for reading cookies
2. Verify the cookie name is exactly `ca_affiliate_id`
3. Test with a simple console.log to see what value you're getting
4. Check Stripe Dashboard to verify metadata is being sent
