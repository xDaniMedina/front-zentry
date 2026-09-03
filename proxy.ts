import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function isTokenValid(token: string): boolean {
  try {
    const payloadB64 = token.split('.')[1];
    if (!payloadB64) return false;
    const normalized = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(normalized));
    if (typeof payload.exp !== 'number') return true; // sin exp, se deja pasar (el backend igual valida la firma)
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export default function proxy(request: NextRequest) {
  const token = request.cookies.get('zentry_token')?.value;
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
  const hasValidToken = !!token && isTokenValid(token);

  if (pathname === '/') {
    return NextResponse.redirect(new URL(hasValidToken ? '/feed' : '/login', request.url));
  }

  if (!hasValidToken && !isAuthRoute) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    if (token) response.cookies.delete('zentry_token');
    return response;
  }

  if (hasValidToken && isAuthRoute) {
    return NextResponse.redirect(new URL('/feed', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/feed/:path*',
    '/profile/:path*',
    '/projects/:path*',
    '/communities/:path*',
    '/messages/:path*',
    '/notifications/:path*',
    '/explore/:path*',
    '/studio/:path*',
    '/wallet/:path*',
    '/settings/:path*',
    '/login',
    '/register',
  ]
}
