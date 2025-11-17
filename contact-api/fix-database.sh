#!/bin/bash
# Script to fix missing name and email columns in PostgreSQL database

echo "🔧 Fixing missing name and email columns in Contact_us table..."

# Navigate to the contact-api directory
cd "$(dirname "$0")"

echo "📦 Installing dependencies..."
npm install

echo "🗄️  Pushing schema to database (this will add missing columns)..."
npx prisma db push

echo "📊 Generating Prisma client..."
npx prisma generate

echo "✅ Database schema updated successfully!"
echo ""
echo "The Contact_us table should now include:"
echo "- name (String, required)"  
echo "- email (String, required)"
echo "- All other existing columns"
echo ""
echo "You can verify this in your Railway PostgreSQL dashboard or by connecting to the database."