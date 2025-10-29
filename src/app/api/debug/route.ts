import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("🔍 Debug endpoint called");

    const checks = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      databaseUrl: !!process.env.DATABASE_URL,
      shadowDatabaseUrl: !!process.env.SHADOW_DATABASE_URL,
    };

    console.log("📊 Environment checks:", checks);

    // Test database connection
    console.log("📡 Testing database connection...");
    await prisma.$connect();
    console.log("✅ Database connection successful");

    // Test user query
    console.log("👤 Testing user query...");
    const userCount = await prisma.user.count();
    console.log(`✅ Found ${userCount} users`);

    // Test specific user
    const testUser = await prisma.user.findUnique({
      where: { email: "sebastianfente@gmail.com" },
      select: { id: true, email: true, name: true, role: true, passwordHash: true }
    });

    console.log("🔍 Test user result:", {
      found: !!testUser,
      hasPasswordHash: testUser ? !!testUser.passwordHash : false
    });

    const response = {
      status: "success",
      checks,
      database: {
        connected: true,
        userCount,
        testUserFound: !!testUser,
        testUserHasPassword: testUser ? !!testUser.passwordHash : false
      }
    };

    console.log("✅ Debug complete:", response);
    return NextResponse.json(response);

  } catch (error) {
    console.error("💥 Debug endpoint error:", error);

    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }

    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      },
      { status: 500 }
    );
  }
}