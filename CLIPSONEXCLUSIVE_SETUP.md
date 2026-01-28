# Testing Real Money Transactions on clipsonexclusive.com

## ✅ What Needs to Be in Place

### 1. JavaScript Redirect Code (Already Set Up)
- ✅ JavaScript redirect code should be on clipsonexclusive.com
- ✅ Redirects `clipsonexclusive.com/?ref=xxxx` → tracking server
- ✅ Sets `link_slug` cookie when someone clicks

### 2. Stripe Webhook Configuration
- ✅ Stripe webhook endpoint: `https://clipsonaffiliates.com/api/stripe/webhook`
- ✅ Webhook secret configured in client settings
- ✅ Events: `invoice.paid`, `checkout.session.completed`

### 3. ⚠️ CRITICAL: Pass link_slug to Stripe Checkout

**This is the missing piece!** When someone clicks `clipsonexclusive.com/?ref=xxxx` and then goes to checkout, you need to:

1. **Read the `link_slug` cookie** in your checkout code
2. **Pass it to Stripe** in checkout session metadata

## 🔧 How to Add link_slug to Stripe Checkout

### Option A: If Using Stripe Checkout (Recommended)

In your clipsonexclusive.com checkout code, add this:

```javascript
// Read the link_slug cookie (set by tracking redirect)
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

const linkSlug = getCookie('link_slug');

// When creating Stripe checkout session
const session = await stripe.checkout.sessions.create({
  // ... your existing checkout config ...
  metadata: {
    link_slug: linkSlug || '', // Add this!
    // ... other metadata ...
  },
  subscription_data: {
    metadata: {
      link_slug: linkSlug || '', // Add this too!
    },
  },
});
```

### Option B: If Using Stripe API Directly

```javascript
// Read cookie
const linkSlug = document.cookie
  .split('; ')
  .find(row => row.startsWith('link_slug='))
  ?.split('=')[1];

// Pass to your backend API
fetch('/api/create-checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    // ... your existing params ...
    linkSlug: linkSlug, // Add this
  }),
});
```

Then in your backend, add to Stripe metadata:

```javascript
const session = await stripe.checkout.sessions.create({
  // ... existing config ...
  metadata: {
    link_slug: linkSlug || '',
  },
  subscription_data: {
    metadata: {
      link_slug: linkSlug || '',
    },
  },
});
```

## ✅ Testing Checklist

Before testing with real money:

- [ ] JavaScript redirect code is on clipsonexclusive.com
- [ ] Test link click: `clipsonexclusive.com/?ref=xxxx` redirects and sets cookie
- [ ] Stripe webhook is configured: `https://clipsonaffiliates.com/api/stripe/webhook`
- [ ] Webhook secret is saved in client settings
- [ ] **Checkout code reads `link_slug` cookie**
- [ ] **Checkout code passes `link_slug` to Stripe metadata**
- [ ] Test with a small amount first ($1 or minimum)

## 🔍 How to Verify It's Working

1. **Click a tracking link**: `clipsonexclusive.com/?ref=xxxx`
   - Should redirect to tracking server
   - Cookie `link_slug` should be set (check in browser DevTools → Application → Cookies)

2. **Go to checkout**:
   - Open browser DevTools → Network tab
   - Complete checkout
   - Check the Stripe checkout session creation request
   - Verify `metadata.link_slug` contains the slug

3. **Check webhook**:
   - After payment, check Stripe Dashboard → Webhooks → View logs
   - Should see `invoice.paid` event
   - Check the webhook payload - should have `link_slug` in metadata

4. **Check clipper dashboard**:
   - Go to clipper dashboard with the link's code
   - Should see conversion appear within a few minutes
   - Total Sales should increment
   - Total Revenue should show the amount

## 🚨 Common Issues

### Issue: Conversion not showing in dashboard
**Solution**: Check if `link_slug` is being passed to Stripe. Without it, the system tries to match by recent clicks (last 60 days), which may not work reliably.

### Issue: Wrong link attributed
**Solution**: Ensure `link_slug` cookie is set correctly and passed to Stripe metadata.

### Issue: Webhook not receiving events
**Solution**: 
- Check webhook URL is correct
- Check webhook secret matches
- Check Stripe Dashboard → Webhooks → View logs for errors

## 📝 Quick Test Script

Add this to your clipsonexclusive.com checkout page to verify cookie is set:

```javascript
// Debug: Check if link_slug cookie exists
console.log('link_slug cookie:', document.cookie
  .split('; ')
  .find(row => row.startsWith('link_slug='))
  ?.split('=')[1]);
```

If this shows `undefined`, the JavaScript redirect isn't working or the cookie isn't being set.

