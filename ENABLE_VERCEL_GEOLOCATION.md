# Enable Country Detection on Vercel

## The Problem

Country data shows "No country data available" because Vercel doesn't automatically provide geolocation headers.

## Solution: Enable Vercel Edge Network Geolocation

Vercel provides geolocation data through Edge Network headers, but you need to enable it.

### Option 1: Use Vercel Edge Headers (Recommended)

Vercel automatically provides geolocation headers when using Edge Functions or Middleware. The headers are:
- `x-vercel-ip-country` - Country code (e.g., "US", "GB")
- `x-vercel-ip-country-region` - Region code
- `x-vercel-ip-city` - City name

**The code already checks for these headers!** They should work automatically on Vercel.

### Option 2: Enable Vercel Analytics (Provides Geolocation)

1. Go to: Vercel Dashboard → Your Project → Analytics
2. Enable Vercel Analytics
3. This provides geolocation data automatically

### Option 3: Use IP Geolocation API (Fallback)

If headers aren't available, we can add IP-based geolocation using a free API like:
- `ipapi.co` (free tier: 1,000 requests/day)
- `ip-api.com` (free tier: 45 requests/minute)

## Current Status

The code now checks for:
1. ✅ `x-vercel-ip-country` (Vercel header)
2. ✅ `cf-ipcountry` (Cloudflare header)
3. ✅ `x-vercel-ip-country-code` (Alternative Vercel header)

## Why You Might Not See Country Data

1. **No clicks yet** - Country data only appears after clicks are tracked
2. **Vercel headers not enabled** - Check if Vercel is providing geolocation headers
3. **All clicks have null country** - Headers might not be available

## Testing

1. Click a tracking link: `https://lowbackability.com/?ref=xxdya`
2. Check if country is stored:
   - Go to Admin → Analytics
   - Check if clicks show country data
3. If still no country data:
   - Check Vercel logs for geolocation headers
   - Consider adding IP geolocation API fallback

## Next Steps

If country data still doesn't appear after clicks:
1. Check Vercel deployment logs
2. Verify geolocation headers are being sent
3. We can add IP-based geolocation API as a fallback

