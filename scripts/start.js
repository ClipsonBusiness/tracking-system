const { execSync } = require('child_process');

console.log('🚀 Starting app...');

// Run database push before starting
let schemaPushed = false
let retries = 3
while (!schemaPushed && retries > 0) {
  try {
    console.log(`📊 Pushing database schema... (${4 - retries}/3)`);
    execSync('npx prisma db push --skip-generate --accept-data-loss', { stdio: 'inherit' });
    console.log('✅ Database schema synced!');
    schemaPushed = true
  } catch (error) {
    retries--
    if (retries > 0) {
      console.error(`⚠️ Database push failed, retrying in 2 seconds... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, 2000))
    } else {
      console.error('❌ Database push failed after 3 attempts');
      console.error('⚠️ Continuing anyway - tables may not exist yet');
      console.error('Error:', error.message);
    }
  }
}

// Start Next.js
console.log('🚀 Starting Next.js server...');
require('next/dist/bin/next');
execSync('next start', { stdio: 'inherit' });

