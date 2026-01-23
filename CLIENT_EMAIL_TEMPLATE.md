# Email Template for Clients - Custom Domain Setup

## Option 1: JavaScript Redirect (RECOMMENDED - Easiest!)

**Subject:** Quick Setup for Custom Domain Tracking

---

Hi [Client Name],

To enable custom domain tracking links (e.g., `yourdomain.com/ref=xxxx`), we just need you to add a small code snippet to your website.

**This takes 2 minutes and requires no technical knowledge!**

### Steps:

1. **Log into your website** (WordPress, Squarespace, Wix, etc.)
2. **Go to Settings → Custom Code** (or similar - varies by platform)
3. **Add this code** to your website's `<head>` section or footer:

```html
<script>
(function() {
  if (window.location.pathname.startsWith('/ref=')) {
    var refCode = window.location.pathname.replace('/ref=', '');
    window.location.href = 'https://[YOUR-RAILWAY-URL]/ref=' + refCode;
  }
})();
</script>
```

**Replace `[YOUR-RAILWAY-URL]` with:** `tracking-system-production-d23c.up.railway.app`

4. **Save and publish**

That's it! Your custom domain links will now work automatically.

**Need help?** Just let me know what platform you're using (WordPress, Squarespace, etc.) and I can provide specific instructions.

Best regards,
[Your Name]

---

## Option 2: DNS Setup (If Client Prefers)

**Subject:** DNS Setup for Custom Domain Tracking

---

Hi [Client Name],

To enable custom domain tracking links (e.g., `yourdomain.com/ref=xxxx`), we need to point your domain to our tracking server.

**This requires access to your domain's DNS settings.**

### Steps:

1. **Log into your domain registrar** (GoDaddy, Namecheap, Cloudflare, etc.)
2. **Go to DNS Management**
3. **Add a new record:**
   - **Type:** CNAME (or A record)
   - **Name/Host:** @ (or leave blank for root domain)
   - **Value/Target:** `tracking-system-production-d23c.up.railway.app`
   - **TTL:** 3600 (or default)

4. **Save the record**

**Note:** DNS changes can take 24-48 hours to propagate, but usually work within a few hours.

**Alternative:** If you prefer, we can use a subdomain like `links.yourdomain.com` instead, which is often easier to set up.

Let me know if you need help finding your DNS settings!

Best regards,
[Your Name]

---

## Quick Decision Guide

**Ask your client:**

> "Do you have access to add code to your website? If yes, we'll use the JavaScript method (easiest!). If not, we can set up DNS instead."

**If they say:**
- ✅ **"Yes, I can add code"** → Send Option 1 (JavaScript)
- ❌ **"No, but I have DNS access"** → Send Option 2 (DNS)
- ❌ **"No to both"** → Use Railway URL (still works, just not custom domain)

---

## What You Need to Replace

In the JavaScript template above, replace:
- `[YOUR-RAILWAY-URL]` with your actual Railway domain
- `[Client Name]` with the client's name
- `[Your Name]` with your name

