'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, User, Paperclip, Mic, Image as ImageIcon, 
  Video, FileText, ChevronLeft, MoreVertical, Play
} from 'lucide-react'

// Mocks actualizados para soportar multimedia
const MOCK_CHATS = [
  { id: 1, name: "Luis", lastMessage: "Te mandé el diagrama de red", online: true, initials: "LU", color: "#10B981" },
  { id: 2, name: "Profe Sistemas", lastMessage: "Revisé la rúbrica, tienes 78.", online: false, initials: "PS", color: "#F59E0B" },
  { id: 3, name: "Equipo Zentry", lastMessage: "El deployment sale a las 10pm.", online: true, initials: "EZ", color: "#A855F7" },
]

type MessageType = 'text' | 'image' | 'audio'

interface Message {
  id: number
  sender: 'me' | 'them'
  type: MessageType
  text?: string
  mediaUrl?: string
  time: string
}

const INITIAL_MESSAGES: Message[] = [
  { id: 1, sender: 'them', type: 'text', text: '¡Hola! ¿Cómo va el desarrollo?', time: '10:00 AM' },
  { id: 2, sender: 'me', type: 'text', text: 'Casi terminamos el front, mañana entregamos.', time: '10:05 AM' },
  { id: 3, sender: 'them', type: 'image', mediaUrl: 'Diagrama de Arquitectura', text: 'Mira cómo quedó la estructura', time: '10:08 AM' },
]

