# Fix: Wrong Stripe Key Format

## The Problem

You added `mk_1SjqJyLDafoVnYRak5EVAmu` but this is **NOT** a Stripe secret key!

## Stripe Key Types

### ✅ Secret Keys (What you need)
- **Format**: `sk_live_...` or `sk_test_...`
- **Location**: Stripe Dashboard → Developers → API keys → **Secret key**
- **Used for**: Server-side API calls (creating checkouts, etc.)

### ❌ Publishable Keys (NOT what you need)
- **Format**: `pk_live_...` or `pk_test_...`
- **Location**: Stripe Dashboard → Developers → API keys → **Publishable key**
- **Used for**: Client-side (browser) code only

### ❌ Other Keys
- `mk_...` - Not a valid Stripe secret key format
- `rk_...` - Restricted keys (not what you need)

## How to Get the Correct Key

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com
2. **Switch to LIVE MODE** (top right toggle)
3. **Go to**: Developers → API keys
4. **Find**: "Secret key" section (NOT "Publishable key")
5. **Copy**: The key that starts with `sk_live_...`
   - It will look like: `sk_live_51ABC123xyz...`
   - It's long (usually 100+ characters)

## Update in Vercel

1. Go to: Vercel Dashboard → Your Project → Settings → Environment Variables
2. Find `STRIPE_SECRET_KEY`
3. Click the `...` menu → "Edit"
4. Replace the value with your `sk_live_...` key
5. Save
6. Redeploy

## Verify It's Correct

After updating, the value should:
- ✅ Start with `sk_live_` (for live mode)
- ✅ Be very long (100+ characters)
- ✅ NOT start with `mk_`, `pk_`, or `rk_`

## Quick Checklist

- [ ] In Stripe Dashboard → Live Mode
- [ ] Developers → API keys
- [ ] Copy "Secret key" (not "Publishable key")
- [ ] Key starts with `sk_live_...`
- [ ] Update in Vercel
- [ ] Redeploy
- [ ] Test checkout again

