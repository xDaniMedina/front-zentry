import { cookies } from 'next/headers';

// Nos aseguramos de quitar cualquier diagonal al final de la URL base para que no se duplique
const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/$/, "");

type FetchOptions = RequestInit & {
  requireAuth?: boolean;
};

export async function fetchAPI(endpoint: string, options: FetchOptions = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('zentry_token')?.value;
  
  console.log("---- DEBUG FETCH EN NEXT.JS ----");
  console.log("1. Endpoint solicitado:", endpoint);
  console.log("2. ¿Hay token en la cookie?:", token ? `SÍ (Inicia con: ${token.substring(0, 15)}...)` : "NO, ESTÁ VACÍO");
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  }
  
  const url = `${BASE_URL}${endpoint}`;
  console.log("3. URL final armada:", url);
  
  const response = await fetch(url, {
    ...options, 
    headers,
    cache: 'no-store'
  });

  if (!response.ok) {
    if (response.status === 404) {
      // Recurso no encontrado (el backend aún no tiene el objeto en DB) -> fallback a estado local
      return null;
    }
    if (response.status === 401) {
      console.error('No autorizado (401). El token expiró o es inválido.');
      return null;
    }
    if (response.status === 403) {
      console.error(`Prohibido (403). Acceso denegado en el backend a la ruta: ${url}`);
      return null;
    }
    console.error(`Error ${response.status} en la petición a ${url}`);
    return null;
  }

  const text = await response.text();
  if (!text) {
    return null;
  }

  return JSON.parse(text);
} 