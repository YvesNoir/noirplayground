# Noir Playground

Plataforma colaborativa de minijuegos (iniciando con un Wordle personalizado) construida con Next.js 16 y TailwindCSS.

## Características principales

- Landing page estilo Wordle con estética dark y tablero demo.
- Autenticación por email/contraseña con sesiones persistentes en PostgreSQL.
- Panel administrativo rápido para crear usuarios y grupos privados.
- API REST sobre App Router (`/api/auth/login`, `/api/users`, `/api/groups`, `/api/session`).
- Base de datos gestionada con Prisma y migraciones listas para PostgreSQL.

## Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **UI:** TailwindCSS 4, Framer Motion, shadcn/ui (pendiente)
- **Estado y datos:** Prisma, Zustand, TanStack Query (en roadmap)
- **Base de datos:** PostgreSQL (`db_noirplayground`)

## Configuración

1. Clonar el repositorio y crear el archivo `.env` (o ajustar variables existentes):

   ```bash
   cp .env.example .env # si existiera, sino copiar manualmente
   ```

   Variables esperadas:

   ```env
   DATABASE_URL="postgresql://app_noirplayground:Noirplayground1666.@72.60.240.4:5432/db_noirplayground?schema=noirplayground"
   SHADOW_DATABASE_URL="postgresql://app_noirplayground:Noirplayground1666.@72.60.240.4:5432/db_noirplayground?schema=shadow_noirplayground"
   ```

2. Instalar dependencias y levantar el entorno de desarrollo:

   ```bash
   npm install
   npm run dev
   ```

3. Abrir [http://localhost:3000](http://localhost:3000) y utilizar `/login` para iniciar sesión.

   - Usuario seed: `sebastianfente@gmail.com`
   - Contraseña: `A37989250.`

## Scripts útiles

- `npm run dev`: inicia el servidor de desarrollo.
- `npm run lint`: corre ESLint con la configuración de Next.js 16.
- `npx tsx -r dotenv/config scripts/create-user.ts`: script para crear usuarios manualmente con contraseña hasheada.

## Roadmap inmediato

- Integrar NextAuth con providers y flujo de invitaciones.
- Implementar motor del juego Wordle y scoreboards en tiempo real.
- Añadir logout, middleware de protección y feedback visual (toasts) en el panel.
- Formalizar migraciones Prisma para cambios posteriores (`passwordHash`, seeds, etc.).

---

Este proyecto evoluciona como playground para experimentar con Noir y nuevos modos de juego.
