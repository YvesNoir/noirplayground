import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("🔍 Testing Prisma connection...");

    // Test 1: Simple connection
    const connectionTest = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("✅ Raw query test passed:", connectionTest);

    // Test 2: Model access
    const userCount = await prisma.user.count();
    console.log("✅ User count:", userCount);

    // Test 3: Specific user query (similar to login)
    const testUser = await prisma.user.findFirst({
      select: { id: true, email: true, role: true }
    });
    console.log("✅ Test user found:", testUser ? "Yes" : "No");

    return NextResponse.json({
      success: true,
      message: "Prisma connection successful",
      tests: {
        rawQuery: connectionTest,
        userCount,
        testUserExists: !!testUser
      },
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("💥 Prisma test failed:", error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      errorName: error instanceof Error ? error.constructor.name : "Unknown",
      stack: error instanceof Error ? error.stack : undefined,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}