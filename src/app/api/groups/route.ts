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
    const memberIds: string[] = Array.isArray(body.memberIds)
      ? Array.from(
          new Set(
            body.memberIds
              .filter((value: unknown): value is string => typeof value === "string")
              .map((value) => value.trim())
              .filter((value) => value.length > 0),
          ),
        )
      : [];

    if (!name) {
      return NextResponse.json(
        { error: "El nombre es obligatorio." },
        { status: 400 },
      );
    }

    if (memberIds.length > 0 && currentUser.role !== "ADMIN") {
      return NextResponse.json(
        {
          error:
            "Solo los administradores pueden asignar miembros al momento de crear un grupo.",
        },
        { status: 403 },
      );
    }

    const joinCode = `NG-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    let extraMembers: Array<{
      userId: string;
      role: "MEMBER";
      status: "ACTIVE";
    }> = [];

    if (memberIds.length > 0) {
      const users = await prisma.user.findMany({
        where: { id: { in: memberIds } },
        select: { id: true },
      });

      const validIds = users
        .map((user) => user.id)
        .filter((id) => id !== currentUser.id);

      extraMembers = validIds.map((userId) => ({
        userId,
        role: "MEMBER",
        status: "ACTIVE",
      }));
    }

    const group = await prisma.group.create({
      data: {
        name,
        description,
        joinCode,
        ownerId: currentUser.id,
        memberships: {
          create: [
            {
              userId: currentUser.id,
              role: "ADMIN",
              status: "ACTIVE",
            },
            ...extraMembers,
          ],
        },
      },
      include: {
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      group: {
        id: group.id,
        name: group.name,
        description: group.description,
        joinCode: group.joinCode,
        members: group.memberships.map((membership) => ({
          userId: membership.userId,
          role: membership.role,
          status: membership.status,
          user: membership.user,
        })),
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
