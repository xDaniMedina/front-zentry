import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Expone el JWT (que vive en la cookie HTTP-Only) solo para que el cliente
// STOMP pueda autenticar el handshake de WebSocket. El token se entrega en
// la respuesta de este endpoint y el cliente debe mantenerlo solo en
// memoria (nunca localStorage/sessionStorage/otra cookie legible por JS).
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('zentry_token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
  }

  return NextResponse.json({ token });
}
