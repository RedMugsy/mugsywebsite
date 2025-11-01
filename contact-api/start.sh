#!/bin/bash
# Railway startup script
set -e

echo "🚀 Starting Red Mugsy Contact API..."

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma db push

# Start the application
echo "🌟 Starting server..."
exec npm start