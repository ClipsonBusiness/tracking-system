# 🔗 Connect Postgres to Your App

## The Problem
Postgres is "Online" but `DATABASE_URL` is missing. This means they're not connected.

---

## ✅ Solution: Connect Postgres Service

### Step 1: Check Connection

**In Railway Architecture view:**
- You should see both `tracking-system` and `Postgres` services
- They should be visually connected (with a line/arrow)
- If not, they need to be connected

---

### Step 2: Connect Them

**Option A: Automatic Connection (Railway should do this)**

1. **Click on `tracking-system` service card**
2. **Look for connection options:**
   - Might see "Connect" or "Link" options
   - Or Railway might auto-detect Postgres

**Option B: Manual Connection via Variables**

1. **Get Postgres connection string:**
   - Click on **Postgres** service
   - Go to **"Variables"** tab
   - Look for connection details
   - Or go to **"Data"** tab → **"Connection Info"**
   - Copy the connection string

2. **Add to your app:**
   - Go to **`tracking-system`** service
   - Click **"Variables"** tab
   - Click **"New Variable"**
   - Key: `DATABASE_URL`
   - Value: (paste the Postgres connection string)
   - Click **"Add"**

---

### Step 3: Verify Connection

**After connecting:**

1. **Go to `tracking-system` → "Variables" tab**
2. **Check for `DATABASE_URL`:**
   - Should be listed
   - Should start with `postgresql://`
   - Railway might mark it as "Reference" (that's fine)

---

### Step 4: Push Database Schema

**Once DATABASE_URL is set:**

1. **Go to `tracking-system` → "Shell" tab**
2. **Run:**
   ```bash
   npx prisma db push
   ```
3. **Wait for success**
4. **Refresh browser and try login**

---

## 🔍 Quick Check

**Right now, check:**

1. **Click on `tracking-system` service**
2. **Go to "Variables" tab**
3. **Is `DATABASE_URL` listed?**
   - If YES → Great! Just push schema
   - If NO → Need to connect Postgres (see Step 2)

---

## 💡 Railway Auto-Connection

**Railway usually auto-connects services in the same project, but sometimes you need to:**

1. **Make sure both services are in the same project**
2. **Railway might need a moment to detect the connection**
3. **Try refreshing the page**
4. **Or manually add DATABASE_URL** (see Option B above)

---

## ✅ Most Likely Fix

**Since Postgres exists but DATABASE_URL is missing:**

1. **Click on `tracking-system` service**
2. **Go to "Variables" tab**
3. **Check if DATABASE_URL is there**
4. **If not, get Postgres connection string and add it manually**

**Then push schema and you're done!** 🎉

