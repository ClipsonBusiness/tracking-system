# Click Tracking Format - What Worked Well

## Overview
This document explains the link click tracking formats that work best in the system.

## Format 1: Direct Link Tracking (Primary - Used by Clippers)

### Clean URL Format (Recommended)
```
https://tracking-server.com/[slug]
https://tracking-server.com/l/[slug]
```

**Example:**
```
https://clipsonaffiliates.com/pynhl
https://clipsonaffiliates.com/l/pynhl
```

**How it works:**
- The `[slug]` is the unique link identifier (e.g., `pynhl`)
- When clicked, the system:
  1. Records the click in the database
  2. Sets `aff_code` cookie (if `?aff=` parameter present)
  3. Sets `link_slug` cookie for conversion attribution
  4. Redirects to the destination URL

### With Affiliate Code Parameter
```
https://tracking-server.com/[slug]?aff=AFFILIATE_CODE
https://tracking-server.com/l/[slug]?aff=AFFILIATE_CODE
```

**Example:**
```
https://clipsonaffiliates.com/pynhl?aff=ABCD
```

**How it works:**
- The `?aff=` parameter identifies the clipper/affiliate
- Sets a cookie `aff_code` with 60-day expiry
- Used for tracking which affiliate sent the click

## Format 2: Custom Domain Tracking (For Client Websites)

### Client's Custom Domain Format
```
https://client-domain.com/?ref=AFFILIATE_ID
```

**Example:**
```
https://freeclipping.com/?ref=ABCD
```

**How it works:**
- Requires JavaScript tracking script installed on client's website
- The script:
  1. Reads `?ref=` parameter from URL
  2. Sets `ca_affiliate_id` cookie (90-day expiry) on client's domain
  3. Sends beacon to tracking server: `/track?ref=AFFILIATE_ID&beacon=true`
  4. Tracking server records the click

**JavaScript Code Generated:**
```javascript
<!-- Clipson Affiliate Tracking -->
<script>
(function() {
  const urlParams = new URLSearchParams(window.location.search);
  const refParam = urlParams.get('ref');
  
  if (!refParam) return;

  // Set cookie on client's domain (90 days expiry)
  const expiryDays = 90;
  const expiryDate = new Date();
  expiryDate.setTime(expiryDate.getTime() + (expiryDays * 24 * 60 * 60 * 1000));
  document.cookie = 'ca_affiliate_id=' + encodeURIComponent(refParam) + 
    '; expires=' + expiryDate.toUTCString() + 
    '; path=/' + 
    '; SameSite=Lax' + 
    (location.protocol === 'https:' ? '; Secure' : '');

  // Record click on tracking server (non-blocking beacon)
  const beaconUrl = 'https://tracking-server.com/track?ref=' + encodeURIComponent(refParam) + '&beacon=true';
  
  if (navigator.sendBeacon) {
    navigator.sendBeacon(beaconUrl);
  } else {
    fetch(beaconUrl, { method: 'GET', keepalive: true }).catch(() => {});
  }
})();
</script>
```

## Format 3: Track Route (For Beacon Requests)

### Beacon Format
```
https://tracking-server.com/track?ref=SLUG&beacon=true
```

**How it works:**
- Used by JavaScript tracking script to record clicks
- `ref` parameter contains the link slug
- `beacon=true` indicates this is a beacon request (no redirect)
- Returns 200 OK after recording click

## Summary: Which Format to Use

### For Clippers (Direct Links)
✅ **Use:** `https://tracking-server.com/[slug]` or `https://tracking-server.com/l/[slug]`
- Clean, simple URLs
- Automatic click tracking
- Supports `?aff=` parameter for affiliate identification

### For Client Websites (Custom Domain)
✅ **Use:** `https://client-domain.com/?ref=AFFILIATE_ID`
- Requires JavaScript tracking script installation
- Sets cookie on client's domain for Stripe checkout
- Automatically sends beacon to tracking server

### Key Differences

| Format | URL Structure | Click Tracking | Cookie Domain | Use Case |
|--------|--------------|----------------|---------------|----------|
| Direct Link | `/l/[slug]` | Automatic | Tracking server | Clipper links |
| Custom Domain | `/?ref=ID` | Via JavaScript | Client domain | Client website |

## Best Practices

1. **For Clippers:** Always use the clean `/l/[slug]` format
2. **For Clients:** Install the JavaScript tracking script and use `?ref=` format
3. **Affiliate Codes:** Use `?aff=` parameter when you need to track specific affiliates
4. **UTM Parameters:** All formats support UTM parameters (`?utm_source=...&utm_medium=...`)

## Technical Details

### Click Recording
- All clicks are stored in the `clicks` table
- Includes: IP hash, country, city, referer, user agent, UTM parameters, affiliate code
- Requires `clientId` to be set on the link

### Cookie Management
- `aff_code`: Set by tracking server, 60-day expiry
- `link_slug`: Set by tracking server, 60-day expiry (for conversion attribution)
- `ca_affiliate_id`: Set by client's JavaScript, 90-day expiry (for Stripe checkout)

### Conversion Attribution
- Sales are attributed to links using:
  1. `link_slug` cookie (set when link is clicked)
  2. Stripe checkout metadata (`ca_affiliate_id`)
  3. Link slug matching in webhook handler
