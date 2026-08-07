"use client"

import { useState, useRef, useEffect, ElementType } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  MousePointer2, PenTool, Type, Square, Circle, Eraser, 
  Layers, Download, Save, ArrowLeft, ZoomIn, ZoomOut, 
  Play, Pause, Scissors, SlidersHorizontal, Image as ImageIcon,
  Music, Video, Loader2, CheckCircle2, Settings2, Image as ImageLucide
} from "lucide-react";

type Tool = 'select' | 'pen' | 'text' | 'rect' | 'circle' | 'eraser';
type RightTab = 'capas' | 'ajustes'; // Nuevo tipo para el panel derecho

export default function EditorClient({ canvasId }: { canvasId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileType = searchParams.get('type') || 'canvas'; 
  
  const [activeTool, setActiveTool] = useState<Tool>('pen');
  const [zoom, setZoom] = useState(100);
  const [title, setTitle] = useState(canvasId === 'new' ? 'Obra sin título' : `Proyecto ${canvasId}`);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [rightTab, setRightTab] = useState<RightTab>('capas'); // Estado de la pestaña derecha

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [mediaProgress, setMediaProgress] = useState(0); 

  // --- SOLUCIÓN AL ERROR DE REACT ---
  // Ahora manejamos la lógica dentro de la función setMediaProgress
  useEffect(() => {
    if (!isPlaying) return; // Si no está reproduciendo, no hacemos nada

    const interval = setInterval(() => {
      setMediaProgress((prev) => {
        if (prev >= 100) {
          setIsPlaying(false); // Es seguro llamar esto dentro del callback del intervalo
          return 0; // Reiniciamos el progreso
        }
        return prev + 0.5; // Avanzamos
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]); // Solo dependemos de isPlaying
  // ----------------------------------

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000); 
    }, 1500);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== 'pen' && activeTool !== 'eraser') return;
    const canvas = canvasRef.current;
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    ctx.lineTo(x, y);
    ctx.strokeStyle = activeTool === 'eraser' ? '#ffffff' : '#1a1a21';
    ctx.lineWidth = activeTool === 'eraser' ? 20 : 3;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const renderRightPanel = () => (
    <div className="hidden lg:flex w-64 border-l border-zentry-border bg-zentry-card flex-col shrink-0">
      {/* Pestañas del panel derecho */}
      <div className="flex border-b border-zentry-border">
        <button 
          onClick={() => setRightTab('capas')}
          className={`flex-1 py-3 text-sm font-bold transition-colors ${rightTab === 'capas' ? 'text-zentry-text-1 border-b-2 border-zentry-accent' : 'text-zentry-text-2 hover:text-zentry-text-1'}`}
        >
          Capas
        </button>
        <button 
          onClick={() => setRightTab('ajustes')}
          className={`flex-1 py-3 text-sm font-bold transition-colors ${rightTab === 'ajustes' ? 'text-zentry-text-1 border-b-2 border-zentry-accent' : 'text-zentry-text-2 hover:text-zentry-text-1'}`}
        >
          Ajustes
        </button>
      </div>

      {/* Contenido dinámico del panel */}
      <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
        {rightTab === 'capas' ? (
          // CONTENIDO: CAPAS
          <>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-zentry-bg border border-zentry-border text-sm text-zentry-text-1 cursor-pointer">
              <Layers className="w-4 h-4 text-zentry-accent" /> Capa 2 (Dibujo)
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-zentry-bg text-sm text-zentry-text-2 cursor-pointer transition-colors">
              <ImageLucide className="w-4 h-4" /> Capa 1 (Fondo)
            </div>
          </>
        ) : (
          // CONTENIDO: AJUSTES (NUEVO)
          <div className="flex flex-col gap-5">
            <div>
              <label className="text-xs font-bold text-zentry-text-2 mb-2 block uppercase tracking-wider">Formato de Exportación</label>
              <select className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-3 py-2 text-sm text-zentry-text-1 focus:outline-none focus:border-zentry-accent">
                <option>PNG (Alta calidad)</option>
                <option>JPG (Ligero)</option>
                <option>WEBP (Web)</option>
              </select>
            </div>
            
            <div>
              <label className="text-xs font-bold text-zentry-text-2 mb-2 block uppercase tracking-wider">Dimensiones del Lienzo</label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <span className="text-[10px] text-zentry-text-2">Ancho (px)</span>
                  <input type="number" defaultValue={800} className="w-full bg-zentry-bg border border-zentry-border rounded-lg px-2 py-1.5 text-sm text-zentry-text-1 focus:outline-none" />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] text-zentry-text-2">Alto (px)</span>
                  <input type="number" defaultValue={600} className="w-full bg-zentry-bg border border-zentry-border rounded-lg px-2 py-1.5 text-sm text-zentry-text-1 focus:outline-none" />
                </div>
              </div>
            </div>

            <div className="h-px bg-zentry-border w-full my-2" />

            <div>
              <label className="text-xs font-bold text-zentry-text-2 mb-2 block uppercase tracking-wider">Opciones de Red</label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-zentry-text-1">Permitir remezcla</span>
                <input type="checkbox" defaultChecked className="accent-zentry-accent w-4 h-4" />
              </label>
              <p className="text-[10px] text-zentry-text-2 mt-1">Otros podrán crear versiones derivadas de tu obra.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderCanvasWorkspace = () => (
    <>
      <div className="w-14 border-r border-zentry-border bg-zentry-card flex flex-col items-center py-4 gap-2 shrink-0">
        <ToolButton icon={MousePointer2} tool="select" active={activeTool} onClick={setActiveTool} />
        <div className="w-8 h-px bg-zentry-border my-2" />
        <ToolButton icon={PenTool} tool="pen" active={activeTool} onClick={setActiveTool} />
        <ToolButton icon={Type} tool="text" active={activeTool} onClick={setActiveTool} />
        <ToolButton icon={Square} tool="rect" active={activeTool} onClick={setActiveTool} />
        <ToolButton icon={Circle} tool="circle" active={activeTool} onClick={setActiveTool} />
        <div className="w-8 h-px bg-zentry-border my-2" />
        <ToolButton icon={Eraser} tool="eraser" active={activeTool} onClick={setActiveTool} />
      </div>
      <div className="flex-1 bg-[#1a1a21] relative overflow-auto flex items-center justify-center p-8">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4a4a5e 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        
        <div className="shadow-2xl relative transition-transform duration-200 bg-white" style={{ width: '800px', height: '600px', transform: `scale(${zoom / 100})` }}>
          <canvas 
            ref={canvasRef}
            width={800}
            height={600}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className={`w-full h-full ${activeTool === 'pen' ? 'cursor-crosshair' : activeTool === 'eraser' ? 'cursor-cell' : 'cursor-default'}`}
          />
        </div>
      </div>
      
      {/* Llamamos al panel derecho unificado */}
      {renderRightPanel()}
    </>
  );

  // ... (renderImageWorkspace y renderMediaWorkspace se mantienen igual, 
  // no las incluyo para no hacer ruido, pero asegúrate de que queden igual que en tu archivo original. 
  // O si necesitas que te pegue todo el archivo completo avísame, aunque solo cambió el inicio, 
  // el useEffect y renderRightPanel).

  const renderImageWorkspace = () => (
    <>
      <div className="w-16 border-r border-zentry-border bg-zentry-card flex flex-col items-center py-4 gap-4 shrink-0">
        <button className="p-3 bg-zentry-bg rounded-xl text-zentry-accent"><SlidersHorizontal className="w-5 h-5" /></button>
        <button className="p-3 hover:bg-zentry-bg rounded-xl text-zentry-text-2"><Scissors className="w-5 h-5" /></button>
      </div>
      <div className="flex-1 bg-black/90 relative overflow-hidden flex items-center justify-center p-8">
        <div className="max-w-2xl w-full aspect-video bg-zentry-card border-2 border-zentry-border rounded-xl flex items-center justify-center flex-col gap-4 text-zentry-text-2 shadow-2xl transition-transform" style={{ transform: `scale(${zoom / 100})` }}>
           <ImageIcon className="w-16 h-16 opacity-50" />
           <p className="font-medium">Tu Fotografía / Imagen</p>
        </div>
      </div>
      {renderRightPanel()}
    </>
  );

  const renderMediaWorkspace = () => {
    const totalSeconds = 225; 
    const currentSeconds = Math.floor((mediaProgress / 100) * totalSeconds);
    const formatTime = (secs: number) => {
      const m = Math.floor(secs / 60).toString().padStart(2, '0');
      const s = (secs % 60).toString().padStart(2, '0');
      return `00:${m}:${s}`;
    };

    return (
      <div className="flex-1 flex flex-col bg-black/95">
        <div className="flex-1 relative flex items-center justify-center p-8">
          <div className="max-w-3xl w-full aspect-video bg-zentry-card border border-zentry-border/50 rounded-2xl flex flex-col items-center justify-center gap-4 shadow-2xl relative overflow-hidden">
            {fileType === 'video' ? <Video className={`w-16 h-16 ${isPlaying ? 'text-zentry-accent animate-pulse' : 'text-zentry-text-2/50'}`} /> : <Music className={`w-16 h-16 ${isPlaying ? 'text-zentry-accent animate-pulse' : 'text-zentry-text-2/50'}`} />}
            <p className="text-zentry-text-2 font-medium">Previsualización de {fileType === 'video' ? 'Video' : 'Audio'}</p>
            {fileType === 'audio' && (
              <div className="absolute bottom-10 left-10 right-10 h-16 flex items-end justify-center gap-1 opacity-50">
                {[...Array(30)].map((_, i) => (
                  <div key={i} className={`w-2 rounded-t-full transition-all duration-300 ${isPlaying ? 'bg-zentry-accent' : 'bg-zentry-text-2'}`} style={{ height: isPlaying ? `${Math.random() * 100}%` : '20%' }} />
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="h-48 bg-zentry-card border-t border-zentry-border p-4 flex flex-col gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsPlaying(!isPlaying)} className="w-10 h-10 rounded-full bg-zentry-accent text-white flex items-center justify-center hover:opacity-90">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 translate-x-0.5" />}
            </button>
            <span className="text-sm font-mono text-zentry-text-2">{formatTime(currentSeconds)} / {formatTime(totalSeconds)}</span>
            <button className="ml-auto p-2 text-zentry-text-2 hover:text-zentry-text-1 bg-zentry-bg rounded-lg"><Scissors className="w-4 h-4" /></button>
          </div>
          
          <div className="flex-1 bg-zentry-bg rounded-xl border border-zentry-border relative flex items-center overflow-hidden cursor-pointer" onClick={(e) => {
             const rect = e.currentTarget.getBoundingClientRect();
             const clickX = e.clientX - rect.left;
             setMediaProgress((clickX / rect.width) * 100);
          }}>
            <div className="absolute left-0 top-0 bottom-0 bg-zentry-border/50" style={{ width: `${mediaProgress}%` }} />
            <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 shadow-[0_0_8px_rgba(239,68,68,0.8)] transition-all duration-100" style={{ left: `${mediaProgress}%` }} />
            <div className={`h-12 rounded-lg flex-1 mx-4 z-0 ${fileType === 'video' ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-blue-500/20 border border-blue-500/30'}`} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-6rem)] sm:h-[calc(100vh-2rem)] flex flex-col bg-zentry-bg border border-zentry-border rounded-3xl overflow-hidden shadow-2xl mt-2 sm:mt-6">
      <div className="h-14 border-b border-zentry-border bg-zentry-card flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/studio')} className="text-zentry-text-2 hover:text-zentry-text-1 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="h-4 w-px bg-zentry-border" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-zentry-bg border border-zentry-border text-zentry-text-2">
              {fileType}
            </span>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-transparent font-bold text-sm text-zentry-text-1 focus:outline-none focus:border-b border-zentry-accent px-1 w-48 truncate" />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-zentry-bg border border-zentry-border rounded-lg p-1">
            <button onClick={() => setZoom(z => Math.max(10, z - 10))} className="p-1 text-zentry-text-2 hover:text-zentry-text-1"><ZoomOut className="w-4 h-4" /></button>
            <span className="text-xs font-medium text-zentry-text-1 w-10 text-center">{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="p-1 text-zentry-text-2 hover:text-zentry-text-1"><ZoomIn className="w-4 h-4" /></button>
          </div>
          
          <button className="hidden sm:flex items-center gap-2 text-sm font-medium text-zentry-text-2 hover:text-zentry-text-1 px-3 py-1.5 rounded-lg transition-colors">
            <Download className="w-4 h-4" /> Exportar
          </button>
          
          <button 
            onClick={handleSave}
            disabled={isSaving || saved}
            className={`flex items-center gap-2 text-sm font-semibold px-4 py-1.5 rounded-lg transition-all ${
              saved ? 'bg-green-500 text-white' : 'text-zentry-bg bg-zentry-text-1 hover:opacity-90'
            }`}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {fileType === 'canvas' && renderCanvasWorkspace()}
        {fileType === 'image' && renderImageWorkspace()}
        {(fileType === 'video' || fileType === 'audio') && renderMediaWorkspace()}
      </div>
    </div>
  );
}

function ToolButton({ icon: Icon, tool, active, onClick }: { icon: ElementType, tool: Tool, active: Tool, onClick: (t: Tool) => void }) {
  return (
    <button onClick={() => onClick(tool)} className={`p-2.5 rounded-xl transition-all ${active === tool ? 'bg-zentry-accent text-white shadow-lg shadow-zentry-accent/20' : 'text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-bg'}`} title={tool}>
      <Icon className="w-5 h-5" />
    </button>
  )
}

