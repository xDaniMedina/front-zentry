import { cookies } from 'next/headers';

/**
 * Valida (sin verificar firma) que exista una cookie zentry_token no vencida.
 * La firma la valida el backend Spring en cada llamada real a la API; esto
 * solo evita que rutas Next.js sin backend detrás (mocks, proxies) queden
 * completamente abiertas a peticiones anónimas.
 */
export async function hasValidSession(): Promise<boolean> {
  const token = (await cookies()).get('zentry_token')?.value;
  if (!token) return false;

  try {
    const payloadB64 = token.split('.')[1];
    if (!payloadB64) return false;
    const normalized = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(Buffer.from(normalized, 'base64').toString('utf-8'));
    if (typeof payload.exp !== 'number') return true;
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
