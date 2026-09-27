"use client"

import useSWR from "swr"
import { useAuth } from "@/context/AuthContext"
import { getMyProfileAction } from "@/lib/actions/profile"

/**
 * Foto de perfil del usuario actual desde su perfil real (misma clave SWR que el sidebar),
 * con el valor de la sesión como respaldo: la sesión puede tener una foto vieja o vacía.
 */
export function useMyAvatar(): string | null {
  const { user } = useAuth()
  const { data } = useSWR(user ? "myProfile" : null, getMyProfileAction)
  const profile = data?.success ? data.data : null
  return profile?.avatarUrl || profile?.avatar_url || user?.avatar_url || null
}
