import { PrismaClient } from '@prisma/client';

async function ensureTableExists() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking if Contact_us table exists...');
    
    // Try to query the table
    await prisma.$queryRaw`SELECT 1 FROM "Contact_us" LIMIT 1`;
    console.log('✅ Contact_us table exists');
    
    // Test if we can insert/select with all required fields
    const testCount = await prisma.contactSubmission.count();
    console.log(`📊 Contact_us table has ${testCount} records`);
    
  } catch (error: any) {
    console.error('❌ Contact_us table issue:', error.message);
    
    if (error.message.includes('does not exist')) {
      console.log('🔧 Creating Contact_us table...');
      
      // Create the table with proper structure
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "Contact_us" (
          "id" TEXT NOT NULL,
          "requestId" TEXT NOT NULL,
          "locale" TEXT NOT NULL DEFAULT 'en',
          "name" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "company" TEXT,
          "phoneCountry" TEXT,
          "phoneDialCode" TEXT,
          "phoneNational" TEXT,
          "phoneE164" TEXT,
          "purpose" TEXT NOT NULL,
          "otherReason" TEXT,
          "subject" TEXT NOT NULL,
          "message" TEXT NOT NULL,
          "walletAddress" TEXT,
          "fileName" TEXT,
          "fileSize" INTEGER,
          "fileMimeType" TEXT,
          "ip" TEXT,
          "userAgent" TEXT,
          "status" TEXT NOT NULL DEFAULT 'new',
          "notes" TEXT,
          "adminResponse" TEXT,
          "respondedAt" TIMESTAMP(3),
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          
          CONSTRAINT "Contact_us_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "Contact_us_requestId_key" UNIQUE ("requestId")
        )
      `;
      
      console.log('✅ Contact_us table created successfully');
    } else {
      console.error('🚨 Unexpected database error');
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Auto-run if executed directly
if (require.main === module) {
  ensureTableExists().catch(console.error);
}

export { ensureTableExists };