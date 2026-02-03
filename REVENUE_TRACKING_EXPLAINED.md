# Revenue Tracking Per Link - How It Works

## ✅ Yes, Total Revenue Works Through Each Link!

The system tracks revenue **per link**, so each clipper can see exactly how much revenue their links generated.

---

## How Revenue Tracking Works

### 1. **Link Click Tracking** ✅
When someone clicks a tracking link:
- Click is recorded with the `linkId`
- Link slug is stored in a cookie (`link_slug`)
- This happens on `lowbackability.com/?ref=xxxxx`

### 2. **Stripe Webhook** ✅
When a customer makes a purchase:
- Stripe sends a webhook to: `https://clipsonaffiliates.com/api/stripe/webhook`
- Webhook events: `invoice.paid`, `checkout.session.completed`

### 3. **Conversion Attribution** ✅
The system attributes the sale to a specific link using:

**Method 1: Link Slug in Stripe Metadata (Best)**
- If client passes `link_slug` in Stripe checkout metadata
- Directly matches the conversion to the specific link
- **Most accurate method**

**Method 2: Most Recent Click (Fallback)**
- If no metadata, finds the most recent click within 60 days
- Attributes the sale to that link
- Works well if customers purchase shortly after clicking

### 4. **Revenue Calculation** ✅
- Each conversion stores:
  - `linkId` - Which link generated the sale
  - `amountPaid` - Revenue amount (in cents)
  - `status` - paid or refunded

### 5. **Clipper Dashboard** ✅
- Shows total revenue per clipper
- Calculated by summing all conversions linked to their links
- Formula: `SUM(conversions.amountPaid WHERE link.clipperId = clipper.id)`

---

## What Your Clients Need to Do

### ✅ Required: Stripe Webhook Configuration

1. **Go to Stripe Dashboard** → Webhooks
2. **Add endpoint**: `https://clipsonaffiliates.com/api/stripe/webhook`
3. **Select events**:
   - `invoice.paid` (most important for revenue)
   - `checkout.session.completed`
   - `charge.refunded` (optional, for refund tracking)
4. **Copy the signing secret** (starts with `whsec_`)
5. **Add it to the client setup form**

### ✅ Optional: Pass Link Slug in Checkout (Recommended)

For **best accuracy**, clients should pass the link slug in Stripe checkout:

```javascript
// In their checkout code
stripe.checkout.sessions.create({
  // ... other params
  metadata: {
    link_slug: 'xxxxx', // The tracking link slug
  },
})
```

**Or** if using Stripe Checkout links, add metadata:
- In Stripe Dashboard → Products → Checkout links
- Add metadata: `link_slug` = `xxxxx`

---

## Current Status Check

Run this to check if clients have Stripe configured:

```bash
node scripts/check-stripe-config.js
```

This will show:
- ✅ Which clients have Stripe webhook secrets
- ✅ Which clients have custom domains
- ✅ Total conversions and revenue
- ✅ Link attribution rate

---

## Revenue Tracking Flow

```
1. Customer clicks: lowbackability.com/?ref=xxxxx
   ↓
2. System stores click with linkId
   ↓
3. Customer purchases on client's site
   ↓
4. Stripe sends webhook: invoice.paid
   ↓
5. System finds link by:
   - link_slug in metadata (best)
   - OR most recent click (fallback)
   ↓
6. Conversion created with linkId + amountPaid
   ↓
7. Clipper dashboard shows revenue for that link
```

---

## Testing Revenue Tracking

### Test with Real Purchase:
1. Click a tracking link: `lowbackability.com/?ref=xxxxx`
2. Make a test purchase (use Stripe test mode)
3. Check clipper dashboard - should show the revenue

### Test with $0 Purchase (100% Coupon):
- System tracks $0 conversions too
- Shows in "Total Sales" count
- Shows $0.00 in revenue (correctly)

---

## Troubleshooting

### ❌ Revenue Not Showing?

1. **Check Stripe Webhook Secret**:
   - Client must have added webhook secret
   - Run: `node scripts/check-stripe-config.js`

2. **Check Webhook Events**:
   - Must have `invoice.paid` event selected
   - Check Stripe Dashboard → Webhooks → Events

3. **Check Link Attribution**:
   - If linkId is null, attribution failed
   - Check if client passes `link_slug` in metadata
   - Or verify clicks are being recorded

4. **Check Conversion Status**:
   - Only `status: 'paid'` conversions count
   - Refunded conversions are excluded

---

## Summary

✅ **Yes, revenue tracking works per link!**

- Each link tracks its own revenue
- Clippers see total revenue from their links
- System attributes sales to specific links
- Works with or without metadata (uses fallback)

**To ensure it works:**
1. ✅ Client adds Stripe webhook secret (required)
2. ✅ Client configures webhook endpoint (required)
3. ✅ Optional: Pass `link_slug` in checkout metadata (recommended)
