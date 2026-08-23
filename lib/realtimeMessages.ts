// MOTOR COMPLETO DE MENSAJERÍA EN TIEMPO REAL TIPO WHATSAPP PARA ZENTRY

import { Message } from "@/types";

export function normalizeUserIdentifier(u?: string | null): string {
  if (!u) return 'anon';
  let clean = u.trim().toLowerCase().replace(/^@/, '');
  if (clean.includes('@')) {
    clean = clean.split('@')[0];
  }
  return clean.replace(/[^a-z0-9_.-]/g, '');
}

export function getSharedChannelKey(user1: string, user2: string): string {
  const clean1 = normalizeUserIdentifier(user1);
  const clean2 = normalizeUserIdentifier(user2);
  const sorted = [clean1, clean2].sort();
  return `zentry_chat_channel_${sorted[0]}_${sorted[1]}`;
}

export function getSharedChannelMessages(channelKey: string): Message[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(channelKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn("Error leyendo canal compartido:", e);
  }
  return [];
}

export async function saveSharedChannelMessage(channelKey: string, message: Message): Promise<Message[]> {
  if (typeof window === 'undefined') return [message];
  try {
    const current = getSharedChannelMessages(channelKey);
    
    // Evitar duplicados por ID
    const exists = current.some(m => m.id === message.id);
    const updated = exists 
      ? current.map(m => m.id === message.id ? { ...m, ...message } : m)
      : [...current, message];
      
    localStorage.setItem(channelKey, JSON.stringify(updated));

    // Notificar a todas las pestañas y sesiones locales
    if ('BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel('zentry_realtime_chat_v2');
        bc.postMessage({
          type: 'NEW_MESSAGE',
          channelKey,
          message
        });
        bc.close();
      } catch (err) {}
    }

    // Sincronizar inmediatamente con el servidor Next.js
    try {
      fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...message,
          sender_username: message.sender_username,
          receiver_username: message.receiver_username
        })
      }).catch(() => {});
    } catch {}

    return updated;
  } catch (e) {
    console.warn("Error guardando mensaje en canal compartido:", e);
    return [message];
  }
}

export async function fetchServerMessagesForUser(username: string): Promise<Record<string, Message[]>> {
  if (typeof window === 'undefined' || !username) return {};
  try {
    const cleanU = normalizeUserIdentifier(username);
    const res = await fetch(`/api/messages?username=${encodeURIComponent(cleanU)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.channels) {
        // Fusionar con localStorage
        Object.entries(data.channels as Record<string, Message[]>).forEach(([channelKey, serverMsgs]) => {
          const localMsgs = getSharedChannelMessages(channelKey);
          
          const map = new Map<string, Message>();
          localMsgs.forEach(m => map.set(m.id, m));
          serverMsgs.forEach(m => map.set(m.id, m));

          const merged = Array.from(map.values()).sort((a, b) => {
            return new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime();
          });

          localStorage.setItem(channelKey, JSON.stringify(merged));
        });

        return data.channels;
      }
    }
  } catch (e) {
    console.warn("Error sincronizando con servidor Next.js:", e);
  }
  return {};
}

export async function markSharedChannelMessagesRead(channelKey: string, currentUsername: string): Promise<Message[]> {
  if (typeof window === 'undefined') return [];
  try {
    const cleanCurrent = normalizeUserIdentifier(currentUsername);
    const current = getSharedChannelMessages(channelKey);
    let changed = false;

    const updated = current.map(m => {
      const sender = normalizeUserIdentifier(m.sender_username);
      if (sender !== cleanCurrent && m.status !== 'read') {
        changed = true;
        return { ...m, status: 'read' as const };
      }
      return m;
    });

    if (changed) {
      localStorage.setItem(channelKey, JSON.stringify(updated));
      if ('BroadcastChannel' in window) {
        try {
          const bc = new BroadcastChannel('zentry_realtime_chat_v2');
          bc.postMessage({
            type: 'MESSAGES_READ',
            channelKey
          });
          bc.close();
        } catch {}
      }

      fetch('/api/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mark_read',
          channelKey,
          username: cleanCurrent
        })
      }).catch(() => {});
    }
    return updated;
  } catch (e) {
    console.warn("Error marcando mensajes como leídos:", e);
    return [];
  }
}

export async function toggleReactionOnMessage(channelKey: string, messageId: string, emoji: string, username: string): Promise<Message[]> {
  if (typeof window === 'undefined') return [];
  try {
    const cleanU = normalizeUserIdentifier(username);
    const current = getSharedChannelMessages(channelKey);

    const updated = current.map(msg => {
      if (msg.id === messageId) {
        const currentReactions = msg.reactions || {};
        const usersForEmoji = currentReactions[emoji] || [];

        let newUsers: string[];
        if (usersForEmoji.includes(cleanU)) {
          newUsers = usersForEmoji.filter(u => u !== cleanU);
        } else {
          newUsers = [...usersForEmoji, cleanU];
        }

        const newReactions = { ...currentReactions };
        if (newUsers.length > 0) {
          newReactions[emoji] = newUsers;
        } else {
          delete newReactions[emoji];
        }

        return { ...msg, reactions: newReactions };
      }
      return msg;
    });

    localStorage.setItem(channelKey, JSON.stringify(updated));

    if ('BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel('zentry_realtime_chat_v2');
        bc.postMessage({
          type: 'REACTION_UPDATED',
          channelKey,
          messageId
        });
        bc.close();
      } catch {}
    }

    fetch('/api/messages', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'toggle_reaction',
        channelKey,
        messageId,
        emoji,
        username: cleanU
      })
    }).catch(() => {});

    return updated;
  } catch (e) {
    console.warn("Error toggling reaction:", e);
    return [];
  }
}

export async function deleteMessageFromSharedChannel(channelKey: string, messageId: string): Promise<Message[]> {
  if (typeof window === 'undefined') return [];
  try {
    const current = getSharedChannelMessages(channelKey);
    const updated = current.filter(m => m.id !== messageId);
    localStorage.setItem(channelKey, JSON.stringify(updated));

    if ('BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel('zentry_realtime_chat_v2');
        bc.postMessage({
          type: 'MESSAGE_DELETED',
          channelKey,
          messageId
        });
        bc.close();
      } catch {}
    }

    fetch(`/api/messages?channelKey=${encodeURIComponent(channelKey)}&messageId=${encodeURIComponent(messageId)}`, {
      method: 'DELETE'
    }).catch(() => {});

    return updated;
  } catch (e) {
    console.warn("Error eliminando mensaje:", e);
    return [];
  }
}
