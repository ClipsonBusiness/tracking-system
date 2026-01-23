const { execSync } = require('child_process');

console.log('🚀 Starting app...');

// Run database push before starting
try {
  console.log('📊 Pushing database schema...');
  execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
  console.log('✅ Database schema synced!');
} catch (error) {
  console.error('⚠️ Database push failed, continuing anyway...');
  console.error(error.message);
}

// Start Next.js
console.log('🚀 Starting Next.js server...');
require('next/dist/bin/next');
execSync('next start', { stdio: 'inherit' });

