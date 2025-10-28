# Notas del proyecto

## Objetivo

- Construir una plataforma de minijuegos (iniciando con Wordle) sobre Next.js.
- Juego base: palabra de cinco letras con retroalimentación por intento (exacta, parcial, ausente).
- Futuro: invitar amigos, grupos cerrados con scoreboards/leaderboards.

## Estado actual

- Proyecto inicializado con Next.js (TypeScript + Tailwind, App Router).
- Dependencias clave añadidas: NextAuth, Prisma (`@prisma/client`), Zustand, TanStack Query, Framer Motion, dotenv.
- Prisma apuntando a PostgreSQL remoto (`db_noirplayground`, esquema `noirplayground`) con migración inicial aplicada.
- `User` amplía columna `passwordHash` para credenciales (sincronizado con `prisma db push`).
- Script de seed en `scripts/create-user.ts` (usa `tsx` + `bcryptjs`) para crear usuario inicial.
- Helpers Prisma/Auth/Session centralizan acceso a base y sesión (`src/lib/prisma.ts`, `src/lib/auth.ts`, `src/lib/session.ts`).
- Endpoints protegidos: `POST /api/auth/login`, `GET/POST /api/users`, `POST /api/groups`, `GET /api/session`.
- Pantallas `/login` (modo dark) y `/dashboard` (panel rápido para creación de usuarios y grupos con asignación de miembros).
- Home inspirada en Wordle implementada con estética dark y hero interactivo.
- Usuario inicial (`sebastianfente@gmail.com`) promovido a rol ADMIN para usar el panel.
- Despliegue preparado para Vercel (`vercel.json`, script `vercel-build`, `postinstall` con `prisma generate`, guía en `docs/deploy-vercel.md`).

## Arquitectura propuesta (borrador)

- **Framework**: Next.js (App Router) con TypeScript.
- **UI**: TailwindCSS para styling rápido + componentes accesibles (p.ej. Radix UI/Headless UI).
- **Componentes/UI extra**:
  - shadcn/ui para componentes preconstruidos sobre Tailwind.
  - Framer Motion para animaciones suaves.
  - Zustand o Redux Toolkit para estado local compartido (opcional).
  - TanStack Query para manejo de datos async/cache.
- **Auth**: NextAuth (autenticación por email/terceros) con Prisma + base de datos (SQLite dev, Postgres prod).
- **Estado/Lógica**:
  - `/app`: páginas y rutas protegidas (dashboard, scoreboard, juego).
  - `/components`: UI compartida.
  - `/lib/game`: motor del Wordle (lógica e utilidades).
  - `/lib/data`: acceso a diccionarios y repositorios.
- **Persistencia**:
  - Usuarios, grupos, invitaciones, partidas, resultados.
  - Scoreboard por grupo.
- **Infra futura**: API routes (app router actions/route handlers), websockets opcionales para eventos en vivo.

## Próximos pasos propuestos

- Modelar capa de aplicación: rutas iniciales (`/`, `/auth`, `/dashboard`, `/groups`).
- Implementar motor de Wordle y servicios en `/lib/game`.
- Crear seeds (usuarios demo, grupos) para validar integraciones.
- Configurar NextAuth con adapter Prisma y flujo de invitaciones.
- Formalizar migración para `passwordHash` y añadir seeding automatizado (scripts Prisma).
- Implementar cierre de sesión y middleware de protección de rutas.
- Añadir feedback (toasts) y listados a `/dashboard` para monitoreo rápido.
- Automatizar pipeline en Vercel (previews con base de datos temporal, seeds por entorno).

## Modelo de datos inicial (Prisma)

- `User`: metadata + roles (`USER`, `ADMIN`), relaciones con invitaciones, intentos y scores.
- `Account`/`Session`/`VerificationToken`: soporte NextAuth/Auth.js.
- `Group`: info del grupo, join code, owner.
- `GroupMembership`: usuario por grupo con rol (`MEMBER`, `ADMIN`) y estado (`PENDING`, `ACTIVE`, ...).
- `Invitation`: invitaciones por email, token, vencimiento, invitador/destinatario.
- `Game`: catálogo de juegos (`slug`, config JSON).
- `GameRound`: rondas por juego y grupo, estado (`SCHEDULED`, `ACTIVE`, ...).
- `Attempt`: intentos dentro de una ronda con feedback JSON y orden.
- `Score`: agregados por usuario/round/grupo (puntos, wins, intentos, streak).
