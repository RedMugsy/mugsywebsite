// Usage:
//   node scripts/reset-password.js <username> <newPassword>
// Example:
//   node scripts/reset-password.js admin newpass123

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  const [username, newPass] = process.argv.slice(2);
  if (!username || !newPass) {
    console.error('Usage: node scripts/reset-password.js <username> <newPassword>');
    process.exit(1);
  }
  const prisma = new PrismaClient();
  try {
    const hash = await bcrypt.hash(newPass, 10);
    const user = await prisma.adminUser.update({
      where: { username },
      data: { passwordHash: hash },
    });
    console.log('Password updated for', user.username);
  } catch (e) {
    console.error('Failed to update password:', e.message || e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

