---
name: shadcn-scaffold
description: Usa este skill al agregar o modificar componentes de components/ui/ (shadcn/ui). Cubre el flujo correcto vía CLI, uso de cn(), y reglas de Tailwind v4 sin tailwind.config.js.
---

# Scaffold de componentes shadcn/ui

## Contexto del proyecto
- **shadcn style:** `radix-nova` (ver `components.json`).
- **CSS global:** `app/globals.css` — tokens definidos con `@theme`.
- **Componentes instalados actualmente:** avatar, badge, button, card, input,
  label, select, separator, tabs, textarea.
- **Alias de hooks:** `@/hooks` (definido en `components.json`, pero la carpeta
  aún no existe — crearla al primer hook necesario).

## Reglas fijas

### Instalación
- Nunca copiar/pegar código de componentes a mano. Siempre usar:
  ```bash
  npx shadcn@latest add <componente>
  ```
- Si un componente ya existe en `components/ui/`, verificar la versión antes de
  sobrescribirlo.

### Clases CSS
- Todo merge de clases pasa por `cn()` de `lib/utils.ts` (clsx + tailwind-merge).
  Nunca template strings condicionales sueltos para clases.
  ```tsx
  // ❌ MAL
  className={`base ${condition ? 'a' : 'b'}`}
  // ✅ BIEN
  className={cn('base', condition ? 'a' : 'b')}
  ```

### Tailwind v4 — SIN tailwind.config.js
- Este proyecto usa Tailwind v4: NO existe `tailwind.config.js`.
- Los tokens de diseño (colores, spacing, fonts, radius) se definen con `@theme`
  dentro de `app/globals.css`. Nunca crear ni sugerir un `tailwind.config.js`.
- Los colores custom del proyecto siguen el patrón `zentry-*`:
  - `bg-zentry-bg`, `bg-zentry-card`, `bg-zentry-sidebar`
  - `text-zentry-text-1`, `text-zentry-text-2`
  - `text-zentry-accent`, `border-zentry-border`
- Los temas (`light`, `dark`, `zentry`) se manejan vía CSS variables en `:root`,
  `.dark`, y `[data-theme='zentry']`.

### Librerías exclusivas
- Iconos: siempre de `lucide-react`, nunca otra librería sin pedirlo.
- Animaciones JS-driven: `framer-motion` (ya importado como `motion`).
- Animaciones CSS puras: `tw-animate-css` (ya importado en `globals.css`).
- Toasts/feedback: siempre `sonner`, nunca otra librería de toasts.

## Al modificar un primitive existente
1. Verificar si el cambio debería ir en el primitive (`components/ui/`) o en un
   wrapper específico de la app (`components/`) para no romper otros usos.
2. Mantener las variantes con `cva` (class-variance-authority) si el componente
   ya las usa.
3. Los colores hardcodeados `zinc-*` en los componentes de negocio (ej.
   `bg-zinc-900`) deberían migrar a tokens semánticos (`bg-zentry-card`) para
   que funcionen con los 3 temas.
