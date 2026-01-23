# 🚀 Fast Setup: Use lowbackability.com

## Quick Steps (5 minutes)

### Step 1: Add Custom Domain in Railway (2 min)

1. **Go to Railway Dashboard:**
   - https://railway.app/project/tracking-system
   - Click on **`tracking-system`** service (your app)

2. **Go to Settings:**
   - Click **"Settings"** tab
   - Scroll to **"Networking"** section

3. **Add Custom Domain:**
   - Click **"Custom Domain"** or **"Add Domain"**
   - Enter: `lowbackability.com`
   - Railway will show you DNS records to add

---

### Step 2: Configure DNS (2 min)

**If you own `lowbackability.com`:**

1. **Go to your domain registrar** (where you bought the domain)
   - Namecheap, GoDaddy, Cloudflare, etc.

2. **Add DNS records Railway shows you:**
   - Usually a **CNAME** record pointing to Railway
   - Or an **A** record with Railway's IP

3. **Wait 5-60 minutes** for DNS to propagate

---

### Step 3: Set Custom Domain in App (1 min)

1. **Go to Admin Dashboard:**
   - http://localhost:3000/admin/settings
   - Or your Railway URL: `https://your-app.railway.app/admin/settings`

2. **Find your client** (or create one)

3. **Set Custom Domain:**
   - Enter: `lowbackability.com`
   - Save

---

### Step 4: Test! ✅

1. **Create a test link:**
   - Go to Admin → Links
   - Create a link with slug: `test123`
   - Set custom domain: `lowbackability.com`

2. **Visit:**
   - `https://lowbackability.com/test123`
   - Should redirect and track! ✅

---

## ⚡ If You DON'T Own the Domain

### Option A: Use Subdomain (Fastest)
- Use: `links.lowbackability.com` or `track.lowbackability.com`
- Same steps, just use subdomain instead

### Option B: Use Your Railway Domain
- Use: `your-app.railway.app/fhkeo`
- Works immediately, no DNS needed!

### Option C: Reverse Proxy (If Client Has Server)
- Client adds nginx config
- Routes `/xxxxx` to your Railway server
- No DNS changes needed

---

## 🎯 Fastest Path Right Now

**If you own `lowbackability.com`:**
1. Railway Settings → Add Domain → `lowbackability.com`
2. Add DNS records Railway shows
3. Wait 5-60 min
4. Set in Admin Settings
5. Done! ✅

**If you DON'T own it:**
1. Use Railway domain: `your-app.railway.app/xxxxx`
2. Works immediately! ✅

---

## 📋 Checklist

- [ ] Railway: Add custom domain in Settings
- [ ] DNS: Add records Railway provides
- [ ] Wait: 5-60 minutes for DNS
- [ ] Admin: Set custom domain in Settings
- [ ] Test: Create link and visit it

---

**That's it!** 🚀

