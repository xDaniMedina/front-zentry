import { redirect } from 'next/navigation'

/**
 * Página raíz — redirige al login.
 * Cuando tengamos middleware, redirigirá al feed si hay sesión.
 */
export default function HomePage() {
  redirect('/login')
}