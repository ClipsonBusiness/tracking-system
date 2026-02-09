# Client Workflow Guide

## How to Set Up Tracking Links for Your Clients

### Step 1: Create a Client

1. Go to **Admin → Settings**
2. You'll see your default client (or create new ones via database)
3. Optionally set a custom domain if the client owns one

### Step 2: Create Tracking Links

1. Go to **Admin → Links**
2. Paste the destination URL (e.g., `https://lowbackability.com/signup`)
3. Select the client
4. Click "Create Link"
5. System auto-generates a short code (e.g., `fhkeo`)

**Result**: You get a tracking link like:
- `https://yourdomain.com/fhkeo` (if custom domain set)
- `https://your-app.vercel.app/fhkeo` (if using deployment domain)

### Step 3: Create Affiliates

1. Go to **Admin → Affiliates**
2. Create affiliate with code (e.g., `AFF001`)
3. Set payout percentage if needed
4. Click "Show" to see share link format

### Step 4: Generate Share Links for Affiliates

**Option A: Manual Share Links**
- Base link: `https://yourdomain.com/fhkeo`
- With affiliate: `https://yourdomain.com/fhkeo?aff=AFF001`
- Share this with the affiliate

**Option B: Use Link-in-Bio Pages**
- Create links with same handle (e.g., `demo`)
- Share: `https://yourdomain.com/p/demo`
- Affiliates can add `?aff=AFF001` to the page URL

### Step 5: Share with Clients/Affiliates

**For Clients:**
- Give them the base tracking link: `https://yourdomain.com/fhkeo`
- They can use it in emails, social media, ads, etc.
- All clicks are tracked automatically

**For Affiliates:**
- Give them the affiliate link: `https://yourdomain.com/fhkeo?aff=AFF001`
- They share this link
- Clicks are attributed to them (via query param or cookie)

### Step 6: Track Performance

1. Go to **Admin → Statistics**
2. View:
   - Total clicks
   - Clicks by link
   - Clicks by country
   - Revenue by affiliate (from Stripe conversions)

## Best Practices

### For Multiple Clients

1. **Create separate clients** for each business/client
2. **Set custom domains** if clients own domains
3. **Use handles** to group links (e.g., all "summer-campaign" links)

### For Affiliate Programs

1. **Create unique affiliate codes** per affiliate
2. **Share links with `?aff=CODE`** parameter
3. **Monitor in Analytics** to see which affiliates drive revenue
4. **Use Stripe checkout** with affiliate codes for revenue attribution

### Link Organization

- **Use handles** to group related links (e.g., `email-campaign`, `social-media`)
- **Create link-in-bio pages** by grouping links with same handle
- **Track campaigns** using UTM parameters: `?utm_source=email&utm_campaign=summer`

## Client Use Cases

### Use Case 1: Email Campaigns
1. Create link for landing page
2. Use in email: `https://yourdomain.com/fhkeo`
3. Track opens/clicks in Analytics

### Use Case 2: Social Media
1. Create link for product page
2. Post: `https://yourdomain.com/fhkeo`
3. Track engagement by source

### Use Case 3: Affiliate Program
1. Create link for signup page
2. Give affiliates: `https://yourdomain.com/fhkeo?aff=THEIRCODE`
3. Track conversions and payouts

### Use Case 4: Paid Ads
1. Create link with UTM params: `https://yourdomain.com/fhkeo?utm_source=google&utm_campaign=summer`
2. Use in Google Ads, Facebook Ads, etc.
3. Track ROI by campaign

## Integration with Stripe

### For Revenue Tracking

1. **Create checkout session** using `/api/stripe/create-checkout-session`
2. **Pass affiliate code** in the request
3. **Webhook processes** `invoice.paid` events
4. **Revenue attributed** to affiliate in Analytics

### Example API Call

```javascript
const response = await fetch('/api/stripe/create-checkout-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    priceId: 'price_1234567890',
    affiliateCode: 'AFF001', // From tracking link
    successUrl: 'https://yourdomain.com/success',
    cancelUrl: 'https://yourdomain.com/cancel'
  })
})
```

## Quick Reference

**Create Link**: Admin → Links → Paste URL → Create
**Create Affiliate**: Admin → Affiliates → Add Code → Show Share Link
**View Analytics**: Admin → Statistics
**Configure Domain**: Admin → Settings → Set Custom Domain
