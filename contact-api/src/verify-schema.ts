/**
 * Database schema verification and repair script
 * Run this if you notice missing name/email columns in Contact_us table
 */

import { PrismaClient } from '@prisma/client';

async function verifyAndRepairSchema(): Promise<void> {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Verifying database schema...');
    
    // Try to create a test record to see if all fields work
    const testData = {
      requestId: 'TEST-' + Date.now().toString(),
      name: 'Test User',
      email: 'test@example.com',
      purpose: 'Support',
      subject: 'Schema Test',
      message: 'Testing if name and email fields exist',
      status: 'new'
    };
    
    console.log('📝 Testing contact submission creation...');
    const testSubmission = await prisma.contactSubmission.create({
      data: testData
    });
    
    console.log('✅ Success! Schema is correct. Test submission created with ID:', testSubmission.id);
    
    // Clean up test data
    await prisma.contactSubmission.delete({
      where: { id: testSubmission.id }
    });
    
    console.log('🧹 Test data cleaned up');
    
    // Get table info
    const submissions = await prisma.contactSubmission.findMany({
      take: 1,
      select: {
        id: true,
        requestId: true, 
        name: true,
        email: true,
        createdAt: true
      }
    });
    
    console.log('📊 Database is working correctly');
    console.log('Recent submissions count:', submissions.length);
    
  } catch (error: unknown) {
    console.error('❌ Schema verification failed:', error);
    
    const err = error as any;
    if (err?.code === 'P2002') {
      console.log('💡 Unique constraint error - this is expected for the test');
    } else if (err?.message && typeof err.message === 'string' && err.message.includes('column') && (err.message.includes('name') || err.message.includes('email'))) {
      console.error('🚨 Missing name or email column detected!');
      console.log('🔧 Run: npx prisma db push --accept-data-loss');
      console.log('   This will add missing columns to your PostgreSQL table');
    } else {
      console.error('🚨 Unexpected database error. Check your DATABASE_URL and connection.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  verifyAndRepairSchema().catch(console.error);
}

export { verifyAndRepairSchema };