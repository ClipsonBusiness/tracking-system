# 🔔 How to Get Notified When Someone Buys

## Current System: Manual Checking

Right now, you need to **manually check** the dashboard to see new sales. Here's where to look:

### Option 1: Admin Dashboard (Best for Overview)
1. Go to: `/admin/dashboard`
2. Check **Total Sales** count
3. Check **Total Revenue** amount
4. Refresh page to see updates

### Option 2: Clients Page (Best for Per-Client Sales)
1. Go to: `/admin/clients`
2. Find your client (e.g., "flexus1")
3. Look at **📊 Sales Tracking Status** section
4. See **Recent Conversions** list
5. Shows: Amount, Link Slug, Date

### Option 3: Clipper Dashboard (Best for Affiliate View)
1. Go to: `/clipper/dashboard?code=XXXX`
2. Check **TOTAL REVENUE** card
3. See revenue per link

---

## 🚀 Adding Real-Time Notifications

I can add **email notifications** or **webhook notifications** so you get notified instantly when someone buys. Here are the options:

### Option A: Email Notifications ✅ (Recommended)
**What it does:**
- Sends email to admin when a sale happens
- Email includes: Amount, Link Slug, Clipper, Date
- Can send to multiple email addresses

**Setup required:**
- Add email service (SendGrid, Resend, or SMTP)
- Add admin email address to config

**I can implement this now if you want!**

### Option B: Webhook Notifications ✅
**What it does:**
- Sends HTTP POST to your URL when a sale happens
- You can integrate with Slack, Discord, or custom system
- Full control over notification format

**Setup required:**
- Provide webhook URL
- Optional: webhook secret for security

**I can implement this now if you want!**

### Option C: Database Polling ✅ (Simple)
**What it does:**
- Create a simple script that checks for new sales
- Run it every few minutes
- Send notification if new sale found

**Setup required:**
- Run script on cron/scheduler
- Configure notification method

---

## 📊 Quick Check: Is Sales Tracking Working?

**Right now, check this:**

1. **Go to:** `/admin/clients`
2. **Find client:** "flexus1" (or your client name)
3. **Look for:** "📊 Sales Tracking Status" section
4. **Check:**
   - ✅ **"Working!"** = Sales are being tracked
   - ✅ **Recent Conversions** = Shows last 10 sales
   - ⚠️ **"No conversions yet"** = No sales yet (or webhook not configured)

**If you see sales listed:** ✅ System is working!

**If you don't see sales:** Check:
- Stripe webhook is configured
- Webhook secret is added to client setup
- Test purchase was made

---

## 🎯 Recommended Setup

**For now:**
1. Bookmark `/admin/clients` page
2. Check it periodically (every few hours)
3. Look for new conversions in the list

**For real-time notifications:**
- **Email:** Best for personal notifications
- **Webhook:** Best for team/Slack/Discord integration
- **Both:** Best for redundancy

**Would you like me to add email notifications?** Just say:
- "Add email notifications to [your-email@example.com]"
- "Add webhook notifications to [your-webhook-url]"
- "Add both"

---

## 📱 Mobile Access

You can also:
1. Bookmark `/admin/clients` on your phone
2. Check it on the go
3. See sales as they happen

---

## 🔍 Testing Sales Tracking

**To verify sales are being tracked:**

1. **Make a test purchase:**
   - Use affiliate link: `https://www.freeclipping.com/?ref=tcjsn`
   - Complete checkout
   - Wait 10-30 seconds

2. **Check dashboard:**
   - Go to `/admin/clients`
   - Find your client
   - Look for new conversion in "Recent Conversions"

3. **Check clipper dashboard:**
   - Go to `/clipper/dashboard?code=kfgz`
   - Check "TOTAL REVENUE" - should increase

**If sale appears:** ✅ Everything is working!

**If sale doesn't appear:** Check webhook configuration.
