// lib/api.ts
import { createClient } from '@/lib/supabase/client'; // Tu función del navegador para Supabase
import { toast } from 'sonner';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';


type FetchOptions = RequestInit & {
  requireAuth?: boolean;
};

/**
 * Cliente HTTP unificado y tipado para Zentry.
 * Inyecta automáticamente los JWT de Supabase de forma segura.
 */
export async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { requireAuth = true, ...customConfig } = options;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Si la ruta requiere autenticación, extraemos el JWT del cliente de Supabase
  if (requireAuth) {
    try {
      const supabase = createClient();
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        throw new Error('No se encontró una sesión activa de Supabase.');
      }

      // Inyectamos el JWT en el estándar Bearer Token
      headers['Authorization'] = `Bearer ${session.access_token}`;
    } catch (authError) {
      console.error('[API AUTH ERROR]:', authError);
      toast.error('Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.');
      throw authError;
    }
  }

  const config: RequestInit = {
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    
    if (response.status === 401 || response.status === 403) {
      toast.error('No tienes permisos para realizar esta acción (401/403).');
      throw new Error('No autorizado');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error del servidor: ${response.status}`);
    }

    // Si la respuesta no tiene contenido (ej. 204 No Content)
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error: unknown) {
    // Verificamos si el error es realmente un objeto de tipo Error
    if (error instanceof Error) {
      console.error(`[API NETWORK ERROR] en ${endpoint}:`, error.message);
    } else {
      // Si arrojaron un string o un número directamente
      console.error(`[API NETWORK ERROR] en ${endpoint}:`, error);
    }
    
    throw error;
  }
}