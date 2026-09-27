import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, '')

/**
 * Presencia vía el propio servidor de Next: el navegador no puede leer la cookie HTTP-Only,
 * así que un sendBeacon directo al backend llegaba sin token (401) y nunca marcaba "desconectado".
 * Aquí se lee la cookie y se reenvía con el JWT. Acepta ?status=online|offline.
 */
export async function POST(req: NextRequest) {
  const token = (await cookies()).get('zentry_token')?.value
  if (!token) return NextResponse.json({ ok: false }, { status: 401 })

  const status = req.nextUrl.searchParams.get('status') === 'offline' ? 'offline' : 'online'
  try {
    await fetch(`${API_URL}/api/core/friends/presence/ping?status=${status}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
  } catch {
    // backend no disponible: se reintentará con el siguiente ping
  }
  return NextResponse.json({ ok: true, status })
}
