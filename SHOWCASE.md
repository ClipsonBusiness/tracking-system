# 🎯 Showcase Guide - Tracking System

## Quick Start

The development server should be starting. Once ready, visit: **http://localhost:3000**

## 🚀 Showcase Flow

### 1. Home Page
- **URL**: http://localhost:3000
- Simple landing page with link to admin dashboard

### 2. Admin Dashboard Access
- **URL**: http://localhost:3000/admin/login
- **Password**: `demo123` (from .env)
- After login, you'll see the admin navigation

### 3. Create a Link
- Navigate to **Links** in admin dashboard
- Create a new link:
  - **Client**: Select "Default Client" (from seed)
  - **Handle**: `demo` (for link-in-bio page)
  - **Slug**: `my-product` (unique identifier)
  - **Destination URL**: `https://example.com/product`
- Click "Create Link"

### 4. Test Tracked Link
- Visit: **http://localhost:3000/l/my-product**
- This will:
  - Track the click (timestamp, referer, user-agent, etc.)
  - Redirect to the destination URL
- Try with affiliate code: **http://localhost:3000/l/my-product?aff=AFF001**

### 5. Link-in-Bio Page
- Visit: **http://localhost:3000/p/demo**
- Shows all links with handle "demo" as clickable buttons
- Each button navigates through the tracked link route

### 6. Create an Affiliate
- Navigate to **Affiliates** in admin dashboard
- Create a new affiliate:
  - **Client**: Default Client
  - **Code**: `AFF002`
  - **Status**: Active
  - **Payout %**: 15 (optional)
- Click "Show" to see the share link format

### 7. View Analytics
- Navigate to **Analytics** in admin dashboard
- View:
  - Total clicks (last 7/30 days)
  - Clicks by country
  - Clicks by link
  - Total revenue (from Stripe conversions)
  - Revenue by affiliate

## 🧪 Testing Features

### Test Affiliate Cookie Tracking
1. Visit: http://localhost:3000/l/my-product?aff=AFF001
2. This sets a cookie `aff_code=AFF001` (60-day expiry)
3. Visit any other link: http://localhost:3000/l/my-product
4. The click will still be attributed to AFF001 (from cookie)

### Test UTM Parameters
Visit: http://localhost:3000/l/my-product?utm_source=google&utm_medium=cpc&utm_campaign=summer

### Test Multiple Links
Create several links with the same handle to see the link-in-bio page populate

## 📊 Database Setup (If Needed)

If you see database connection errors:

### Option 1: Use Local PostgreSQL
```bash
# Create database
createdb tracking_db

# Update .env with your connection string
DATABASE_URL="postgresql://youruser:yourpassword@localhost:5432/tracking_db?schema=public"

# Run migrations
npm run db:migrate

# Seed data
npm run db:seed
```

### Option 2: Use SQLite (Quick Demo)
1. Change `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
2. Update `.env`:
   ```
   DATABASE_URL="file:./dev.db"
   ```
3. Run:
   ```bash
   npm run db:push
   npm run db:seed
   ```

## 🎨 Features to Highlight

1. **Click Tracking**: Every visit to `/l/[slug]` is tracked with full analytics
2. **Affiliate Attribution**: Cookie-based tracking persists across sessions
3. **Link-in-Bio**: Simple, clean pages for sharing multiple links
4. **Admin Dashboard**: Full CRUD for links and affiliates
5. **Analytics**: Real-time insights into clicks and revenue
6. **Stripe Integration**: Ready for webhook-based revenue tracking

## 🔗 Key URLs

- Home: http://localhost:3000
- Admin Login: http://localhost:3000/admin/login
- Admin Links: http://localhost:3000/admin/links
- Admin Affiliates: http://localhost:3000/admin/affiliates
- Admin Analytics: http://localhost:3000/admin/analytics
- Tracked Link: http://localhost:3000/l/[slug]
- Link-in-Bio: http://localhost:3000/p/[handle]

## 💡 Pro Tips

- Use browser DevTools to see cookies being set
- Check Network tab to see redirects happening
- Try different user agents and referers to see analytics capture
- Create multiple affiliates and test attribution
- View analytics after generating some clicks

## 🐛 Troubleshooting

**Server won't start?**
- Check if port 3000 is available
- Ensure all dependencies are installed: `npm install`
- Check for database connection errors

**Database errors?**
- Make sure PostgreSQL is running (if using Postgres)
- Or switch to SQLite for quick demo
- Run `npm run db:push` to sync schema

**Admin login not working?**
- Check `.env` has `ADMIN_PASSWORD="demo123"`
- Clear browser cookies and try again

---

**Enjoy showcasing your tracking system! 🚀**

