#!/bin/bash
echo "🔄 Switching to PostgreSQL for production..."

# Backup current schema
cp prisma/schema.prisma prisma/schema.prisma.backup

# Update datasource
sed -i '' 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma

echo "✅ Updated prisma/schema.prisma"
echo ""
echo "⚠️  IMPORTANT: Update your .env file with PostgreSQL connection string:"
echo "   DATABASE_URL=\"postgresql://user:password@host:5432/dbname\""
echo ""
echo "Then run:"
echo "   npm run db:generate"
echo "   npm run db:push"
echo "   npm run db:seed"
