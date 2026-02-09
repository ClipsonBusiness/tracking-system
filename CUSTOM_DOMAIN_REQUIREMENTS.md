# Why Custom Domains Don't Work (And How to Fix It)

## The Problem

When you set a custom domain like `lowbackability.com` in the system, the link shows as `https://lowbackability.com/vqzpl`, but when someone clicks it, they see the client's original website (404 page) instead of your tracking server.

**Why?** The domain's DNS is pointing to the client's website server, not your Railway tracking server.

---

## What Needs to Happen

For `lowbackability.com/vqzpl` to work, the domain's DNS must point to your Railway server. When someone visits `lowbackability.com/vqzpl`:

1. Browser looks up DNS for `lowbackability.com`
2. DNS should return your Railway server IP/domain
3. Request goes to Railway → Your tracking app → Tracks click → Redirects

**Currently:** DNS points to client's website → Shows 404 ❌  
**Needed:** DNS points to Railway → Works! ✅

---

## What Clients Need to Provide

### Option 1: DNS Access (Best - Full Control)

**Client provides:**
- Access to their domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
- OR DNS management credentials
- OR ability to add DNS records

**You do:**
1. Railway Dashboard → Settings → Networking → Add Domain: `lowbackability.com`
2. Railway shows DNS records (usually CNAME or A record)
3. Client adds those DNS records at their registrar
4. Wait 5-60 minutes for DNS propagation
5. ✅ Works!

**Example DNS Records:**
```
Type: CNAME
Name: @ (or lowbackability.com)
Value: tracking-system-production-d23c.up.railway.app
```

---

### Option 2: Reverse Proxy (No DNS Changes)

**Client provides:**
- Access to their web server (nginx/apache)
- Ability to add server configuration

**You provide:**
- Your Railway URL: `https://tracking-system-production-d23c.up.railway.app`

**Client adds to their nginx/apache config:**
```nginx
# Route 5-letter tracking links to your server
location ~ ^/[a-z]{5}$ {
    proxy_pass https://tracking-system-production-d23c.up.railway.app;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

**Result:**
- ✅ `lowbackability.com/vqzpl` → Client's server → Proxies to Railway → Works!
- ✅ `lowbackability.com/` → Client's main website (unchanged)

**No DNS changes needed!**

---

### Option 3: JavaScript Redirect (Easiest for Client)

**Client provides:**
- Access to their website code
- Ability to add a script tag

**You provide:**
- Your Railway URL: `https://tracking-system-production-d23c.up.railway.app`

**Client adds to their website:**
```html
<script>
(function() {
  const path = window.location.pathname;
  // Match 5-letter codes like /vqzpl
  if (/^\/[a-z]{5}$/.test(path)) {
    const trackingServer = 'https://tracking-system-production-d23c.up.railway.app';
    window.location.href = trackingServer + path + window.location.search;
  }
})();
</script>
```

**Result:**
- ✅ `lowbackability.com/vqzpl` → Redirects to Railway → Works!
- ✅ `lowbackability.com/` → Client's main website (unchanged)

**No DNS or server config needed!**

---

### Option 4: Subdomain (Easier DNS)

**Client provides:**
- Ability to create subdomain DNS records

**You do:**
1. Use subdomain: `links.lowbackability.com` or `track.lowbackability.com`
2. Railway Dashboard → Add Domain: `links.lowbackability.com`
3. Client adds CNAME record: `links` → Railway domain
4. ✅ Works!

**Easier because:**
- Client doesn't need to change main domain DNS
- Subdomain can point to different server
- Main website stays unchanged

---

## What Information to Collect from Clients

### For DNS Setup (Option 1):
- [ ] Domain registrar name (GoDaddy, Namecheap, etc.)
- [ ] Can they add DNS records? (Yes/No)
- [ ] Do they want to give you access? (Yes/No)
- [ ] Preferred method: DNS access or instructions?

### For Reverse Proxy (Option 2):
- [ ] What web server? (nginx/apache/other)
- [ ] Can they add server config? (Yes/No)
- [ ] Do they have server access? (Yes/No)

### For JavaScript Redirect (Option 3):
- [ ] Can they add a script tag? (Yes/No)
- [ ] Where is their website hosted? (WordPress, custom, etc.)

### For Subdomain (Option 4):
- [ ] Can they create subdomain? (Yes/No)
- [ ] Preferred subdomain name? (links/track/go/etc.)

---

## Recommendation

**For Most Clients:**
1. **Try JavaScript Redirect first** (easiest, no server/DNS access needed)
2. **If they have server access:** Use Reverse Proxy (most reliable)
3. **If they can do DNS:** Use subdomain (cleanest URLs)
4. **Last resort:** Full domain DNS change (requires most access)

**For You:**
- Always show the working Railway URL as primary
- Custom domain is a "nice to have" feature
- Don't block clients from using the system if they can't set up custom domain

---

## Quick Checklist for Clients

**To make `lowbackability.com/vqzpl` work, you need ONE of these:**

- [ ] **DNS Access:** Can add DNS records at domain registrar
- [ ] **Server Access:** Can add nginx/apache config
- [ ] **Website Access:** Can add JavaScript to website
- [ ] **Subdomain:** Can create `links.lowbackability.com`

**If none of these work, use the Railway URL - it works immediately!**

---

## Current Status

✅ **System is ready** - Custom domain support is built in  
⚠️ **DNS not configured** - Domain points to client's website  
✅ **Railway URL works** - Always use this as fallback  

The tracking system works perfectly with Railway URLs. Custom domains are optional and require client setup.
