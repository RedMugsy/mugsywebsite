#!/bin/bash
# Railway startup script
set -e

echo "🚀 Starting Red Mugsy Contact API..."

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Push database schema (ensures all columns exist)
echo "🗄️ Synchronizing database schema..."
npx prisma db push --accept-data-loss

echo "✅ Database schema synchronized with missing columns (name, email) added"

# Start the application
echo "🌟 Starting server..."
exec npm start