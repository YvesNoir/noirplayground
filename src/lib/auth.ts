import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export async function verifyCredentials(email: string, password: string) {
  console.log("🔍 Looking for user with email:", email);

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log("❌ User not found with email:", email);
      return null;
    }

    console.log("✅ User found:", user.id, user.email);

    if (!user.passwordHash) {
      console.log("❌ User has no passwordHash");
      return null;
    }

    console.log("🔐 Comparing password...");
    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      console.log("❌ Password doesn't match");
      return null;
    }

    console.log("✅ Password matches");
    return user;
  } catch (error) {
    console.error("💥 Error in verifyCredentials:", error);
    throw error;
  }
}
