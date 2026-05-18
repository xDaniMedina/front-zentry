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
 * Ejemplo: "Daniel García" → "DG"
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}