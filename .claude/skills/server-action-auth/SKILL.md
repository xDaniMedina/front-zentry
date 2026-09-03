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

## ⚠️ BUGS CONOCIDOS

### Bug 1 y 2 — RESUELTOS
`lib/actions/auth.ts` ya borra `zentry_token` (no `zentry_session`) en `logout()`.
`login()`/`register()` ya no hacen `redirect()` internamente: devuelven
`{ success, user }` (sin el token — el JWT nunca sale del servidor) y el
componente cliente (`app/(auth)/login/page.tsx`, `register/page.tsx`) llama
`loginState(user)` y navega. `AuthContext.loginState` ya no escribe
`document.cookie`; el JWT vive exclusivamente en la cookie HTTP-Only que
setea el Server Action. `AuthContext` sigue cacheando en `localStorage` solo
datos NO sensibles de UI (username, avatar, etc.), nunca el token.
Cualquier componente cliente que necesite pegarle al backend debe hacerlo a
través de un Server Action en `lib/actions/*.ts` (que internamente usa
`fetchAPI`) — nunca leyendo `document.cookie` para armar un header
`Authorization` a mano (ese patrón ya no funciona: la cookie es HTTP-Only).

### Bug 3: Navbar importa tipos de Supabase — PENDIENTE
`components/shared/Navbar.tsx` importa `User from '@supabase/supabase-js'`
aunque Supabase está deprecado. El componente no está importado en ningún
lado (`app/(main)/layout.tsx` usa `LeftSidebar`/`RightSidebar`), así que la
corrección real es borrar el archivo en la limpieza de código muerto, no
arreglar el import.

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
matcher: [
  '/feed/:path*', '/profile/:path*', '/projects/:path*', '/communities/:path*',
  '/messages/:path*', '/notifications/:path*', '/explore/:path*',
  '/studio/:path*', '/wallet/:path*', '/settings/:path*', '/login', '/register',
]
```
El middleware ya no solo verifica que la cookie exista: decodifica el `exp`
del JWT (sin validar firma — eso lo hace el backend) y trata un token
vencido igual que ausente. Si agregas una nueva ruta protegida, súmala al
`matcher`.
