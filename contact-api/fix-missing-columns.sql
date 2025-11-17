-- Add missing name and email columns to Contact_us table

ALTER TABLE "public"."Contact_us" 
ADD COLUMN IF NOT EXISTS "name" TEXT NOT NULL DEFAULT 'Unknown',
ADD COLUMN IF NOT EXISTS "email" TEXT NOT NULL DEFAULT 'unknown@example.com';

-- Update the default values to be more reasonable
ALTER TABLE "public"."Contact_us" 
ALTER COLUMN "name" DROP DEFAULT,
ALTER COLUMN "email" DROP DEFAULT;

-- Add some indexes for performance
CREATE INDEX IF NOT EXISTS "Contact_us_email_idx" ON "public"."Contact_us"("email");
CREATE INDEX IF NOT EXISTS "Contact_us_name_idx" ON "public"."Contact_us"("name");
CREATE INDEX IF NOT EXISTS "Contact_us_created_at_idx" ON "public"."Contact_us"("createdAt");

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'Contact_us' 
ORDER BY ordinal_position;