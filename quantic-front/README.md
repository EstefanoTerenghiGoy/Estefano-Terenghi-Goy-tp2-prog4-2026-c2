# Quantic (front)

Front de **Quantic**, una red social de exploradores. Hecho con Angular 22 (componentes standalone, signals y formularios reactivos). El back (NestJS + MongoDB) está en `../quantic-back`.

## Correr el front en local

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Tener el back corriendo (ver el `README` de `quantic-back`). Por defecto escucha en `http://localhost:3000`, que es el `apiUrl` de `src/environments/environment.development.ts`.
3. Levantar el front:
   ```bash
   npm start
   ```
4. Abrir `http://localhost:4200`.

> El back solo acepta pedidos del origen que indica su variable `FRONT_URL` (por defecto `http://localhost:4200`). Si servís el front en otro puerto, hay que cambiarla.

### Inicio rápido (solo desarrollo)
En el login hay dos botones, "Usuario" y "Admin", que inician sesión con las cuentas de prueba definidas en `src/environments/environment.development.ts` (`usuariosRapidos`). En producción esa lista está vacía y los botones no aparecen.

## Variables de entorno

| Archivo | Cuándo se usa | `apiUrl` |
|---|---|---|
| `src/environments/environment.development.ts` | `ng serve` y `ng build --configuration development` | `http://localhost:3000` |
| `src/environments/environment.ts` | `ng build` (producción) | `https://COMPLETAR-URL-DEL-BACK` |

## Desplegar en Render

El front se despliega como **Static Site** en [Render](https://render.com).

1. Desplegar primero el back como **Web Service** y copiar su URL pública.
2. Poner esa URL en `apiUrl` de `src/environments/environment.ts` (reemplazando `https://COMPLETAR-URL-DEL-BACK`), **sin `/` al final**, y subir el cambio al repositorio.
3. En el back, configurar la variable `FRONT_URL` con la URL pública del front (la que Render te asigne al crear el Static Site, por ejemplo `https://quantic-front.onrender.com`) para que CORS permita los pedidos del front, y reiniciar el back.
4. En Render, crear un **Static Site** (**New → Static Site**), conectar este repositorio y configurar:
   - **Root Directory:** `quantic-front`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist/quantic-front/browser`
5. En el servicio, ir a **Redirects/Rewrites** y agregar esta regla:
   - **Source:** `/*`
   - **Destination:** `/index.html`
   - **Action:** `Rewrite`

   Sin esa regla, al recargar la página o entrar directo a `/perfil`, `/login`, etc. Render busca un archivo con ese nombre, no lo encuentra y devuelve **404**. Con el rewrite siempre se entrega `index.html` y Angular resuelve la ruta en el navegador. Los archivos que sí existen (JS, CSS, favicon) se siguen sirviendo normalmente.

Cada `git push` a la rama configurada vuelve a desplegar el front automáticamente.

Para probar el build de producción en local:
```bash
npm run build
```
Los archivos quedan en `dist/quantic-front/browser`.

## Estructura

```
src/app/
  core/       servicios (auth, modal) y utilidades
  shared/     componentes, directivas, pipes, validadores y modelos reutilizables
  pages/      pantallas: login, registro, publicaciones y perfil
```
