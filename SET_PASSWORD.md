# 🔐 Set Admin Password in Railway

## Quick Steps

### Step 1: Go to Variables
1. Railway Dashboard → `tracking-system` service
2. Click **"Variables"** tab

### Step 2: Add ADMIN_PASSWORD
1. Click **"New Variable"** or **"+"** button
2. Fill in:
   - **Key:** `ADMIN_PASSWORD`
   - **Value:** `Demo123` (or your preferred password)
3. Click **"Add"** or **"Save"**

### Step 3: Wait for Restart
- Railway will automatically restart your app
- Wait ~30 seconds for restart

### Step 4: Login
1. Go to your Railway URL: `https://your-app.railway.app/login`
2. Enter password: `Demo123`
3. Should work! ✅

---

## If It Still Doesn't Work

1. **Check the variable name:**
   - Must be exactly: `ADMIN_PASSWORD` (all caps, underscore)
   - No spaces

2. **Check the value:**
   - Make sure there are no extra spaces
   - Value should be: `Demo123`

3. **Wait for restart:**
   - Railway needs to restart after adding variables
   - Check "Deployments" tab to see if it's restarting

4. **Try a different password:**
   - Use something simple like: `admin123`
   - Make sure it matches exactly what you set

---

## Quick Check

After adding the variable:
- Go to "Deployments" tab
- Should see a new deployment starting
- Wait for it to complete
- Then try logging in again

---

**That's it!** 🔐
