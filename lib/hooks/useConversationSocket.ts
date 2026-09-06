"use client"

import { useEffect, useRef, useCallback, useState } from "react";
import { Client, type IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { Message } from "@/types";

const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/$/, "");

/**
 * Mantiene una única conexión STOMP/SockJS autenticada mientras el componente
 * que la usa está montado, y permite suscribirse a conversaciones puntuales.
 * El JWT nunca se persiste: se pide una vez a /api/auth/ws-token (que lo lee
 * de la cookie HTTP-Only en el servidor) y solo vive en esta instancia del Client.
 */
export function useConversationSocket(enabled: boolean) {
  const clientRef = useRef<Client | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let client: Client | null = null;

    (async () => {
      try {
        const res = await fetch("/api/auth/ws-token");
        if (!res.ok || cancelled) return;
        const { token } = await res.json();
        if (!token || cancelled) return;

        client = new Client({
          webSocketFactory: () => new SockJS(`${BACKEND_URL}/ws`),
          connectHeaders: { Authorization: `Bearer ${token}` },
          reconnectDelay: 4000,
          onConnect: () => setConnected(true),
          onDisconnect: () => setConnected(false),
          onStompError: () => setConnected(false),
        });
        client.activate();
        clientRef.current = client;
      } catch {
        // sin conexión en tiempo real; la app sigue funcionando por REST
      }
    })();

    return () => {
      cancelled = true;
      setConnected(false);
      clientRef.current?.deactivate();
      clientRef.current = null;
    };
  }, [enabled]);

  const subscribeToConversation = useCallback(
    (conversationId: number, onMessage: (message: Message) => void) => {
      const client = clientRef.current;
      if (!client) return () => {};

      const doSubscribe = () => {
        const sub = client.subscribe(`/topic/conversations/${conversationId}`, (frame: IMessage) => {
          try {
            onMessage(JSON.parse(frame.body));
          } catch {
            // payload inesperado, se ignora
          }
        });
        return sub;
      };

      if (client.connected) {
        const sub = doSubscribe();
        return () => sub.unsubscribe();
      }

      // Todavía no conectó: nos enganchamos a onConnect una sola vez
      let sub: ReturnType<Client["subscribe"]> | null = null;
      const prevOnConnect = client.onConnect;
      client.onConnect = (frame) => {
        prevOnConnect?.(frame);
        sub = doSubscribe();
      };
      return () => sub?.unsubscribe();
    },
    []
  );

  return { connected, subscribeToConversation };
}
