import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";

    if (!name) {
      return NextResponse.json(
        { error: "El nombre es obligatorio." },
        { status: 400 },
      );
    }

    const joinCode = `NG-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const group = await prisma.group.create({
      data: {
        name,
        description,
        joinCode,
        ownerId: currentUser.id,
        memberships: {
          create: {
            userId: currentUser.id,
            role: "ADMIN",
            status: "ACTIVE",
          },
        },
      },
      include: {
        memberships: {
          where: { userId: currentUser.id },
        },
      },
    });

    return NextResponse.json({
      group: {
        id: group.id,
        name: group.name,
        description: group.description,
        joinCode: group.joinCode,
      },
    });
  } catch (error) {
    console.error("Create group error", error);
    return NextResponse.json(
      { error: "No se pudo crear el grupo." },
      { status: 500 },
    );
  }
}
