'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { fetchAPI } from '@/lib/api'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export type AuthUser = { id: number | string; username: string; email: string }
export type AuthResult =
  | { success: true; user: AuthUser }
  | { success: false; message: string }

async function setSessionCookie(token: string) {
  if (!token) return;
  (await cookies()).set('zentry_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function login(formData: FormData): Promise<AuthResult> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  let needsVerification = false;
  let token = null;
  let userData = null;

  try {
    const response = await fetch(`${API}/api/auth/login`,  {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    })

    if (!response.ok) {
      return { success: false, message: 'Credenciales invalidas' }
    }

    const data = await response.json()

    if (data.requiresVerification) {
        needsVerification = true;
    } else {
        token = data.token;
        userData = data;
    }
  } catch (error) {
    console.error('Error en login:', error)
    return { success: false, message: 'No se pudo conectar con el servidor.' }
  }

  if (needsVerification) {
      redirect('/verify?email=' + encodeURIComponent(email));
  }

  if (token) {
      await setSessionCookie(token);
  }
  revalidatePath('/', 'layout')

  return { success: true, user: { id: userData?.id, username: userData?.username, email: userData?.email } }
}

export async function register(formData: FormData): Promise<AuthResult> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const username = formData.get('username') as string

  let needsVerification = false;
  let token = null;
  let userData = null;

  try {
    const response = await fetch(`${API}/api/auth/register`,  {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username }),
      cache: 'no-store',
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      return { success: false, message: data.message || 'Error en el registro' }
    }

    if (data.requiresVerification) {
        needsVerification = true;
    } else {
        token = data.token;
        userData = data;
    }
  } catch (error) {
    console.error('Error en registro:', error)
    return { success: false, message: 'No se pudo conectar con el servidor.' }
  }

  if (needsVerification) {
      redirect('/verify?email=' + encodeURIComponent(email));
  }

  if (token) {
      await setSessionCookie(token);
  }
  revalidatePath('/', 'layout')

  return { success: true, user: { id: userData?.id, username: userData?.username, email: userData?.email } }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('zentry_token')

  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function completeOnboarding(formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  
  await fetchAPI('/api/core/profiles/onboarding', {
    method: 'POST',
    body: JSON.stringify(data)
  })

  revalidatePath('/', 'layout')
  redirect('/feed')
}