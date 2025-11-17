@echo off
echo 🔧 Fixing missing name and email columns in contact_submissions table...

cd /d "%~dp0"

echo 📦 Installing dependencies...
npm install

echo 🗄️ Pushing schema to database (this will add missing columns)...
npx prisma db push

echo 📊 Generating Prisma client...
npx prisma generate

echo ✅ Database schema updated successfully!
echo.
echo The contact_submissions table should now include:
echo - name (String, required)
echo - email (String, required)
echo - All other existing columns
echo.
echo You can verify this in your Railway PostgreSQL dashboard.
pause