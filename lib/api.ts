import { cookies } from 'next/headers';

// URL base del backend
const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/$/, "");

type FetchOptions = RequestInit & {
  requireAuth?: boolean;
  timeoutMs?: number;
};

export async function fetchAPI(endpoint: string, options: FetchOptions = {}) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('zentry_token')?.value;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };
    
    const url = `${BASE_URL}${endpoint}`;
    const timeout = options.timeoutMs || 2500;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      ...options, 
      headers,
      signal: options.signal || controller.signal,
      cache: 'no-store'
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      if (response.status === 401) {
        return null;
      }
      if (response.status === 403) {
        return null;
      }
      return null;
    }

    const text = await response.text();
    if (!text) {
      return { success: true };
    }

    try {
      return JSON.parse(text);
    } catch {
      return { success: true, text };
    }
  } catch (error: any) {
    // Si la conexión falló o hubo timeout, retornar null rápidamente sin bloquear
    return null;
  }
}