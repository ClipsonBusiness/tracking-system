# Working with Clients Who Have Custom Domains

## ✅ Yes! It Works - Here Are Your Options

### Scenario: Client Has `lowbackability.com` and Wants `lowbackability.com/fhkeo`

You have **3 main options** (all work without you needing DNS access):

---

## Option 1: Reverse Proxy (Best if Client Has Server) ✅

**How it works:**
- Client's website already runs on `lowbackability.com`
- They add reverse proxy rules to forward tracking links to your server
- No DNS changes needed

**What client does:**
1. Adds nginx/apache config to their existing server
2. Routes `/fhkeo` patterns to your tracking server
3. Everything else stays on their main site

**You provide:**
```nginx
# Client adds this to their nginx config
location ~ ^/[a-z]{5}$ {
    proxy_pass https://your-tracking-server.com;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

**Result:**
- ✅ `lowbackability.com/fhkeo` → Your tracking server → Tracks → Redirects
- ✅ `lowbackability.com/` → Their main website (unchanged)
- ✅ No DNS changes needed
- ✅ Both sites work simultaneously

**Best for:** Clients with existing servers/websites

---

## Option 2: JavaScript Redirect (Easiest for Client) ✅

**How it works:**
- Client adds a script to their website
- Script checks if URL matches tracking pattern
- Redirects to your tracking server

**What client does:**
1. Adds one script tag to their website
2. That's it!

**You provide:**
```html
<!-- Client adds this to their website -->
<script>
(function() {
  const path = window.location.pathname;
  // Match 5-letter codes like /fhkeo
  if (/^\/[a-z]{5}$/.test(path)) {
    const trackingServer = 'https://your-tracking-server.com';
    window.location.href = trackingServer + path + window.location.search;
  }
})();
</script>
```

**Result:**
- ✅ `lowbackability.com/fhkeo` → Redirects to your server → Tracks → Redirects
- ✅ `lowbackability.com/` → Their main website (unchanged)
- ✅ No DNS or server config needed
- ✅ Client just adds script

**Best for:** Clients with static websites or simple setups

**Note:** Requires visitor to hit their site first (slight delay), but works perfectly!

---

## Option 3: Cloudflare Worker (If Client Uses Cloudflare) ✅

**How it works:**
- Client uses Cloudflare for their domain
- You provide a Worker script
- Worker routes tracking links to your server

**What client does:**
1. Adds Worker to their Cloudflare account
2. Deploys your script
3. Routes traffic through Worker

**You provide:**
```javascript
// Cloudflare Worker script
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const path = url.pathname
  
  // If path matches tracking link pattern (5 lowercase letters)
  if (/^\/[a-z]{5}$/.test(path)) {
    // Forward to tracking server
    return fetch(`https://your-tracking-server.com${path}${url.search}`, {
      method: request.method,
      headers: request.headers,
    })
  }
  
  // Otherwise, forward to main site
  return fetch(`https://main-site.com${path}${url.search}`)
}
```

**Result:**
- ✅ `lowbackability.com/fhkeo` → Worker → Your server → Tracks → Redirects
- ✅ `lowbackability.com/` → Their main website (unchanged)
- ✅ No DNS changes needed
- ✅ Fast (runs at edge)

**Best for:** Clients already using Cloudflare

---

## Option 4: Use Subdomain (Easier DNS Setup) ✅

**How it works:**
- Use subdomain: `links.lowbackability.com` or `go.lowbackability.com`
- Client creates CNAME record (easier than A record)
- Points to your tracking server

**What client does:**
1. Creates CNAME record: `links` → `your-tracking-server.com`
2. You set custom domain: `links.lowbackability.com`
3. Done!

**Result:**
- ✅ `links.lowbackability.com/fhkeo` → Your server → Tracks → Redirects
- ✅ `lowbackability.com/` → Their main website (unchanged)
- ✅ Easier than root domain
- ✅ Less likely to break main site

**Best for:** Clients who want branded links but easier setup

---

## 🎯 Recommended Approach

### For Most Clients: JavaScript Redirect

**Why:**
- ✅ Easiest for client (just add script)
- ✅ No DNS changes
- ✅ No server config
- ✅ Works with any hosting

**You provide:**
- Script code
- Your tracking server URL
- Instructions (2 minutes to implement)

**Client does:**
- Adds script to their website
- Done!

---

## 📋 What to Tell Your Clients

### Template Email:

```
Hi [Client],

Great news! Your tracking links can work on lowbackability.com/fhkeo.

Here's the easiest way to set it up:

**Option 1: JavaScript Redirect (Recommended - Easiest)**
Just add this script to your website:

<script>
(function() {
  const path = window.location.pathname;
  if (/^\/[a-z]{5}$/.test(path)) {
    window.location.href = 'https://your-tracking-server.com' + path + window.location.search;
  }
})();
</script>

That's it! Your links will work on lowbackability.com/fhkeo

**Option 2: Reverse Proxy (If you have server access)**
I can provide nginx/apache config - just let me know!

**Option 3: Subdomain (If you prefer)**
We can use links.lowbackability.com - easier DNS setup.

Which option works best for you?
```

---

## ✅ Summary

**Yes, clients with custom domains can use them!**

**Easiest for client:** JavaScript redirect (just add script)
**Best for existing servers:** Reverse proxy
**Best for Cloudflare users:** Cloudflare Worker
**Easiest DNS:** Subdomain approach

**All options work without you needing DNS access!**

---

## 🚀 Quick Setup Flow

1. **Client has:** `lowbackability.com`
2. **You provide:** JavaScript redirect script (or other option)
3. **Client adds:** Script to their website
4. **Result:** `lowbackability.com/fhkeo` works! ✅

**That's it!** No DNS coordination needed.
