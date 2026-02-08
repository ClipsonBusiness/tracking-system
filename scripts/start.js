const { execSync } = require('child_process');

console.log('🚀 Starting app...');

// Wait for database to be ready (check connection)
function waitForDatabase(maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      console.log(`🔍 Checking database connection... (${i + 1}/${maxAttempts})`);
      execSync('npx prisma db execute --stdin', { 
        input: 'SELECT 1;',
        stdio: 'pipe'
      });
      console.log('✅ Database connection ready!');
      return true;
    } catch (error) {
      if (i < maxAttempts - 1) {
        console.log('⏳ Database not ready yet, waiting 3 seconds...');
        const start = Date.now();
        while (Date.now() - start < 3000) {
          // Busy wait 3 seconds
        }
      } else {
        console.warn('⚠️ Could not verify database connection, proceeding anyway...');
        return false;
      }
    }
  }
  return false;
}

// Run database push before starting
let schemaPushed = false
let retries = 5
waitForDatabase()

while (!schemaPushed && retries > 0) {
  try {
    console.log(`📊 Pushing database schema... (attempt ${6 - retries}/5)`);
    execSync('npx prisma db push --skip-generate --accept-data-loss', { 
      stdio: 'inherit',
      env: { ...process.env }
    });
    console.log('✅ Database schema synced!');
    schemaPushed = true
  } catch (error) {
    retries--
    if (retries > 0) {
      console.error(`⚠️ Database push failed, retrying in 5 seconds... (${retries} retries left)`);
      console.error(`Error details: ${error.message}`);
      // Wait 5 seconds before retry
      const start = Date.now()
      while (Date.now() - start < 5000) {
        // Busy wait
      }
    } else {
      console.error('❌ Database push failed after 5 attempts');
      console.error('⚠️ Continuing anyway - tables may not exist yet');
      console.error('💡 You can manually push the schema via: /api/admin/push-schema');
      console.error('Error:', error.message);
    }
  }
}

// Start Next.js
console.log('🚀 Starting Next.js server...');
execSync('next start', { stdio: 'inherit' });

