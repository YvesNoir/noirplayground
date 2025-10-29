import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    console.log("🚪 Logout attempt started");

    const sessionData = await getCurrentSession();

    if (sessionData) {
      console.log("🗑️ Deleting session for user:", sessionData.user.id);

      // Delete the session from database
      await prisma.session.deleteMany({
        where: { userId: sessionData.user.id },
      });

      console.log("✅ Session deleted from database");
    }

    // Create response and clear the cookie
    const response = NextResponse.json({ message: "Logout successful" });

    response.cookies.set({
      name: "noirplayground_session",
      value: "",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0), // Expire immediately
      path: "/",
    });

    console.log("🍪 Session cookie cleared");
    console.log("✅ Logout completed successfully");

    return response;
  } catch (error) {
    console.error("💥 Logout error:", error);

    // Even if there's an error, clear the cookie
    const response = NextResponse.json(
      { error: "Error during logout" },
      { status: 500 }
    );

    response.cookies.set({
      name: "noirplayground_session",
      value: "",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0),
      path: "/",
    });

    return response;
  }
}