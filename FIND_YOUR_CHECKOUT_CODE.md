# How to Find Your Stripe Checkout Code

## Where to Look

The code needs to be added to **your website's backend**, not in Stripe Dashboard. Here's where to find it:

---

## Step 1: Identify Your Website Platform

### Option A: Custom Website / Next.js / React
- Look for files like:
  - `app/api/create-checkout/route.ts` (Next.js App Router)
  - `pages/api/create-checkout.ts` (Next.js Pages Router)
  - `api/create-checkout.js` (Serverless function)
  - `routes/checkout.js` (Express.js)
  - `server/routes/checkout.ts` (Custom backend)

### Option B: WordPress
- Look for:
  - Custom plugin files
  - Theme functions.php
  - Custom post type handlers
  - WooCommerce hooks (if using WooCommerce)

### Option C: Shopify
- Look for:
  - Theme code → `checkout.liquid`
  - App extensions
  - Custom checkout scripts

### Option D: Webflow / Squarespace / Wix
- These platforms typically require:
  - Custom code injection
  - Third-party integrations
  - API calls to your backend

---

## Step 2: Search for Stripe Checkout Code

Search your codebase for these keywords:

```bash
# Search for Stripe checkout session creation
grep -r "checkout.sessions.create" .
grep -r "stripe.checkout" .
grep -r "createCheckoutSession" .
```

Look for code that looks like this:

```javascript
stripe.checkout.sessions.create({
  line_items: [...],
  mode: 'payment',
  // ...
})
```

---

## Step 3: Common Locations

### If Using Next.js:

**File:** `app/api/create-checkout/route.ts` or `pages/api/create-checkout.ts`

```typescript
import Stripe from 'stripe';

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  
  // YOUR CODE IS HERE - add the cookie reading and metadata
  const session = await stripe.checkout.sessions.create({
    // ... existing code ...
  });
}
```

### If Using Express.js:

**File:** `routes/checkout.js` or `server/routes/checkout.js`

```javascript
router.post('/create-checkout', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    // YOUR CODE IS HERE - add the cookie reading and metadata
  });
});
```

### If Using Serverless Functions:

**File:** `api/create-checkout.js` or `functions/create-checkout.js`

```javascript
exports.handler = async (event) => {
  const session = await stripe.checkout.sessions.create({
    // YOUR CODE IS HERE - add the cookie reading and metadata
  });
};
```

---

## Step 4: What to Add

Once you find your checkout code, add this:

### 1. Add Cookie Reading Function (at the top of your file):

```javascript
function getAffiliateId(req) {
  const cookies = req.headers.cookie || req.headers.get('cookie') || '';
  const cookie = cookies
    .split('; ')
    .find(row => row.startsWith('ca_affiliate_id='));
  return cookie ? decodeURIComponent(cookie.split('=')[1]) : '';
}
```

### 2. Read the Cookie (before creating checkout session):

```javascript
const affiliateId = getAffiliateId(req); // or request, depending on your framework
```

### 3. Add to Checkout Session:

```javascript
const session = await stripe.checkout.sessions.create({
  // ... your existing code ...
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

---

## Step 5: If You Can't Find the Code

### Option 1: Check Your Frontend Code

Sometimes checkout is initiated from the frontend. Look for:

```javascript
// Frontend code that calls your backend
fetch('/api/create-checkout', {
  method: 'POST',
  body: JSON.stringify({ priceId: '...' })
})
```

Then find the backend endpoint it's calling.

### Option 2: Check Your Hosting Platform

- **Vercel:** Check Functions tab → Look for API routes
- **Netlify:** Check Functions folder → Look for serverless functions
- **Railway:** Check your deployed code → Look for API routes
- **Heroku:** Check your codebase → Look for API endpoints

### Option 3: Check Stripe Dashboard → Developers → Logs

1. Go to Stripe Dashboard → Developers → Logs
2. Look for recent checkout session creations
3. Check the "Request" tab to see what metadata is being sent
4. This will help you identify which endpoint is creating checkouts

---

## Step 6: Test After Adding Code

1. **Visit affiliate link:** `https://clipsonexclusive.com/?ref=hancn`
2. **Go through checkout**
3. **Check Stripe Dashboard:**
   - Go to Payments → [Your Payment]
   - Click on the payment
   - Scroll to "Metadata" section
   - Should see: `ca_affiliate_id: hancn`

---

## Still Can't Find It?

If you're using a third-party service or platform that handles checkout:

1. **Check if you have API access** to modify checkout
2. **Look for webhook handlers** - you might need to add metadata there
3. **Contact your developer** - they'll know where the checkout code is
4. **Check documentation** for your platform/framework

---

## Quick Checklist

- [ ] Found where checkout sessions are created
- [ ] Added cookie reading function
- [ ] Added `metadata.ca_affiliate_id` to checkout session
- [ ] Added `subscription_data.metadata.ca_affiliate_id` (if using subscriptions)
- [ ] Tested with affiliate link
- [ ] Verified metadata appears in Stripe Dashboard
