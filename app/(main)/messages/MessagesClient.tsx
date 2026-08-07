"use client"

import { useState, useRef, useEffect } from "react"
import { Search, Send, ArrowLeft, Image as ImageIcon, CheckCircle2 } from "lucide-react"

type Message = { id: string; text: string; isMe: boolean; time: string; isImage?: boolean }
type Chat = { id: number; name: string; avatar: string; isOnline: boolean; messages: Message[] }

const INITIAL_CHATS: Chat[] = [
  { id: 1, name: "Pixel Kid", avatar: "PK", isOnline: true, messages: [
      { id: 'm1', text: "¡Hola Dani!", isMe: false, time: "10:28 AM" },
      { id: 'm2', text: "¿Qué opinas del nuevo boceto?", isMe: false, time: "10:30 AM" }
    ] 
  },
  { id: 2, name: "Luna Muse", avatar: "LM", isOnline: false, messages: [
      { id: 'm3', text: "¡Gracias por el feedback en mi obra!", isMe: false, time: "Ayer" }
    ] 
  }
];

export default function MessagesClient() {
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [inputText, setInputText] = useState("");
  
  // Referencias para el scroll automático y el input de archivo
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeChat = chats.find(c => c.id === activeChatId);

  // Scroll to bottom cada vez que cambia el chat activo o hay mensajes nuevos
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages]);

  const addMessageToChat = (text: string, isImage = false) => {
    if (!activeChatId) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isMe: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isImage
    };
    
    setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: [...c.messages, newMessage] } : c));

    // Simular respuesta del otro usuario después de 1.5 segundos
    setTimeout(() => {
      setChats(prev => prev.map(c => {
        if (c.id === activeChatId) {
          return { ...c, messages: [...c.messages, { id: Date.now().toString(), text: "¡Interesante! Lo reviso en un momento.", isMe: false, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }] };
        }
        return c;
      }));
    }, 1500);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    addMessageToChat(inputText);
    setInputText("");
  };

  const handleSendImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      addMessageToChat(`📷 ${e.target.files[0].name}`, true);
    }
  };

  return (
    <div className="h-[calc(100vh-2rem)] sm:h-[calc(100vh-6rem)] mt-2 sm:mt-6 bg-zentry-card border border-zentry-border rounded-3xl overflow-hidden flex shadow-lg">
      
      {/* PANEL IZQUIERDO: Lista de Chats */}
      <div className={`w-full sm:w-1/3 border-r border-zentry-border flex flex-col ${activeChatId ? 'hidden sm:flex' : 'flex'}`}>
        <div className="p-4 border-b border-zentry-border">
          <h2 className="text-xl font-bold text-zentry-text-1 mb-4">Mensajes</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zentry-text-2" />
            <input type="text" placeholder="Buscar chat..." className="w-full bg-zentry-bg border border-zentry-border rounded-xl py-2 pl-9 pr-3 text-sm text-zentry-text-1 focus:outline-none focus:border-zentry-accent transition-colors" />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {chats.map(chat => {
            const lastMsg = chat.messages[chat.messages.length - 1];
            return (
              <div 
                key={chat.id} 
                onClick={() => setActiveChatId(chat.id)}
                className={`p-4 border-b border-zentry-border cursor-pointer transition-colors ${activeChatId === chat.id ? 'bg-zentry-bg' : 'hover:bg-zentry-bg/50'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-zentry-text-1">{chat.name}</span>
                    {chat.isOnline && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                  </div>
                  <span className="text-xs text-zentry-text-2">{lastMsg?.time}</span>
                </div>
                <p className="text-sm truncate text-zentry-text-2">
                  {lastMsg?.isMe && <CheckCircle2 className="inline-block w-3 h-3 mr-1 text-zentry-accent" />}
                  {lastMsg?.isMe ? 'Tú: ' : ''}{lastMsg?.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* PANEL DERECHO: Conversación Activa */}
      <div className={`w-full sm:w-2/3 flex flex-col bg-zentry-bg relative ${!activeChatId ? 'hidden sm:flex' : 'flex'}`}>
        {!activeChat ? (
          <div className="flex-1 flex flex-col items-center justify-center text-zentry-text-2">
            <div className="w-16 h-16 rounded-full bg-zentry-card border border-zentry-border flex items-center justify-center mb-4 shadow-sm">
              <Send className="w-6 h-6 text-zentry-text-2/50" />
            </div>
            <p>Selecciona un chat para iniciar</p>
          </div>
        ) : (
          <>
            {/* Header Chat */}
            <div className="p-4 border-b border-zentry-border bg-zentry-card/80 backdrop-blur-md sticky top-0 z-10 flex items-center gap-3 shadow-sm">
              <button className="sm:hidden text-zentry-text-1 p-2 -ml-2" onClick={() => setActiveChatId(null)}>
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-zentry-bg border border-zentry-border flex items-center justify-center font-bold text-zentry-text-1">
                  {activeChat.avatar}
                </div>
                {activeChat.isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-zentry-card rounded-full" />}
              </div>
              <div>
                <h3 className="font-bold text-zentry-text-1 text-sm leading-tight">{activeChat.name}</h3>
                <p className="text-xs text-zentry-text-2">{activeChat.isOnline ? 'En línea' : 'Desconectado'}</p>
              </div>
            </div>
            
            {/* Burbujas de chat */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
              {activeChat.messages.map(msg => (
                <div key={msg.id} className={`flex flex-col max-w-[80%] ${msg.isMe ? 'self-end' : 'self-start'}`}>
                  <div className={`p-3 text-sm shadow-sm ${
                    msg.isImage 
                      ? 'bg-zentry-card border border-zentry-border text-zentry-accent rounded-2xl font-medium' // Estilo distinto para imágenes
                      : msg.isMe 
                        ? 'bg-zentry-accent text-white rounded-2xl rounded-tr-sm' 
                        : 'bg-zentry-card border border-zentry-border text-zentry-text-1 rounded-2xl rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                  <div className={`flex items-center gap-1 mt-1 ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[10px] text-zentry-text-2">{msg.time}</span>
                    {msg.isMe && <CheckCircle2 className="w-3 h-3 text-zentry-accent" />}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} /> {/* Div invisible para hacer auto-scroll */}
            </div>

            {/* Input para escribir */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-zentry-border bg-zentry-card flex items-center gap-2">
              <input type="file" ref={fileInputRef} onChange={handleSendImage} className="hidden" accept="image/*" />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-bg rounded-xl transition-colors">
                <ImageIcon className="w-5 h-5" />
              </button>
              
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Escribe un mensaje..." 
                className="flex-1 bg-zentry-bg border border-zentry-border rounded-xl py-2.5 px-4 text-sm text-zentry-text-1 focus:outline-none focus:border-zentry-accent transition-colors" 
              />
              <button 
                type="submit" 
                disabled={!inputText.trim()}
                className="p-2.5 bg-zentry-text-1 text-zentry-bg rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </div>

    </div>
  )
}


