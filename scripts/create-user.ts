import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "sebastianfente@gmail.com";
  const plainPassword = "A37989250.";
  const name = "Sebastian Fente";

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    console.info(`User with email ${email} already exists (id: ${existing.id}).`);
    return;
  }

  const passwordHash = await bcrypt.hash(plainPassword, 12);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
    },
  });

  console.info(`User created with id ${user.id}`);
}

main()
  .catch((error) => {
    console.error("Failed to create user", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
