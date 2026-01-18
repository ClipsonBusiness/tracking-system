# 📦 Setup GitHub Repository

## Option 1: Create New Repository on GitHub (Recommended)

### Step 1: Create Repository on GitHub

1. Go to https://github.com
2. Click the **"+"** icon (top right) → **"New repository"**
3. Fill in:
   - **Repository name**: `tracking-system` (or any name you like)
   - **Description**: "Link tracking and affiliate attribution system"
   - **Visibility**: Choose Public or Private
   - **DO NOT** check "Initialize with README" (we already have code)
4. Click **"Create repository"**

### Step 2: Push Your Code to GitHub

Run these commands in your terminal:

```bash
# Navigate to your project
cd "/Users/tomastomasson/Tracking system"

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - Tracking system ready for Railway"

# Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/tracking-system.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**If you get authentication errors**, use GitHub CLI or set up SSH keys.

---

## Option 2: Use GitHub CLI (Easiest)

If you have GitHub CLI installed:

```bash
# Install GitHub CLI (if not installed)
# macOS: brew install gh
# Or download from: https://cli.github.com

# Login to GitHub
gh auth login

# Create repository and push (all in one command!)
gh repo create tracking-system --public --source=. --remote=origin --push
```

This will:
- Create the repository on GitHub
- Add it as remote
- Push your code
- Done! ✅

---

## Option 3: Deploy Without GitHub (Railway CLI)

You can deploy directly without GitHub using Railway CLI:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize and deploy
railway init
railway up
```

This uploads your code directly to Railway without needing GitHub.

---

## Quick Check: Do You Have Git?

Run this to check:

```bash
git --version
```

If you see a version number, git is installed. If not, install it:
- **macOS**: `brew install git` or download from https://git-scm.com

---

## After Setting Up GitHub

Once your code is on GitHub:

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Continue with Railway deployment (see `DEPLOY_RAILWAY.md`)

---

## Need Help?

- **GitHub Docs**: https://docs.github.com
- **GitHub CLI Docs**: https://cli.github.com/manual/
- **Railway Docs**: https://docs.railway.app

