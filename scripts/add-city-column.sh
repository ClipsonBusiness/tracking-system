#!/bin/bash
# Script to add city column using Railway CLI
# Make sure you have Railway CLI installed and are logged in

echo "Connecting to Railway database..."
railway connect postgres << SQL
ALTER TABLE clicks ADD COLUMN IF NOT EXISTS city TEXT;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clicks' AND column_name = 'city';
\q
SQL

echo "Done!"
