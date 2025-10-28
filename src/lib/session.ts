import { cookies } from "next/headers";
import { prisma } from "./prisma";

const SESSION_COOKIE = "noirplayground_session";

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionToken) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: {
      user: true,
    },
  });

  if (!session || session.expires < new Date()) {
    return null;
  }

  return session;
}

export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user ?? null;
}
