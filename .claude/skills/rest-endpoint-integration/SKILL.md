---
name: rest-endpoint-integration
description: Usa este skill al integrar cualquier endpoint del backend REST (Spring Boot / Zentry). Cubre el patrón fetchAPI, manejo de 401/403, y sincronización de tipos con Zod.
---

# Integración de endpoints REST

## Arquitectura actual
- **Conector central:** `lib/api.ts` — función `fetchAPI(endpoint, options)`.
- **URL base:** `NEXT_PUBLIC_API_URL` (default `http://localhost:8080`).
- **Token:** cookie HTTP-Only `zentry_token`, inyectada automáticamente como
  `Authorization: Bearer <token>`.
- **Server Actions existentes:** `lib/actions/auth.ts`, `lib/actions/projects.ts`.

## Reglas fijas

### Uso de fetchAPI
- Toda petición HTTP pasa por `fetchAPI` en `lib/api.ts`. Nunca `fetch()` directo
  dentro de componentes o Server Actions.
  ```tsx
  // ❌ MAL — fetch directo sin headers de auth
  const res = await fetch('http://localhost:8080/api/users')
  // ✅ BIEN — usa el conector centralizado
  const data = await fetchAPI('/api/users')
  ```
- El token JWT se inyecta automáticamente en el header — nunca manejarlo
  manualmente en cada llamada.

### Manejo de errores
- Los códigos 401 y 403 ya tienen manejo centralizado en `fetchAPI` (retorna
  `null`). No duplicar ese manejo en cada componente.
- Al consumir `fetchAPI`, siempre verificar si el resultado es `null`:
  ```tsx
  const data = await fetchAPI('/api/v1/posts')
  if (!data) {
    // manejar error o redirigir
  }
  ```

### Convención de endpoints
- El backend expone la mayoría de sus endpoints bajo `/api/core/`,
  `/api/business/` y `/api/ai/` (además de aliases `/api/v1/` para algunos,
  ver `securityConfig.java` en el backend). **No asumir `/api/v1/` para auth.**
- Los endpoints de autenticación reales (confirmados en
  `AuthController.java` del backend) son:
  - `POST /api/auth/login` → `{ email, password }` → `{ token, id, username, email }`
  - `POST /api/auth/register` → `{ email, password, username }` → `{ token, id, username, email }`
- Si tienes dudas sobre un endpoint, revisa el controller correspondiente en
  el repo del backend en vez de asumir un prefijo — este proyecto ya tuvo un
  bug de producción por asumir `/api/v1/login` en vez de verificarlo.

### Crear un nuevo Server Action
Siempre seguir este patrón (basado en `lib/actions/projects.ts`):
```tsx
'use server'
import { fetchAPI } from '@/lib/api'
import { revalidatePath } from 'next/cache'

export async function createThing(formData: FormData) {
  const data = Object.fromEntries(formData)
  try {
    await fetchAPI('/api/v1/things', {
      method: 'POST',
      body: JSON.stringify(data)
    })
    revalidatePath('/things')
  } catch (error) {
    console.error("Error:", error)
  }
}
```

## Tipado de respuestas
1. Definir el shape de la respuesta como interface TypeScript en `types/index.ts`
   o en un archivo específico de `types/`.
2. Si se necesita validación en runtime, crear un schema Zod en
   `lib/validations/` e inferir el tipo con `z.infer<typeof schema>`.
3. **⚠️ CUIDADO con tipos duplicados:** El proyecto ya tiene una interfaz
   `Project` en `types/index.ts` Y otra diferente en `types/project.ts`. Nunca
   crear definiciones duplicadas — consolidar en un solo lugar.
4. Si el endpoint viene del backend Zentry (Spring Boot), revisar que los tipos
   numéricos (UUID vs Integer vs Long) coincidan con las entidades reales.

## Supabase — DEPRECADO
- `@supabase/*` está deprecado/comentado en este proyecto. La carpeta
  `lib/supabase/` existe pero NO DEBE USARSE. Nunca sugerir ni reintroducir
  el cliente de Supabase. Toda persistencia pasa por la API REST.
