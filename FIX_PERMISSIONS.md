# 🔧 Fix npm Permission Error

You're getting a permission error because npm is trying to install globally to `/usr/local/lib/node_modules/` which requires admin access.

## ✅ Solution 1: Use npx (Easiest - No Installation!)

**You don't need to install Railway CLI globally!** Just use `npx`:

```bash
# Login
npx @railway/cli login

# Initialize project
npx @railway/cli init

# Add PostgreSQL
npx @railway/cli add postgresql

# Deploy
npx @railway/cli up

# All other commands work the same way:
npx @railway/cli variables set ADMIN_PASSWORD="your-password"
npx @railway/cli run npx prisma db push
npx @railway/cli logs
```

**This is the recommended approach!** No permission issues, no installation needed.

---

## Solution 2: Use sudo (Quick Fix)

If you want to install globally:

```bash
sudo npm i -g @railway/cli
```

Then use normally:
```bash
railway login
railway init
```

**Note:** Using `sudo` with npm is generally not recommended, but it works.

---

## Solution 3: Fix npm Permissions Properly (Best Long-term)

Fix npm to install global packages to your home directory:

```bash
# Create directory for global packages
mkdir ~/.npm-global

# Configure npm to use it
npm config set prefix '~/.npm-global'

# Add to PATH (for zsh)
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc

# Reload shell
source ~/.zshrc

# Now install without sudo
npm i -g @railway/cli
```

This fixes npm permissions permanently for all future global installs.

---

## Recommendation

**Use Solution 1 (npx)** - It's the easiest and doesn't require any setup or permissions!

Just replace `railway` with `npx @railway/cli` in all commands.
