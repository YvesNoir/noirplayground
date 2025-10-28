import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let availableCount = await prisma.word.count({
      where: { usedAt: null },
    });

    if (availableCount === 0) {
      await prisma.word.updateMany({ data: { usedAt: null } });
      availableCount = await prisma.word.count();
    }

    if (availableCount === 0) {
      return NextResponse.json(
        { error: "No hay palabras disponibles en la base de datos." },
        { status: 404 },
      );
    }

    const skip = Math.floor(Math.random() * availableCount);

    const word = await prisma.word.findFirst({
      where: { usedAt: null },
      orderBy: { createdAt: "asc" },
      skip,
    });

    if (!word) {
      return NextResponse.json(
        { error: "No se pudo obtener una palabra." },
        { status: 404 },
      );
    }

    await prisma.word.update({
      where: { id: word.id },
      data: { usedAt: new Date() },
    });

    return NextResponse.json({ word: word.text, length: word.length });
  } catch (error) {
    console.error("Error al obtener palabra", error);
    return NextResponse.json(
      { error: "Error interno al obtener la palabra." },
      { status: 500 },
    );
  }
}
