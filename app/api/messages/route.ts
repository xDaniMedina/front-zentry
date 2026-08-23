import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Message } from '@/types';

// Almacenamiento en memoria en el servidor Next.js
declare global {
  var __ZENTRY_GLOBAL_MESSAGES__: Map<string, Message[]> | undefined;
}

if (!global.__ZENTRY_GLOBAL_MESSAGES__) {
  global.__ZENTRY_GLOBAL_MESSAGES__ = new Map<string, Message[]>();
}

const messageStore = global.__ZENTRY_GLOBAL_MESSAGES__;

function normalizeUser(u?: string | null): string {
  if (!u) return 'anon';
  let clean = u.trim().toLowerCase().replace(/^@/, '');
  if (clean.includes('@')) {
    clean = clean.split('@')[0];
  }
  return clean.replace(/[^a-z0-9_.-]/g, '');
}

function getChannelKey(u1: string, u2: string): string {
  const c1 = normalizeUser(u1);
  const c2 = normalizeUser(u2);
  const sorted = [c1, c2].sort();
  return `zentry_chat_channel_${sorted[0]}_${sorted[1]}`;
}

// GET: Obtener mensajes de un canal o todos los mensajes de un usuario
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const u1 = searchParams.get('u1') || searchParams.get('sender');
  const u2 = searchParams.get('u2') || searchParams.get('receiver');
  const username = searchParams.get('username') || searchParams.get('user');

  if (u1 && u2) {
    const key = getChannelKey(u1, u2);
    const messages = messageStore.get(key) || [];
    return NextResponse.json({ success: true, channelKey: key, messages });
  }

  if (username) {
    const cleanUser = normalizeUser(username);
    const userChannels: Record<string, Message[]> = {};

    for (const [key, msgs] of messageStore.entries()) {
      if (key.includes(cleanUser)) {
        userChannels[key] = msgs;
      }
    }
    return NextResponse.json({ success: true, channels: userChannels });
  }

  // Devolver todos los canales
  const allChannels: Record<string, Message[]> = {};
  for (const [key, msgs] of messageStore.entries()) {
    allChannels[key] = msgs;
  }

  return NextResponse.json({ success: true, channels: allChannels });
}

// POST: Enviar / Guardar un nuevo mensaje entre usuarios
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      sender_username, 
      receiver_username, 
      text, 
      content,
      isImage, 
      fileUrl, 
      isVoice,
      voiceDuration,
      status 
    } = body;

    const u1 = normalizeUser(sender_username);
    const u2 = normalizeUser(receiver_username);

    if (!u1 || !u2) {
      return NextResponse.json({ success: false, error: 'Emisor y receptor requeridos' }, { status: 400 });
    }

    const key = getChannelKey(u1, u2);
    const currentMessages = messageStore.get(key) || [];

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: Message = {
      id: body.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      sender_username: u1,
      receiver_username: u2,
      text: text || content || '',
      content: content || text || '',
      time: body.time || timeStr,
      created_at: body.created_at || now.toISOString(),
      status: status || 'delivered',
      isImage: Boolean(isImage),
      fileUrl: fileUrl || undefined,
      isVoice: Boolean(isVoice),
      voiceDuration: voiceDuration || undefined,
      reactions: body.reactions || {}
    };

    // Evitar duplicados por ID
    const exists = currentMessages.some(m => m.id === newMsg.id);
    const updated = exists 
      ? currentMessages.map(m => m.id === newMsg.id ? { ...m, ...newMsg } : m)
      : [...currentMessages, newMsg];

    messageStore.set(key, updated);

    return NextResponse.json({ success: true, channelKey: key, message: newMsg, messages: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Marcar leídos o agregar reacciones
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, channelKey, u1, u2, username, messageId, emoji } = body;

    const key = channelKey || (u1 && u2 ? getChannelKey(u1, u2) : null);
    if (!key) {
      return NextResponse.json({ success: false, error: 'Canal no especificado' }, { status: 400 });
    }

    const currentMessages = messageStore.get(key) || [];

    if (action === 'mark_read' && username) {
      const cleanUser = normalizeUser(username);
      const updated = currentMessages.map(m => {
        if (normalizeUser(m.sender_username) !== cleanUser && m.status !== 'read') {
          return { ...m, status: 'read' as const };
        }
        return m;
      });
      messageStore.set(key, updated);
      return NextResponse.json({ success: true, messages: updated });
    }

    if (action === 'toggle_reaction' && messageId && emoji && username) {
      const cleanUser = normalizeUser(username);
      const updated = currentMessages.map(m => {
        if (m.id === messageId) {
          const reactions = m.reactions || {};
          const currentUsers = reactions[emoji] || [];
          let newUsers: string[];

          if (currentUsers.includes(cleanUser)) {
            newUsers = currentUsers.filter(u => u !== cleanUser);
          } else {
            newUsers = [...currentUsers, cleanUser];
          }

          const newReactions = { ...reactions };
          if (newUsers.length > 0) {
            newReactions[emoji] = newUsers;
          } else {
            delete newReactions[emoji];
          }

          return { ...m, reactions: newReactions };
        }
        return m;
      });

      messageStore.set(key, updated);
      return NextResponse.json({ success: true, messages: updated });
    }

    return NextResponse.json({ success: false, error: 'Acción no válida' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Eliminar mensaje
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get('messageId');
    const u1 = searchParams.get('u1');
    const u2 = searchParams.get('u2');
    const channelKey = searchParams.get('channelKey') || (u1 && u2 ? getChannelKey(u1, u2) : null);

    if (!channelKey || !messageId) {
      return NextResponse.json({ success: false, error: 'channelKey y messageId requeridos' }, { status: 400 });
    }

    const currentMessages = messageStore.get(channelKey) || [];
    const updated = currentMessages.filter(m => m.id !== messageId);
    messageStore.set(channelKey, updated);

    return NextResponse.json({ success: true, messages: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
