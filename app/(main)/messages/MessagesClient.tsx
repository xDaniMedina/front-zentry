"use client"

import { useState, useRef, useEffect, useTransition, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Search, Send, ArrowLeft, Image as ImageIcon, CheckCircle2, 
  Phone, Video, MoreVertical, Paperclip, Smile, Mic, X, 
  UserCheck, ShieldCheck, Sparkles, PhoneCall, PhoneOff, Volume2,
  MessageSquare, Loader2, User as UserIcon, Users, UserPlus, Check, CheckCheck,
  ShieldAlert, Lock, Clock, Info, Bell, Play, Pause, Trash2, SmilePlus,
  Copy, Reply, CornerDownRight, Eye, MicOff, VideoOff, Maximize2
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { Conversation, Message, FriendUser } from "@/types"
import { getConversationMessages, sendMessageAction, getConversations } from "@/lib/actions/messages"
import { getFriendsAction, sendFriendRequestAction } from "@/lib/actions/friends"
import { getInitials, getImageUrl } from "@/lib/utils"
import { 
  normalizeUserIdentifier, 
  getSharedChannelKey, 
  getSharedChannelMessages, 
  saveSharedChannelMessage,
  fetchServerMessagesForUser,
  markSharedChannelMessagesRead,
  toggleReactionOnMessage,
  deleteMessageFromSharedChannel
} from "@/lib/realtimeMessages"

interface MessagesClientProps {
  initialConversations?: Conversation[];
}

const EMOJI_LIST = ["😀", "😂", "🥰", "😍", "🔥", "❤️", "👍", "🙌", "🚀", "🎉", "✨", "🎨", "💯", "⚡", "👏", "😎", "🤩", "🤯", "💎", "🌟", "👾", "👑", "💪", "💡"];
const QUICK_REACTION_EMOJIS = ["❤️", "👍", "😂", "🔥", "🚀", "🎉"];

function MessagesInner({ initialConversations = [] }: MessagesClientProps) {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentUsername = normalizeUserIdentifier(user?.username || user?.email);

  const userParam = searchParams.get('user') || searchParams.get('username');
  const chatParam = searchParams.get('chat') || searchParams.get('id');

  const [chats, setChats] = useState<Conversation[]>(() => {
    if (typeof window !== 'undefined' && currentUsername) {
      try {
        const saved = localStorage.getItem(`zentry_user_chats_${currentUsername}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return initialConversations;
  });

  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | number | null>(() => {
    return chatParam || (chats.length > 0 ? chats[0].id : null);
  });

  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [chatFilter, setChatFilter] = useState<'all' | 'unread' | 'friends' | 'online'>('all');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMessageForAction, setSelectedMessageForAction] = useState<string | null>(null);

  // Estados de Grabación de Audio
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  // Estados de Llamadas / Video
  const [activeCall, setActiveCall] = useState<'voice' | 'video' | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);

  // Vista Previa de Imágenes
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);

  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [isPending, startTransition] = useTransition();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Cargar amigos y datos del backend
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [friendsRes, convsRes] = await Promise.all([
          getFriendsAction(false),
          getConversations()
        ]);

        if (!isMounted) return;

        if (friendsRes.success && friendsRes.data) {
          const realFriends = friendsRes.data.filter(f => {
            const fNorm = normalizeUserIdentifier(f.username || f.name);
            return fNorm !== currentUsername;
          });
          setFriends(realFriends);
        }

        if (convsRes.success && convsRes.data && convsRes.data.length > 0) {
          setChats(prev => {
            const merged = [...convsRes.data!];
            prev.forEach(p => {
              if (!merged.some(m => String(m.id) === String(p.id))) {
                merged.push(p);
              }
            });
            return merged;
          });
        }
      } catch (e) {
        console.warn("Cargando datos locales:", e);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [currentUsername]);

  // 2. Manejo de apertura de chat por parámetro de URL ?user=usuario
  useEffect(() => {
    if (!userParam) return;

    const cleanParam = normalizeUserIdentifier(userParam);
    if (!cleanParam || cleanParam === currentUsername) return;

    const existingChat = chats.find(c => {
      const u = normalizeUserIdentifier(c.username);
      const n = normalizeUserIdentifier(c.name);
      return u === cleanParam || n === cleanParam;
    });

    if (existingChat) {
      setActiveChatId(existingChat.id);
    } else {
      const friend = friends.find(f => 
        normalizeUserIdentifier(f.username) === cleanParam || 
        normalizeUserIdentifier(f.name) === cleanParam
      );

      const displayName = friend?.name || userParam.replace(/^@/, '');
      const initials = getInitials(displayName);
      const newChatId = `chat_${cleanParam}`;

      const channelKey = getSharedChannelKey(currentUsername, cleanParam);
      const sharedHistory = getSharedChannelMessages(channelKey);

      const newConversation: Conversation = {
        id: newChatId,
        name: displayName,
        username: `@${cleanParam}`,
        avatar: initials,
        isOnline: Boolean(friend?.is_online),
        bio: friend?.discipline || "Creador Zentry",
        messages: sharedHistory,
        last_message: sharedHistory.length > 0 ? sharedHistory[sharedHistory.length - 1] : null
      };

      setChats(prev => [newConversation, ...prev]);
      setActiveChatId(newChatId);
    }
  }, [userParam, friends, currentUsername]);

  // 3. Persistir chats por usuario conectado
  useEffect(() => {
    if (typeof window !== 'undefined' && currentUsername && chats.length > 0) {
      try {
        localStorage.setItem(`zentry_user_chats_${currentUsername}`, JSON.stringify(chats));
      } catch (e) {}
    }
  }, [chats, currentUsername]);

  const activeChat = chats.find(c => String(c.id) === String(activeChatId));
  const targetUsername = normalizeUserIdentifier(activeChat?.username || activeChat?.name);

  // 4. Validación de permiso de envío: Amigo O En línea
  const isFriend = friends.some(f => 
    normalizeUserIdentifier(f.username) === targetUsername ||
    normalizeUserIdentifier(f.name) === targetUsername ||
    String(f.id) === String(activeChat?.id)
  );

  const isOnline = Boolean(
    activeChat?.isOnline || 
    friends.find(f => normalizeUserIdentifier(f.username) === targetUsername)?.is_online
  );

  const canSendMessage = isFriend || isOnline || targetUsername.length > 0;

  // 5. MOTOR EN TIEMPO REAL TIPO WHATSAPP: Auto-descubrimiento y sincronización total
  const syncAllChannels = async () => {
    if (typeof window === 'undefined' || !currentUsername) return;

    // 1. Sincronizar desde servidor Next.js primero para traer mensajes de otros navegadores/incógnito
    await fetchServerMessagesForUser(currentUsername);

    setChats(prevChats => {
      let updatedList = [...prevChats];

      // Escanear todos los canales compartidos en localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('zentry_chat_channel_') && key.includes(currentUsername)) {
          const rawMsgs = localStorage.getItem(key);
          if (!rawMsgs) continue;
          
          let msgs: Message[] = [];
          try { msgs = JSON.parse(rawMsgs); } catch {}
          if (!Array.isArray(msgs) || msgs.length === 0) continue;

          const pair = key.replace('zentry_chat_channel_', '').split('_');
          const otherUser = pair[0] === currentUsername ? pair[1] : pair[0];
          if (!otherUser) continue;

          const lastM = msgs[msgs.length - 1];
          const unreadCount = msgs.filter(m => normalizeUserIdentifier(m.sender_username) !== currentUsername && m.status !== 'read').length;

          const existingIdx = updatedList.findIndex(c => {
            const u = normalizeUserIdentifier(c.username || c.name);
            return u === otherUser;
          });

          if (existingIdx >= 0) {
            updatedList[existingIdx] = {
              ...updatedList[existingIdx],
              messages: msgs,
              last_message: lastM,
              unread_count: unreadCount
            };
          } else {
            const friend = friends.find(f => normalizeUserIdentifier(f.username || f.name) === otherUser);
            const displayName = friend?.name || otherUser;
            updatedList.unshift({
              id: `chat_${otherUser}`,
              name: displayName,
              username: `@${otherUser}`,
              avatar: getInitials(displayName),
              isOnline: Boolean(friend?.is_online),
              bio: friend?.discipline || "Creador Zentry",
              messages: msgs,
              last_message: lastM,
              unread_count: unreadCount
            });
          }
        }
      }

      return updatedList;
    });

    if (targetUsername) {
      const channelKey = getSharedChannelKey(currentUsername, targetUsername);
      await markSharedChannelMessagesRead(channelKey, currentUsername);
    }
  };

  useEffect(() => {
    syncAllChannels();

    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bc = new BroadcastChannel('zentry_realtime_chat_v2');
      bc.onmessage = (event) => {
        if (['NEW_MESSAGE', 'MESSAGES_READ', 'REACTION_UPDATED', 'MESSAGE_DELETED'].includes(event.data?.type)) {
          syncAllChannels();
        }
      };
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key?.startsWith('zentry_chat_channel_')) {
        syncAllChannels();
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', syncAllChannels);

    const interval = setInterval(syncAllChannels, 1000);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', syncAllChannels);
      clearInterval(interval);
    };
  }, [targetUsername, currentUsername, friends]);

  // Temporizador de Llamada Activa
  useEffect(() => {
    if (activeCall) {
      setCallDuration(0);
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    }

    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [activeCall]);

  // Auto-scroll suave
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages]);

  // 6. Iniciar chat con un amigo
  const startChatWithFriend = (friend: FriendUser) => {
    const cleanU = normalizeUserIdentifier(friend.username || friend.name);
    if (cleanU === currentUsername) return;

    const existing = chats.find(c => {
      const u = normalizeUserIdentifier(c.username || c.name);
      return u === cleanU;
    });

    if (existing) {
      setActiveChatId(existing.id);
    } else {
      const channelKey = getSharedChannelKey(currentUsername, cleanU);
      const sharedHistory = getSharedChannelMessages(channelKey);

      const newChatId = `chat_${cleanU}`;
      const newConv: Conversation = {
        id: newChatId,
        name: friend.name || friend.username,
        username: `@${cleanU}`,
        avatar: getInitials(friend.name || friend.username),
        isOnline: Boolean(friend.is_online),
        bio: friend.discipline || "Creador Zentry",
        messages: sharedHistory,
        last_message: sharedHistory.length > 0 ? sharedHistory[sharedHistory.length - 1] : null
      };
      setChats(prev => [newConv, ...prev]);
      setActiveChatId(newChatId);
    }
  };

  // 7. Enviar Mensaje de Texto
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !activeChatId || !targetUsername) return;

    const messageText = inputText.trim();
    const tempId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: Message = {
      id: tempId,
      sender_id: user?.id ? String(user.id) : undefined,
      sender_username: currentUsername,
      receiver_username: targetUsername,
      text: messageText,
      content: messageText,
      isMe: true,
      status: isOnline ? 'delivered' : 'sent',
      time: timeStr,
      created_at: new Date().toISOString()
    };

    const channelKey = getSharedChannelKey(currentUsername, targetUsername);
    const updatedHistory = await saveSharedChannelMessage(channelKey, newMsg);

    setChats(prev => prev.map(c => 
      String(c.id) === String(activeChatId) 
        ? { 
            ...c, 
            messages: updatedHistory,
            last_message: newMsg
          } 
        : c
    ));
    setInputText("");
    setShowEmojiPicker(false);

    startTransition(async () => {
      await sendMessageAction(activeChatId, messageText);
    });
  };

  // 8. Reaccionar a un Mensaje
  const handleReactToMessage = async (messageId: string, emoji: string) => {
    if (!targetUsername) return;
    const channelKey = getSharedChannelKey(currentUsername, targetUsername);
    const updated = await toggleReactionOnMessage(channelKey, messageId, emoji, currentUsername);
    setChats(prev => prev.map(c => 
      String(c.id) === String(activeChatId) ? { ...c, messages: updated } : c
    ));
    setSelectedMessageForAction(null);
  };

  // 9. Eliminar Mensaje
  const handleDeleteMessage = async (messageId: string) => {
    if (!targetUsername) return;
    const channelKey = getSharedChannelKey(currentUsername, targetUsername);
    const updated = await deleteMessageFromSharedChannel(channelKey, messageId);
    setChats(prev => prev.map(c => 
      String(c.id) === String(activeChatId) ? { ...c, messages: updated } : c
    ));
    toast.success("Mensaje eliminado");
    setSelectedMessageForAction(null);
  };

  // 10. Grabar y Enviar Nota de Voz
  const handleToggleVoiceRecording = async () => {
    if (!isRecordingVoice) {
      setIsRecordingVoice(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      setIsRecordingVoice(false);

      if (recordingSeconds > 0 && targetUsername) {
        const tempId = `voice_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const durationStr = `0:${recordingSeconds < 10 ? '0' : ''}${recordingSeconds}`;
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const voiceMsg: Message = {
          id: tempId,
          sender_id: user?.id ? String(user.id) : undefined,
          sender_username: currentUsername,
          receiver_username: targetUsername,
          text: `🎤 Mensaje de voz (${durationStr})`,
          content: `🎤 Mensaje de voz (${durationStr})`,
          isMe: true,
          isVoice: true,
          voiceDuration: durationStr,
          status: isOnline ? 'delivered' : 'sent',
          time: timeStr,
          created_at: new Date().toISOString()
        };

        const channelKey = getSharedChannelKey(currentUsername, targetUsername);
        const updatedHistory = await saveSharedChannelMessage(channelKey, voiceMsg);

        setChats(prev => prev.map(c => 
          String(c.id) === String(activeChatId) 
            ? { ...c, messages: updatedHistory, last_message: voiceMsg } 
            : c
        ));
        toast.success("Mensaje de voz enviado");
      }
    }
  };

  // 11. Enviar Imagen o Archivo con Previsualización
  const handleSendFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && activeChatId && targetUsername) {
      const file = e.target.files[0];
      const isImg = file.type.startsWith('image/');
      const tempId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;

        const newMsg: Message = {
          id: tempId,
          sender_id: user?.id ? String(user.id) : undefined,
          sender_username: currentUsername,
          receiver_username: targetUsername,
          text: isImg ? `🖼️ Imagen: ${file.name}` : `📎 Archivo: ${file.name}`,
          content: isImg ? `🖼️ Imagen: ${file.name}` : `📎 Archivo: ${file.name}`,
          fileUrl: base64Data,
          isMe: true,
          status: isOnline ? 'delivered' : 'sent',
          time: timeStr,
          isImage: isImg,
          created_at: new Date().toISOString()
        };

        const channelKey = getSharedChannelKey(currentUsername, targetUsername);
        const updatedHistory = await saveSharedChannelMessage(channelKey, newMsg);

        setChats(prev => prev.map(c => 
          String(c.id) === String(activeChatId) 
            ? { ...c, messages: updatedHistory, last_message: newMsg } 
            : c
        ));
        toast.success("Archivo compartido en el chat");

        startTransition(async () => {
          await sendMessageAction(activeChatId, isImg ? `[Imagen: ${file.name}]` : `[Archivo: ${file.name}]`, { isImage: isImg });
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Filtrado de Conversaciones
  const filteredChats = chats.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.username.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (chatFilter === 'unread') return (c.unread_count || 0) > 0;
    if (chatFilter === 'friends') {
      const u = normalizeUserIdentifier(c.username || c.name);
      return friends.some(f => normalizeUserIdentifier(f.username || f.name) === u);
    }
    if (chatFilter === 'online') return c.isOnline;
    return true;
  });

  const formatCallTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="h-[calc(100vh-2rem)] sm:h-[calc(100vh-6rem)] mt-2 sm:mt-6 bg-[#0c0c14] border border-zentry-border rounded-3xl overflow-hidden flex shadow-2xl relative select-none">
      
      {/* PANEL IZQUIERDO: Estilo WhatsApp Web */}
      <div className={`w-full sm:w-80 md:w-96 border-r border-zinc-800 flex flex-col bg-[#11111c] ${activeChatId ? 'hidden sm:flex' : 'flex'}`}>
        
        {/* Cabecera del Usuario Actual */}
        <div className="p-4 border-b border-zinc-800 bg-[#161626] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-zentry-accent/20 border-2 border-zentry-accent flex items-center justify-center font-black text-xs text-zentry-accent shadow-inner overflow-hidden">
                {user?.avatar_url ? (
                  <img src={getImageUrl(user.avatar_url)} alt={user.username} className="w-full h-full object-cover rounded-full" />
                ) : (
                  getInitials(user?.name || user?.username || 'ZE')
                )}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#161626] rounded-full shadow-sm" />
            </div>

            <div>
              <h3 className="font-extrabold text-xs text-white leading-tight">
                {user?.name || user?.username || 'Mi Perfil'}
              </h3>
              <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Conectado en Zentry
              </p>
            </div>
          </div>

          <Link href="/feed" className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-xl transition-colors" title="Volver al Feed">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* Buscador de Chats */}
        <div className="p-3 border-b border-zinc-800/60 bg-[#11111c] space-y-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar o empezar un nuevo chat..." 
              className="w-full bg-[#1a1a2b] border border-zinc-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-zentry-accent transition-colors" 
            />
          </div>

          {/* Filtros de Pestañas Rápidas */}
          <div className="flex gap-1.5 overflow-x-auto text-[11px] custom-scrollbar pb-0.5">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'unread', label: 'No leídos' },
              { id: 'friends', label: 'Amigos' },
              { id: 'online', label: 'En línea' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setChatFilter(f.id as any)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                  chatFilter === f.id
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-[#181828] text-zinc-400 hover:text-white hover:bg-[#202034] border border-zinc-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contactos Amigos Rápidos */}
        {friends.length > 0 && (
          <div className="p-3 border-b border-zinc-800/60 bg-[#0e0e18]">
            <span className="text-[10px] uppercase font-black tracking-wider text-zinc-400 flex items-center gap-1 mb-2 px-1">
              <Users className="w-3 h-3 text-zentry-accent" /> Amigos Directos ({friends.length})
            </span>
            <div className="flex gap-2.5 overflow-x-auto custom-scrollbar pb-1">
              {friends.map(friend => (
                <button
                  key={friend.id}
                  onClick={() => startChatWithFriend(friend)}
                  className="flex flex-col items-center gap-1 shrink-0 p-1.5 hover:bg-[#1a1a2e] rounded-xl transition-all group text-center w-14 cursor-pointer"
                  title={`Chatear con ${friend.name}`}
                >
                  <div className="relative w-10 h-10 rounded-full bg-purple-950/60 text-purple-300 font-extrabold text-xs flex items-center justify-center border border-purple-500/40 group-hover:scale-105 transition-transform overflow-hidden shadow-sm">
                    {friend.avatar_url ? (
                      <img src={getImageUrl(friend.avatar_url)} alt={friend.name} className="w-full h-full object-cover" />
                    ) : (
                      getInitials(friend.name || friend.username)
                    )}
                    {friend.is_online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#11111c] rounded-full" />
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-zinc-300 truncate w-full group-hover:text-white">
                    {friend.name?.split(' ')[0] || friend.username}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Lista de Conversaciones Activas */}
        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-zinc-800/40">
          {filteredChats.length === 0 ? (
            <div className="p-8 text-center text-zinc-400 space-y-3">
              <MessageSquare className="w-9 h-9 mx-auto text-zinc-600 mb-1 opacity-50" />
              <p className="text-xs font-bold text-white">Sin chats activos</p>
              <p className="text-[11px] text-zinc-400">Selecciona a un amigo arriba o visita su perfil para chatear en vivo.</p>
            </div>
          ) : (
            filteredChats.map(chat => {
              const chatMessages = chat.messages || [];
              const lastMsg = chatMessages[chatMessages.length - 1] || chat.last_message;
              const isSelected = String(activeChatId) === String(chat.id);
              const lastMsgText = lastMsg?.text || lastMsg?.content || "Chat iniciado";

              const isMineMsg = normalizeUserIdentifier(lastMsg?.sender_username) === currentUsername || lastMsg?.isMe;

              return (
                <div 
                  key={chat.id} 
                  onClick={() => setActiveChatId(chat.id)}
                  className={`p-3.5 cursor-pointer transition-all flex items-center gap-3 ${
                    isSelected 
                      ? 'bg-[#1e1e32] border-l-4 border-l-zentry-accent' 
                      : 'hover:bg-[#151524]'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-black text-xs text-white shadow-sm overflow-hidden">
                      {chat.avatar || getInitials(chat.name || chat.username)}
                    </div>
                    {chat.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#11111c] rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className="font-bold text-xs text-white truncate">{chat.name}</h4>
                      <span className="text-[10px] text-zinc-500 font-mono shrink-0 ml-1">
                        {lastMsg?.time || (lastMsg?.created_at ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs text-zinc-400 truncate flex items-center gap-1">
                        {isMineMsg && (
                          <span className="shrink-0">
                            {lastMsg?.status === 'read' ? (
                              <CheckCheck className="w-3.5 h-3.5 text-cyan-400 inline" />
                            ) : lastMsg?.status === 'delivered' ? (
                              <CheckCheck className="w-3.5 h-3.5 text-zinc-400 inline" />
                            ) : lastMsg?.status === 'sent' ? (
                              <Check className="w-3.5 h-3.5 text-zinc-400 inline" />
                            ) : (
                              <Clock className="w-3 h-3 text-zinc-500 inline animate-spin" />
                            )}
                          </span>
                        )}
                        <span className="truncate">{lastMsgText}</span>
                      </p>

                      {Boolean(chat.unread_count && chat.unread_count > 0) && (
                        <span className="bg-emerald-500 text-black text-[10px] font-black px-1.5 py-0.2 rounded-full shrink-0">
                          {chat.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* PANEL DERECHO: Ventana de Chat WhatsApp */}
      <div className={`flex-1 flex flex-col bg-[#0f0f18] relative ${!activeChatId ? 'hidden sm:flex' : 'flex'}`}>
        {!activeChat ? (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 space-y-4 p-6 text-center">
            <div className="w-20 h-20 rounded-3xl bg-[#161626] border border-zinc-800 flex items-center justify-center shadow-xl">
              <Send className="w-8 h-8 text-zentry-accent animate-bounce" />
            </div>
            <h3 className="font-extrabold text-base text-white">Zentry Web Messenger</h3>
            <p className="text-xs text-zinc-400 max-w-sm">
              Comunicación en tiempo real tipo WhatsApp. Selecciona un contacto a la izquierda para empezar a conversar.
            </p>
          </div>
        ) : (
          <>
            {/* Top Bar del Chat */}
            <div className="p-3.5 sm:p-4 border-b border-zinc-800 bg-[#161626] sticky top-0 z-10 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <button className="sm:hidden text-white p-1 -ml-1 rounded-lg" onClick={() => setActiveChatId(null)}>
                  <ArrowLeft className="w-5 h-5" />
                </button>
                
                <Link href={`/profile/${encodeURIComponent(targetUsername)}`} className="relative group block">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-black text-xs text-white group-hover:scale-105 transition-transform overflow-hidden">
                    {activeChat.avatar || getInitials(activeChat.name || activeChat.username)}
                  </div>
                  {activeChat.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#161626] rounded-full" />
                  )}
                </Link>

                <div>
                  <Link href={`/profile/${encodeURIComponent(targetUsername)}`} className="hover:underline">
                    <h3 className="font-black text-xs sm:text-sm text-white leading-tight">{activeChat.name}</h3>
                  </Link>
                  <p className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                    {isOnline ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> En línea
                      </span>
                    ) : (
                      <span>Visto recientemente</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Botones Llamadas / Perfil */}
              <div className="flex items-center gap-2">
                <Link 
                  href={`/profile/${encodeURIComponent(targetUsername)}`}
                  className="p-2 rounded-xl bg-[#1f1f32] hover:bg-[#282842] text-zinc-300 hover:text-white transition-colors"
                  title="Ver Perfil"
                >
                  <UserIcon className="w-4 h-4" />
                </Link>
                <button 
                  onClick={() => setActiveCall('voice')}
                  className="p-2 rounded-xl bg-[#1f1f32] hover:bg-[#282842] text-emerald-400 transition-colors"
                  title="Llamada de voz"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setActiveCall('video')}
                  className="p-2 rounded-xl bg-[#1f1f32] hover:bg-[#282842] text-purple-400 transition-colors"
                  title="Videollamada HD"
                >
                  <Video className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Mensajes / Burbujas */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-3 bg-[#0d0d16] bg-[radial-gradient(#1e1e32_1px,transparent_1px)] [background-size:16px_16px]">
              {(!activeChat.messages || activeChat.messages.length === 0) ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-zinc-400">
                  <div className="w-12 h-12 rounded-2xl bg-[#161626] border border-zinc-800 flex items-center justify-center text-zentry-accent">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="font-extrabold text-sm text-white">Canal seguro con {activeChat.name}</h4>
                  <p className="text-xs max-w-xs">
                    Los mensajes se cifran y se sincronizan al instante en ambas pantallas.
                  </p>
                </div>
              ) : (
                activeChat.messages.map((msg, idx) => {
                  const messageText = msg.text || msg.content || "";
                  
                  const senderNorm = normalizeUserIdentifier(msg.sender_username);
                  const isMine = senderNorm ? senderNorm === currentUsername : Boolean(msg.isMe);
                  const displayTime = msg.time || (msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');

                  const msgStatus = msg.status || 'delivered';
                  const isVoice = msg.isVoice || messageText.includes('🎤 Mensaje de voz');
                  const isImage = msg.isImage || Boolean(msg.fileUrl && msg.fileUrl.startsWith('data:image'));

                  const reactions = msg.reactions || {};
                  const reactionEntries = Object.entries(reactions);

                  return (
                    <div 
                      key={msg.id || idx} 
                      className={`flex flex-col max-w-[85%] sm:max-w-[65%] group relative ${isMine ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                    >
                      {/* Barra Flotante de Reacciones Rápidas */}
                      <div className={`absolute -top-7 ${isMine ? 'right-0' : 'left-0'} hidden group-hover:flex items-center gap-1 bg-[#1e1e32] border border-zinc-700 px-2 py-1 rounded-full shadow-xl z-20 animate-in fade-in zoom-in-95 duration-100`}>
                        {QUICK_REACTION_EMOJIS.map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => handleReactToMessage(msg.id, emoji)}
                            className="text-xs hover:scale-125 transition-transform p-0.5 active:scale-95 cursor-pointer"
                          >
                            {emoji}
                          </button>
                        ))}
                        {isMine && (
                          <button 
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="text-zinc-400 hover:text-red-400 p-0.5 ml-1 border-l border-zinc-700 pl-1"
                            title="Eliminar mensaje"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <div className={`p-3 text-xs sm:text-sm leading-relaxed shadow-lg relative ${
                        isMine 
                          ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white rounded-2xl rounded-tr-xs' 
                          : 'bg-[#1a1a2b] border border-zinc-800 text-zinc-100 rounded-2xl rounded-tl-xs'
                      }`}>
                        
                        {/* Renderizado de Imagen */}
                        {isImage && msg.fileUrl && (
                          <div 
                            onClick={() => setPreviewImageModal(msg.fileUrl || null)}
                            className="mb-2 rounded-xl overflow-hidden border border-white/10 cursor-pointer max-w-xs hover:opacity-90 transition-opacity"
                          >
                            <img src={msg.fileUrl} alt="Adjunto" className="w-full h-auto object-cover max-h-60" />
                          </div>
                        )}

                        {/* Mensaje de Voz */}
                        {isVoice ? (
                          <div className="flex items-center gap-3 py-1">
                            <button 
                              type="button"
                              onClick={() => setPlayingVoiceId(playingVoiceId === msg.id ? null : msg.id)}
                              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-transform active:scale-95 shrink-0"
                            >
                              {playingVoiceId === msg.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                            </button>
                            <div className="flex-1 space-y-1">
                              <div className="h-2 bg-white/20 rounded-full overflow-hidden flex items-center">
                                <div className={`h-full bg-emerald-400 rounded-full transition-all duration-300 ${playingVoiceId === msg.id ? 'w-3/4 animate-pulse' : 'w-1/4'}`} />
                              </div>
                              <span className="text-[10px] font-mono opacity-80">{messageText.replace('🎤 ', '')}</span>
                            </div>
                          </div>
                        ) : (
                          <span>{messageText}</span>
                        )}

                        {/* Hora y Checks WhatsApp */}
                        <div className={`flex items-center gap-1.5 mt-1 text-[10px] ${isMine ? 'text-purple-200 justify-end' : 'text-zinc-400 justify-start'}`}>
                          <span className="font-mono">{displayTime}</span>
                          {isMine && (
                            <span>
                              {msgStatus === 'read' ? (
                                <span title="Leído"><CheckCheck className="w-3.5 h-3.5 text-cyan-300" /></span>
                              ) : msgStatus === 'delivered' ? (
                                <span title="Entregado"><CheckCheck className="w-3.5 h-3.5 text-zinc-300" /></span>
                              ) : msgStatus === 'sent' ? (
                                <span title="Enviado"><Check className="w-3.5 h-3.5 text-zinc-300" /></span>
                              ) : (
                                <span title="Enviando..."><Clock className="w-3 h-3 text-zinc-300 animate-spin" /></span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Insignias de Reacciones Debajo de la Burbuja */}
                      {reactionEntries.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1 px-1">
                          {reactionEntries.map(([emoji, usersList]) => (
                            <button
                              key={emoji}
                              onClick={() => handleReactToMessage(msg.id, emoji)}
                              className={`text-[11px] px-2 py-0.5 rounded-full border flex items-center gap-1 shadow-sm transition-transform active:scale-95 ${
                                usersList.includes(currentUsername)
                                  ? 'bg-purple-950/80 border-purple-500 text-purple-300'
                                  : 'bg-[#181828] border-zinc-700 text-zinc-300'
                              }`}
                            >
                              <span>{emoji}</span>
                              <span className="text-[10px] font-bold font-mono">{usersList.length}</span>
                            </button>
                          ))}
                        </div>
                      )}

                    </div>
                  );
                })
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar Estilo WhatsApp */}
            <div className="p-3 sm:p-4 border-t border-zinc-800 bg-[#161626] relative">
              
              {/* Selector de Emojis */}
              {showEmojiPicker && (
                <div className="absolute bottom-full left-4 mb-2 p-3 bg-[#1e1e32] border border-zinc-700 rounded-2xl shadow-2xl flex flex-wrap gap-2 max-w-xs z-50 animate-in slide-in-from-bottom-2 duration-150">
                  {EMOJI_LIST.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setInputText(prev => prev + emoji)}
                      className="text-xl p-1.5 hover:bg-zinc-700/50 rounded-xl transition-transform hover:scale-125 active:scale-95 cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* Grabando Audio */}
              {isRecordingVoice ? (
                <div className="flex items-center justify-between gap-3 bg-red-500/10 border border-red-500/30 p-2.5 rounded-2xl">
                  <div className="flex items-center gap-2 text-xs text-red-400 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    Grabando audio... <span className="font-mono">{recordingSeconds}s</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      type="button" 
                      onClick={() => {
                        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
                        setIsRecordingVoice(false);
                      }}
                      className="p-2 text-zinc-400 hover:text-white rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button 
                      type="button" 
                      onClick={handleToggleVoiceRecording}
                      className="px-4 py-1.5 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-colors flex items-center gap-1 shadow-md"
                    >
                      <Send className="w-3.5 h-3.5" /> Enviar
                    </button>
                  </div>
                </div>
              ) : (
                /* Formulario de Envío */
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input type="file" ref={fileInputRef} onChange={handleSendFile} className="hidden" />
                  
                  {/* Botón Emojis */}
                  <button 
                    type="button" 
                    onClick={() => setShowEmojiPicker(prev => !prev)}
                    className="p-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors shrink-0 cursor-pointer"
                    title="Insertar Emoji"
                  >
                    <Smile className="w-5 h-5 text-amber-400" />
                  </button>

                  {/* Botón Archivo */}
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()} 
                    className="p-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors shrink-0 cursor-pointer"
                    title="Adjuntar Imagen o Archivo"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  
                  {/* Input de Texto */}
                  <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Escribe un mensaje a ${activeChat.name}...`} 
                    className="flex-1 bg-[#10101c] border border-zinc-800 rounded-2xl py-3 px-4 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zentry-accent transition-colors" 
                  />

                  {/* Botón Micrófono o Enviar */}
                  {inputText.trim() ? (
                    <button 
                      type="submit" 
                      className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl hover:opacity-90 transition-all shrink-0 shadow-lg shadow-purple-600/30 active:scale-95 flex items-center justify-center cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      onClick={handleToggleVoiceRecording}
                      className="p-3 bg-[#1e1e32] hover:bg-[#282842] text-zinc-300 hover:text-white rounded-2xl transition-colors shrink-0 cursor-pointer"
                      title="Grabar mensaje de voz"
                    >
                      <Mic className="w-4 h-4 text-emerald-400" />
                    </button>
                  )}
                </form>
              )}
            </div>
          </>
        )}
      </div>

      {/* MODAL DE LLAMADA / VIDEOLLAMADA INTERACTIVA */}
      {activeCall && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#161626] border border-zinc-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-full bg-purple-950/60 border-2 border-purple-500 flex items-center justify-center font-black text-xl text-purple-300 mx-auto animate-pulse">
              {activeChat?.avatar || 'ZE'}
            </div>

            <div>
              <h3 className="font-extrabold text-white text-lg">{activeChat?.name}</h3>
              <p className="text-xs text-emerald-400 mt-1 flex items-center justify-center gap-1.5 font-mono font-bold">
                <Volume2 className="w-4 h-4 animate-pulse" />
                {activeCall === 'voice' ? 'Llamada de voz' : 'Videollamada HD'} • {formatCallTime(callDuration)}
              </p>
            </div>

            {/* Controles de Llamada */}
            <div className="flex justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => setIsMuted(prev => !prev)}
                className={`p-3.5 rounded-full transition-colors ${isMuted ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
                title={isMuted ? "Desactivar silencio" : "Silenciar micrófono"}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button 
                onClick={() => {
                  setActiveCall(null);
                  toast.info("Llamada finalizada");
                }}
                className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-transform active:scale-95 shadow-lg shadow-red-500/40"
                title="Colgar llamada"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE VISTA PREVIA DE IMAGEN */}
      {previewImageModal && (
        <div 
          onClick={() => setPreviewImageModal(null)}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer"
        >
          <div className="relative max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl">
            <img src={previewImageModal} alt="Preview" className="w-full h-auto max-h-[85vh] object-contain" />
            <button 
              onClick={() => setPreviewImageModal(null)}
              className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-full hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function MessagesClient(props: MessagesClientProps) {
  return (
    <Suspense fallback={
      <div className="h-[calc(100vh-6rem)] mt-6 bg-zentry-card border border-zentry-border rounded-3xl flex items-center justify-center text-zentry-text-2 gap-2 text-xs">
        <Loader2 className="w-5 h-5 animate-spin text-zentry-accent" /> Cargando mensajería WhatsApp...
      </div>
    }>
      <MessagesInner {...props} />
    </Suspense>
  );
}
