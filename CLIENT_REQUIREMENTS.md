# What You Need From Clients for Custom Domain Tracking

## Quick Answer: Choose ONE Option

### ✅ **Option 1: JavaScript Redirect (EASIEST - No DNS Access Needed)**
**What client needs to do:**
1. Add a small JavaScript snippet to their website
2. That's it!

**What you need from client:**
- Access to add code to their website (or they can do it themselves)

**Setup:**
- You provide them a JavaScript snippet
- They add it to their website's `<head>` or footer
- Links like `lowbackability.com/ref=xxxx` will work automatically

---

### ✅ **Option 2: DNS Access (MOST RELIABLE)**
**What client needs to do:**
1. Point their domain to your tracking server

**What you need from client:**
- DNS access to their domain
- Or they can add the DNS record themselves

**Setup:**
- Add an A record or CNAME pointing to your Railway server IP/domain
- Example: `A record: @ → your-railway-ip` or `CNAME: @ → your-app.railway.app`

---

### ✅ **Option 3: Subdomain (EASIER DNS)**
**What client needs to do:**
1. Point a subdomain (like `links.lowbackability.com`) to your server

**What you need from client:**
- DNS access (but only for a subdomain, not the main domain)

**Setup:**
- Add CNAME: `links` → `your-app.railway.app`
- Links will be: `links.lowbackability.com/ref=xxxx`

---

### ❌ **Option 4: Reverse Proxy (MOST COMPLEX)**
**What client needs to do:**
1. Configure their web server (nginx/apache) to proxy requests

**What you need from client:**
- Server access
- Technical knowledge

**Setup:**
- Add nginx/apache config to proxy `/ref=*` requests to your tracking server

---

## Recommended: JavaScript Redirect

**Why?**
- ✅ No DNS access needed
- ✅ Client can do it themselves
- ✅ Works immediately
- ✅ No server configuration

**What to send client:**

```html
<!-- Add this to your website's <head> or before </body> -->
<script>
(function() {
  // Check if URL matches tracking pattern: domain.com/ref=xxxx
  if (window.location.pathname.startsWith('/ref=')) {
    var refCode = window.location.pathname.replace('/ref=', '');
    // Redirect to tracking server
    window.location.href = 'https://your-app.railway.app/ref=' + refCode;
  }
})();
</script>
```

**Or if they use a service like WordPress/Squarespace:**
- Add the script via a plugin or custom code section

---

## What to Ask Your Client

**Simple Email Template:**

> Hi [Client],
> 
> To enable custom domain tracking (e.g., `yourdomain.com/ref=xxxx`), we need one of the following:
> 
> **Easiest Option:** Add a small JavaScript snippet to your website. No technical knowledge needed!
> 
> **Alternative:** If you prefer, we can set up DNS (requires access to your domain's DNS settings).
> 
> Which option works best for you? I can provide step-by-step instructions for either.
> 
> Best,
> [Your Name]

---

## Summary Table

| Option | What Client Needs | Difficulty | Time |
|-------|------------------|------------|------|
| JavaScript Redirect | Website access | ⭐ Easy | 5 min |
| Subdomain DNS | Subdomain DNS access | ⭐⭐ Medium | 15 min |
| Full DNS | Main domain DNS access | ⭐⭐ Medium | 15 min |
| Reverse Proxy | Server access | ⭐⭐⭐ Hard | 1+ hour |

---

## Quick Decision Guide

**Ask client: "Do you have access to add code to your website?"**
- ✅ **Yes** → Use JavaScript Redirect (Easiest!)
- ❌ **No, but I have DNS access** → Use DNS Option
- ❌ **No to both** → Use Railway URL instead (still works, just not custom domain)
