#!/bin/bash
# Railway startup script
set -e

echo "🚀 Starting Red Mugsy Contact API..."

# Generate Prisma client first
echo "📦 Generating Prisma client..."
npx prisma generate

# Force push schema to ensure table exists with correct structure
echo "🗄️ Force synchronizing database schema..."
npx prisma db push --force-reset --accept-data-loss

echo "✅ Database schema forcefully synchronized - Contact_us table ready"

# Verify database connection
echo "🔍 Testing database connection..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.contactSubmission.findMany({ take: 1 }).then(() => {
  console.log('✅ Database connection successful');
  prisma.\$disconnect();
}).catch(err => {
  console.error('❌ Database connection failed:', err.message);
  process.exit(1);
});
"

# Start the application
echo "🌟 Starting server..."
exec npm start