import { cookies } from 'next/headers';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

type FetchOptions = RequestInit & {
  requireAuth?: boolean;
};

export async function fetchAPI(endpoint: string, options: FetchOptions = {}) {
  const token = (await cookies()).get('zentry_token')?.value;
  const cookieStore = await cookies();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  }
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options, 
    headers,
  });

  if(response.status === 401) {
    throw new Error('No autorizado. Falta el token.');
  }
  return response.json();
}

