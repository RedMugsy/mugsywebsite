-- Add missing name and email columns to contact_submissions table

ALTER TABLE "public"."contact_submissions" 
ADD COLUMN IF NOT EXISTS "name" TEXT NOT NULL DEFAULT 'Unknown',
ADD COLUMN IF NOT EXISTS "email" TEXT NOT NULL DEFAULT 'unknown@example.com';

-- Update the default values to be more reasonable
ALTER TABLE "public"."contact_submissions" 
ALTER COLUMN "name" DROP DEFAULT,
ALTER COLUMN "email" DROP DEFAULT;

-- Add some indexes for performance
CREATE INDEX IF NOT EXISTS "contact_submissions_email_idx" ON "public"."contact_submissions"("email");
CREATE INDEX IF NOT EXISTS "contact_submissions_name_idx" ON "public"."contact_submissions"("name");
CREATE INDEX IF NOT EXISTS "contact_submissions_created_at_idx" ON "public"."contact_submissions"("createdAt");

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'contact_submissions' 
ORDER BY ordinal_position;