---
name: rsc-boundary-check
description: Usa este skill al crear cualquier archivo dentro de app/ o components/ para decidir si debe ser Server Component o Client Component, y evitar "client leakage".
---

# Fronteras Server / Client Component

## Estado actual del proyecto
### Archivos marcados como 'use client' (correcto):
- `context/AuthContext.tsx` — usa useState, useEffect, useRouter
- `lib/context/FeedContext.tsx` — usa createContext, useState
- `components/providers/ThemeProvider.tsx` — wraps next-themes
- `components/shared/Navbar.tsx` — usa useState
- `components/feed/LeftSidebar.tsx` — usa useState, useEffect, useTheme
- `components/auth/login-form.tsx` — usa useForm (react-hook-form)
- `components/projects/create-project-modal.tsx` — usa useForm

### Archivos Server Component (correcto):
- `app/page.tsx` — solo redirect()
- `app/(main)/layout.tsx` — solo renderiza LeftSidebar/RightSidebar
- `app/layout.tsx` — root layout

### ⚠️ Archivo problemático:
- `components/feed/FeedCard.tsx` — Usa `useState`, `motion` de framer-motion,
  event handlers... pero **NO tiene la directiva `'use client'`**. Funciona
  solo porque algún componente padre ya es Client Component. Agregarle la
  directiva explícitamente para evitar errores si se importa desde un RSC.

## Checklist antes de escribir 'use client'
Antes de marcar un componente como Client Component, verificar si cumple
ALGUNA de estas condiciones:
- ¿Usa hooks de React? (`useState`, `useEffect`, `useContext`, `useRef`)
- ¿Usa hooks de next? (`useRouter`, `usePathname`, `useSearchParams`)
- ¿Usa hooks de terceros? (`useForm`, `useTheme`, `useFeed`, `useAuth`)
- ¿Necesita event handlers? (`onClick`, `onChange`, `onSubmit`)
- ¿Usa APIs del navegador? (`window`, `localStorage`, `document`)
- ¿Usa Framer Motion con animaciones interactivas? (`motion.div`, `AnimatePresence`)

**Si NINGUNA aplica** → Server Component (default, sin directiva).
**Si alguna aplica** → `'use client'` al inicio del archivo.

## Antipatrón a evitar (client leakage)
```tsx
// ❌ MAL — toda la página es 'use client' por un solo botón
'use client'
export default function ProjectsPage() {
  const [open, setOpen] = useState(false)
  // ... 200 líneas de markup estático ...
  return <div>
    <h1>Proyectos</h1>
    {/* Cientos de líneas estáticas... */}
    <button onClick={() => setOpen(true)}>Crear</button>
  </div>
}
```
```tsx
// ✅ BIEN — solo el botón es Client Component
// app/(main)/projects/page.tsx (Server Component)
import { CreateButton } from './CreateButton'
export default function ProjectsPage() {
  return <div>
    <h1>Proyectos</h1>
    {/* Markup estático renderizado en servidor */}
    <CreateButton />
  </div>
}

// app/(main)/projects/CreateButton.tsx
'use client'
export function CreateButton() {
  const [open, setOpen] = useState(false)
  return <button onClick={() => setOpen(true)}>Crear</button>
}
```

## Patrón de Providers en este proyecto
Los Providers (`ThemeProvider`, `AuthProvider`) están correctamente en el
root layout. Al agregar un nuevo Provider:
1. Crear wrapper en `components/providers/`.
2. Marcarlo `'use client'`.
3. Importarlo en `app/layout.tsx` (que es Server Component).
4. Este patrón funciona porque Next.js permite importar Client Components
   dentro de Server Components — lo que NO se puede es usar hooks en un RSC.
