# How to Add City Column to Database

## Option 1: Use npx (No Installation Needed) ✅ RECOMMENDED

Run this command (it will prompt you to login if needed):

```bash
npx @railway/cli login
```

Then run:

```bash
npx @railway/cli connect postgres
```

When connected, type:
```sql
ALTER TABLE clicks ADD COLUMN IF NOT EXISTS city TEXT;
```

Press Enter, then type `\q` to exit.

---

## Option 2: Use Node.js Script (If DATABASE_URL is set)

If you have `DATABASE_URL` in your `.env` file or environment:

```bash
node scripts/add-city-column.js
```

---

## Option 3: Use Railway Web Interface

1. Go to Railway Dashboard
2. Click on your Postgres database
3. Click "Connect" button
4. Copy the connection string
5. Use a PostgreSQL client like:
   - **psql** (command line): `psql "your-connection-string"`
   - **pgAdmin** (GUI tool)
   - **DBeaver** (GUI tool)
   - Online tool: https://sqlpad.io

Then run:
```sql
ALTER TABLE clicks ADD COLUMN IF NOT EXISTS city TEXT;
```

---

## Option 4: Use sudo (Not Recommended)

If you really want to install globally:

```bash
sudo npm i -g @railway/cli
```

Then follow Option 1 steps.

---

## Verify It Worked

After running the command, you can verify with:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clicks' AND column_name = 'city';
```

You should see a row with `city` and `text` as the data type.
