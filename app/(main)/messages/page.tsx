"use client" // Obligatorio porque usaremos useState e interactividad

import { useState } from "react";
import { Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock de datos para la demo
const MOCK_CHATS = [
  { id: 1, name: "Luis", lastMessage: "¿El DNS ya está corriendo?", online: true },
  { id: 2, name: "Profe Sistemas", lastMessage: "Revisé la rúbrica, tienes 78.", online: false },
  { id: 3, name: "Equipo Zentry", lastMessage: "El deployment sale a las 10pm.", online: true },
];

export default function MessagesPage() {
  const [activeChat, setActiveChat] = useState(MOCK_CHATS[0]);
  const [messageText, setMessageText] = useState("");
  
  // Estado para guardar los mensajes de la conversación actual
  const [messages, setMessages] = useState([
    { id: 1, sender: 'them', text: '¡Hola! ¿Cómo va el desarrollo?', time: '10:00 AM' },
    { id: 2, sender: 'me', text: 'Casi terminamos el front, mañana entregamos.', time: '10:05 AM' },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    // Agregamos el nuevo mensaje a la vista
    setMessages([...messages, { 
      id: Date.now(), 
      sender: 'me', 
      text: messageText, 
      time: 'Ahora' 
    }]);
    setMessageText(""); // Limpiamos el input
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      
      {/* Sidebar de Chats */}
      <div className="w-80 border-r border-zinc-800 bg-zinc-950 flex flex-col">
        <div className="p-4 border-b border-zinc-800">
          <h2 className="text-white font-bold text-xl">Mensajes</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {MOCK_CHATS.map(chat => (
            <div 
              key={chat.id} 
              onClick={() => setActiveChat(chat)}
              className={`p-4 flex items-center gap-3 cursor-pointer transition-colors border-b border-zinc-900 ${
                activeChat.id === chat.id ? 'bg-zinc-800' : 'hover:bg-zinc-900'
              }`}
            >
              <div className="relative">
                <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center">
                  <User className="text-zinc-400 w-5 h-5"/>
                </div>
                {chat.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-zinc-950 rounded-full" />}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-white text-sm font-semibold">{chat.name}</p>
                <p className="text-zinc-500 text-xs truncate">{chat.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ventana de Chat Activo */}
      <div className="flex-1 flex flex-col bg-zinc-900/30">
        {/* Cabecera del chat */}
        <div className="p-4 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 flex items-center gap-3">
           <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center"><User className="text-zinc-500 w-4 h-4"/></div>
           <span className="text-white font-semibold">{activeChat.name}</span>
        </div>

        {/* Área de mensajes */}
        <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
          {messages.map(msg => (
            <div key={msg.id} className={`max-w-[70%] text-sm flex flex-col ${msg.sender === 'me' ? 'self-end' : 'self-start'}`}>
              <div className={`p-3 rounded-2xl ${
                msg.sender === 'me' 
                  ? 'bg-violet-600 text-white rounded-br-none' 
                  : 'bg-zinc-800 text-white rounded-bl-none'
              }`}>
                {msg.text}
              </div>
              <span className={`text-[10px] text-zinc-500 mt-1 ${msg.sender === 'me' ? 'text-right' : 'text-left'}`}>
                {msg.time}
              </span>
            </div>
          ))}
        </div>

        {/* Input de envío */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800">
          <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
            <input 
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-violet-500" 
              placeholder="Escribe un mensaje..."
            />
            <Button type="submit" size="icon" className="bg-violet-600 hover:bg-violet-500 text-white shrink-0">
              <Send className="w-4 h-4"/>
            </Button>
          </form>
        </div>
      </div>

    </div>
  );
}