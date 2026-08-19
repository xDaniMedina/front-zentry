@AGENTS.md

# Project Commands
- `npm run dev` — Servidor de desarrollo
- `npm run build` — Build de producción
- `npm run lint` — Linting con ESLint

# Tech Stack
- Next.js 16.2 (App Router) + React 19 + TypeScript strict
- Tailwind CSS v4 (NO hay tailwind.config.js — usa `@theme` en CSS)
- shadcn/ui (estilo `radix-nova`) + Radix UI + lucide-react
- React Hook Form + Zod + @hookform/resolvers
- Framer Motion + tw-animate-css + sonner
- next-themes (3 temas: light, dark, zentry)

# Backend
- API REST externa (Spring Boot en `NEXT_PUBLIC_API_URL`, default `:8080`)
- Auth via JWT en cookie HTTP-Only `zentry_token`
- Supabase está DEPRECADO — no usar `lib/supabase/` ni `@supabase/*`

# Conventions
- Colores: usar tokens `zentry-*` (bg, card, sidebar, text-1, text-2, accent, border)
- CSS merge: siempre `cn()` de `lib/utils.ts`, nunca template strings condicionales
- API calls: siempre via `fetchAPI()` de `lib/api.ts`, nunca `fetch()` directo
- Forms: React Hook Form + Zod schema + zodResolver
- Toasts: `sonner` (`toast.success()`, `toast.error()`), nunca `alert()`
- Icons: `lucide-react`, nunca otra librería
- Components: `npx shadcn@latest add <name>`, nunca copiar a mano
