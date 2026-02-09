# 🔒 Fix SSL Error for Custom Domain

## The Problem

When you click `https://www.clipsonexclusive.com/ref=aakwp`, you get:
- **Error:** `NET::ERR_CERT_COMMON_NAME_INVALID`
- **Meaning:** Railway hasn't provisioned an SSL certificate for this domain yet

## Why This Happens

Railway automatically provisions SSL certificates, but only after:
1. ✅ Custom domain is added in Railway Settings
2. ✅ DNS is pointing to Railway correctly
3. ⏳ Railway detects the DNS and provisions SSL (can take 5-60 minutes)

---

## ✅ Solution: Add Custom Domain in Railway

### Step 1: Add Domain in Railway (2 minutes)

1. **Go to Railway Dashboard:**
   - https://railway.app
   - Open your `tracking-system` project
   - Click on your **service** (the app, not the database)

2. **Go to Settings:**
   - Click **"Settings"** tab
   - Scroll to **"Networking"** section

3. **Add Custom Domain:**
   - Click **"Custom Domain"** or **"Add Domain"**
   - Enter: `www.clipsonexclusive.com`
   - Railway will show you DNS records to add

4. **Railway will show something like:**
   ```
   Type: CNAME
   Name: www
   Value: [some-railway-domain].up.railway.app
   ```

---

### Step 2: Configure DNS (If Not Done Already)

**If you're using Cloudflare (which you mentioned earlier):**

1. **Go to Cloudflare Dashboard:**
   - https://dash.cloudflare.com
   - Select `clipsonexclusive.com` domain

2. **Go to DNS → Records**

3. **Add/Update CNAME Record:**
   ```
   Type: CNAME
   Name: www
   Target: [The Railway domain shown in Step 1]
   Proxy status: DNS only (gray cloud, NOT orange)
   TTL: Auto
   ```

4. **For Root Domain (clipsonexclusive.com without www):**
   - Some registrars don't allow CNAME on root domain
   - Use A record if Railway provides an IP
   - Or use ALIAS/ANAME if available
   - Or just use `www.clipsonexclusive.com` (recommended)

---

### Step 3: Wait for SSL Provisioning

After DNS is configured:

1. **Railway will detect the DNS** (usually within 5-60 minutes)
2. **Railway will automatically provision SSL** (Let's Encrypt)
3. **You'll see in Railway:** "Domain verified" or "SSL active"

**How to check:**
- Railway Dashboard → Settings → Networking
- Should show green checkmark ✅ next to domain
- Should say "SSL Active" or similar

---

### Step 4: Test

Once SSL is active:

1. Visit: `https://www.clipsonexclusive.com/ref=aakwp`
2. Should redirect without SSL error ✅
3. Click is tracked ✅

---

## 🚀 Quick Workaround: Use JavaScript Redirect (No SSL Needed!)

If you need it working **RIGHT NOW** without waiting for SSL:

1. **Go to Client Dashboard:**
   - `/admin/clients/[clipson-id]/dashboard`
   - Or have client go to their dashboard

2. **Click "Configure DNS"** → **"Get JavaScript Code"**

3. **Copy the JavaScript code**

4. **Add to `www.clipsonexclusive.com` website:**
   - WordPress: Add to header.php or use a plugin
   - Squarespace: Settings → Code Injection → Header
   - Wix: Settings → Custom Code → Add to Head
   - Any website: Add to `<head>` section

5. **Works immediately!** No DNS or SSL needed ✅

---

## 🔍 Troubleshooting

### Still Getting SSL Error?

1. **Check DNS:**
   ```bash
   # Run in terminal
   nslookup www.clipsonexclusive.com
   # Should show Railway domain
   ```

2. **Check Railway:**
   - Settings → Networking
   - Does it show domain as "Verified"?
   - Does it show "SSL Active"?

3. **Wait Longer:**
   - SSL provisioning can take up to 1 hour
   - DNS propagation can take up to 24 hours (usually much faster)

4. **Try Different Domain:**
   - Use `clipsonexclusive.com` (without www) if www doesn't work
   - Or use a subdomain: `links.clipsonexclusive.com`

---

## ✅ Checklist

- [ ] Custom domain added in Railway Settings → Networking
- [ ] DNS record added (CNAME or A record)
- [ ] DNS pointing to Railway (check with nslookup)
- [ ] Railway shows domain as "Verified"
- [ ] Railway shows "SSL Active"
- [ ] Test link works without SSL error

---

## 🎯 Recommended: Use JavaScript Redirect for Now

**Fastest solution:** Use the JavaScript redirect method. It:
- ✅ Works immediately (no waiting)
- ✅ No DNS changes needed
- ✅ No SSL certificate needed
- ✅ Works on any website platform
- ✅ Client can do it themselves

Then set up DNS + SSL later for a permanent solution.
