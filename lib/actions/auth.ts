'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
// import { createClient } from '@/lib/supabase/server' // Comentado para la demo

const API = process.env.NEXT_PUBLIC_API_URL

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  try {
    const response = await fetch(`${API}/api/v1/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

  if (!response.ok) {
    return { success: false, message: 'Credenciales inválidas' };
  }
       const data = await response.json();
       const token = data.token;

       (await cookies()).set('zentry_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 días
          });
          return { success: true };
    } catch (error) {
    console.error('Error en login:', error)
    return { success: false, message: 'Error en el servidor' };
  }

  revalidatePath('/', 'layout')
    redirect('/onboarding')
}


export async function register(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const username = formData.get('username') as string

  try {
    const response = await fetch(`${API}/api/v1/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, username }),
      cache: 'no-store', // Evita que la respuesta se almacene en caché
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, message: data.message || 'Error en el registro' }
    }

    const cookieStore = await cookies()
    cookieStore.set('zentry_token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 días
    })

  } catch (error) {
    return { success: false, message: 'Error en el servidor' };
  }
  revalidatePath('/', 'layout')
  redirect('/onboarding')
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('zentry_session')
  
  revalidatePath('/', 'layout')
  redirect('/login')
}