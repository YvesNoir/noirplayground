#!/usr/bin/env node

console.log('🔧 Vercel-specific Prisma generation starting...');

// Force specific binary target for Vercel
process.env.PRISMA_CLI_BINARY_TARGETS = 'debian-openssl-3.0.x';
process.env.PRISMA_QUERY_ENGINE_BINARY = 'debian-openssl-3.0.x';

const { execSync } = require('child_process');

try {
  console.log('🧹 Cleaning old Prisma client...');
  try {
    execSync('rm -rf node_modules/.prisma/client', { stdio: 'inherit' });
  } catch (e) {
    // Ignore if directory doesn't exist
  }

  console.log('🔄 Generating Prisma client with forced binary target...');
  execSync('npx prisma generate', {
    stdio: 'inherit',
    env: {
      ...process.env,
      PRISMA_CLI_BINARY_TARGETS: 'debian-openssl-3.0.x',
      PRISMA_QUERY_ENGINE_BINARY: 'debian-openssl-3.0.x'
    }
  });

  console.log('✅ Prisma client generated successfully for Vercel!');
} catch (error) {
  console.error('❌ Error generating Prisma client:', error);
  process.exit(1);
}