# 🚂 Deploy to Railway (No GitHub Required)

Deploy directly to Railway without needing GitHub!

## Step 1: Install Railway CLI

```bash
npm i -g @railway/cli
```

## Step 2: Login to Railway

```bash
railway login
```

This will open your browser to authenticate with Railway.

## Step 3: Initialize Project

```bash
cd "/Users/tomastomasson/Tracking system"
railway init
```

This will:
- Create a new Railway project
- Link your local code to Railway
- Ask you to name your project

## Step 4: Add PostgreSQL Database

```bash
railway add postgresql
```

This automatically:
- Creates a PostgreSQL database
- Sets `DATABASE_URL` environment variable
- Connects it to your app

## Step 5: Add Environment Variables

```bash
railway variables set ADMIN_PASSWORD="your-secure-password"
railway variables set STRIPE_SECRET_KEY="sk_live_..."
railway variables set STRIPE_WEBHOOK_SECRET="whsec_..."
railway variables set IP_SALT="random-string-32-chars"
```

**Get your URL first:**
```bash
railway domain
```

Then set:
```bash
railway variables set APP_BASE_URL="https://your-app.railway.app"
```

## Step 6: Deploy

```bash
railway up
```

This uploads your code and deploys it to Railway!

## Step 7: Setup Database

After deployment, run:

```bash
railway run npx prisma db push
railway run npx prisma db seed
```

## Step 8: Get Your Public URL

```bash
railway domain
```

Or generate a custom domain:
```bash
railway domain generate
```

## Step 9: Configure Stripe Webhook

1. Get your Railway URL: `railway domain`
2. Go to Stripe Dashboard → Webhooks
3. Add endpoint: `https://your-app.railway.app/api/stripe/webhook`
4. Copy webhook secret
5. Update: `railway variables set STRIPE_WEBHOOK_SECRET="whsec_..."`

## Useful Railway CLI Commands

```bash
# View logs
railway logs

# Open shell in Railway
railway shell

# View environment variables
railway variables

# Redeploy
railway up

# View project info
railway status
```

## ✅ That's It!

Your app is now live on Railway without needing GitHub!

---

## Alternative: Setup GitHub Later

If you want to use GitHub for automatic deployments later:

1. Follow `SETUP_GITHUB.md` to create a GitHub repo
2. In Railway dashboard, go to Settings → Source
3. Connect your GitHub repository
4. Enable automatic deployments

---

## Troubleshooting

**"railway: command not found"**
- Make sure Railway CLI is installed: `npm i -g @railway/cli`
- Or use: `npx @railway/cli` instead

**Deployment fails?**
- Check logs: `railway logs`
- Verify all environment variables are set: `railway variables`
- Make sure PostgreSQL is added: `railway add postgresql`

**Database connection error?**
- Verify PostgreSQL is added: `railway add postgresql`
- Check DATABASE_URL is set: `railway variables`
- Run migrations: `railway run npx prisma db push`

