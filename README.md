# Tracked Links + Affiliate Attribution for Stripe Subscriptions

An MVP tracking system for managing short links, affiliate attribution, and Stripe subscription revenue tracking.

## Features

- **Tracked Short Links**: Create short links that capture click analytics (timestamp, referer, user-agent, IP hash, country, UTM params, affiliate code)
- **Link-in-Bio Pages**: Simple pages that display all links for a given handle
- **Affiliate System**: Create affiliates and generate share links with affiliate codes
- **Stripe Integration**: Webhook handler for tracking subscription revenue and attributing conversions to affiliates
- **Admin Dashboard**: Manage links, affiliates, and view analytics

## Tech Stack

- Next.js 14+ (App Router, TypeScript)
- Prisma ORM
- PostgreSQL
- Stripe Node SDK
- Tailwind CSS
- Simple password-based admin authentication

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `ADMIN_PASSWORD`: Password for admin dashboard access
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret
- `APP_BASE_URL`: Your app's base URL (e.g., `https://yourdomain.com` or `http://localhost:3000`)
- `IP_SALT`: Random string for hashing IP addresses

### 3. Database Setup

Generate Prisma client:

```bash
npm run db:generate
```

Run migrations:

```bash
npm run db:migrate
```

Or push schema directly (for development):

```bash
npm run db:push
```

### 4. Seed Database

Create default client, links, and affiliate:

```bash
npm run db:seed
```

### 5. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## Stripe Webhook Setup

### Local Testing with Stripe CLI

1. Install [Stripe CLI](https://stripe.com/docs/stripe-cli)

2. Login to Stripe:

```bash
stripe login
```

3. Forward webhooks to your local server:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This will output a webhook signing secret (starts with `whsec_`). Add this to your `.env` as `STRIPE_WEBHOOK_SECRET`.

### Production Setup

1. In your Stripe Dashboard, go to Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `invoice.paid`
   - `charge.refunded`
4. Copy the webhook signing secret to your `.env`

## Usage

### Creating Checkout Sessions with Affiliate Attribution

To ensure affiliate attribution works correctly, use the `/api/stripe/create-checkout-session` endpoint when creating Stripe Checkout Sessions. This endpoint automatically attaches the affiliate code to:

- Checkout session metadata
- Subscription metadata
- Customer metadata (if customer exists)

**Example Request:**

```bash
curl -X POST http://localhost:3000/api/stripe/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "priceId": "price_1234567890",
    "affiliateCode": "AFF001",
    "customerId": "cus_1234567890",
    "successUrl": "https://yourdomain.com/success",
    "cancelUrl": "https://yourdomain.com/cancel"
  }'
```

**Response:**

```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

### Manual Stripe Checkout Setup

If you're creating checkout sessions manually (not using the provided endpoint), you must attach the affiliate code to metadata:

**JavaScript/TypeScript Example:**

```typescript
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  line_items: [{ price: 'price_1234567890', quantity: 1 }],
  metadata: {
    affiliate_code: 'AFF001', // Important!
  },
  subscription_data: {
    metadata: {
      affiliate_code: 'AFF001', // Important!
    },
  },
  // If customer exists, also update customer metadata
  customer: 'cus_1234567890',
})

// Also update customer metadata if customer exists
if (session.customer) {
  await stripe.customers.update(session.customer as string, {
    metadata: {
      affiliate_code: 'AFF001',
    },
  })
}
```

**Why this matters:**

The webhook handler (`/api/stripe/webhook`) looks for affiliate codes in this order:
1. Invoice metadata (`invoice.metadata.affiliate_code`)
2. Subscription metadata (`subscription.metadata.affiliate_code`)
3. Customer metadata (`customer.metadata.affiliate_code`)

If the affiliate code is not found in any of these locations, the conversion will be recorded without an affiliate code.

### Creating Tracked Links

1. Go to `/admin/login` and enter your admin password
2. Navigate to "Links" in the admin dashboard
3. Create a new link with:
   - Client (select from dropdown)
   - Handle (for link-in-bio page)
   - Slug (unique identifier for the short link)
   - Destination URL

### Creating Affiliates

1. Go to `/admin/affiliates`
2. Create a new affiliate with:
   - Client
   - Code (unique per client)
   - Status (active/inactive)
   - Payout Percent (optional)

3. Generate share links by clicking "Show" next to an affiliate. Share links follow the format:
   ```
   https://yourdomain.com/l/<slug>?aff=<affiliate_code>
   ```

### Viewing Analytics

Go to `/admin/analytics` to view:
- Total clicks (last 7/30 days)
- Clicks by country
- Clicks by link
- Total revenue from Stripe conversions
- Revenue by affiliate

## Routes

### Public Routes

- `GET /` - Home page
- `GET /l/[slug]` - Tracked link redirect (captures analytics)
- `GET /p/[handle]` - Link-in-bio page

### API Routes

- `POST /api/stripe/webhook` - Stripe webhook handler
- `POST /api/stripe/create-checkout-session` - Create Stripe checkout session with affiliate metadata
- `POST /api/admin/login` - Admin login

### Admin Routes (Password Protected)

- `GET /admin/login` - Admin login page
- `GET /admin/links` - Manage links
- `GET /admin/affiliates` - Manage affiliates
- `GET /admin/analytics` - View analytics

## Database Schema

- **Client**: Organizations that own links and affiliates
- **Link**: Short links with slugs and destination URLs
- **Click**: Click analytics (timestamp, referer, user-agent, IP hash, country, UTM params, affiliate code)
- **Affiliate**: Affiliate codes with payout percentages
- **StripeEvent**: Raw Stripe webhook events (for debugging)
- **Conversion**: Revenue conversions from Stripe invoices, attributed to affiliates

## Security Notes

- Admin authentication uses a simple password stored in environment variables
- IP addresses are hashed using SHA256 with a salt
- Country detection is best-effort (can be improved with Cloudflare headers or other services)
- Webhook signature verification ensures requests are from Stripe

## Development

### Prisma Commands

- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database (development)
- `npm run db:migrate` - Run migrations
- `npm run db:seed` - Seed database with default data

### Building for Production

```bash
npm run build
npm start
```

## Deployment

### Railway Deployment

This app is configured for Railway deployment. See `DEPLOY_RAILWAY.md` for detailed instructions.

**Quick steps:**
1. Push code to GitHub
2. Connect Railway to your GitHub repository
3. Add PostgreSQL service in Railway
4. Set environment variables
5. Railway will auto-deploy on every push!

**Current deployment:**
- Repository: https://github.com/ClipsonBusiness/tracking-system
- Railway Project: tracking-system

## Future Improvements

- Full authentication system (replace password gate)
- Better country detection (Cloudflare headers, GeoIP service)
- More detailed analytics and charts
- Email notifications for conversions
- Multi-tenant support with proper client isolation
- API keys for programmatic access
- Link expiration dates
- Custom domains for short links

