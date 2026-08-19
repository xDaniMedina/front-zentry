<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:zentry-project-rules -->
# Zentry Frontend — Reglas del Proyecto

## Arquitectura
- **App Router only.** Nunca usar patrones de Pages Router (getServerSideProps,
  _app.tsx, _document.tsx).
- **Server Components por defecto.** Solo agregar `'use client'` cuando sea
  estrictamente necesario (hooks, event handlers, browser APIs).
- **Server Actions** (`'use server'`) para mutaciones de datos. Viven en `lib/actions/`.
- **Middleware** en `middleware.ts` protege rutas via cookie `zentry_token`.

## CSS / Diseño
- **Tailwind v4** — tokens en `@theme` dentro de `app/globals.css`.
  NO existe `tailwind.config.js`. Nunca crear uno.
- **Colores semánticos:** siempre usar tokens `zentry-*`:
  `bg-zentry-bg`, `bg-zentry-card`, `text-zentry-text-1`, `text-zentry-text-2`,
  `text-zentry-accent`, `border-zentry-border`.
- **Clases condicionales:** siempre via `cn()` de `lib/utils.ts`.

## Componentes
- **shadcn/ui** (estilo `radix-nova`): instalar via CLI, nunca a mano.
- **Iconos:** solo `lucide-react`.
- **Animaciones:** Framer Motion (JS) o tw-animate-css (CSS).
- **Toasts:** solo `sonner`.

## API & Auth
- **fetchAPI()** de `lib/api.ts` para toda comunicación con backend.
  Nunca `fetch()` directo en componentes.
- **JWT** en cookie HTTP-Only `zentry_token`. Nunca localStorage/sessionStorage.
- **Supabase DEPRECADO.** No usar `lib/supabase/` ni importar `@supabase/*`.

## Tipos
- Tipos compartidos en `types/index.ts`.
- Schemas Zod reutilizables en `lib/validations/`.
- Inferir tipos de schemas: `z.infer<typeof schema>`, nunca duplicar interfaces.
<!-- END:zentry-project-rules -->
