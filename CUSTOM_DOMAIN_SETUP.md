# Custom Domain Setup Guide

## The Problem

When you visit `lowbackability.com/pynhl`, you're seeing the Low Back Ability website's 404 page because the domain is pointing to their server, not your tracking server.

## Solution Options

### Option 1: Point Domain to Tracking Server (Recommended for Testing)

1. **Update DNS** to point `lowbackability.com` to your tracking server IP
2. **Or use a subdomain** like `track.lowbackability.com` or `links.lowbackability.com`
3. Deploy your tracking app to that domain

### Option 2: Reverse Proxy (Recommended for Production)

Use a reverse proxy (nginx, Cloudflare, etc.) to route specific paths:

**Nginx Example:**
```nginx
server {
    server_name lowbackability.com;
    
    # Route tracking links to your tracking server
    location ~ ^/[a-z]{5}$ {
        proxy_pass http://your-tracking-server:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Route everything else to main website
    location / {
        proxy_pass http://your-main-website;
    }
}
```

**Cloudflare Workers Example:**
Route paths matching `/^[a-z]{5}$/` to your tracking server.

### Option 3: Subdomain Approach

Use a subdomain for tracking:
- `links.lowbackability.com/pynhl`
- `track.lowbackability.com/pynhl`
- `go.lowbackability.com/pynhl`

Update the custom domain in Settings to use the subdomain.

## Testing Locally

To test if the route works, you can use:

```bash
# Test with Host header
curl -H "Host: lowbackability.com" http://localhost:3000/pynhl

# Should redirect to the destination URL
```

## Current Setup

- ✅ Custom domain configured: `lowbackability.com`
- ✅ Link exists: `pynhl` → `https://lowbackability.com/`
- ✅ Catch-all route: `app/[...slug]/route.ts` handles custom domain paths
- ⚠️ DNS/Proxy: Domain needs to point to tracking server

## Next Steps

1. **For Testing**: Use a subdomain or test with Host header
2. **For Production**: Set up reverse proxy or point domain to tracking server
3. **Verify**: Check server logs to see if requests are reaching the catch-all route

