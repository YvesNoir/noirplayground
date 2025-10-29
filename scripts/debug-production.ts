import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function debugProduction() {
  console.log("🔍 Debug de producción iniciado...");
  console.log("DATABASE_URL:", process.env.DATABASE_URL ? "✅ Configurada" : "❌ Faltante");

  try {
    // Test de conexión
    console.log("\n📡 Testeando conexión a la base de datos...");
    await prisma.$connect();
    console.log("✅ Conexión exitosa");

    // Verificar usuario
    const email = "sebastianfente@gmail.com";
    const password = "A37989250.";

    console.log("\n👤 Verificando usuario...");
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      console.log("❌ Usuario no encontrado");
      return;
    }

    console.log("✅ Usuario encontrado:", {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      hasPasswordHash: !!user.passwordHash,
      createdAt: user.createdAt
    });

    // Verificar contraseña
    console.log("\n🔐 Verificando contraseña...");
    if (!user.passwordHash) {
      console.log("❌ Usuario no tiene passwordHash");
      return;
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    console.log(passwordMatches ? "✅ Contraseña correcta" : "❌ Contraseña incorrecta");

    // Test de sesión
    console.log("\n🎫 Testeando creación de sesión...");
    const sessionToken = crypto.randomUUID();
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

    // Limpiar sesiones existentes
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    // Crear nueva sesión
    const session = await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires,
      },
    });

    console.log("✅ Sesión creada:", {
      id: session.id,
      userId: session.userId,
      expires: session.expires
    });

    // Limpiar sesión de prueba
    await prisma.session.delete({
      where: { id: session.id }
    });
    console.log("✅ Sesión de prueba eliminada");

  } catch (error) {
    console.error("❌ Error durante el debug:", error);

    if (error instanceof Error) {
      console.error("Mensaje:", error.message);
      console.error("Stack:", error.stack);
    }
  }
}

debugProduction()
  .catch((error) => {
    console.error("💥 Error fatal:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("\n✅ Debug completado");
  });