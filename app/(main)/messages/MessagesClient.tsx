"use client"

import { useState, useRef, useEffect } from "react"
import { 
  Search, Send, ArrowLeft, Image as ImageIcon, CheckCircle2, 
  Phone, Video, MoreVertical, Paperclip, Smile, Mic, X, 
  UserCheck, ShieldCheck, Sparkles, PhoneCall, PhoneOff, Volume2
} from "lucide-react"
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

type Message = { 
  id: string; 
  text: string; 
  isMe: boolean; 
  time: string; 
  isImage?: boolean;
  fileUrl?: string;
}

type Chat = { 
  id: number; 
  name: string; 
  username: string;
  avatar: string; 
  isOnline: boolean; 
  lastSeen?: string;
  bio?: string;
  messages: Message[];
}

const INITIAL_CHATS: Chat[] = [
  { 
    id: 1, 
    name: "Pixel Kid", 
    username: "@pixelkid",
    avatar: "PK", 
    isOnline: true, 
    bio: "Concept Artist & Modelador 3D.",
    messages: [
      { id: 'm1', text: "¡Hola Dani! ¿Cómo va el proyecto de Zentry?", isMe: false, time: "10:28 AM" },
      { id: 'm2', text: "¡Hola! Todo perfecto, refinando las interfaces del estudio.", isMe: true, time: "10:29 AM" },
      { id: 'm3', text: "¿Qué opinas del nuevo boceto que subí a comunidades?", isMe: false, time: "10:30 AM" }
    ] 
  },
  { 
    id: 2, 
    name: "Luna Muse", 
    username: "@lunamuse",
    avatar: "LM", 
    isOnline: false, 
    lastSeen: "Hace 15 min",
    bio: "Ilustradora digital y creadora de entornos cyberpunk.",
    messages: [
      { id: 'm4', text: "¡Gracias por el feedback en mi obra!", isMe: false, time: "Ayer" },
      { id: 'm5', text: "Me ayudó mucho para mejorar la iluminación.", isMe: false, time: "Ayer" }
    ] 
  },
  { 
    id: 3, 
    name: "Carlos Dev", 
    username: "@carlos_dev",
    avatar: "CD", 
    isOnline: true, 
    bio: "Full Stack Engineer & Diseñador de Interfaces.",
    messages: [
      { id: 'm6', text: "Las APIs del backend para la billetera están casi listas.", isMe: false, time: "Hace 2 horas" }
    ] 
  }
];

