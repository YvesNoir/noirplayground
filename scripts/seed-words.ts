import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const dataPath = join(process.cwd(), "data", "spanish-5.txt");
  const raw = readFileSync(dataPath, "utf8");

  const filtered = Array.from(
    new Set(
      raw
        .split(/\r?\n/)
        .map((word) => word.trim().toLowerCase())
        .filter((word) => word.length === 5 && /^[a-z]+$/.test(word))
    )
  );

  if (filtered.length < 600) {
    throw new Error(
      `Se requieren al menos 600 palabras válidas y únicas; solo se encontraron ${filtered.length}.`
    );
  }

  const selected = filtered.slice(0, 600);

  await prisma.word.createMany({
    data: selected.map((text) => ({ text, length: text.length })),
    skipDuplicates: true,
  });

  console.info(`Seeded ${selected.length} palabras.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
