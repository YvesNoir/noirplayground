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

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
    }

    const { attempts, seconds, solved } = body as {
      attempts?: number;
      seconds?: number;
      solved?: boolean;
    };

    if (
      typeof attempts !== "number" ||
      typeof seconds !== "number" ||
      typeof solved !== "boolean"
    ) {
      return NextResponse.json({ error: "Datos incompletos." }, { status: 400 });
    }

    if (attempts < 1 || attempts > MAX_ATTEMPTS) {
      return NextResponse.json({ error: "Cantidad de intentos inválida." }, { status: 400 });
    }

    if (seconds < 0) {
      return NextResponse.json({ error: "Tiempo inválido." }, { status: 400 });
    }

    const todayKey = getTodayKey();

    const day = await prisma.wordleDay.findUnique({ where: { date: todayKey } });

    if (!day) {
      return NextResponse.json(
        { error: "No hay palabra asignada para el día." },
        { status: 400 },
      );
    }

    const existing = await prisma.wordleResult.findUnique({
      where: {
        userId_wordleDayId: {
          userId: user.id,
          wordleDayId: day.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "La partida ya fue registrada." },
        { status: 409 },
      );
    }

    const result = await prisma.wordleResult.create({
      data: {
        userId: user.id,
        wordleDayId: day.id,
        attempts,
        seconds,
        solved,
      },
    });

    return NextResponse.json({
      success: true,
      result: {
        attempts: result.attempts,
        seconds: result.seconds,
        solved: result.solved,
        createdAt: result.createdAt,
      },
    });
  } catch (error) {
    console.error("Error al registrar resultado de Wordle", error);
    return NextResponse.json(
      { error: "Error interno al registrar el resultado." },
      { status: 500 },
    );
  }
}
