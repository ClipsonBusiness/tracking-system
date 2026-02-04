# 🔧 Fix Click Tracking for freeclipping.com

## Step-by-Step Troubleshooting Guide

### Step 1: Verify JavaScript Snippet is Installed

1. **Go to Admin Dashboard:**
   - Visit: `https://clipsonaffiliates.com/admin/test-stripe`
   - Log in with admin password

2. **Use "Verify Tracking Script" Tool:**
   - Find the "Verify Tracking Script" section (purple box)
   - Enter: `freeclipping.com`
   - Click "Verify Script"
   - **Check the results:**
     - ✅ **If detected:** Script is installed, move to Step 2
     - ❌ **If NOT detected:** Script is missing, go to Step 3

### Step 2: Check if Clicks are Being Recorded

1. **Use "Check Click Tracking" Tool:**
   - Find the "Check Click Tracking" section (green box)
   - Enter the link slug: `tcjsn` (or whatever slug you're using)
   - Click "Check Clicks"
   - **Check the results:**
     - If clicks show up → ✅ **Working!**
     - If 0 clicks → Continue to Step 3

### Step 3: Install/Update JavaScript Snippet

1. **Get Client Setup Link:**
   - Go to: `https://clipsonaffiliates.com/admin/clients`
   - Find the client (likely "flexus1" or similar)
   - Look for the green "Client Setup Link" box
   - Copy the setup URL

2. **Access Client Setup Page:**
   - Open the setup URL in a new tab
   - You'll see a yellow/orange section at the top: "Step 1: Add JavaScript Tracking Code"

3. **Generate the Code:**
   - Enter domain: `freeclipping.com` (without https:// or www)
   - The JavaScript code will appear in a green code box
   - Click "📋 Copy Code"

4. **Add to Website:**
   - **WordPress:**
     - Install "WPCode" plugin (free)
     - Go to: WPCode → Code Snippets → Add New
     - Paste the code
     - Set location: "Site Wide Header"
     - Save and Activate
   
   - **Squarespace:**
     - Settings → Advanced → Code Injection
     - Paste in "Header" section
     - Save
   
   - **Wix:**
     - Settings → Custom Code
     - Add Code → Head
     - Paste and Apply
   
   - **Shopify:**
     - Online Store → Themes → Actions → Edit Code
     - Open `theme.liquid`
     - Paste before `</head>`
     - Save
   
   - **Custom HTML:**
     - Open your website's HTML file
     - Paste in `<head>` section (before `</head>`)
     - Save and publish

### Step 4: Verify Installation

1. **Check the Script is Live:**
   - Visit: `https://www.freeclipping.com`
   - Right-click → "View Page Source"
   - Press Ctrl+F (or Cmd+F) and search for: `Clipson Affiliate Tracking`
   - **If found:** ✅ Script is installed
   - **If not found:** Script wasn't added correctly, repeat Step 3

2. **Test the Tracking:**
   - Visit: `https://www.freeclipping.com/?ref=tcjsn`
   - Open Browser DevTools (F12)
   - Go to "Network" tab
   - Look for a request to: `clipsonaffiliates.com/track?ref=tcjsn&beacon=true`
   - **If you see it:** ✅ Tracking is working!
   - **If you don't see it:** Check browser console for errors

3. **Check Clicks Again:**
   - Go back to: `https://clipsonaffiliates.com/admin/test-stripe`
   - Use "Check Click Tracking" tool
   - Enter: `tcjsn`
   - Clicks should now appear!

### Step 5: Common Issues & Fixes

#### Issue: Script Not Detected
**Fix:**
- Make sure you pasted the ENTIRE code block (including the `<!-- Clipson Affiliate Tracking -->` comment)
- Check that it's in the `<head>` section, not `<body>`
- Clear browser cache and check again

#### Issue: Domain Mismatch
**Fix:**
- The script checks for `freeclipping.com` or `www.freeclipping.com`
- Make sure you entered the domain correctly in the setup form
- If using `www.`, make sure the script includes both variants

#### Issue: CORS Errors in Console
**Fix:**
- The tracking server must allow requests from `freeclipping.com`
- Check server logs for CORS errors
- Verify the tracking server URL is correct in the snippet

#### Issue: Link Slug Not Found
**Fix:**
- Verify the link slug `tcjsn` exists in the database
- Go to `/admin/links` and check if the link exists
- Make sure you're using the correct slug

### Step 6: Verify Everything Works

1. **Test a Real Click:**
   - Visit: `https://www.freeclipping.com/?ref=tcjsn`
   - Wait 5-10 seconds
   - Go to: `/admin/test-stripe`
   - Check clicks for `tcjsn`
   - You should see your click appear!

2. **Check Clipper Dashboard:**
   - Go to clipper dashboard with code `mflp` (or relevant code)
   - Clicks should appear in their dashboard

## Quick Checklist

- [ ] JavaScript snippet installed on freeclipping.com
- [ ] Script is in `<head>` section
- [ ] Domain matches (freeclipping.com or www.freeclipping.com)
- [ ] Link slug `tcjsn` exists in database
- [ ] Test visit to `freeclipping.com/?ref=tcjsn` shows network request
- [ ] Clicks appear in admin dashboard

## Need Help?

If clicks still aren't working after following these steps:

1. **Check Server Logs:**
   - Look for errors in Vercel/Railway logs
   - Search for "Track route hit" or "Error storing click"

2. **Verify Database Connection:**
   - Make sure the database is accessible
   - Check if other clicks are being recorded

3. **Test Direct Link:**
   - Try: `https://clipsonaffiliates.com/track?ref=tcjsn`
   - This should redirect and record a click
   - If this works, the issue is with the JavaScript snippet

4. **Contact Support:**
   - Share the results from the diagnostic tools
   - Include any browser console errors
   - Include server log errors
