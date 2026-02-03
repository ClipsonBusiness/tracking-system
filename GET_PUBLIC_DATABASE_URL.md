# How to Get Public Database URL from Railway

## Steps:

1. **Go to Railway Dashboard**
2. **Click on your Postgres service** (the one showing "postgres-production-2d6e...")
3. **Click on the "Variables" tab** (not "Data" or "Config")
4. **Look for these variables:**
   - `DATABASE_URL` (might be the public one)
   - `POSTGRES_URL` 
   - `PGHOST` (should be something like `containers-us-west-xxx.railway.app`)
   - `PGPORT` (usually `5432`)
   - `PGDATABASE` (usually `railway`)
   - `PGUSER` (usually `postgres`)
   - `PGPASSWORD` (your password)

5. **If you see individual variables, construct the connection string:**
   ```
   postgresql://PGUSER:PGPASSWORD@PGHOST:PGPORT/PGDATABASE
   ```

6. **OR look for a "Public Networking" or "Connect" section** that shows the public connection string

## The public connection string should look like:
```
postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
```

NOT:
```
postgresql://postgres:password@postgres.railway.internal:5432/railway
```

The difference is:
- **Internal**: `postgres.railway.internal` (only works inside Railway)
- **Public**: `containers-us-west-xxx.railway.app` or similar (works from anywhere)
