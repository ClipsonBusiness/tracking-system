# 🚨 Push Database Schema - Fix Server Error

## The Problem
You're seeing: "Application error: a server-side exception has occurred"

**This means:** The database tables don't exist yet!

---

## ✅ Fix: Push Database Schema

### Step 1: Open Railway Shell

1. **Go to Railway Dashboard:**
   - https://railway.app/project/tracking-system
   - Click on **`tracking-system`** service (your app, not Postgres)

2. **Click "Shell" tab:**
   - If you don't see "Shell" tab, try:
     - "Deployments" tab → Click latest deployment → "Shell" button
     - Or look for a terminal/console icon

---

### Step 2: Run Database Push Command

**In the Shell terminal, type:**
```bash
npx prisma db push
```

**Press Enter**

---

### Step 3: Wait for Success

**You should see:**
```
✔ Generated Prisma Client
✔ Your database is now in sync with your schema.
```

**If you see errors:**
- Check that Postgres service is "Online" in Railway
- Check that `DATABASE_URL` is set in Variables tab

---

### Step 4: Refresh Browser

1. **Go back to your app:**
   - https://tracking-system-production-d23c.up.railway.app/login

2. **Try logging in again**
3. **Should work now!** ✅

---

## 🔍 If Shell Tab Doesn't Work

**Alternative: Use Railway CLI**

1. **In your local terminal:**
   ```bash
   cd "/Users/tomastomasson/Tracking system"
   npx @railway/cli run npx prisma db push
   ```

2. **This will run the command in Railway's environment**

---

## 📋 What This Does

The `npx prisma db push` command:
- Creates all database tables (clients, links, clicks, etc.)
- Sets up relationships between tables
- Generates Prisma Client
- Makes your database ready to use

**Without this, your app can't work because there are no tables!**

---

## ✅ After Success

Once the schema is pushed:
- ✅ Database tables exist
- ✅ App can query the database
- ✅ Login should work
- ✅ You can create links, clients, etc.

---

## 🚀 Quick Action

**Right now:**
1. Railway Dashboard → `tracking-system` service
2. Click "Shell" tab
3. Run: `npx prisma db push`
4. Wait for success
5. Refresh browser
6. Try login again

**That's it!** 🎉
