import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const MAX_ATTEMPTS = 6;

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }

    const todayKey = getTodayKey();

    let day = await prisma.wordleDay.findUnique({
      where: { date: todayKey },
      include: { word: true },
    });

    if (!day) {
      let availableCount = await prisma.word.count({ where: { usedAt: null } });

      if (availableCount === 0) {
        await prisma.word.updateMany({ data: { usedAt: null } });
        availableCount = await prisma.word.count();
      }

      if (availableCount === 0) {
        return NextResponse.json(
          { error: "No hay palabras disponibles." },
          { status: 500 },
        );
      }

      const skip = Math.floor(Math.random() * availableCount);
      const selectedWord = await prisma.word.findFirst({
        where: { usedAt: null },
        orderBy: { createdAt: "asc" },
        skip,
      });

      if (!selectedWord) {
        return NextResponse.json(
          { error: "No se pudo obtener la palabra del día." },
          { status: 500 },
        );
      }

      day = await prisma.wordleDay.create({
        data: {
          date: todayKey,
          wordId: selectedWord.id,
        },
        include: { word: true },
      });

      await prisma.word.update({
        where: { id: selectedWord.id },
        data: { usedAt: new Date() },
      });
    }

    const result = await prisma.wordleResult.findUnique({
      where: {
        userId_wordleDayId: {
          userId: user.id,
          wordleDayId: day.id,
        },
      },
    });

    const sanitizedResult = result
      ? {
          attempts: result.attempts,
          seconds: result.seconds,
          solved: result.solved,
          createdAt: result.createdAt,
        }
      : null;

    return NextResponse.json({
      length: day.word.length,
      word: day.word.text,
      alreadyPlayed: Boolean(result),
      result: sanitizedResult,
      maxAttempts: MAX_ATTEMPTS,
    });
  } catch (error) {
    console.error("Error al obtener la palabra del día", error);
    return NextResponse.json(
      { error: "Error interno al obtener la palabra del día." },
      { status: 500 },
    );
  }
}
