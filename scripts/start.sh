#!/bin/bash

# Run database migrations on startup
echo "Running database migrations..."
npx prisma db push --skip-generate || echo "Database push failed, continuing..."

# Start the Next.js app
echo "Starting Next.js app..."
exec next start
