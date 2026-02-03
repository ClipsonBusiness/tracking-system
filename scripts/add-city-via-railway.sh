#!/bin/bash
# Script to add city column via Railway CLI
# Make sure you're logged in: npx @railway/cli login

echo "Connecting to Railway PostgreSQL and adding city column..."

npx @railway/cli connect postgres <<EOF
ALTER TABLE clicks ADD COLUMN IF NOT EXISTS city TEXT;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clicks' AND column_name = 'city';
\q
EOF

echo "Done! Check the output above to verify the column was added."
