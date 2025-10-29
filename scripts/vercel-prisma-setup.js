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

  // Check for both .so.node files and binary executables
  const allFiles = fs.readdirSync(prismaClientPath);
  const queryEngineFiles = allFiles.filter(file =>
    (file.includes('libquery_engine') && file.endsWith('.so.node')) ||
    (file.includes('query-engine') && !file.includes('.'))
  );

  console.log('🔍 All files in .prisma/client:', allFiles);
  console.log('🔍 Found query engine files:', queryEngineFiles);

  if (queryEngineFiles.length === 0) {
    throw new Error('No query engine files found after generation');
  }

  // Check for binary engines (engineType = "binary")
  const binaryEngines = allFiles.filter(file =>
    file.startsWith('query-engine-') && !file.includes('.')
  );
  console.log('🔍 Found binary engines:', binaryEngines);

  // Ensure the rhel-openssl-3.0.x engine exists (either .so.node or binary)
  const rhelEngine = queryEngineFiles.find(file => file.includes('rhel-openssl-3.0.x'));
  const rhelBinary = binaryEngines.find(file => file.includes('rhel-openssl-3.0.x'));

  if (!rhelEngine && !rhelBinary) {
    console.warn('⚠️  RHEL OpenSSL 3.0.x engine not found');
    console.warn('Available engines:', queryEngineFiles);
    console.warn('Available binaries:', binaryEngines);
  } else {
    console.log('✅ RHEL OpenSSL 3.0.x engine found:', rhelEngine || rhelBinary);
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