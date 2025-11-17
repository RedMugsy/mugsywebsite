-- Emergency fix: Create the correct table structure for Contact_us
-- Run this SQL in your Railway PostgreSQL console

-- First, let's check what tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Create Contact_us table with all required columns if it doesn't exist
CREATE TABLE IF NOT EXISTS "public"."Contact_us" (
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
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "Contact_us_email_idx" ON "public"."Contact_us"("email");
CREATE INDEX IF NOT EXISTS "Contact_us_name_idx" ON "public"."Contact_us"("name");
CREATE INDEX IF NOT EXISTS "Contact_us_createdAt_idx" ON "public"."Contact_us"("createdAt");
CREATE INDEX IF NOT EXISTS "Contact_us_status_idx" ON "public"."Contact_us"("status");

-- If you have an existing Contact_us table with different structure, 
-- you might need to add missing columns:
-- ALTER TABLE "public"."Contact_us" ADD COLUMN IF NOT EXISTS "id" TEXT;
-- ALTER TABLE "public"."Contact_us" ADD COLUMN IF NOT EXISTS "requestId" TEXT;
-- Add other missing columns as needed...

-- Verify the final structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'Contact_us' 
ORDER BY ordinal_position;