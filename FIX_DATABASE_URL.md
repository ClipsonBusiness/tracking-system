# 🔧 Fix DATABASE_URL Missing Error

## The Problem
Error: `Environment variable not found: DATABASE_URL`

Railway should automatically set this when Postgres is connected, but it's missing.

---

## ✅ Solution: Connect Postgres Service

### Step 1: Check Postgres Service

1. **Go to Railway Dashboard:**
   - https://railway.app/project/tracking-system
   - Look at the Architecture view

2. **Check if Postgres is connected:**
   - You should see a **Postgres** service
   - It should show "Online" with a green dot
   - If it's not there, you need to add it

---

### Step 2: Connect Postgres to Your App

**If Postgres exists but isn't connected:**

1. **In Architecture view:**
   - Click on **`tracking-system`** service (your app)
   - Look for connection options or "Connect" button
   - Connect it to the **Postgres** service

2. **Or check Variables:**
   - Go to `tracking-system` service → "Variables" tab
   - Look for `DATABASE_URL`
   - If missing, Railway needs to connect the services

---

### Step 3: Add Postgres Service (If Missing)

**If you don't have Postgres:**

1. **In Railway Dashboard:**
   - Click **"+ New"** button
   - Select **"Database"** → **"Add PostgreSQL"**

2. **Railway will:**
   - Create the database
   - Automatically set `DATABASE_URL` for your app
   - Connect them together

3. **Wait for it to finish:**
   - Should show "Online" status

---

### Step 4: Verify DATABASE_URL is Set

1. **Go to `tracking-system` service → "Variables" tab**

2. **Look for `DATABASE_URL`:**
   - Should be there automatically
   - Should start with `postgresql://`
   - Should NOT be editable (Railway manages it)

3. **If it's still missing:**
   - Try disconnecting and reconnecting Postgres
   - Or manually add it (see Step 5)

---

### Step 5: Manual Fix (If Auto-Connect Doesn't Work)

**If Railway didn't auto-set it:**

1. **Get Postgres connection string:**
   - Click on **Postgres** service
   - Go to **"Variables"** tab
   - Look for connection details
   - Or go to **"Data"** tab → **"Connection Info"**

2. **Copy the connection string:**
   - Should look like: `postgresql://postgres:password@host:port/railway`

3. **Add to your app:**
   - Go to `tracking-system` service → "Variables" tab
   - Click **"New Variable"**
   - Key: `DATABASE_URL`
   - Value: (paste the connection string)
   - Click **"Add"**

---

### Step 6: Push Database Schema

**After DATABASE_URL is set:**

1. **Go to Shell tab:**
   - `tracking-system` service → "Shell" tab

2. **Run:**
   ```bash
   npx prisma db push
   ```

3. **Wait for success**

4. **Refresh browser and try login again**

---

## 🔍 Quick Check

**In Railway Dashboard:**

1. **Architecture view:**
   - Do you see a **Postgres** service?
   - Is it "Online"?
   - Is it connected to `tracking-system`?

2. **Variables tab:**
   - Go to `tracking-system` → "Variables"
   - Is `DATABASE_URL` listed?
   - If not, Postgres isn't connected

---

## ✅ Most Likely Fix

**If Postgres exists but isn't connected:**

1. Railway → Architecture view
2. Make sure Postgres service is there
3. Connect it to `tracking-system` service
4. Railway should auto-set `DATABASE_URL`
5. Then push schema: `npx prisma db push`

---

**Check your Railway Architecture view first - is Postgres connected to your app?** 🔍