export default function MessagesPage() {
  const [activeChat, setActiveChat] = useState<typeof MOCK_CHATS[0] | null>(null)
  const [messageText, setMessageText] = useState('')
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll al último mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Seleccionar chat por defecto solo en Desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && !activeChat) {
        setActiveChat(MOCK_CHATS[0])
      }
    }
    handleResize() // Initial check
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [activeChat])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim()) return

    setMessages(prev => [...prev, { 
      id: Date.now(), 
      sender: 'me', 
      type: 'text',
      text: messageText.trim(), 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }])
    setMessageText('')
    setShowAttachMenu(false)
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // Aquí iría la lógica real de MediaRecorder API
    if (isRecording) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'me',
        type: 'audio',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }])
    }
  }

  return (
    // Altura calculada restando el Navbar superior para no hacer scroll global
    <div className="flex h-[calc(100vh-80px)] w-full max-w-7xl mx-auto bg-zentry-bg transition-colors duration-300 overflow-hidden md:rounded-3xl md:border md:border-zentry-border md:mt-6 md:h-[calc(100vh-120px)] md:shadow-2xl">
      
      {/* ========================================== */}
      {/* 1. SIDEBAR DE CHATS                        */}
      {/* ========================================== */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-zentry-border bg-zentry-card flex flex-col transition-all duration-300 ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Header Lista */}
        <div className="p-5 border-b border-zentry-border">
          <h2 className="text-zentry-text-1 font-bold text-xl">Mensajes</h2>
          <div className="mt-4 relative">
            <input 
              type="text" 
              placeholder="Buscar conversación..." 
              className="w-full bg-zentry-bg border border-zentry-border focus:border-zentry-accent text-zentry-text-1 placeholder:text-zentry-text-2/60 text-sm rounded-xl px-4 py-2.5 outline-none transition-colors"
            />
          </div>
        </div>

        {/* Lista de Chats */}
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {MOCK_CHATS.map(chat => (
            <div 
              key={chat.id} 
              onClick={() => setActiveChat(chat)}
              className={`p-4 flex items-center gap-4 cursor-pointer transition-colors border-b border-zentry-border/50 ${
                activeChat?.id === chat.id 
                  ? 'bg-zentry-accent/10 border-l-4 border-l-zentry-accent' 
                  : 'hover:bg-zentry-bg border-l-4 border-l-transparent'
              }`}
            >
              <div className="relative shrink-0">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shadow-sm"
                  style={{ background: chat.color + '20', color: chat.color }}
                >
                  {chat.initials}
                </div>
                {chat.online && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-zentry-card rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <p className="text-zentry-text-1 text-sm font-bold truncate">{chat.name}</p>
                  <span className="text-[10px] text-zentry-text-2">10:00 AM</span>
                </div>
                <p className="text-zentry-text-2 text-xs truncate">{chat.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================== */}
      {/* 2. ÁREA DE CHAT ACTIVO                     */}
      {/* ========================================== */}
      <div className={`flex-1 flex flex-col bg-zentry-bg relative ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
        
        {activeChat ? (
          <>
            {/* Header del Chat */}
            <div className="h-[72px] px-4 bg-zentry-card/90 backdrop-blur-md border-b border-zentry-border flex items-center justify-between shrink-0 z-10">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveChat(null)}
                  className="md:hidden w-8 h-8 flex items-center justify-center rounded-full bg-zentry-bg text-zentry-text-2 hover:text-zentry-text-1 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: activeChat.color + '20', color: activeChat.color }}
                >
                  {activeChat.initials}
                </div>
                <div>
                  <span className="text-zentry-text-1 font-bold block leading-tight">{activeChat.name}</span>
                  <span className="text-[10px] text-zentry-text-2 font-medium">{activeChat.online ? 'En línea' : 'Desconectado'}</span>
                </div>
              </div>
              <button className="w-8 h-8 flex items-center justify-center rounded-full text-zentry-text-2 hover:bg-zentry-bg transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Zona de Mensajes */}
            <div className="flex-1 p-4 sm:p-6 flex flex-col gap-4 overflow-y-auto hide-scrollbar">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`max-w-[85%] sm:max-w-[70%] flex flex-col ${msg.sender === 'me' ? 'self-end' : 'self-start'}`}
                  >
                    <div className={`p-3 rounded-2xl shadow-sm ${
                      msg.sender === 'me' 
                        ? 'bg-zentry-accent text-white rounded-br-sm' 
                        : 'bg-zentry-card border border-zentry-border text-zentry-text-1 rounded-bl-sm'
                    }`}>
                      
                      {/* Renderizado Condicional por Tipo de Mensaje */}
                      {msg.type === 'text' && (
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                      )}
                      
                      {msg.type === 'image' && (
                        <div className="flex flex-col gap-2">
                          <div className="w-full h-40 sm:h-48 bg-black/20 rounded-xl flex items-center justify-center overflow-hidden relative">
                            <ImageIcon className="w-8 h-8 opacity-50" />
                            <span className="absolute bottom-2 left-2 text-[10px] bg-black/50 px-2 py-1 rounded-md backdrop-blur-sm">{msg.mediaUrl}</span>
                          </div>
                          {msg.text && <p className="text-sm mt-1">{msg.text}</p>}
                        </div>
                      )}

                      {msg.type === 'audio' && (
                        <div className="flex items-center gap-3 min-w-[150px]">
                          <button className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center shrink-0 hover:bg-black/30 transition-colors">
                            <Play className="w-4 h-4 ml-0.5" />
                          </button>
                          <div className="flex-1 h-1.5 bg-black/20 rounded-full overflow-hidden">
                            <div className="w-1/3 h-full bg-white/80 rounded-full" />
                          </div>
                          <span className="text-xs font-medium">0:14</span>
                        </div>
                      )}

                    </div>
                    <span className={`text-[10px] text-zentry-text-2 mt-1.5 font-medium ${msg.sender === 'me' ? 'text-right pr-1' : 'text-left pl-1'}`}>
                      {msg.time}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input de envío y Menú de Adjuntos */}
            <div className="p-4 bg-zentry-card border-t border-zentry-border relative z-20">
              
              {/* Menú Popover de Adjuntos */}
              <AnimatePresence>
                {showAttachMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-20 left-4 bg-zentry-card border border-zentry-border rounded-2xl p-2 shadow-xl shadow-black/10 flex flex-col gap-1 w-48"
                  >
                    <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zentry-bg text-zentry-text-2 hover:text-zentry-text-1 text-sm transition-colors text-left">
                      <ImageIcon className="w-4 h-4 text-blue-400" /> Imagen o Video
                    </button>
                    <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zentry-bg text-zentry-text-2 hover:text-zentry-text-1 text-sm transition-colors text-left">
                      <FileText className="w-4 h-4 text-purple-400" /> Documento
                    </button>
                    <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zentry-bg text-zentry-text-2 hover:text-zentry-text-1 text-sm transition-colors text-left">
                      <User className="w-4 h-4 text-green-400" /> Contacto
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Barra de Input */}
              <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                <div className="flex-1 bg-zentry-bg border border-zentry-border focus-within:border-zentry-accent rounded-2xl flex items-end px-2 py-1 transition-colors">
                  <button 
                    type="button"
                    onClick={() => setShowAttachMenu(!showAttachMenu)}
                    className={`p-2 shrink-0 transition-colors rounded-full ${showAttachMenu ? 'bg-zentry-card text-zentry-accent shadow-sm' : 'text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-card'}`}
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  
                  <textarea 
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage(e)
                      }
                    }}
                    className="flex-1 bg-transparent border-none px-3 py-2.5 text-zentry-text-1 text-sm focus:outline-none focus:ring-0 resize-none max-h-32 min-h-[44px]" 
                    placeholder="Escribe un mensaje..."
                    rows={1}
                  />
                </div>

                {/* Botón Micrófono o Enviar */}
                {messageText.trim() ? (
                  <motion.button 
                    initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                    type="submit" 
                    className="w-[46px] h-[46px] rounded-full bg-zentry-accent hover:opacity-90 text-white shrink-0 flex items-center justify-center shadow-lg shadow-zentry-accent/20 transition-all mb-0.5"
                  >
                    <Send className="w-5 h-5 ml-1" />
                  </motion.button>
                ) : (
                  <button 
                    type="button"
                    onClick={toggleRecording}
                    className={`w-[46px] h-[46px] rounded-full shrink-0 flex items-center justify-center transition-all mb-0.5 ${
                      isRecording 
                        ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                        : 'bg-zentry-card border border-zentry-border text-zentry-text-2 hover:text-zentry-accent hover:border-zentry-accent/50'
                    }`}
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                )}
              </form>
            </div>
          </>
        ) : (
          /* Estado Vacío Desktop */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 bg-zentry-card border border-zentry-border rounded-full flex items-center justify-center mb-6 shadow-sm">
              <Send className="w-8 h-8 text-zentry-accent/50 ml-1" />
            </div>
            <h3 className="text-xl font-bold text-zentry-text-1 mb-2">Tus Mensajes</h3>
            <p className="text-sm text-zentry-text-2 max-w-sm">
              Selecciona una conversación del panel lateral o inicia una nueva colaboración.
            </p>
          </div>
        )}
      </div>

    </div>
  )
}