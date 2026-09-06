import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea una fecha a texto legible en español.
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

/**
 * Formatea un número de Zentry Coins con separadores.
 */
export function formatCoins(amount: number): string {
  return new Intl.NumberFormat('es-MX').format(amount)
}

/**
 * Genera las iniciales de un nombre para avatares.
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Formatea una fecha como tiempo relativo ("Hace 5 min", "Hace 2 h").
 */
export function timeAgo(date?: string | Date | null): string {
  if (!date) return '';
  const then = new Date(date).getTime();
  if (Number.isNaN(then)) return '';

  const diffMs = Date.now() - then;
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return 'Justo ahora';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Hace ${diffHours} h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `Hace ${diffDays} d`;
  return formatDate(date);
}

/**
 * Resuelve URLs absolutas de uploads y assets del backend
 */
export function getImageUrl(path?: string | null): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}
