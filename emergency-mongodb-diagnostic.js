// Emergency Railway MongoDB Diagnostic Script
// This will help us understand what's happening in the Railway environment

console.log('🔍 EMERGENCY MONGODB DIAGNOSTIC');
console.log('================================');

// Log all MongoDB-related environment variables
console.log('Environment Variables:');
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
console.log('- MONGOHOST:', process.env.MONGOHOST || 'NOT SET');
console.log('- MONGOUSER:', process.env.MONGOUSER || 'NOT SET');  
console.log('- MONGOPASSWORD:', process.env.MONGOPASSWORD ? 'SET (hidden)' : 'NOT SET');
console.log('- MONGOPORT:', process.env.MONGOPORT || 'NOT SET');
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'SET (hidden)' : 'NOT SET');

// Show the actual connection string being used (redacted)
const mongoUri = process.env.MONGODB_URI;
if (mongoUri) {
  const redacted = mongoUri.replace(/:([^:@]+)@/, ':***@');
  console.log('- Connection string:', redacted);
} else {
  console.log('- No MONGODB_URI found!');
}

console.log('\n🌐 Railway Environment:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT || 'NOT SET');

// Test basic DNS resolution
import dns from 'dns';
dns.resolve4('mongodb.railway.internal', (err, addresses) => {
  if (err) {
    console.log('\n❌ DNS Resolution Failed:', err.message);
  } else {
    console.log('\n✅ DNS Resolution Success:', addresses);
  }
});

// Test basic TCP connectivity  
import net from 'net';
const socket = net.createConnection(27017, 'mongodb.railway.internal');
socket.on('connect', () => {
  console.log('✅ TCP connection to mongodb.railway.internal:27017 successful');
  socket.end();
});
socket.on('error', (err) => {
  console.log('❌ TCP connection failed:', err.message);
});
socket.setTimeout(5000);

console.log('\n💡 This diagnostic will show what Railway sees internally');
console.log('🎯 Goal: Identify if issue is DNS, networking, or credentials');