# 🔍 Check Railway Logs for Error

## Step 1: View Logs

1. **Go to Railway Dashboard:**
   - https://railway.app/project/tracking-system
   - Click on **`tracking-system`** service

2. **Click "Logs" tab** (top navigation bar)

3. **Look for error messages:**
   - Usually says something like:
     - `table "clients" does not exist`
     - `Cannot connect to database`
     - `Prisma Client not generated`
   - Scroll to see the most recent errors

4. **Copy the error message** and share it

---

## Step 2: Most Likely Fix - Push Database Schema

**If you see "table does not exist" error:**

1. **Go to "Shell" tab** (or "Deployments" → latest → "Shell")

2. **Run:**
   ```bash
   npx prisma db push
   ```

3. **Wait for success:**
   - Should say: "Your database is now in sync with your schema"
   - This creates all tables

4. **Refresh your browser** and try again

---

## Step 3: Verify Database Connection

**Check in Railway:**

1. **Go to "Variables" tab**
2. **Look for `DATABASE_URL`:**
   - Should be automatically set by Railway
   - Should start with `postgresql://`
   - If missing, Postgres service might not be connected

3. **Check Postgres service:**
   - In Architecture view, Postgres should show "Online"
   - If not, there's a connection issue

---

## Common Errors & Fixes

### Error: "table 'clients' does not exist"
**Fix:** Run `npx prisma db push` in Shell

### Error: "Cannot connect to database"
**Fix:** 
- Check Postgres is "Online"
- Check `DATABASE_URL` is set

### Error: "Prisma Client not generated"
**Fix:** Run `npx prisma generate` then `npx prisma db push`

---

## Quick Action

**Most likely fix:**
1. Railway → Shell tab
2. Run: `npx prisma db push`
3. Wait for success
4. Refresh browser

**That's usually it!** ✅
