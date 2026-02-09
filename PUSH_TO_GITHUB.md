# 🔐 Push to GitHub - Authentication Fix

## The Problem
You're authenticated as `Tomasjr20` but trying to push to `ClipsonBusiness` organization.

## ✅ Solution Options

### Option 1: Use SSH (Recommended if you have SSH keys)

```bash
cd "/Users/tomastomasson/Tracking system"
git remote set-url origin git@github.com:ClipsonBusiness/tracking-system.git
git push -u origin main
```

**If you don't have SSH keys set up:**
1. Generate SSH key: `ssh-keygen -t ed25519 -C "your_email@example.com"`
2. Add to GitHub: https://github.com/settings/keys
3. Then use the command above

---

### Option 2: Use Personal Access Token (Easiest)

1. **Create a token:**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Name: `Railway Deployment`
   - Select scopes: `repo` (full control)
   - Click "Generate token"
   - **Copy the token** (you won't see it again!)

2. **Update remote URL with token:**
   ```bash
   cd "/Users/tomastomasson/Tracking system"
   git remote set-url origin https://YOUR_TOKEN@github.com/ClipsonBusiness/tracking-system.git
   git push -u origin main
   ```
   (Replace `YOUR_TOKEN` with the token you copied)

---

### Option 3: Re-authenticate with Correct Account

```bash
cd "/Users/tomastomasson/Tracking system"

# Clear stored credentials
git credential-osxkeychain erase
host=github.com
protocol=https

# Then push (will prompt for credentials)
git push -u origin main
```

When prompted, enter:
- Username: Your GitHub username (or organization name)
- Password: Your Personal Access Token (not your password!)

---

## After Successful Push

Once code is pushed to GitHub:

1. **Go to Railway Dashboard:**
   https://railway.app/project/tracking-system

2. **Connect to GitHub:**
   - Click on `tracking-system` service (the app)
   - Go to **Settings** tab
   - Scroll to **"Source"** section
   - Click **"Connect GitHub"** or **"Change Source"**
   - Select: `ClipsonBusiness/tracking-system`
   - Select branch: `main`
   - Railway will auto-deploy! ✅

3. **Future deployments:**
   ```bash
   git push
   ```
   Railway will automatically build and deploy!

---

## Quick Check

After pushing, verify:
```bash
git remote -v
```

Should show:
```
origin  https://github.com/ClipsonBusiness/tracking-system.git (fetch)
origin  https://github.com/ClipsonBusiness/tracking-system.git (push)
```

---

**Choose the option that works best for you!** 🚀
