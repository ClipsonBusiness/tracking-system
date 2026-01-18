# Client Requirements - What You Need vs What's Optional

## ✅ Minimum Required (Client Must Provide)

### 1. Destination URLs
**What you need:** The URLs they want to track
- Example: `https://lowbackability.com/signup`
- Example: `https://lowbackability.com/pricing`
- Example: `https://lowbackability.com/checkout`

**Why:** You need to know where the links should redirect

**How to get it:** Ask them: "What pages do you want to track?"

---

## 🎯 Optional but Recommended

### 2. Custom Domain (If They Want Branded Links)
**What you need:** Domain they own (e.g., `lowbackability.com`)

**Why:** So links look like `lowbackability.com/fhkeo` instead of `yourserver.com/fhkeo`

**Requirements:**
- They must own the domain
- They need to set up DNS to point to your server
- OR you set up a reverse proxy

**If they don't have one:** Use your tracking server's domain (works fine!)

---

### 3. Affiliate Information (If Running Affiliate Program)
**What you need:**
- Affiliate codes/names (e.g., `AFF001`, `JOHN2024`)
- Optional: Payout percentages

**Why:** To track which affiliates drive traffic/revenue

**If they don't have affiliates:** Skip this - links still work!

---

### 4. Stripe Account Details (If Tracking Revenue)
**What you need:**
- Stripe account ID (if multi-tenant)
- Webhook endpoint access

**Why:** To attribute revenue to affiliates

**If they don't use Stripe:** Skip this - click tracking still works!

---

## 📋 Typical Client Onboarding

### Scenario 1: Simple Link Tracking (Minimum)
**Client provides:**
- List of URLs to track

**You do:**
- Create links in admin dashboard
- Give them the tracking links
- Done! ✅

**Example:**
```
Client: "I want to track these pages:
- https://lowbackability.com/signup
- https://lowbackability.com/pricing"

You: Create links → Give them:
- https://yourserver.com/fhkeo
- https://yourserver.com/abcde
```

---

### Scenario 2: Branded Links (With Custom Domain)
**Client provides:**
- URLs to track
- Domain they own (e.g., `lowbackability.com`)

**You do:**
- Create links
- Set custom domain in Settings
- Help them configure DNS (or do it yourself)
- Give them branded links

**Example:**
```
Client: "I want links on lowbackability.com"

You: 
1. Create links
2. Set custom domain: lowbackability.com
3. Configure DNS (or guide them)
4. Give them: lowbackability.com/fhkeo
```

---

### Scenario 3: Full Affiliate Program
**Client provides:**
- URLs to track
- List of affiliates with codes
- Optional: Payout percentages

**You do:**
- Create links
- Create affiliates
- Generate share links for each affiliate
- Set up Stripe webhook (if tracking revenue)

**Example:**
```
Client: "I have 3 affiliates: JOHN, MARY, BOB"

You:
1. Create links
2. Create affiliates: JOHN, MARY, BOB
3. Give each affiliate their link:
   - JOHN: yourserver.com/fhkeo?aff=JOHN
   - MARY: yourserver.com/fhkeo?aff=MARY
   - BOB: yourserver.com/fhkeo?aff=BOB
```

---

## 🚀 Quick Start Checklist

### For You (Admin):
- [ ] Client provides destination URLs
- [ ] Create links in Admin → Links
- [ ] Copy tracking links
- [ ] Share with client

### Optional Additions:
- [ ] Custom domain? → Set in Settings, configure DNS
- [ ] Affiliates? → Create in Admin → Affiliates
- [ ] Revenue tracking? → Set up Stripe webhook

---

## 💡 Pro Tips

### You Can Do Most of It Yourself
- **Create the links** - Just need the destination URLs
- **Generate short codes** - System does this automatically
- **Set up tracking** - Already built in
- **View analytics** - Already available

### Client Just Needs to:
1. **Give you URLs** (that's it for basic tracking!)
2. **Use the tracking links** you provide
3. **Optional:** Set up DNS if they want custom domain

### What You DON'T Need:
- ❌ Client doesn't need to log into your system
- ❌ Client doesn't need technical knowledge
- ❌ Client doesn't need to set up anything (except DNS if custom domain)
- ❌ Client doesn't need to understand how it works

---

## 📝 Example Client Request Form

**Simple version:**
```
Hi [Client],

To set up your tracking links, I just need:

1. The URLs you want to track:
   - [URL 1]
   - [URL 2]
   - [URL 3]

That's it! I'll create the tracking links and send them to you.

Optional:
- Do you have a custom domain you'd like to use?
- Do you have affiliates to track?
```

---

## 🎯 Bottom Line

**Minimum:** Just destination URLs
**Recommended:** URLs + custom domain (if they want branded links)
**Full Setup:** URLs + custom domain + affiliates + Stripe

**You handle:** Everything technical
**Client handles:** Just providing URLs (and DNS if custom domain)

