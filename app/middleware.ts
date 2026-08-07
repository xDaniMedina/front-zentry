import { NextResponse, type NextRequest } from 'next/server'


export function middleware(request: NextRequest) {
  // 1. Buscamos la cookie de la sesión de la demo que acabamos de configurar
  const token = request.cookies.get('zentry_session')?.value

  const { pathname } = request.nextUrl

  // 2. Si el usuario intenta entrar a las pantallas de la app sin la cookie, lo mandamos al login
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register')
  
  // Excluimos archivos estáticos, api e imágenes para que no se rompa nada
  const isStaticRoute = 
    pathname.startsWith('/_next') || 
    pathname.includes('.') || 
    pathname.startsWith('/api')

  if (isStaticRoute) {
    return NextResponse.next()
  }

  // Si no hay sesión y quiere entrar al feed, wallet, profile, etc. -> Al Login
  if (!token && !isAuthRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  return NextResponse.next()
}

// Protegemos todas las pantallas del ecosistema principal
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.:original|$).*)',
  ],
}