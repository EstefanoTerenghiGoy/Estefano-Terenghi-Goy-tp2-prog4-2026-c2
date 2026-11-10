# Quantic

**Quantic** es una red social de exploradores, con una estética inspirada en *Outer Wilds*: cada usuario es un explorador que registra sus descubrimientos en una bitácora compartida.

Segundo trabajo práctico de Programación IV (Tecnicatura en Programación, UTN).

**Stack:** Angular (front) · NestJS + Mongoose (back) · MongoDB Atlas (base de datos) · Cloudinary (imágenes).

## Estructura

```
quantic/
├── quantic-back/    API en NestJS (registro, login, usuarios, publicaciones)
└── quantic-front/   Aplicación en Angular
```

## Correr en local

Hace falta Node.js, una base en MongoDB Atlas y una cuenta de Cloudinary.

### Back

```bash
cd quantic-back
npm install
cp .env.example .env   # completar los valores (ver la tabla de abajo)
npm run start:dev
```

La API queda en `http://localhost:3000`.

### Front

```bash
cd quantic-front
npm install
npm start
```

Abrir `http://localhost:4200`. Con el back corriendo ya se puede registrar un usuario e iniciar sesión.

> El back solo acepta pedidos del origen indicado en `FRONT_URL` (por defecto `http://localhost:4200`). Si servís el front en otro puerto, hay que cambiarla.

#### Inicio rápido (solo desarrollo)
En el login hay dos botones, "Usuario" y "Admin", que inician sesión con las cuentas de prueba definidas en `quantic-front/src/environments/environment.development.ts` (`usuariosRapidos`). En producción esa lista está vacía y los botones no aparecen.

## Variables de entorno

### Back (`quantic-back/.env`)

El archivo `.env` nunca se sube al repositorio; `.env.example` es la plantilla sin valores.

| Variable | Descripción |
|---|---|
| `MONGODB_URI` | Cadena de conexión de MongoDB Atlas. |
| `JWT_SECRET` | Secreto para firmar los tokens (se usa a partir del Sprint 2). |
| `CLOUDINARY_CLOUD_NAME` | Nombre de la nube de Cloudinary. |
| `CLOUDINARY_API_KEY` | API key de Cloudinary. |
| `CLOUDINARY_API_SECRET` | API secret de Cloudinary. |
| `FRONT_URL` | URL del front, usada para CORS. En local: `http://localhost:4200`. |
| `PORT` | Puerto de la API. Opcional, por defecto `3000`. |

### Front (`quantic-front/src/environments/`)

| Archivo | Cuándo se usa | `apiUrl` |
|---|---|---|
| `environment.development.ts` | `npm start` y `ng build --configuration development` | `http://localhost:3000` |
| `environment.ts` | `npm run build` (producción) | URL pública del back en Render |

## Desplegar en Render

Se despliegan dos servicios, **en este orden**:

### 1. Back (Web Service)

En Render: **New → Web Service**, conectar el repositorio y configurar:

- **Root Directory:** `quantic-back`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm run start:prod`
- **Environment Variables:** cargar `MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET`. `FRONT_URL` se completa en el paso 4. `PORT` no hace falta: Render lo define solo.

En MongoDB Atlas, ir a **Network Access** y permitir el acceso desde `0.0.0.0/0`; si no, Render no puede conectarse a la base.

Cuando termine el deploy, copiar la URL pública del back (por ejemplo `https://quantic-back.onrender.com`).

### 2. Configurar la URL del back en el front

Poner esa URL en `apiUrl` de `quantic-front/src/environments/environment.ts`, **sin `/` al final**, y hacer push al repositorio.

### 3. Front (Static Site)

En Render: **New → Static Site**, conectar el repositorio y configurar:

- **Root Directory:** `quantic-front`
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist/quantic-front/browser`

Además, en **Redirects/Rewrites** del servicio agregar la regla **Source** `/*` → **Destination** `/index.html` → **Action** `Rewrite`. Sin ella, recargar la página o entrar directo a `/perfil` o `/login` da 404, porque Render busca un archivo con ese nombre. Con el rewrite siempre se entrega `index.html` y Angular resuelve la ruta.

Cuando termine, copiar la URL pública del front (por ejemplo `https://quantic-front.onrender.com`).

### 4. Permitir el front en el back

En el servicio del back, en Render, cargar `FRONT_URL` con la URL pública del front, **sin `/` al final**, y guardar (el servicio se reinicia solo). Sin esto, el navegador bloquea los pedidos del front por CORS.