export default function MessagesClient() {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState<number | null>(1);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeCall, setActiveCall] = useState<'voice' | 'video' | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  // Scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages, isTyping]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !activeChatId) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      text: inputText,
      isMe: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: [...c.messages, newMessage] } : c));
    setInputText("");

    // Simular respuesta inteligente del otro usuario
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const reply: Message = {
        id: `reply-${Date.now()}`,
        text: "¡Excelente! Me parece una gran idea para continuar colaborando.",
        isMe: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: [...c.messages, reply] } : c));
    }, 2000);
  };

  const handleSendFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && activeChatId) {
      const file = e.target.files[0];
      const newMsg: Message = {
        id: `file-${Date.now()}`,
        text: `📎 Adjunto: ${file.name}`,
        isMe: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isImage: file.type.startsWith('image/')
      };
      setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: [...c.messages, newMsg] } : c));
      toast.success("Archivo adjuntado correctamente");
    }
  };

  const filteredChats = chats.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-2rem)] sm:h-[calc(100vh-6rem)] mt-2 sm:mt-6 bg-zentry-card border border-zentry-border rounded-3xl overflow-hidden flex shadow-2xl relative">
      
      {/* PANEL IZQUIERDO: Lista de Mensajes / Conversaciones */}
      <div className={`w-full sm:w-80 md:w-96 border-r border-zentry-border flex flex-col bg-zentry-card ${activeChatId ? 'hidden sm:flex' : 'flex'}`}>
        
        {/* Header de la Lista */}
        <div className="p-4 sm:p-5 border-b border-zentry-border space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-zentry-text-1">Mensajes</h2>
            <span className="text-[10px] font-mono font-bold bg-zentry-accent/20 text-zentry-accent px-2.5 py-1 rounded-full border border-zentry-accent/30">
              EN VIVO
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zentry-text-2" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por usuario o mensaje..." 
              className="w-full bg-zentry-bg border border-zentry-border rounded-xl py-2.5 pl-9 pr-3 text-xs text-zentry-text-1 focus:outline-none focus:border-zentry-accent transition-colors" 
            />
          </div>
        </div>
        
        {/* Items de Lista */}
        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-zentry-border/50">
          {filteredChats.map(chat => {
            const lastMsg = chat.messages[chat.messages.length - 1];
            const isSelected = activeChatId === chat.id;

            return (
              <div 
                key={chat.id} 
                onClick={() => setActiveChatId(chat.id)}
                className={`p-4 cursor-pointer transition-all flex items-center gap-3.5 ${
                  isSelected ? 'bg-zentry-bg border-l-4 border-l-zentry-accent' : 'hover:bg-zentry-bg/60'
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-2xl bg-zentry-accent/20 border border-zentry-accent/30 flex items-center justify-center font-black text-xs text-zentry-accent shadow-sm">
                    {chat.avatar}
                  </div>
                  {chat.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-zentry-card rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-extrabold text-xs text-zentry-text-1 truncate">{chat.name}</h3>
                    <span className="text-[10px] text-zentry-text-2 font-mono shrink-0 ml-1">{lastMsg?.time}</span>
                  </div>
                  <p className="text-xs text-zentry-text-2 truncate">
                    {lastMsg?.isMe && <span className="text-zentry-accent font-bold">Tú: </span>}
                    {lastMsg?.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PANEL DERECHO: Ventana de Chat Activa */}
      <div className={`flex-1 flex flex-col bg-zentry-bg relative ${!activeChatId ? 'hidden sm:flex' : 'flex'}`}>
        {!activeChat ? (
          <div className="flex-1 flex flex-col items-center justify-center text-zentry-text-2 space-y-3 p-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-zentry-card border border-zentry-border flex items-center justify-center shadow-lg">
              <Send className="w-7 h-7 text-zentry-accent" />
            </div>
            <h3 className="font-bold text-sm text-zentry-text-1">Tus Mensajes Directos</h3>
            <p className="text-xs text-zentry-text-2 max-w-sm">Selecciona una conversación a la izquierda para interactuar en tiempo real con otros creadores.</p>
          </div>
        ) : (
          <>
            {/* Header del Chat Activo */}
            <div className="p-4 border-b border-zentry-border bg-zentry-card/90 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <button className="sm:hidden text-zentry-text-1 p-1 -ml-1 rounded-lg" onClick={() => setActiveChatId(null)}>
                  <ArrowLeft className="w-5 h-5" />
                </button>
                
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-zentry-accent/20 border border-zentry-accent/30 flex items-center justify-center font-black text-xs text-zentry-accent">
                    {activeChat.avatar}
                  </div>
                  {activeChat.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-zentry-card rounded-full" />
                  )}
                </div>

                <div>
                  <h3 className="font-extrabold text-zentry-text-1 text-xs sm:text-sm leading-tight">{activeChat.name}</h3>
                  <span className="text-[11px] text-zentry-text-2">
                    {activeChat.isOnline ? <span className="text-emerald-400 font-bold">🟢 En línea</span> : (activeChat.lastSeen || 'Desconectado')}
                  </span>
                </div>
              </div>

              {/* Botones de Llamada / Opciones */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setActiveCall('voice')}
                  className="p-2 rounded-xl bg-zentry-bg border border-zentry-border text-zentry-text-1 hover:border-zentry-accent transition-colors"
                  title="Llamada de voz"
                >
                  <Phone className="w-4 h-4 text-zentry-accent" />
                </button>
                <button 
                  onClick={() => setActiveCall('video')}
                  className="p-2 rounded-xl bg-zentry-bg border border-zentry-border text-zentry-text-1 hover:border-zentry-accent transition-colors"
                  title="Videollamada HD"
                >
                  <Video className="w-4 h-4 text-purple-400" />
                </button>
              </div>
            </div>
            
            {/* Mensajes / Burbujas */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-4">
              {activeChat.messages.map(msg => (
                <div key={msg.id} className={`flex flex-col max-w-[80%] sm:max-w-[70%] ${msg.isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                  <div className={`p-3.5 text-xs sm:text-sm leading-relaxed shadow-md ${
                    msg.isImage 
                      ? 'bg-zentry-card border border-zentry-accent/40 text-zentry-accent font-extrabold rounded-2xl'
                      : msg.isMe 
                        ? 'bg-zentry-accent text-white rounded-2xl rounded-tr-xs' 
                        : 'bg-zentry-card border border-zentry-border text-zentry-text-1 rounded-2xl rounded-tl-xs'
                  }`}>
                    {msg.text}
                  </div>
                  <div className={`flex items-center gap-1.5 mt-1 text-[10px] text-zentry-text-2 ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                    <span>{msg.time}</span>
                    {msg.isMe && <CheckCircle2 className="w-3 h-3 text-zentry-accent" />}
                  </div>
                </div>
              ))}

              {/* Indicador de "Escribiendo..." */}
              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-zentry-text-2 bg-zentry-card border border-zentry-border px-3 py-2 rounded-2xl w-fit animate-pulse">
                  <span className="w-2 h-2 bg-zentry-accent rounded-full animate-bounce" />
                  <span className="font-bold">{activeChat.name} está escribiendo...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input de Mensaje */}
            <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-zentry-border bg-zentry-card flex items-center gap-2">
              <input type="file" ref={fileInputRef} onChange={handleSendFile} className="hidden" />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()} 
                className="p-2.5 text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-bg rounded-xl transition-colors shrink-0"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Escribir a ${activeChat.name}...`} 
                className="flex-1 bg-zentry-bg border border-zentry-border rounded-xl py-2.5 px-4 text-xs text-zentry-text-1 focus:outline-none focus:border-zentry-accent transition-colors" 
              />

              <button 
                type="submit" 
                disabled={!inputText.trim()}
                className="p-2.5 bg-zentry-accent text-white rounded-xl hover:opacity-90 disabled:opacity-40 transition-opacity shrink-0 shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </div>

      {/* MODAL SIMULADO DE LLAMADA / VIDEOLLAMADA */}
      {activeCall && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-zentry-card border border-zentry-border rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-full bg-zentry-accent/20 border-2 border-zentry-accent flex items-center justify-center font-black text-xl text-zentry-accent mx-auto animate-pulse">
              {activeChat.avatar}
            </div>

            <div>
              <h3 className="font-extrabold text-zentry-text-1 text-lg">{activeChat.name}</h3>
              <p className="text-xs text-zentry-text-2 mt-1 flex items-center justify-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                {activeCall === 'voice' ? 'Llamada de voz cifrada...' : 'Videollamada HD cifrada...'}
              </p>
            </div>

            <div className="flex justify-center gap-4 pt-2">
              <button 
                onClick={() => {
                  setActiveCall(null);
                  toast.info("Llamada finalizada");
                }}
                className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
