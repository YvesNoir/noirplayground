#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up Prisma for Vercel deployment...');

try {
  // Generate Prisma client
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Verify the query engine files exist
  const prismaClientPath = path.join(process.cwd(), 'node_modules', '.prisma', 'client');
  const queryEngineFiles = fs.readdirSync(prismaClientPath).filter(file =>
    file.includes('libquery_engine') && file.endsWith('.so.node')
  );

  console.log('🔍 Found query engine files:', queryEngineFiles);

  if (queryEngineFiles.length === 0) {
    throw new Error('No query engine files found after generation');
  }

  // Ensure the rhel-openssl-3.0.x engine exists
  const rhelEngine = queryEngineFiles.find(file => file.includes('rhel-openssl-3.0.x'));
  if (!rhelEngine) {
    console.warn('⚠️  RHEL OpenSSL 3.0.x engine not found, available engines:', queryEngineFiles);
  } else {
    console.log('✅ RHEL OpenSSL 3.0.x engine found:', rhelEngine);
  }

  // Verify schema.prisma exists
  const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
  if (!fs.existsSync(schemaPath)) {
    throw new Error('schema.prisma not found');
  }

  console.log('✅ Prisma setup complete for Vercel');

} catch (error) {
  console.error('💥 Prisma setup failed:', error.message);
  process.exit(1);
}