# 🚀 Quick Push to GitHub

## Step 1: Get Personal Access Token

1. Go to: **https://github.com/settings/tokens**
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Fill in:
   - **Note**: `Railway Deployment`
   - **Expiration**: Choose 90 days or No expiration
   - **Scopes**: Check **`repo`** (this gives full repository access)
4. Click **"Generate token"**
5. **COPY THE TOKEN** - you won't see it again!

---

## Step 2: Push Your Code

Once you have the token, run:

```bash
cd "/Users/tomastomasson/Tracking system"

# Replace YOUR_TOKEN with the token you copied
git remote set-url origin https://YOUR_TOKEN@github.com/ClipsonBusiness/tracking-system.git

# Push to GitHub
git push -u origin main
```

---

## Step 3: Connect Railway to GitHub

1. Go to Railway Dashboard: https://railway.app/project/tracking-system
2. Click on **`tracking-system`** service (the app, not Postgres)
3. Go to **Settings** tab
4. Scroll to **"Source"** section
5. Click **"Connect GitHub"** or **"Change Source"**
6. Select: `ClipsonBusiness/tracking-system`
7. Select branch: `main`
8. Railway will automatically deploy! ✅

---

## After Connection

Every time you push to GitHub:
```bash
git push
```

Railway will automatically build and deploy! 🎉

---

**Get your token and let's push!** 🔐
