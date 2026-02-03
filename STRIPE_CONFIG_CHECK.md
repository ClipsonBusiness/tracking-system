# How to Check if Clients Added Stripe Configuration

## Quick Answer

**To check if your clients added Stripe configuration:**

1. Go to **Admin Dashboard** → **Clients**
2. Click on a client
3. Check if they have:
   - ✅ **Stripe Webhook Secret** (starts with `whsec_`)
   - ✅ **Stripe Account ID** (optional, starts with `acct_`)

Or check the **Client Setup** page - if they completed setup, they should have added it there.

---

## What Clients Need to Add

### Required: Stripe Webhook Secret

1. **Client goes to Stripe Dashboard** → Webhooks
2. **Adds endpoint**: `https://clipsonaffiliates.com/api/stripe/webhook`
3. **Selects events**:
   - `invoice.paid` (most important)
   - `checkout.session.completed`
4. **Copies signing secret** (starts with `whsec_`)
5. **Adds it in the client setup form**

### Optional: Stripe Account ID

- Only needed if using Stripe Connect
- Usually auto-detected
- Starts with `acct_`

---

## How Revenue Tracking Works Per Link

### ✅ Yes, Total Revenue Works Through Each Link!

**The system tracks revenue per link:**

1. **Click Tracking**: When someone clicks `lowbackability.com/?ref=xxxxx`
   - System stores the click with `linkId`
   - Stores `link_slug` in cookie

2. **Purchase**: Customer buys on client's site
   - Stripe processes payment
   - Sends webhook: `invoice.paid`

3. **Attribution**: System matches sale to link
   - **Method 1**: Uses `link_slug` from Stripe metadata (best)
   - **Method 2**: Uses most recent click within 60 days (fallback)

4. **Revenue Tracking**: Conversion created with:
   - `linkId` - Which link generated the sale
   - `amountPaid` - Revenue amount
   - Linked to the clipper who owns that link

5. **Clipper Dashboard**: Shows total revenue
   - Sums all conversions for their links
   - Formula: `SUM(conversions WHERE link.clipperId = clipper.id)`

---

## Current Status

### ✅ What's Working:
- **Link clicks work** for `lowbackability.com` ✅
- **JavaScript redirect** is working ✅
- **Click tracking** is functional ✅

### ⚠️ What to Check:
- **Stripe webhook secret** - Client needs to add this
- **Webhook endpoint** - Client needs to configure in Stripe
- **Revenue tracking** - Will work once Stripe is configured

---

## How to Verify Stripe is Configured

### Option 1: Check Admin Dashboard
1. Go to `/admin/clients`
2. Click on client (e.g., "Low Back Ability")
3. Look for "Stripe Webhook Secret" field
4. If it shows a value starting with `whsec_`, it's configured ✅

### Option 2: Check Client Setup Form
1. Get client setup link from admin dashboard
2. Visit the setup page
3. Check if "Stripe Webhook Secret" field is filled

### Option 3: Test a Purchase
1. Click a tracking link
2. Make a test purchase
3. Check clipper dashboard for revenue
4. If revenue appears, Stripe is working ✅

---

## Revenue Tracking Flow

```
Customer clicks: lowbackability.com/?ref=xxxxx
         ↓
System stores click with linkId
         ↓
Customer purchases on client's site
         ↓
Stripe sends webhook: invoice.paid
         ↓
System finds link by:
  - link_slug in metadata (best)
  - OR most recent click (fallback)
         ↓
Conversion created with linkId + amountPaid
         ↓
Clipper dashboard shows revenue for that link ✅
```

---

## Troubleshooting

### ❌ Revenue Not Showing?

1. **Check Stripe Webhook Secret**:
   - Must be added in client setup
   - Should start with `whsec_`

2. **Check Webhook Events**:
   - Must have `invoice.paid` selected
   - Check Stripe Dashboard → Webhooks

3. **Check Link Attribution**:
   - System tries to match sales to links
   - Uses metadata first, then most recent click

4. **Test with Real Purchase**:
   - Make a test purchase
   - Check if conversion appears in database

---

## Summary

✅ **Link clicks work** - Confirmed for `lowbackability.com`

✅ **Revenue tracking works per link** - System tracks:
- Each link's revenue separately
- Total revenue per clipper
- Attribution via metadata or recent clicks

⚠️ **To enable revenue tracking**:
- Client must add Stripe webhook secret
- Client must configure webhook endpoint
- Optional: Pass `link_slug` in checkout metadata (recommended)

---

## Next Steps

1. **Check if client added Stripe webhook secret**:
   - Go to Admin → Clients → View client details

2. **If not added, send them setup link**:
   - They can add it in the client setup form

3. **Test revenue tracking**:
   - Make a test purchase
   - Check clipper dashboard for revenue

4. **For best accuracy**:
   - Ask client to pass `link_slug` in Stripe checkout metadata
