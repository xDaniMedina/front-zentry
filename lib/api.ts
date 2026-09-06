// URL base del backend
const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/$/, "");

const DEFAULT_TIMEOUT_MS = 8000;

type FetchOptions = RequestInit & {
  requireAuth?: boolean;
  timeoutMs?: number;
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Obtener token dinámicamente según el entorno
async function getToken() {
  if (typeof window !== 'undefined') {
    // Cliente: Extraer de document.cookie
    const match = document.cookie.match(new RegExp('(^| )zentry_token=([^;]+)'));
    return match ? match[2] : null;
  } else {
    // Servidor: la cookie HTTP-Only solo es legible aquí
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      return cookieStore.get('zentry_token')?.value ?? null;
    } catch {
      return null;
    }
  }
}

export async function fetchAPI(endpoint: string, options: FetchOptions = {}) {
  let response: Response;

  try {
    const token = await getToken();
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

    const headers: HeadersInit = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const url = `${BASE_URL}${endpoint}`;
    const timeout = options.timeoutMs || DEFAULT_TIMEOUT_MS;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    response = await fetch(url, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
      cache: 'no-store'
    }).finally(() => clearTimeout(timeoutId));
  } catch {
    // Falla de red, timeout o abort: no hay respuesta del servidor que mostrar
    return null;
  }

  if (!response.ok) {
    // 401/403/404: estados esperados que cada pantalla ya maneja como "sin datos" / "sin permiso"
    if (response.status === 401 || response.status === 403 || response.status === 404) {
      return null;
    }

    // Cualquier otro error (400, 409, 500, 502...) sí debe llegar al usuario
    let message = `Error ${response.status}`;
    try {
      const errorBody = await response.json();
      message = errorBody?.message || errorBody?.error || message;
    } catch {
      // el cuerpo no era JSON, nos quedamos con el mensaje genérico
    }
    throw new ApiError(response.status, message);
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
}
