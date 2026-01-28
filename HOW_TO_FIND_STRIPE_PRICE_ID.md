# How to Find Your Stripe Price ID (Live Mode)

## Quick Steps

### Step 1: Go to Stripe Dashboard
1. Visit: https://dashboard.stripe.com
2. **Make sure you're in LIVE MODE** (toggle in top right should say "Live mode" not "Test mode")
   - If it says "Test mode", click it to switch to "Live mode"

### Step 2: Navigate to Products
1. In the left sidebar, click **"Products"**
2. Or go directly to: https://dashboard.stripe.com/products

### Step 3: Find Your Product
1. You'll see a list of all your products
2. Click on the product you want to use (e.g., your subscription product)

### Step 4: Find the Price ID
1. On the product page, scroll down to the **"Pricing"** section
2. You'll see your prices listed
3. Each price has a **Price ID** that looks like: `price_1ABC123xyz...`
4. **Copy this Price ID** - this is what you need!

## Visual Guide

```
Stripe Dashboard
├── Products (left sidebar)
│   └── Click your product
│       └── Pricing section
│           └── Price ID: price_1ABC123xyz...
```

## Important Notes

### Test Mode vs Live Mode
- **Test Mode Price IDs**: Start with `price_` but are from test mode (use test cards)
- **Live Mode Price IDs**: Also start with `price_` but are from live mode (real charges)

**How to tell the difference:**
- Check the toggle in top right of Stripe Dashboard
- If it says "Test mode" → prices are for testing
- If it says "Live mode" → prices are for real money

### If You Don't Have a Product Yet

1. **Create a Product:**
   - Go to Products → Click "Add product"
   - Enter product name (e.g., "Monthly Subscription")
   - Set price (e.g., $29.99/month)
   - Click "Save product"

2. **Get the Price ID:**
   - After creating, you'll see the Price ID on the product page
   - Copy it!

## Example Price IDs

- ✅ **Live Mode**: `price_1ABC123def456GHI789jkl012MNO345`
- ✅ **Test Mode**: `price_1XYZ789abc012DEF345ghi678JKL901`

Both look similar, but the difference is:
- Which mode you're in when you copy it
- Live mode = real money
- Test mode = fake/test money

## Quick Checklist

- [ ] Logged into Stripe Dashboard
- [ ] Switched to **Live mode** (top right toggle)
- [ ] Navigated to Products
- [ ] Selected your product
- [ ] Found Price ID in Pricing section
- [ ] Copied the Price ID (starts with `price_`)

## Troubleshooting

### "I don't see any products"
- You may need to create one first
- Go to Products → Add product

### "I only see test mode prices"
- Make sure you've switched to Live mode (top right toggle)
- Live mode products/prices are separate from test mode

### "The price ID doesn't work"
- Double-check you copied the entire ID (they're long!)
- Make sure you're using a live mode price ID for live mode checkout
- Make sure your Stripe API keys are for live mode

## Need Help?

If you're still having trouble:
1. Check Stripe's official docs: https://stripe.com/docs/products-prices/overview
2. Make sure your Stripe account is activated for live mode
3. Verify you have the correct permissions to view products

