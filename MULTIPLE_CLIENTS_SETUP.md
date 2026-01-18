# Managing Multiple Clients with Link-in-Bio Pages

## ✅ Yes! The System Supports Multiple Clients

### How It Works:

1. **Each client gets their own Client record**
2. **Each client can have their own custom domain**
3. **Each client can have multiple link-in-bio pages** (using handles)
4. **All links are tracked separately** per client

---

## 🎯 Setup for Multiple Clients

### Step 1: Create Clients

**Option A: Via Database (Currently)**
- Clients are created in the database
- Each client has: name, customDomain (optional)

**Option B: Via Admin UI (Future Enhancement)**
- Could add "Create Client" form in Admin → Settings

**Current Setup:**
```sql
-- Example: Create multiple clients
INSERT INTO clients (name, custom_domain) VALUES
  ('Client 1 - Low Back Ability', 'lowbackability.com'),
  ('Client 2 - Fitness Pro', 'fitnesspro.com'),
  ('Client 3 - Yoga Studio', NULL); -- Uses your server domain
```

---

### Step 2: Create Links for Each Client

**For Client 1 (Low Back Ability):**
1. Go to Admin → Links
2. Select "Client 1 - Low Back Ability"
3. Create links with handle: `lowback`
4. Links: `lowbackability.com/fhkeo`, `lowbackability.com/abcde`

**For Client 2 (Fitness Pro):**
1. Select "Client 2 - Fitness Pro"
2. Create links with handle: `fitness`
3. Links: `fitnesspro.com/xyzab`, `fitnesspro.com/qwert`

**For Client 3 (Yoga Studio):**
1. Select "Client 3 - Yoga Studio"
2. Create links with handle: `yoga`
3. Links: `your-server.com/abcde`, `your-server.com/fghij`

---

### Step 3: Link-in-Bio Pages

**Each handle creates a separate link-in-bio page:**

- Client 1: `lowbackability.com/p/lowback` (or `your-server.com/p/lowback`)
- Client 2: `fitnesspro.com/p/fitness` (or `your-server.com/p/fitness`)
- Client 3: `your-server.com/p/yoga`

**How it works:**
- All links with same handle appear on same page
- Each client can have multiple handles (different pages)
- Pages are automatically generated

---

## 📋 Example: Multiple Clients Setup

### Client 1: Low Back Ability
- **Custom Domain:** `lowbackability.com`
- **Handle:** `lowback`
- **Links:**
  - `lowbackability.com/fhkeo` → Signup page
  - `lowbackability.com/abcde` → Pricing page
  - `lowbackability.com/xyzab` → Blog post
- **Link-in-Bio:** `lowbackability.com/p/lowback`

### Client 2: Fitness Pro
- **Custom Domain:** `fitnesspro.com`
- **Handle:** `fitness`
- **Links:**
  - `fitnesspro.com/qwert` → Workout program
  - `fitnesspro.com/asdfg` → Nutrition guide
- **Link-in-Bio:** `fitnesspro.com/p/fitness`

### Client 3: Yoga Studio
- **Custom Domain:** None (uses your server)
- **Handle:** `yoga`
- **Links:**
  - `your-server.com/hjklm` → Class schedule
  - `your-server.com/zxcvb` → Teacher bios
- **Link-in-Bio:** `your-server.com/p/yoga`

---

## 🔧 Managing Multiple Clients

### In Admin Dashboard:

**Links Page:**
- Filter by client (dropdown)
- See all links for selected client
- Create links for specific client

**Analytics Page:**
- View analytics per client
- See clicks/revenue by client
- Compare performance

**Settings Page:**
- Set custom domain per client
- Configure each client separately

---

## 💡 Best Practices

### 1. Use Handles to Organize
- Each client gets their own handle(s)
- Can have multiple handles per client (different pages)
- Example: `lowback-main`, `lowback-summer`, `lowback-winter`

### 2. Custom Domains Per Client
- Client 1: `lowbackability.com`
- Client 2: `fitnesspro.com`
- Client 3: Uses your server domain

### 3. Link Organization
- Group related links with same handle
- Use handles for campaigns: `summer-2024`, `winter-sale`
- Easy to create multiple link-in-bio pages

---

## 🎯 Link-in-Bio Pages for Multiple Clients

### How It Works:

**Route:** `/p/[handle]`

**Example URLs:**
- `lowbackability.com/p/lowback` → Shows all links with handle "lowback" for Client 1
- `fitnesspro.com/p/fitness` → Shows all links with handle "fitness" for Client 2
- `your-server.com/p/yoga` → Shows all links with handle "yoga" for Client 3

**Current Implementation:**
- Shows all links with matching handle
- Doesn't filter by client (could be enhanced)
- Displays as clickable buttons

**Enhancement Needed:**
- Filter link-in-bio pages by client
- So `lowbackability.com/p/lowback` only shows Client 1's links
- And `fitnesspro.com/p/fitness` only shows Client 2's links

---

## 🚀 Quick Setup for Multiple Clients

### 1. Create Clients (Database)
```sql
-- Add clients to database
INSERT INTO clients (name, custom_domain) VALUES
  ('Low Back Ability', 'lowbackability.com'),
  ('Fitness Pro', 'fitnesspro.com'),
  ('Yoga Studio', NULL);
```

### 2. Set Custom Domains (Admin)
- Go to Admin → Settings
- Set custom domain for each client
- Or leave blank to use your server domain

### 3. Create Links (Admin)
- For each client, create links
- Use handles to group (e.g., `lowback`, `fitness`, `yoga`)
- System tracks everything separately

### 4. Share Link-in-Bio Pages
- Client 1: `lowbackability.com/p/lowback`
- Client 2: `fitnesspro.com/p/fitness`
- Client 3: `your-server.com/p/yoga`

---

## 📊 Analytics Per Client

**Current System:**
- All clicks tracked with `clientId`
- Can filter analytics by client
- Revenue attribution per client

**In Analytics Dashboard:**
- View total clicks per client
- See revenue per client (if Stripe connected)
- Compare performance

---

## ✅ Summary

**Yes, the system supports multiple clients!**

**Each client can have:**
- ✅ Their own custom domain (or use your server)
- ✅ Multiple link-in-bio pages (using handles)
- ✅ Separate analytics tracking
- ✅ Their own affiliates

**Setup:**
1. Create clients (database or admin)
2. Set custom domains (optional)
3. Create links with handles
4. Share link-in-bio pages: `domain.com/p/handle`

**Everything is tracked and organized per client!** 🎉

