# Webhook Troubleshooting Guide

## Problem: Checkout Completes But No Conversions Appear

This means Stripe webhooks aren't reaching your server. Here's how to fix it:

---

## Step 1: Check Webhook Configuration in Stripe

1. **Go to Stripe Dashboard** (Test mode): https://dashboard.stripe.com/test/webhooks
2. **Check if webhook exists:**
   - Look for: `https://tracking-system-production-d23c.up.railway.app/api/stripe/webhook`
   - If it doesn't exist, create it (see Step 2)
   - If it exists, check its status

3. **Check webhook status:**
   - Click on the webhook endpoint
   - Look at "Recent events" - do you see any `invoice.paid` events?
   - If events show "Failed" or "No events", the webhook isn't working

---

## Step 2: Create Webhook in Stripe (If Missing)

1. **Go to:** https://dashboard.stripe.com/test/webhooks
2. **Click:** "Add endpoint"
3. **Enter endpoint URL:**
   ```
   https://tracking-system-production-d23c.up.railway.app/api/stripe/webhook
   ```
4. **Select events to listen to:**
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `invoice.paid` (MOST IMPORTANT - this creates conversions!)
   - ✅ `charge.refunded`

5. **Click:** "Add endpoint"
6. **Copy the webhook signing secret:**
   - It starts with `whsec_`
   - Example: `whsec_1234567890abcdef...`

---

## Step 3: Add Webhook Secret to Railway

1. **Go to Railway Dashboard:** https://railway.app
2. **Select your project** → **Your app service** → **Variables tab**
3. **Add or update:**
   ```
   Variable Name: STRIPE_WEBHOOK_SECRET
   Value: whsec_... (paste the secret from Step 2)
   ```
4. **Save** - Railway will auto-redeploy

---

## Step 4: Verify Webhook is Working

### Option A: Check Stripe Dashboard
1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click on your webhook endpoint
3. Look at "Recent events"
4. After completing a test checkout, you should see:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `invoice.paid` ← This creates the conversion!

### Option B: Check Railway Logs
1. Go to Railway → Your service → **Logs** tab
2. After completing a test checkout, look for:
   - `Webhook signature verification failed` (bad secret)
   - `Conversion created/updated for invoice...` (success!)
   - `Error creating conversion` (database issue)

---

## Step 5: Test Again

1. Go to: `/admin/test-stripe`
2. Create a test checkout
3. Complete payment with test card: `4242 4242 4242 4242`
4. Wait 10-30 seconds (webhooks can take a moment)
5. Click "Refresh" on "Recent Conversions"
6. You should see your conversion! ✅

---

## Common Issues

### Issue 1: "No events received yet"
**Cause:** Webhook not configured in Stripe  
**Fix:** Follow Step 2 above

### Issue 2: "Webhook signature verification failed"
**Cause:** Wrong `STRIPE_WEBHOOK_SECRET` in Railway  
**Fix:** 
- Get fresh secret from Stripe Dashboard → Webhooks → Your endpoint → "Reveal"
- Update `STRIPE_WEBHOOK_SECRET` in Railway
- Redeploy

### Issue 3: Events received but no conversions
**Cause:** Client not found or webhook handler error  
**Fix:**
- Check Railway logs for errors
- Make sure client has `stripeWebhookSecret` set
- Check that `invoice.paid` event is selected in webhook

### Issue 4: Webhook shows "Failed" in Stripe
**Cause:** Server error or wrong URL  
**Fix:**
- Check Railway logs
- Verify webhook URL is correct
- Make sure Railway service is running

---

## Quick Checklist

- [ ] Webhook created in Stripe Dashboard (Test mode)
- [ ] Webhook URL: `https://tracking-system-production-d23c.up.railway.app/api/stripe/webhook`
- [ ] Events selected: `invoice.paid`, `checkout.session.completed`, etc.
- [ ] Webhook secret copied (starts with `whsec_`)
- [ ] `STRIPE_WEBHOOK_SECRET` added to Railway Variables
- [ ] Railway service redeployed
- [ ] Test checkout completed
- [ ] Checked "Recent Stripe Events" - see `invoice.paid`?
- [ ] Checked "Recent Conversions" - see conversion?

---

## Still Not Working?

1. **Check Railway Logs:**
   - Railway → Your service → Logs
   - Look for webhook-related errors

2. **Check Stripe Webhook Logs:**
   - Stripe Dashboard → Webhooks → Your endpoint → "Recent events"
   - Click on an event to see request/response

3. **Verify Environment Variables:**
   - Railway → Variables tab
   - Make sure both are set:
     - `STRIPE_SECRET_KEY` (for creating checkouts)
     - `STRIPE_WEBHOOK_SECRET` (for receiving webhooks)

4. **Test with Stripe CLI (Local):**
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   stripe trigger invoice.paid
   ```
