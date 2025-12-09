import mongoose from 'mongoose';
import { config } from 'dotenv';
import Promoter from '../models/Promoter.js';

// Load environment variables from .env / backend.env
config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/treasure_hunt';

async function main() {
  const email = process.env.ADMIN_EMAIL || 'demo-admin@redmugsy.com';
  const password = process.env.ADMIN_PASSWORD || 'AdminDemo123!';
  const name = process.env.ADMIN_NAME || 'Demo Admin';

  console.log('🔐 Creating admin user');
  console.log('   Mongo URI:', MONGODB_URI);
  console.log('   Email:', email);

  await mongoose.connect(MONGODB_URI);

  try {
    let existing = await Promoter.findOne({ email: email.toLowerCase() });
    if (existing) {
      console.log('ℹ️  Admin user already exists, updating role/flags if needed.');
      existing.role = 'super_admin';
      existing.status = 'active';
      existing.verified = true;
      // Only reset password if ADMIN_FORCE_PASSWORD is truthy
      if (process.env.ADMIN_FORCE_PASSWORD === 'true') {
        existing.password = password;
      }
      await existing.save();
      console.log('✅ Admin account ready:', existing.email);
      return;
    }

    const promoter = new Promoter({
      email,
      password,
      name,
      role: 'super_admin',
      status: 'active',
      verified: true,
      organization: 'Red Mugsy',
      phone: '+10000000000'
    });

    await promoter.save();
    console.log('✅ Created new admin account:');
    console.log('   Email:', email);
    console.log('   Password:', password);
  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
  } finally {
    await mongoose.disconnect();
  }
}

main().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});

