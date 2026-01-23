# 🔧 Fix Server Error After Login

## The Problem
You're seeing: "Application error: a server-side exception has occurred"

This usually means:
1. **Database tables don't exist** (most common)
2. **Missing environment variables**
3. **Database connection issue**

---

## ✅ Solution: Step by Step

### Step 1: Check Railway Logs (2 min)

1. **Go to Railway Dashboard:**
   - https://railway.app/project/tracking-system
   - Click on **`tracking-system`** service

2. **Click "Logs" tab** (top navigation)

3. **Look for error messages:**
   - Usually says something like "table does not exist"
   - Or "Cannot connect to database"
   - Copy the error message

---

### Step 2: Push Database Schema (Most Likely Fix)

**In Railway Dashboard:**

1. Click on **`tracking-system`** service
2. Click **"Shell"** tab (or "Deployments" → latest → "Shell")
3. Run this command:
   ```bash
   npx prisma db push
   ```
4. Wait for ✅ success message
5. Should say: "Your database is now in sync with your schema"

**This creates all the database tables!**

---

### Step 3: Verify Environment Variables

**In Railway Dashboard:**

1. Click **"Variables"** tab
2. Make sure you have:
   - ✅ `ADMIN_PASSWORD` = (your password)
   - ✅ `DATABASE_URL` = (should be auto-set by Railway)
   - ✅ `APP_BASE_URL` = (your Railway URL)
   - ✅ `IP_SALT` = (random string)

**If `DATABASE_URL` is missing:**
- Railway should set it automatically
- If not, check that Postgres service is connected

---

### Step 4: Restart the App

**After pushing schema:**

1. Go to **"Deployments"** tab
2. Click **"Redeploy"** on the latest deployment
3. Or just wait - Railway might auto-restart

---

### Step 5: Try Login Again

1. Go to: `https://tracking-system-production-d23c.up.railway.app/login`
2. Enter your password
3. Should work now! ✅

---

## 🔍 Common Errors & Fixes

### Error: "table does not exist"
**Fix:** Run `npx prisma db push` in Shell

### Error: "Cannot connect to database"
**Fix:** 
- Check Postgres service is "Online" in Railway
- Check `DATABASE_URL` is set in Variables

### Error: "ADMIN_PASSWORD is not defined"
**Fix:** Add `ADMIN_PASSWORD` in Variables tab

### Error: "Prisma Client not generated"
**Fix:** Run `npx prisma generate` in Shell (though `db push` should do this)

---

## 📋 Quick Checklist

- [ ] Check Logs tab for specific error
- [ ] Push database schema (`npx prisma db push` in Shell)
- [ ] Verify environment variables are set
- [ ] Restart app (Redeploy)
- [ ] Try login again

---

## 🚀 Most Likely Fix

**90% of the time, it's the database schema:**

1. Railway → Shell tab
2. Run: `npx prisma db push`
3. Wait for success
4. Try login again

**That's usually it!** ✅

---

**Start with Step 2 (push database schema) - that's the most common fix!**

