'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/feed')
}

export async function register(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    redirect(`/register?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/onboarding')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient()

  // Verificar que hay sesión activa
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  const display_name = formData.get('display_name') as string
  const artistic_name = formData.get('artistic_name') as string
  const username      = formData.get('username') as string
  const discipline    = formData.get('discipline') as string
  const experience_level = formData.get('experience_level') as string
  const bio           = formData.get('bio') as string

  // Guardar perfil en Supabase
  const { error } = await supabase
    .from('profiles')
    .upsert({
      user_id:          user.id,
      display_name,
      artistic_name,
      username,
      discipline,
      experience_level,
      bio,
      onboarding_status: 'completed',
    })

  if (error) {
    redirect(`/onboarding?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/feed')
}