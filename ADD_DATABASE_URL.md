# 🔧 Add DATABASE_URL Manually

## The Problem
`DATABASE_URL` is NOT in the Railway variables list. Postgres isn't connected to your app.

---

## ✅ Solution: Get Postgres Connection String

### Step 1: Get Postgres Connection String

1. **In Railway Dashboard:**
   - Click on the **Postgres** service card (in Architecture view)
   - Or go to the Postgres service directly

2. **Go to "Variables" tab:**
   - Look for connection-related variables
   - Or go to **"Data"** tab → **"Connection Info"**

3. **Find the connection string:**
   - Should look like: `postgresql://postgres:password@host:port/railway`
   - Or you might see separate variables:
     - `PGHOST`
     - `PGPORT`
     - `PGUSER`
     - `PGPASSWORD`
     - `PGDATABASE`

4. **If you see separate variables, construct the connection string:**
   ```
   postgresql://PGUSER:PGPASSWORD@PGHOST:PGPORT/PGDATABASE
   ```
   (Replace with actual values)

---

### Step 2: Add DATABASE_URL to Your App

1. **Go back to `tracking-system` service**
2. **Click "Variables" tab**
3. **Click "+ New Variable" button** (top right)
4. **Fill in:**
   - **Key:** `DATABASE_URL`
   - **Value:** (paste the Postgres connection string)
5. **Click "Add"**

---

### Step 3: Push Database Schema

**After DATABASE_URL is added:**

1. **Go to "Shell" tab** (next to "Variables")
2. **Run:**
   ```bash
   npx prisma db push
   ```
3. **Wait for success**
4. **Refresh browser and try login**

---

## 🔍 Alternative: Use Railway's Database Connection

**If Railway has a "Connect Database" feature:**

1. **Look for a link or button:**
   - "Trying to connect a database? Add Variable"
   - Or "Connect Database" button
   - This might auto-add DATABASE_URL

2. **Click it and follow the prompts**

---

## 📋 Quick Steps

1. **Click Postgres service → Variables tab**
2. **Get connection string** (or construct from PGHOST, PGPORT, etc.)
3. **Go to tracking-system → Variables → + New Variable**
4. **Add:** Key=`DATABASE_URL`, Value=(connection string)
5. **Shell tab → `npx prisma db push`**
6. **Refresh browser**

---

**Get the Postgres connection string first, then add it!** 🔗

