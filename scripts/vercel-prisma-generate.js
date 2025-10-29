const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function generatePrismaClient() {
  console.log('🔧 Generating Prisma client for Vercel...');

  try {
    // Set environment variable para forzar binary target
    process.env.PRISMA_CLI_BINARY_TARGETS = 'linux-arm64-openssl-3.0.x,debian-openssl-3.0.x';

    const { stdout, stderr } = await execAsync('npx prisma generate --no-engine');
    console.log('✅ Prisma generate stdout:', stdout);
    if (stderr) {
      console.log('⚠️ Prisma generate stderr:', stderr);
    }

    // También generar con el engine
    const { stdout2, stderr2 } = await execAsync('npx prisma generate');
    console.log('✅ Prisma generate with engine stdout:', stdout2);
    if (stderr2) {
      console.log('⚠️ Prisma generate with engine stderr:', stderr2);
    }

    console.log('✅ Prisma client generated successfully for Vercel');
  } catch (error) {
    console.error('❌ Error generating Prisma client:', error);
    process.exit(1);
  }
}

generatePrismaClient();