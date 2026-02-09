# Setting Up Your Own Domain (lowbackability.com)

## ✅ Yes! If You Have DNS Access, You Can Do This!

### Step-by-Step Setup

#### Step 1: Point Domain to Your Tracking Server

**Option A: A Record (Root Domain)**
```
Type: A
Name: @ (or leave blank)
Value: [Your server IP address]
TTL: 3600 (or default)
```

**Option B: CNAME (If Using Subdomain or CDN)**
```
Type: CNAME
Name: @ (or leave blank)
Value: your-tracking-server.com
TTL: 3600 (or default)
```

**Option C: If Using Vercel/Netlify/Railway**
- Add custom domain in their dashboard
- They'll provide DNS records to add
- Usually CNAME or A records

---

#### Step 2: Set Custom Domain in Settings

1. Go to **Admin → Settings**
2. Find your client (or create one)
3. Enter: `lowbackability.com`
4. Press Enter or click away to save

---

#### Step 3: Wait for DNS Propagation

- Usually takes 5-60 minutes
- Can take up to 48 hours (rare)
- Check with: `nslookup lowbackability.com` or `dig lowbackability.com`

---

#### Step 4: Create Links

1. Go to **Admin → Links**
2. Create a link (e.g., destination: `https://lowbackability.com/signup`)
3. System generates slug: `hfjem`
4. Your link: `https://lowbackability.com/hfjem` ✅

---

## 🎯 What Happens

### Before DNS Setup:
- `lowbackability.com/hfjem` → Goes to their website (404)

### After DNS Setup:
- `lowbackability.com/hfjem` → Goes to your tracking server
- Your catch-all route (`app/[...slug]/route.ts`) handles it
- Tracks the click
- Redirects to destination URL

---

## 📋 DNS Configuration Examples

### If Your Tracking Server is on Vercel:

1. **Add domain in Vercel:**
   - Go to Vercel dashboard
   - Add `lowbackability.com` as custom domain
   - Vercel shows DNS records needed

2. **Add DNS records:**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21 (Vercel's IP)
   
   Type: A
   Name: @
   Value: 76.223.126.88 (Vercel's IP)
   ```

### If Your Tracking Server is on Netlify:

1. **Add domain in Netlify:**
   - Go to Netlify dashboard
   - Add `lowbackability.com`
   - Netlify shows DNS records

2. **Add DNS records:**
   ```
   Type: A
   Name: @
   Value: [Netlify IP addresses]
   ```

### If Your Tracking Server is on Railway:

1. **Add domain in Railway:**
   - Go to Railway dashboard
   - Add custom domain
   - Railway provides DNS records

2. **Add DNS records as shown**

### If You Have Your Own Server:

1. **Get your server IP:**
   - Find your server's public IP address

2. **Add A record:**
   ```
   Type: A
   Name: @
   Value: [Your server IP]
   ```

---

## 🔍 Testing

### Test DNS:
```bash
# Check if DNS is pointing correctly
nslookup lowbackability.com
dig lowbackability.com

# Should show your server IP
```

### Test Link:
1. Create a test link: `hfjem`
2. Visit: `https://lowbackability.com/hfjem`
3. Should redirect to destination URL
4. Check Admin → Analytics to see click tracked

---

## ⚠️ Important Notes

### If Client Already Has Website on lowbackability.com:

**Option 1: Use Subdomain Instead**
- Use: `links.lowbackability.com` or `go.lowbackability.com`
- Easier setup (CNAME record)
- Doesn't affect main website

**Option 2: Reverse Proxy**
- Keep main website running
- Add reverse proxy rules to forward `/hfjem` patterns to your server
- More complex but keeps both sites working

**Option 3: Replace Main Site**
- Point domain to your tracking server
- Main site moves to subdomain (e.g., `www.lowbackability.com`)

---

## 🚀 Quick Setup Checklist

- [ ] Get DNS access to `lowbackability.com`
- [ ] Get your tracking server IP or domain
- [ ] Add A record or CNAME in DNS
- [ ] Wait for DNS propagation (5-60 min)
- [ ] Set custom domain in Admin → Settings
- [ ] Create test link
- [ ] Visit `lowbackability.com/hfjem` to test
- [ ] Verify click is tracked in Analytics

---

## 💡 Pro Tips

1. **Use subdomain if main site exists:**
   - `links.lowbackability.com` is easier than root domain
   - Less likely to break existing site

2. **Test with curl first:**
   ```bash
   curl -H "Host: lowbackability.com" http://your-server-ip/hfjem
   ```

3. **Check server logs:**
   - See if requests are reaching your server
   - Verify host header is correct

4. **Use Cloudflare (optional):**
   - Add domain to Cloudflare
   - Use Cloudflare's DNS
   - Get DDoS protection + faster DNS

---

## 🎯 Result

Once set up:
- ✅ `lowbackability.com/hfjem` works
- ✅ All tracking links work on your domain
- ✅ Clean, branded URLs
- ✅ Full analytics tracking
- ✅ Affiliate codes work: `lowbackability.com/hfjem?aff=AFF001`

**You're all set!** 🚀
