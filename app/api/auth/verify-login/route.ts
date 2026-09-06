import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const backendRes = await fetch(BACKEND_URL + '/api/auth/verify-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();
    const res = NextResponse.json(data, { status: backendRes.status });

    // Si la verificacion es exitosa y hay token, establecer cookie
    if (backendRes.ok && data.token) {
      res.cookies.set('zentry_token', data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return res;
  } catch (error) {
    console.error('[API /auth/verify-login] Error:', error);
    return NextResponse.json(
      { message: 'No se pudo conectar con el servidor' },
      { status: 502 }
    );
  }
}