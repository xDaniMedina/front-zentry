'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
// import { createClient } from '@/lib/supabase/server' // Comentado para la demo

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (email && password) {
    const cookieStore = await cookies()
    cookieStore.set('zentry_session', 'demo-session-token', { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 día
      path: '/',
    })

    revalidatePath('/', 'layout')
    redirect('/feed')
  }
}

export async function register(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (email && password) {
    const cookieStore = await cookies()
    cookieStore.set('zentry_session', 'demo-session-token', { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24,
      path: '/',
    })

    revalidatePath('/', 'layout')
    redirect('/onboarding')
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('zentry_session')
  
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function completeOnboarding(formData: FormData) {
  revalidatePath('/', 'layout')
  redirect('/feed')
}