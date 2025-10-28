import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCredentials } from "@/lib/auth";

const SESSION_COOKIE = "noirplayground_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 días

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password =
      typeof body.password === "string" ? body.password : undefined;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son obligatorios." },
        { status: 400 },
      );
    }

    const user = await verifyCredentials(email.toLowerCase(), password);

    if (!user) {
      return NextResponse.json(
        { error: "Credenciales inválidas." },
        { status: 401 },
      );
    }

    const sessionToken = crypto.randomUUID();
    const expires = new Date(Date.now() + SESSION_DURATION_MS);

    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires,
      },
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE,
      value: sessionToken,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error", error);
    return NextResponse.json(
      { error: "Ocurrió un error inesperado." },
      { status: 500 },
    );
  }
}
