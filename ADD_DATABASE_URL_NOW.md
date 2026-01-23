# ✅ Add DATABASE_URL - Exact Steps

## Connection String

**Use this exact value:**

```
postgresql://postgres:LEsjfKtIebCSfiQpJyJnwuPgkVODPwcM@postgres.railway.internal:5432/railway
```

---

## Step-by-Step

### Step 1: Add Variable

1. **In Railway Dashboard:**
   - You should be in `tracking-system` service → "Variables" tab
   - If not, go there now

2. **Click "+ New Variable" button** (top right)

3. **Fill in:**
   - **Key:** `DATABASE_URL`
   - **Value:** 
     ```
     postgresql://postgres:LEsjfKtIebCSfiQpJyJnwuPgkVODPwcM@postgres.railway.internal:5432/railway
     ```

4. **Click "Add"**

---

### Step 2: Verify It's Added

1. **Check the Variables list:**
   - You should now see `DATABASE_URL` in your variables
   - It should be listed (value will be masked)

---

### Step 3: Push Database Schema

1. **Go to "Shell" tab** (next to "Variables")

2. **Run:**
   ```bash
   npx prisma db push
   ```

3. **Wait for success:**
   - Should see: "Your database is now in sync with your schema"
   - This creates all tables

---

### Step 4: Test Your App

1. **Refresh your browser**
2. **Go to:** `https://tracking-system-production-d23c.up.railway.app/login`
3. **Login with your password**
4. **Should work now!** ✅

---

## ✅ Quick Checklist

- [ ] Add DATABASE_URL variable (use connection string above)
- [ ] Verify it's in the list
- [ ] Go to Shell tab
- [ ] Run: `npx prisma db push`
- [ ] Wait for success
- [ ] Refresh browser
- [ ] Try login

---

**Add the variable now, then push the schema!** 🚀

