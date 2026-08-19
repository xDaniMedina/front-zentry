---
name: form-builder-rhf-zod
description: Usa este skill al crear o modificar formularios. Cubre el patrón React Hook Form + Zod + shadcn/ui, y la validación dual cliente/servidor.
---

# Formularios con React Hook Form + Zod

## Implementaciones de referencia existentes
- `components/auth/login-form.tsx` — Login con `useForm` + `zodResolver`.
- `components/projects/create-project-modal.tsx` — Modal con Zod transform.

## Patrón estándar
```tsx
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

// 1. Schema de validación
const mySchema = z.object({
  name: z.string().min(3, { message: "Mínimo 3 caracteres" }),
  email: z.string().email({ message: "Correo inválido" }),
})

// 2. Tipo inferido del schema — nunca duplicar a mano
type FormValues = z.infer<typeof mySchema>

// 3. Hook
const { register, handleSubmit, formState: { errors, isSubmitting } } =
  useForm<FormValues>({
    resolver: zodResolver(mySchema),
    defaultValues: { name: "", email: "" },
  })
```

## Componentes de formulario (shadcn/ui)
- Para formularios simples (como login), está OK usar `<Input>` + `<Label>` +
  `register()` directamente (como en `login-form.tsx`).
- Para formularios complejos con muchos campos, considerar instalar el componente
  `Form` de shadcn que envuelve `react-hook-form`:
  ```bash
  npx shadcn@latest add form
  ```
  Y usar `<Form>`, `<FormField>`, `<FormControl>`, `<FormMessage>` para
  accesibilidad automática (ARIA).

## Ubicación de schemas
- Si el schema se usa SOLO en un componente → definirlo en el mismo archivo
  (como en `login-form.tsx` y `create-project-modal.tsx`).
- Si el schema se reutiliza entre cliente y servidor → extraerlo a
  `lib/validations/<nombre>.ts`.

## Validación dual (cliente + servidor)
- El MISMO schema Zod usado en el cliente se importa y reusa en el Server
  Action correspondiente (`lib/actions/`). Nunca escribir la validación de
  servidor por separado.
- **⚠️ BUG ACTUAL:** En `login-form.tsx` se valida con Zod en el cliente pero
  `lib/actions/auth.ts` NO valida el `FormData` con el mismo schema en servidor.
  Al crear nuevos formularios, siempre validar en AMBOS lados.

## Feedback al usuario
- Errores de validación de campo → mostrar con `{errors.campo.message}` debajo
  del input (ya implementado correctamente).
- Errores de servidor (ej. 422, validación de negocio) → usar `sonner`:
  ```tsx
  import { toast } from 'sonner'
  toast.error('Credenciales incorrectas')
  ```
- **Nunca** usar `alert()` ni `window.confirm()`.
- Estado de carga → `isSubmitting` del hook + `<Loader2 className="animate-spin">`
  (patrón ya establecido en el proyecto).

## Convención de estilos para inputs
Seguir el patrón existente:
```tsx
className={cn(
  'bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500',
  'focus:border-violet-500 focus:ring-violet-500/20 rounded-xl',
  errors.campo && 'border-red-500 focus:border-red-500'
)}
```
**Nota:** Idealmente migrar `bg-zinc-800` → token semántico como `bg-zentry-bg`
para compatibilidad con los 3 temas.
