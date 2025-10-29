import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCredentials } from "@/lib/auth";

const SESSION_COOKIE = "noirplayground_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 días

export async function POST(request: Request) {
  try {
    console.log("🚀 Login attempt started");

    const body = await request.json();
    console.log("📨 Request body parsed");

    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password =
      typeof body.password === "string" ? body.password : undefined;

    console.log("👤 Email received:", email ? `${email.substring(0, 3)}***` : "empty");

    if (!email || !password) {
      console.log("❌ Missing email or password");
      return NextResponse.json(
        { error: "Email y contraseña son obligatorios." },
        { status: 400 },
      );
    }

    console.log("🔍 Verifying credentials...");
    const user = await verifyCredentials(email.toLowerCase(), password);

    if (!user) {
      console.log("❌ Invalid credentials for email:", email);
      return NextResponse.json(
        { error: "Credenciales inválidas." },
        { status: 401 },
      );
    }

    console.log("✅ User verified:", user.id);

    const sessionToken = crypto.randomUUID();
    const expires = new Date(Date.now() + SESSION_DURATION_MS);

    console.log("🗑️ Cleaning old sessions...");
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    console.log("🎫 Creating new session...");
    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires,
      },
    });

    console.log("✅ Session created successfully");

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

    console.log("🍪 Cookie set, login complete");
    return response;
  } catch (error) {
    console.error("💥 Login error:", error);

    // Log más detalles del error
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    // Log información del entorno
    console.log("Environment:", process.env.NODE_ENV);
    console.log("Database URL configured:", !!process.env.DATABASE_URL);

    return NextResponse.json(
      {
        error: "Ocurrió un error inesperado.",
        details: process.env.NODE_ENV === "development" ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: 500 },
    );
  }
}
