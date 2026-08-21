"use client"

import { useState, useRef, useEffect, ElementType } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  MousePointer2, PenTool, Type, Square, Circle, Eraser, 
  Layers, Download, Save, ArrowLeft, ZoomIn, ZoomOut, 
  Play, Pause, Scissors, SlidersHorizontal, Image as ImageIcon,
  Music, Video, Loader2, CheckCircle2, Settings2, Image as ImageLucide,
  Palette, Grid, Trash2, RotateCcw, FileText, AlignLeft, AlignCenter, 
  AlignRight, Bold, Italic, Underline, Strikethrough, Heading1, Heading2, 
  List, ListOrdered, Quote, Code, Volume2, VolumeX, FastForward, Rewind
} from "lucide-react";
import { toast } from "sonner";

type Tool = 'select' | 'pen' | 'text' | 'rect' | 'circle' | 'eraser';
type RightTab = 'capas' | 'ajustes';

const PALETTE_COLORS = [
  '#1a1a21', '#ffffff', '#ff0055', '#00e5ff', 
  '#ffcc00', '#00ff66', '#9900ff', '#ff6600'
];

export default function EditorClient({ canvasId }: { canvasId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileType = searchParams.get('type') || 'canvas'; 
  
  const [activeTool, setActiveTool] = useState<Tool>('pen');
  const [selectedColor, setSelectedColor] = useState<string>('#1a1a21');
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [isPixelArtMode, setIsPixelArtMode] = useState<boolean>(false);
  const [zoom, setZoom] = useState(100);
  const [title, setTitle] = useState(canvasId === 'new' ? 'Obra sin título' : `Proyecto ${canvasId}`);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [rightTab, setRightTab] = useState<RightTab>('capas');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Estados de Edición de Documento de Texto (Estilo Word)
  const [docContent, setDocContent] = useState<string>(
    "Escribe el contenido de tu documento aquí...\n\nPuedes organizar tus ideas, guiones de video o notas de proyecto con formato enriquecido."
  );
  const [docAlignment, setDocAlignment] = useState<'left' | 'center' | 'right'>('left');

  // Estados de Reproducción de Media (Video / Audio)
  const [isPlaying, setIsPlaying] = useState(false);
  const [mediaProgress, setMediaProgress] = useState(0); 
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setMediaProgress((prev) => {
        if (prev >= 100) {
          setIsPlaying(false);
          return 0;
        }
        return prev + (0.5 * playbackSpeed);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      toast.success("¡Proyecto guardado en tu Estudio!");
      setTimeout(() => setSaved(false), 2500); 
    }, 1000);
  };

  const handleExport = () => {
    toast.success(`Exportando "${title}" en formato ${fileType === 'document' ? 'PDF' : fileType === 'video' ? 'MP4' : 'PNG'}...`);
  };

  // --- LÓGICA DE DIBUJO EN CANVA / PIXEL ART ---
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== 'pen' && activeTool !== 'eraser') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    let x = (e.clientX - rect.left) * (canvas.width / rect.width);
    let y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    if (isPixelArtMode) {
      const gridSize = 16;
      x = Math.floor(x / gridSize) * gridSize;
      y = Math.floor(y / gridSize) * gridSize;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x = (e.clientX - rect.left) * (canvas.width / rect.width);
    let y = (e.clientY - rect.top) * (canvas.height / rect.height);

    if (isPixelArtMode) {
      const gridSize = 16;
      x = Math.floor(x / gridSize) * gridSize;
      y = Math.floor(y / gridSize) * gridSize;
      ctx.fillStyle = activeTool === 'eraser' ? '#ffffff' : selectedColor;
      ctx.fillRect(x, y, gridSize, gridSize);
      return;
    }

    ctx.lineTo(x, y);
    ctx.strokeStyle = activeTool === 'eraser' ? '#ffffff' : selectedColor;
    ctx.lineWidth = activeTool === 'eraser' ? strokeWidth * 3 : strokeWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    toast.info("Lienzo limpiado");
  };

  // --- PANEL DERECHO UNIFICADO ---
  const renderRightPanel = () => (
    <div className="hidden lg:flex w-64 border-l border-zentry-border bg-zentry-card flex-col shrink-0">
      <div className="flex border-b border-zentry-border">
        <button 
          onClick={() => setRightTab('capas')}
          className={`flex-1 py-3 text-xs font-bold uppercase transition-colors ${rightTab === 'capas' ? 'text-zentry-text-1 border-b-2 border-zentry-accent' : 'text-zentry-text-2 hover:text-zentry-text-1'}`}
        >
          Capas
        </button>
        <button 
          onClick={() => setRightTab('ajustes')}
          className={`flex-1 py-3 text-xs font-bold uppercase transition-colors ${rightTab === 'ajustes' ? 'text-zentry-text-1 border-b-2 border-zentry-accent' : 'text-zentry-text-2 hover:text-zentry-text-1'}`}
        >
          Ajustes
        </button>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
        {rightTab === 'capas' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-zentry-bg border border-zentry-border text-xs font-bold text-zentry-text-1 shadow-sm">
              <span className="flex items-center gap-2"><Layers className="w-4 h-4 text-zentry-accent" /> Capa 2 (Dibujo)</span>
              <span className="text-[10px] text-emerald-400">Activa</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-zentry-bg text-xs font-medium text-zentry-text-2 transition-colors cursor-pointer border border-transparent hover:border-zentry-border">
              <span className="flex items-center gap-2"><ImageLucide className="w-4 h-4" /> Capa 1 (Fondo)</span>
              <span className="text-[10px]">Visible</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div>
              <label className="text-xs font-bold text-zentry-text-2 mb-2 block uppercase tracking-wider">Formato de Exportación</label>
              <select className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-3 py-2 text-xs font-medium text-zentry-text-1 focus:outline-none focus:border-zentry-accent">
                <option>PNG (Alta calidad)</option>
                <option>JPG (Ligero)</option>
                <option>WEBP (Web)</option>
                <option>PDF (Documento)</option>
              </select>
            </div>
            
            <div>
              <label className="text-xs font-bold text-zentry-text-2 mb-2 block uppercase tracking-wider">Dimensiones del Lienzo</label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <span className="text-[10px] text-zentry-text-2">Ancho (px)</span>
                  <input type="number" defaultValue={800} className="w-full bg-zentry-bg border border-zentry-border rounded-lg px-2.5 py-1.5 text-xs text-zentry-text-1 focus:outline-none" />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] text-zentry-text-2">Alto (px)</span>
                  <input type="number" defaultValue={600} className="w-full bg-zentry-bg border border-zentry-border rounded-lg px-2.5 py-1.5 text-xs text-zentry-text-1 focus:outline-none" />
                </div>
              </div>
            </div>

            <div className="h-px bg-zentry-border w-full my-1" />

            <div>
              <label className="text-xs font-bold text-zentry-text-2 mb-2 block uppercase tracking-wider">Opciones de Publicación</label>
              <label className="flex items-center justify-between cursor-pointer text-xs font-medium text-zentry-text-1">
                <span>Permitir remezcla en Zentry</span>
                <input type="checkbox" defaultChecked className="accent-zentry-accent w-4 h-4 rounded" />
              </label>
              <p className="text-[10px] text-zentry-text-2 mt-1">Otros creadores podrán crear versiones derivadas de tu obra.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // --- ENTORNOS DE TRABAJO ---

  // 1. LIENZO DIGITAL (CANVA / PIXEL ART)
  const renderCanvasWorkspace = () => (
    <>
      <div className="w-16 border-r border-zentry-border bg-zentry-card flex flex-col items-center py-4 gap-3 shrink-0">
        <ToolButton icon={MousePointer2} tool="select" active={activeTool} onClick={setActiveTool} />
        <ToolButton icon={PenTool} tool="pen" active={activeTool} onClick={setActiveTool} />
        <ToolButton icon={Type} tool="text" active={activeTool} onClick={setActiveTool} />
        <ToolButton icon={Square} tool="rect" active={activeTool} onClick={setActiveTool} />
        <ToolButton icon={Circle} tool="circle" active={activeTool} onClick={setActiveTool} />
        <ToolButton icon={Eraser} tool="eraser" active={activeTool} onClick={setActiveTool} />
        
        <div className="w-8 h-px bg-zentry-border my-1" />

        {/* MODO PIXEL ART TOGGLE */}
        <button 
          onClick={() => setIsPixelArtMode(!isPixelArtMode)}
          className={`p-2.5 rounded-xl transition-all ${isPixelArtMode ? 'bg-purple-500 text-white shadow-md' : 'text-zentry-text-2 hover:bg-zentry-bg'}`}
          title="Modo Pixel Art (Grid Snapping)"
        >
          <Grid className="w-5 h-5" />
        </button>

        <button 
          onClick={clearCanvas}
          className="p-2.5 text-zentry-text-2 hover:text-red-400 hover:bg-zentry-bg rounded-xl transition-colors"
          title="Limpiar Lienzo"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 bg-[#16161c] relative overflow-auto flex flex-col items-center justify-center p-6">
        
        {/* Barra Superior de Herramientas (Paleta de Colores y Grosa) */}
        <div className="mb-4 bg-zentry-card border border-zentry-border px-4 py-2 rounded-2xl shadow-md flex items-center gap-4 z-10">
          <div className="flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-zentry-accent mr-1" />
            {PALETTE_COLORS.map(c => (
              <button 
                key={c}
                onClick={() => setSelectedColor(c)}
                className={`w-6 h-6 rounded-full border border-white/20 transition-transform ${selectedColor === c ? 'scale-125 ring-2 ring-zentry-accent' : 'hover:scale-110'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="h-4 w-px bg-zentry-border" />

          <div className="flex items-center gap-2 text-xs font-bold text-zentry-text-2">
            <span>Grosor:</span>
            <input 
              type="range" 
              min={1} 
              max={40} 
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-24 accent-zentry-accent"
            />
            <span className="text-zentry-text-1 w-6">{strokeWidth}px</span>
          </div>
        </div>

        {/* Contenedor del Canvas */}
        <div className="shadow-2xl relative transition-transform duration-200 bg-white rounded-xl overflow-hidden" style={{ width: '800px', height: '600px', transform: `scale(${zoom / 100})` }}>
          {isPixelArtMode && (
            <div className="absolute inset-0 opacity-25 pointer-events-none z-10" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
          )}
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
      
      {renderRightPanel()}
    </>
  );

  // 2. DOCUMENTO DE TEXTO (ESTILO WORD / NOTION)
  const renderDocumentWorkspace = () => {
    const wordCount = docContent.trim() ? docContent.trim().split(/\s+/).length : 0;
    const charCount = docContent.length;
    const readTime = Math.ceil(wordCount / 200);

    return (
      <div className="flex-1 flex flex-col bg-zentry-bg">
        {/* Barra de Formato Enriquecido */}
        <div className="h-12 border-b border-zentry-border bg-zentry-card px-6 flex items-center justify-between shrink-0 overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-1">
            <button className="p-2 text-zentry-text-2 hover:text-zentry-text-1 rounded-lg hover:bg-zentry-bg font-extrabold" title="Negrita (Ctrl+B)">
              <Bold className="w-4 h-4" />
            </button>
            <button className="p-2 text-zentry-text-2 hover:text-zentry-text-1 rounded-lg hover:bg-zentry-bg" title="Cursiva (Ctrl+I)">
              <Italic className="w-4 h-4" />
            </button>
            <button className="p-2 text-zentry-text-2 hover:text-zentry-text-1 rounded-lg hover:bg-zentry-bg" title="Subrayado">
              <Underline className="w-4 h-4" />
            </button>
            <button className="p-2 text-zentry-text-2 hover:text-zentry-text-1 rounded-lg hover:bg-zentry-bg" title="Tachado">
              <Strikethrough className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-zentry-border mx-1" />

            <button className="p-2 text-zentry-text-2 hover:text-zentry-text-1 rounded-lg hover:bg-zentry-bg" title="Título Principal">
              <Heading1 className="w-4 h-4" />
            </button>
            <button className="p-2 text-zentry-text-2 hover:text-zentry-text-1 rounded-lg hover:bg-zentry-bg" title="Subtítulo">
              <Heading2 className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-zentry-border mx-1" />

            <button onClick={() => setDocAlignment('left')} className={`p-2 rounded-lg ${docAlignment === 'left' ? 'text-zentry-accent bg-zentry-bg' : 'text-zentry-text-2 hover:text-zentry-text-1'}`}>
              <AlignLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setDocAlignment('center')} className={`p-2 rounded-lg ${docAlignment === 'center' ? 'text-zentry-accent bg-zentry-bg' : 'text-zentry-text-2 hover:text-zentry-text-1'}`}>
              <AlignCenter className="w-4 h-4" />
            </button>
            <button onClick={() => setDocAlignment('right')} className={`p-2 rounded-lg ${docAlignment === 'right' ? 'text-zentry-accent bg-zentry-bg' : 'text-zentry-text-2 hover:text-zentry-text-1'}`}>
              <AlignRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-zentry-text-2">
            <span>{wordCount} palabras</span>
            <span>{charCount} caracteres</span>
            <span className="text-zentry-accent font-bold">~{readTime} min de lectura</span>
          </div>
        </div>

        {/* Hoja del Documento estilo Hoja A4 */}
        <div className="flex-1 bg-[#121217] overflow-y-auto p-8 flex justify-center custom-scrollbar">
          <div className="max-w-3xl w-full bg-zentry-card border border-zentry-border rounded-3xl p-10 shadow-2xl min-h-[700px] flex flex-col space-y-4">
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Título del Documento..."
              className="text-2xl font-black text-zentry-text-1 bg-transparent border-b border-zentry-border/50 pb-2 focus:outline-none focus:border-zentry-accent"
            />

            <textarea 
              value={docContent}
              onChange={(e) => setDocContent(e.target.value)}
              placeholder="Comienza a redactar tu historia..."
              style={{ textAlign: docAlignment }}
              className="w-full flex-1 bg-transparent text-sm leading-relaxed text-zentry-text-1 focus:outline-none resize-none custom-scrollbar"
            />
          </div>
        </div>
      </div>
    );
  };

  // 3. EDITAR FOTOGRAFÍA / ARTE
  const renderImageWorkspace = () => (
    <>
      <div className="w-16 border-r border-zentry-border bg-zentry-card flex flex-col items-center py-4 gap-4 shrink-0">
        <button className="p-3 bg-zentry-bg rounded-xl text-zentry-accent" title="Ajustes de color"><SlidersHorizontal className="w-5 h-5" /></button>
        <button className="p-3 hover:bg-zentry-bg rounded-xl text-zentry-text-2" title="Recortar"><Scissors className="w-5 h-5" /></button>
      </div>
      <div className="flex-1 bg-black/90 relative overflow-hidden flex items-center justify-center p-8">
        <div className="max-w-2xl w-full aspect-video bg-zentry-card border-2 border-zentry-border rounded-2xl flex items-center justify-center flex-col gap-4 text-zentry-text-2 shadow-2xl transition-transform" style={{ transform: `scale(${zoom / 100})` }}>
           <ImageIcon className="w-16 h-16 opacity-50 text-zentry-accent" />
           <p className="font-bold text-sm text-zentry-text-1">Previsualización de Fotografía / Arte</p>
        </div>
      </div>
      {renderRightPanel()}
    </>
  );

  // 4. MULTIMEDIA (VIDEO / AUDIO CON LÍNEA DE TIEMPO TIPO YOUTUBE STUDIO)
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
        
        {/* Visor de Video / Reproductor de Audio */}
        <div className="flex-1 relative flex items-center justify-center p-8">
          <div className={`w-full max-w-3xl bg-zentry-card border border-zentry-border/50 rounded-3xl flex flex-col items-center justify-center gap-4 shadow-2xl relative overflow-hidden transition-all ${
            aspectRatio === '16:9' ? 'aspect-video' : aspectRatio === '9:16' ? 'aspect-[9/16] max-h-[450px]' : 'aspect-square max-h-[450px]'
          }`}>
            {fileType === 'video' ? (
              <Video className={`w-16 h-16 ${isPlaying ? 'text-zentry-accent animate-pulse' : 'text-zentry-text-2/50'}`} />
            ) : (
              <Music className={`w-16 h-16 ${isPlaying ? 'text-zentry-accent animate-pulse' : 'text-zentry-text-2/50'}`} />
            )}
            
            <p className="text-zentry-text-1 font-extrabold text-sm">
              Reproduciendo {fileType === 'video' ? 'Video' : 'Audio'} ({aspectRatio})
            </p>

            {/* Ecualizador Gráfico Animado para Audio */}
            {fileType === 'audio' && (
              <div className="absolute bottom-10 left-10 right-10 h-16 flex items-end justify-center gap-1 opacity-60">
                {[...Array(32)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-2 rounded-t-full transition-all duration-200 ${isPlaying ? 'bg-zentry-accent' : 'bg-zentry-text-2'}`} 
                    style={{ height: isPlaying ? `${Math.floor(Math.random() * 90) + 10}%` : '20%' }} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Línea de Tiempo (Timeline) Estilo Premiere / Youtube Studio */}
        <div className="h-52 bg-zentry-card border-t border-zentry-border p-4 flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsPlaying(!isPlaying)} 
                className="w-10 h-10 rounded-2xl bg-zentry-accent text-white flex items-center justify-center hover:opacity-90 transition-opacity shadow-md"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 translate-x-0.5" />}
              </button>

              <span className="text-xs font-mono font-bold text-zentry-text-1 bg-zentry-bg border border-zentry-border px-3 py-1.5 rounded-xl">
                {formatTime(currentSeconds)} / {formatTime(totalSeconds)}
              </span>

              <button onClick={() => setMediaProgress(Math.max(0, mediaProgress - 5))} className="p-2 text-zentry-text-2 hover:text-zentry-text-1">
                <Rewind className="w-4 h-4" />
              </button>
              <button onClick={() => setMediaProgress(Math.min(100, mediaProgress + 5))} className="p-2 text-zentry-text-2 hover:text-zentry-text-1">
                <FastForward className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Selector de Velocidad */}
              <select 
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                className="bg-zentry-bg border border-zentry-border rounded-xl px-2.5 py-1 text-xs font-bold text-zentry-text-1 focus:outline-none"
              >
                <option value={0.5}>0.5x</option>
                <option value={1.0}>1.0x (Normal)</option>
                <option value={1.5}>1.5x</option>
                <option value={2.0}>2.0x</option>
              </select>

              {/* Selector de Relación de Aspecto (16:9, 9:16 Shorts) */}
              <select 
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as '16:9' | '9:16' | '1:1')}
                className="bg-zentry-bg border border-zentry-border rounded-xl px-2.5 py-1 text-xs font-bold text-zentry-text-1 focus:outline-none"
              >
                <option value="16:9">16:9 (Horizontal)</option>
                <option value="9:16">9:16 (Shorts/Reels)</option>
                <option value="1:1">1:1 (Cuadrado)</option>
              </select>

              <button onClick={() => setIsMuted(!isMuted)} className="p-2 text-zentry-text-2 hover:text-zentry-text-1">
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          {/* Pista de Tiempo interactiva con cursor rojo */}
          <div 
            className="flex-1 bg-zentry-bg rounded-2xl border border-zentry-border relative flex items-center overflow-hidden cursor-pointer shadow-inner" 
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              setMediaProgress((clickX / rect.width) * 100);
            }}
          >
            <div className="absolute left-0 top-0 bottom-0 bg-zentry-accent/20 border-r border-zentry-accent" style={{ width: `${mediaProgress}%` }} />
            <div className="absolute top-0 bottom-0 w-1 bg-red-500 z-10 shadow-[0_0_10px_rgba(239,68,68,0.9)] transition-all duration-100" style={{ left: `${mediaProgress}%` }} />
            <div className={`h-14 rounded-xl flex-1 mx-4 z-0 ${fileType === 'video' ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-blue-500/20 border border-blue-500/30'}`} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-6rem)] sm:h-[calc(100vh-2rem)] flex flex-col bg-zentry-bg border border-zentry-border rounded-3xl overflow-hidden shadow-2xl mt-2 sm:mt-6">
      
      {/* Barra de Encabezado Superior del Editor */}
      <div className="h-14 border-b border-zentry-border bg-zentry-card flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/studio')} className="text-zentry-text-2 hover:text-zentry-text-1 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="h-4 w-px bg-zentry-border" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase px-2.5 py-1 rounded-xl bg-zentry-bg border border-zentry-border text-zentry-accent">
              {fileType}
            </span>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="bg-transparent font-extrabold text-sm text-zentry-text-1 focus:outline-none focus:border-b border-zentry-accent px-1 w-52 truncate" 
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {fileType === 'canvas' && (
            <div className="hidden sm:flex items-center gap-2 bg-zentry-bg border border-zentry-border rounded-xl p-1">
              <button onClick={() => setZoom(z => Math.max(10, z - 10))} className="p-1 text-zentry-text-2 hover:text-zentry-text-1"><ZoomOut className="w-4 h-4" /></button>
              <span className="text-xs font-mono font-bold text-zentry-text-1 w-10 text-center">{zoom}%</span>
              <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="p-1 text-zentry-text-2 hover:text-zentry-text-1"><ZoomIn className="w-4 h-4" /></button>
            </div>
          )}
          
          <button 
            onClick={handleExport}
            className="hidden sm:flex items-center gap-2 text-xs font-bold text-zentry-text-1 bg-zentry-bg border border-zentry-border px-3 py-2 rounded-xl transition-colors hover:bg-zentry-card"
          >
            <Download className="w-4 h-4 text-zentry-accent" /> Exportar
          </button>
          
          <button 
            onClick={handleSave}
            disabled={isSaving || saved}
            className={`flex items-center gap-2 text-xs font-extrabold px-5 py-2 rounded-xl transition-all shadow-md ${
              saved ? 'bg-emerald-500 text-white' : 'text-zentry-bg bg-zentry-text-1 hover:opacity-90'
            }`}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Renderizado Dinámico según la Modalidad Seleccionada */}
      <div className="flex-1 flex overflow-hidden">
        {fileType === 'canvas' && renderCanvasWorkspace()}
        {fileType === 'document' && renderDocumentWorkspace()}
        {fileType === 'image' && renderImageWorkspace()}
        {(fileType === 'video' || fileType === 'audio') && renderMediaWorkspace()}
      </div>

    </div>
  );
}

function ToolButton({ icon: Icon, tool, active, onClick }: { icon: ElementType, tool: Tool, active: Tool, onClick: (t: Tool) => void }) {
  return (
    <button 
      onClick={() => onClick(tool)} 
      className={`p-2.5 rounded-xl transition-all ${
        active === tool 
          ? 'bg-zentry-accent text-white shadow-lg shadow-zentry-accent/20' 
          : 'text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-bg'
      }`} 
      title={tool}
    >
      <Icon className="w-5 h-5" />
    </button>
  )
}


