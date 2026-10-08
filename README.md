# DAELY · Lista VIP

Formulario de captación de fans + dashboard privado para descargar los registros en Excel.

Stack: Next.js 16 · Zustand · Prisma 7 + PostgreSQL · Better Auth · ExcelJS

## Arrancar en local

```bash
npm install
cp .env.example .env      # ajusta los valores (ya existe un .env de desarrollo)
npm run db:up             # Postgres en Docker (puerto 5434)
npm run db:migrate        # crea las tablas
npm run db:seed           # crea el usuario admin con ADMIN_EMAIL / ADMIN_PASSWORD
npm run dev
```

- `/` → intro con el vinilo + formulario
- `/gracias` → agradecimiento con enlaces a redes (edítalos en `src/config/social.ts`)
- `/dashboard` → lista de registros + **Descargar Excel**

**Acceso al dashboard:** mantén presionado el logo DAELY del formulario 3 segundos.

## Desplegar en Vercel

1. Sube el proyecto a GitHub e impórtalo en [vercel.com/new](https://vercel.com/new) (detecta Next.js solo).
2. En el proyecto de Vercel → **Storage** → **Create Database** → **Neon (Postgres)** → conéctala.
   Esto crea `DATABASE_URL` y `DATABASE_URL_UNPOOLED` automáticamente.
3. En **Settings → Environment Variables** agrega:
   | Variable | Valor |
   | --- | --- |
   | `BETTER_AUTH_SECRET` | resultado de `openssl rand -base64 32` |
   | `ADMIN_EMAIL` | `admin@daely.com` |
   | `ADMIN_PASSWORD` | la contraseña del admin |
   | `BETTER_AUTH_URL` | *(solo si usas dominio propio)* `https://tudominio.com` |
4. Deploy. El script `vercel-build` hace todo solo: genera Prisma, aplica migraciones,
   crea/actualiza el admin y compila.

Para cambiar la contraseña del admin: cambia `ADMIN_PASSWORD` en Vercel y haz redeploy.

## Seguridad

- **Formulario:** campo trampa (honeypot), token firmado con tiempo mínimo de llenado,
  máximo 5 envíos cada 10 min por IP (se guarda solo un hash del IP), validación estricta
  en el servidor, límite de tamaño de las peticiones, y los correos repetidos no
  sobrescriben datos ni revelan si ya existían.
- **Login:** máximo 5 intentos cada 5 min por IP, registro público deshabilitado.
- **Dashboard y Excel:** verifican la sesión en el servidor. Mantener presionado el logo
  solo esconde el acceso, la protección real es el login.
- **Encabezados:** CSP, HSTS, anti-clickjacking, nosniff, etc. (`next.config.ts`).
