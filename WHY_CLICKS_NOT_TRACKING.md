# 🔍 Why Clicks Aren't Being Tracked for `https://www.freeclipping.com/?ref=tcjsn`

## Quick Diagnosis Steps

### Step 1: Verify JavaScript Snippet is Installed

1. **Go to Admin Dashboard:**
   - Visit: `https://clipsonaffiliates.com/admin/test-stripe`
   - Use "Verify Tracking Script" tool
   - Enter: `freeclipping.com`
   - Click "Verify Script"

2. **Check Results:**
   - ✅ **If detected:** Script is installed, move to Step 2
   - ❌ **If NOT detected:** Script is missing - **THIS IS THE PROBLEM**

### Step 2: Test the Link Manually

1. **Open Browser DevTools:**
   - Visit: `https://www.freeclipping.com/?ref=tcjsn`
   - Press F12 to open DevTools
   - Go to "Network" tab
   - Clear the network log

2. **Look for Beacon Request:**
   - You should see a request to: `clipsonaffiliates.com/track?ref=tcjsn&beacon=true`
   - **If you see it:** ✅ Beacon is being sent
   - **If you DON'T see it:** ❌ JavaScript snippet is not working

3. **Check Browser Console:**
   - Go to "Console" tab
   - Look for JavaScript errors
   - Common errors:
     - `CORS policy` → Tracking server needs to allow requests from freeclipping.com
     - `Failed to fetch` → Network issue or wrong URL
     - No errors but no request → Script not executing

### Step 3: Verify Link Exists

1. **Check Link in Database:**
   - Go to: `/admin/test-stripe`
   - Use "Check Click Tracking" tool (once deployed)
   - Enter: `tcjsn`
   - **If link not found:** The slug doesn't exist in database

## Most Common Issues & Fixes

### Issue 1: JavaScript Snippet Not Installed ❌

**Symptoms:**
- Verify Script tool shows "Script not found"
- No beacon request in Network tab
- No cookie is set

**Fix:**
1. Get the JavaScript code:
   - Go to `/admin/clients`
   - Find your client
   - Click "✏️ Edit"
   - Generate access token
   - Copy "Setup URL"
   - Open setup URL
   - Enter domain: `freeclipping.com`
   - Copy the JavaScript code

2. Add to website:
   - WordPress: Install "WPCode" → Add code → "Site Wide Header"
   - Squarespace: Settings → Advanced → Code Injection → Header
   - Wix: Settings → Custom Code → Add Code → Head
   - Shopify: Online Store → Themes → Edit Code → theme.liquid → Before `</head>`

### Issue 2: Domain Mismatch ❌

**Symptoms:**
- Script is installed but not executing
- No beacon request sent

**Fix:**
- The script checks for: `freeclipping.com` OR `www.freeclipping.com`
- Make sure the domain in the script matches exactly
- If using `www.`, make sure script includes both variants

### Issue 3: Wrong Tracking Server URL ❌

**Symptoms:**
- Beacon request fails
- CORS errors in console
- 404 errors for `/track` endpoint

**Fix:**
- The script should send beacon to: `https://clipsonaffiliates.com/track?ref=tcjsn&beacon=true`
- Verify the tracking server URL in the JavaScript snippet
- Make sure it's `clipsonaffiliates.com` (not localhost or old URL)

### Issue 4: Link Doesn't Exist ❌

**Symptoms:**
- Beacon request succeeds but no clicks recorded
- "Link not found" in server logs

**Fix:**
- Verify the link slug `tcjsn` exists in the database
- Go to `/admin/links` and check if the link exists
- Make sure the slug matches exactly (case-sensitive)

## Expected Behavior

When someone visits `https://www.freeclipping.com/?ref=tcjsn`:

1. ✅ JavaScript snippet detects `?ref=tcjsn`
2. ✅ Sets cookie: `link_slug=tcjsn` (for Stripe attribution)
3. ✅ Sends beacon: `clipsonaffiliates.com/track?ref=tcjsn&beacon=true`
4. ✅ Tracking server records click in database
5. ✅ Click appears in clipper dashboard

## Testing Checklist

- [ ] JavaScript snippet installed on freeclipping.com
- [ ] Script is in `<head>` section (or before `</body>`)
- [ ] Domain matches (`freeclipping.com` or `www.freeclipping.com`)
- [ ] Tracking server URL is correct (`clipsonaffiliates.com`)
- [ ] Link slug `tcjsn` exists in database
- [ ] Beacon request appears in Network tab
- [ ] No CORS errors in console
- [ ] No JavaScript errors in console

## Quick Test

1. Visit: `https://www.freeclipping.com/?ref=tcjsn`
2. Open DevTools → Network tab
3. Look for: `track?ref=tcjsn&beacon=true`
4. **If you see it:** ✅ Tracking is working (check database)
5. **If you DON'T see it:** ❌ JavaScript snippet issue

## Need Help?

If clicks still aren't tracking after checking all of the above:

1. **Check Server Logs:**
   - Look for "Track route hit with ref: tcjsn"
   - Look for "Click stored successfully"
   - Look for any errors

2. **Verify Database:**
   - Check if clicks table has any records
   - Verify the link exists: `SELECT * FROM links WHERE slug = 'tcjsn'`

3. **Test Direct Link:**
   - Try: `https://clipsonaffiliates.com/track?ref=tcjsn`
   - This should redirect and record a click
   - If this works, the issue is with the JavaScript snippet
