# 🔍 Debugging Click Tracking - Step by Step

## Problem: Script is installed, cookies are set, but clicks aren't showing in dashboard

### Step 1: Check Network Tab (CRITICAL)

1. **Visit the link:**
   ```
   https://www.freeclipping.com/?ref=tcjsn
   ```

2. **Open DevTools:**
   - Press `F12` or `Cmd+Option+I`
   - Go to **Network** tab
   - Clear the log (trash icon)

3. **Look for beacon request:**
   - Filter by: `track`
   - You should see: `clipsonaffiliates.com/track?ref=tcjsn&beacon=true`
   
   **What to check:**
   - ✅ **Request exists:** Beacon is being sent
   - ✅ **Status 200:** Server received it successfully
   - ❌ **Status 404:** Link doesn't exist in database
   - ❌ **Status 500:** Server error (check logs)
   - ❌ **CORS error:** Server not allowing requests from freeclipping.com
   - ❌ **No request:** JavaScript snippet not sending beacon

### Step 2: Check Browser Console

1. **Open Console tab** in DevTools
2. **Look for errors:**
   - `Failed to fetch` → Network/CORS issue
   - `CORS policy` → Server needs to allow freeclipping.com
   - No errors → Good, but check Network tab

### Step 3: Verify Link Exists

1. **Go to:** `/admin/test-stripe`
2. **Use "Check Click Tracking" tool**
3. **Enter:** `tcjsn`
4. **Check results:**
   - ✅ Link found → Good
   - ❌ Link not found → Link doesn't exist (this is the problem!)

### Step 4: Check Server Logs

**If you have access to Vercel/Railway logs:**

Look for:
- `Track route hit with ref: { actualSlug: 'tcjsn', isBeacon: true }`
- `Found link by slug: tcjsn`
- `Beacon request detected, recording click for slug: tcjsn`
- `✅ Click recorded successfully for slug: tcjsn`
- `❌ Error storing click:` → Database issue

### Step 5: Test Direct Link

**Try visiting the tracking server directly:**
```
https://clipsonaffiliates.com/track?ref=tcjsn
```

**Expected behavior:**
- ✅ Redirects to destination URL
- ✅ Records a click in database
- ✅ Click appears in dashboard

**If this works:** The issue is with the JavaScript beacon (CORS, URL, or script not executing)

**If this doesn't work:** The link doesn't exist or there's a server issue

## Common Issues & Fixes

### Issue 1: Beacon Request Not Being Sent ❌

**Symptoms:**
- No request in Network tab
- Cookies are set (script is running)
- No errors in console

**Possible causes:**
1. **Wrong tracking server URL in script**
   - Check the JavaScript snippet on freeclipping.com
   - Should be: `clipsonaffiliates.com/track?ref=...&beacon=true`
   - NOT: `localhost:3000` or old URL

2. **Script not executing beacon code**
   - Check if script has `navigator.sendBeacon` call
   - Check if `trackingServerUrl` variable is correct

**Fix:**
- Re-copy JavaScript snippet from client setup page
- Make sure `trackingServerUrl` is `https://clipsonaffiliates.com`

### Issue 2: CORS Error ❌

**Symptoms:**
- Request appears in Network tab
- Status: `CORS error` or `Failed to fetch`
- Console shows: `Access-Control-Allow-Origin` error

**Fix:**
- The tracking server needs to allow requests from `freeclipping.com`
- Check `next.config.js` for CORS configuration
- May need to add `freeclipping.com` to allowed origins

### Issue 3: Link Doesn't Exist ❌

**Symptoms:**
- Request appears in Network tab
- Status: `404 Not Found`
- Server logs: `Link not found for slug: tcjsn`

**Fix:**
- Verify link exists: `/admin/links` or `/admin/test-stripe` → Check Click Tracking
- Make sure slug is exactly `tcjsn` (case-sensitive)
- Link might have been deleted or never created

### Issue 4: Database Error ❌

**Symptoms:**
- Request appears in Network tab
- Status: `500 Internal Server Error`
- Server logs: `Error storing click: ...`

**Fix:**
- Check database connection
- Check Prisma schema matches database
- Check if `clicks` table exists
- Check if `linkId` and `clientId` are valid

## Quick Test Checklist

- [ ] Visit `https://www.freeclipping.com/?ref=tcjsn`
- [ ] Open DevTools → Network tab
- [ ] Look for `track?ref=tcjsn&beacon=true` request
- [ ] Check request status (should be 200)
- [ ] Check browser console for errors
- [ ] Verify link exists: `/admin/test-stripe` → Check Click Tracking
- [ ] Check server logs for click recording
- [ ] Wait 10 seconds, refresh clipper dashboard
- [ ] Clicks should appear!

## Still Not Working?

1. **Share these details:**
   - Screenshot of Network tab (showing the beacon request)
   - Screenshot of Console tab (showing any errors)
   - Result from "Check Click Tracking" tool
   - Server logs (if available)

2. **Test direct link:**
   - Visit: `https://clipsonaffiliates.com/track?ref=tcjsn`
   - Does it redirect? Does it record a click?

3. **Check JavaScript snippet:**
   - View page source on freeclipping.com
   - Find the tracking script
   - Verify `trackingServerUrl` is correct
   - Verify `navigator.sendBeacon` call exists
