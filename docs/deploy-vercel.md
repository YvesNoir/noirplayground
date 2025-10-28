# Deploy en Vercel

Guía rápida para dejar Noir Playground listo en producción sobre Vercel.

## 1. Requisitos previos

- Repositorio en GitHub configurado (`YvesNoir/noirplayground`).
- Base de datos PostgreSQL accesible desde Internet (ya creada: `db_noirplayground`).
- Cuenta en [Vercel](https://vercel.com/) con acceso al repositorio.

## 2. Variables de entorno

Crear el proyecto en Vercel y añadir las variables para los entornos **Production**, **Preview** y **Development**:

| Variable              | Valor                                                                                         |
|-----------------------|-----------------------------------------------------------------------------------------------|
| `DATABASE_URL`        | `postgresql://app_noirplayground:Noirplayground1666.@72.60.240.4:5432/db_noirplayground?schema=noirplayground` |
| `SHADOW_DATABASE_URL` | `postgresql://app_noirplayground:Noirplayground1666.@72.60.240.4:5432/db_noirplayground?schema=shadow_noirplayground` |

> Nota: `SHADOW_DATABASE_URL` se usa solo en local para `prisma migrate dev`, pero dejarlo vacío en Vercel no afecta. Si no querés exponerlo, podés omitirlo en producción.

## 3. Build & runtime

El repo incluye:

- `package.json` con script `postinstall` => `prisma generate`.
- Script `vercel-build` => `prisma migrate deploy && next build`.
- Archivo `vercel.json` forzando a Vercel a utilizar `npm run vercel-build`.

Esto garantiza que durante cada deploy:

1. Prisma genere el cliente (`npm install` → `postinstall`).
2. Las migraciones pendientes se apliquen (`prisma migrate deploy`).
3. Se ejecute `next build`.

## 4. Pasos en Vercel

1. Importar el repositorio `YvesNoir/noirplayground`.
2. Seleccionar framework **Next.js** (Vercel lo detecta automático).
3. Confirmar Build Command `npm run vercel-build` (lo toma del `vercel.json`).
4. Deploy.

## 5. Post-deploy

- Revisar logs para confirmar que `prisma migrate deploy` fue exitoso.
- Probar `/login` con el usuario seed (`sebastianfente@gmail.com / A37989250.`).
- Si necesitás más usuarios/grupos, usar el panel `/dashboard`.

## 6. Consideraciones adicionales

- Para entorno local, copiá `.env.example` → `.env`.
- Si migrás a otra base (por ejemplo, Neon o Supabase), actualizá `DATABASE_URL` y volvé a ejecutar `prisma migrate deploy`.
- A futuro, integrar NextAuth y manejo de sesiones serverless (p.ej. Prisma Accelerate) facilitará el escalado.
