# 🔍 Diagnose Why Clicks Aren't Tracking

## Quick Diagnosis Steps

### Step 1: Verify Tracking Script is Installed ✅

1. **Go to Admin Dashboard:**
   - Visit: `/admin/test-stripe`
   - Use "Verify Tracking Script" tool
   - Enter: `clipsonexclusive.com`
   - Click "Verify Script"

2. **Check Results:**
   - ✅ **If detected:** Script is installed, move to Step 2
   - ❌ **If NOT detected:** Script is missing - **THIS IS THE PROBLEM**

### Step 2: Test the Link Manually 🔗

1. **Open Browser DevTools:**
   - Visit: `https://clipsonexclusive.com/?ref=hancn`
   - Press F12 to open DevTools
   - Go to "Network" tab
   - Clear the network log

2. **Look for Beacon Request:**
   - You should see a request to: `www.clipsonaffiliates.com/track?ref=hancn&beacon=true`
   - **If you see it:** ✅ Beacon is being sent
   - **If you DON'T see it:** ❌ JavaScript snippet is not working

3. **Check Request Status:**
   - ✅ **Status 200:** Server received it successfully
   - ❌ **Status 404:** Link doesn't exist in database (slug "hancn" not found)
   - ❌ **Status 500:** Server error (check logs)
   - ❌ **CORS error:** Server not allowing requests from clipsonexclusive.com
   - ❌ **No request:** JavaScript snippet not sending beacon

### Step 3: Check Browser Console 🖥️

1. **Open Console tab** in DevTools
2. **Look for errors:**
   - `Failed to fetch` → Network/CORS issue
   - `CORS policy` → Server needs to allow clipsonexclusive.com
   - No errors → Good, but check Network tab

### Step 4: Verify Link Exists in Database 📊

1. **Go to:** `/admin/test-stripe`
2. **Use "Check Click Tracking" tool**
3. **Enter:** `hancn`
4. **Check results:**
   - ✅ Link found → Good
   - ❌ Link not found → Link doesn't exist (this is the problem!)

### Step 5: Check Server Logs 📝

**If you have access to Vercel/Railway logs:**

Look for:
- `Track route hit with ref: { actualSlug: 'hancn', isBeacon: true }`
- `Found link by slug: hancn`
- `Beacon request detected, recording click for slug: hancn`
- `✅ Click recorded successfully for slug: hancn`
- `❌ Error storing click:` → Database issue
- `Link not found for slug: hancn` → Link doesn't exist

### Step 6: Test Direct Link 🎯

**Try visiting the tracking server directly:**
```
https://www.clipsonaffiliates.com/track?ref=hancn
```

**Expected behavior:**
- ✅ Redirects to destination URL
- ✅ Records a click in database
- ✅ Click appears in dashboard

**If this works:** The issue is with the JavaScript beacon (CORS, URL, or script not executing)

## Most Common Issues & Fixes

### Issue 1: JavaScript Snippet Not Installed ❌

**Symptoms:**
- Verify Script tool shows "Script not found"
- No beacon request in Network tab
- No cookie is set

**Fix:**
1. Get the JavaScript code:
   - Go to `/admin/clients`
   - Find "Clipson Exclusive" client
   - Click "✏️ Edit"
   - Copy the "Setup URL"
   - Open setup URL
   - Copy the JavaScript code from Section 3

2. Add to website:
   - WordPress: Appearance → Theme Editor → header.php (before `</head>`)
   - Webflow: Project Settings → Custom Code → Head Code
   - Shopify: Online Store → Themes → Edit Code → theme.liquid → Before `</head>`
   - Custom HTML: Add to `<head>` section

### Issue 2: Domain Mismatch ❌

**Symptoms:**
- Script is installed but not executing
- No beacon request sent

**Fix:**
- The script checks for: `clipsonexclusive.com` OR `www.clipsonexclusive.com`
- Make sure the domain in the script matches exactly
- If using `www.`, make sure script includes both variants

### Issue 3: Wrong Tracking Server URL ❌

**Symptoms:**
- Beacon request fails
- CORS errors in console
- 404 errors for `/track` endpoint

**Fix:**
- The script should send beacon to: `https://www.clipsonaffiliates.com/track?ref=hancn&beacon=true`
- Verify the tracking server URL in the JavaScript snippet
- Make sure it's `www.clipsonaffiliates.com` (not localhost or old URL)

### Issue 4: Link Doesn't Exist ❌

**Symptoms:**
- Beacon request succeeds but no clicks recorded
- "Link not found" in server logs

**Fix:**
- Verify the link slug `hancn` exists in the database
- Go to `/admin/links` and check if the link exists
- Make sure the slug matches exactly (case-sensitive)

### Issue 5: CORS Blocking Beacon ❌

**Symptoms:**
- Beacon request fails with CORS error
- Console shows: "Access to fetch at '...' has been blocked by CORS policy"

**Fix:**
- The `/track` route should have CORS headers
- Check that `Access-Control-Allow-Origin: *` is set
- Verify the route handles OPTIONS requests

## Expected Behavior

When someone visits `https://clipsonexclusive.com/?ref=hancn`:

1. ✅ JavaScript snippet detects `?ref=hancn`
2. ✅ Sets cookie: `ca_affiliate_id=hancn` (for Stripe attribution)
3. ✅ Sends beacon: `www.clipsonaffiliates.com/track?ref=hancn&beacon=true`
4. ✅ Tracking server records click in database
5. ✅ Click appears in clipper dashboard

## Testing Checklist

- [ ] JavaScript snippet installed on clipsonexclusive.com
- [ ] Script is in `<head>` section (or before `</body>`)
- [ ] Domain matches (`clipsonexclusive.com` or `www.clipsonexclusive.com`)
- [ ] Tracking server URL is correct (`www.clipsonaffiliates.com`)
- [ ] Link slug `hancn` exists in database
- [ ] Beacon request appears in Network tab
- [ ] No CORS errors in console
- [ ] Beacon request returns status 200
- [ ] Click appears in dashboard after visiting link
