#!/bin/bash

echo "🚀 Railway Deployment Script"
echo "=============================="
echo ""

# Check if logged in
echo "Step 1: Checking Railway login..."
if npx @railway/cli whoami 2>&1 | grep -q "Not logged in"; then
    echo "❌ Not logged in. Please run:"
    echo "   npx @railway/cli login"
    echo ""
    exit 1
else
    echo "✅ Logged in to Railway"
    npx @railway/cli whoami
fi

echo ""
echo "Step 2: List your projects..."
npx @railway/cli list

echo ""
echo "Step 3: Ready to deploy!"
echo ""
echo "Next steps:"
echo "1. If you have a project, link it: npx @railway/cli link"
echo "2. Or create new: npx @railway/cli init"
echo "3. Add PostgreSQL service in Railway dashboard"
echo "4. Push database: npx @railway/cli run npx prisma db push"
echo "5. Add environment variables in Railway dashboard"
echo "6. Deploy: git push (if connected) or npx @railway/cli up"
echo ""

