# Cursor Prompt for Adding Tracking Code to ClipSon Exclusive

## Copy and paste this prompt into Cursor:

---

**I need to add a JavaScript tracking redirect script to my website. The script should:**

1. **Detect when someone visits URLs with `?ref=` query parameters** (e.g., `https://www.clipsonexclusive.com/?ref=ktcdm`)
2. **Redirect those requests to my tracking server** at `https://tracking-system-production-d23c.up.railway.app/?ref=[ref-code]`
3. **Only run on my domain** (`clipsonexclusive.com` and `www.clipsonexclusive.com`)
4. **Not interfere with normal website functionality** - it should only redirect tracking links

**Here's the JavaScript code that needs to be added:**

```javascript
(function() {
  // Only run on your custom domain
  if (window.location.hostname !== 'clipsonexclusive.com' && 
      window.location.hostname !== 'www.clipsonexclusive.com') {
    return;
  }

  // Check for ?ref= query parameter first (e.g., /?ref=xxxx)
  const urlParams = new URLSearchParams(window.location.search);
  const refParam = urlParams.get('ref');
  
  if (refParam) {
    // Redirect with ?ref= parameter
    const trackingUrl = 'https://tracking-system-production-d23c.up.railway.app/?ref=' + refParam;
    window.location.href = trackingUrl;
    return;
  }

  // Get the current path (e.g., /ref=xxxx or /xxxxx)
  const path = window.location.pathname;
  
  // Skip if it's a root path or common paths
  if (path === '/' || path.startsWith('/api/') || path.startsWith('/_next/')) {
    return;
  }

  // Extract slug from path (remove leading slash)
  const slug = path.substring(1);
  
  // If there's a slug, redirect to tracking server
  if (slug && slug.length > 0) {
    const trackingUrl = 'https://tracking-system-production-d23c.up.railway.app/' + slug + window.location.search;
    window.location.href = trackingUrl;
  }
})();
```

**Please:**
1. Find the best place to add this script (likely in the `<head>` section or before `</body>`)
2. Add it in a way that doesn't break existing functionality
3. Make sure it runs early enough to catch tracking link visits
4. Ensure it's wrapped in a script tag if needed

**The script should be added as early as possible in the page load to ensure tracking links are caught before the page fully renders.**

---

## Alternative Shorter Prompt:

**Add a JavaScript redirect script that detects `?ref=` query parameters on `clipsonexclusive.com` and redirects to `https://tracking-system-production-d23c.up.railway.app/?ref=[ref-code]`. The script should only run on my domain and not interfere with normal site functionality. Add it to the `<head>` section or before `</body>` tag.**


