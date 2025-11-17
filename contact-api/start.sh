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

# Additional verification - check if table exists with correct name
echo "🔍 Verifying Contact_us table structure..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  try {
    // Test creating the table structure 
    await prisma.\$executeRaw\`
      CREATE TABLE IF NOT EXISTS \"Contact_us\" (
        \"id\" TEXT NOT NULL,
        \"requestId\" TEXT NOT NULL,
        \"locale\" TEXT NOT NULL DEFAULT 'en',
        \"name\" TEXT NOT NULL,
        \"email\" TEXT NOT NULL,
        \"company\" TEXT,
        \"phoneCountry\" TEXT,
        \"phoneDialCode\" TEXT,
        \"phoneNational\" TEXT,
        \"phoneE164\" TEXT,
        \"purpose\" TEXT NOT NULL,
        \"otherReason\" TEXT,
        \"subject\" TEXT NOT NULL,
        \"message\" TEXT NOT NULL,
        \"walletAddress\" TEXT,
        \"fileName\" TEXT,
        \"fileSize\" INTEGER,
        \"fileMimeType\" TEXT,
        \"ip\" TEXT,
        \"userAgent\" TEXT,
        \"status\" TEXT NOT NULL DEFAULT 'new',
        \"notes\" TEXT,
        \"adminResponse\" TEXT,
        \"respondedAt\" TIMESTAMP(3),
        \"createdAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \"updatedAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT \"Contact_us_pkey\" PRIMARY KEY (\"id\"),
        CONSTRAINT \"Contact_us_requestId_key\" UNIQUE (\"requestId\")
      )
    \`;
    
    console.log('✅ Contact_us table structure verified/created');
    
    // Test basic query
    const count = await prisma.contactSubmission.count();
    console.log('📊 Contact_us table accessible, current records:', count);
    
  } catch (error) {
    console.error('❌ Database verification failed:', error.message);
  } finally {
    await prisma.\$disconnect();
  }
}

verify();
"

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