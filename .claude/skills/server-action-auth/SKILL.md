---
name: server-action-auth
description: Usa este skill para cualquier cambio relacionado a autenticación, sesión, o la cookie zentry_token. Cubre Server Actions de login/registro y reglas de seguridad no negociables.
---

# Autenticación vía Server Actions

## Arquitectura actual
- **Server Actions:** `lib/actions/auth.ts` (login, register, logout).
- **Middleware:** `middleware.ts` — protege rutas verificando cookie `zentry_token`.
- **AuthContext (cliente):** `context/AuthContext.tsx` — estado de usuario en cliente.
- **Cookie name:** `zentry_token`.

## Reglas no negociables
- El JWT se almacena EXCLUSIVAMENTE en una cookie HTTP-Only segura llamada
  `zentry_token`. Nunca sugerir `localStorage`, `sessionStorage`, ni exponer
  el token a JavaScript del cliente (protección contra XSS).
- Login/registro/logout viven como Server Actions (`'use server'`) en
  `lib/actions/auth.ts`. Nunca manejar auth desde un route handler de cliente
  sin necesidad.
- `@supabase/*` está deprecado/comentado. Nunca reintroducir el cliente de
  Supabase para sesión o persistencia.

## ⚠️ BUGS CONOCIDOS — CORREGIR AL TOCAR ESTE CÓDIGO

### Bug 1: Inconsistencia cookie set vs delete
En `lib/actions/auth.ts`, la función `logout()` borra la cookie `zentry_session`:
```ts
cookieStore.delete('zentry_session')  // ❌ Nombre incorrecto
```
Pero login/register setean `zentry_token`. **El logout no limpia la cookie
real**, dejando al usuario "logueado" eternamente en el middleware.
**Fix:** cambiar a `cookieStore.delete('zentry_token')`.

### Bug 2: AuthContext usa localStorage para datos de usuario
`context/AuthContext.tsx` almacena datos del usuario en `localStorage` y setea
la cookie `zentry_token` vía `document.cookie` (sin flag `httpOnly`).
Esto contradice la arquitectura de Server Actions que sí setea cookies HTTP-Only.
**Hay dos fuentes de verdad para el token**, lo cual puede causar desincronización.
**Al refactorizar:** el AuthContext debería obtener el usuario del servidor
(via Server Action o RSC) en vez de `localStorage`.

### Bug 3: Navbar importa tipos de Supabase
`components/shared/Navbar.tsx` importa `User from '@supabase/supabase-js'`
aunque Supabase está deprecado. Debería usar el tipo `User` de `types/index.ts`.

## Al tocar este código
1. Cualquier cambio en auth es sensible: revisar que la cookie se setee con
   `httpOnly: true`, `secure: true` (en producción), y `sameSite` apropiado.
2. Verificar que el manejo de 401/403 en `lib/api.ts` dispare correctamente
   la limpieza de sesión / redirect a login.
3. El middleware (`middleware.ts`) actualmente protege: `/feed/:path*`,
   `/profile/:path*`, `/login`, `/register`. Si agregas nuevas rutas protegidas
   (como `/projects`, `/messages`, etc.), actualizar el `matcher`.

## Middleware actual (referencia)
```ts
// Rutas protegidas actuales
matcher: ['/feed/:path*', '/profile/:path*', '/login', '/register']
```
**⚠️ NOTA:** Las rutas `/projects`, `/communities`, `/messages`,
`/notifications`, `/explore`, `/studio`, `/wallet` NO están protegidas
por el middleware. Un usuario sin token puede acceder directamente.
