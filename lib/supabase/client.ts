import { createBrowserClient } from '@supabase/ssr'

/**
 * Cliente Supabase para componentes del navegador.
 * Usar en archivos con "use client".
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}