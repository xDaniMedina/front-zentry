"use client"

import { useState, useRef, useEffect, useTransition, ElementType } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  MousePointer2, PenTool, Type, Square, Circle, Eraser, 
  Layers, Download, Save, ArrowLeft, ZoomIn, ZoomOut, 
  Play, Pause, Scissors, SlidersHorizontal, Image as ImageIcon,
  Music, Video, Loader2, CheckCircle2, Settings2,
  Palette, Grid, Trash2, RotateCcw, RotateCw, FileText, AlignLeft, AlignCenter, 
  AlignRight, AlignJustify, Bold, Italic, Underline, Strikethrough, Heading1, Heading2, 
  List, ListOrdered, Quote, Code, Volume2, VolumeX, FastForward, Rewind,
  Pipette, PaintBucket, FlipHorizontal, FlipVertical, Crop, Sparkles,
  Undo2, Redo2, Plus, Minus, FileCode, Check, RefreshCw, Maximize2
} from "lucide-react";
import { toast } from "sonner";
import { saveStudioProjectAction } from "@/lib/actions/studio";
import { getImageUrl } from "@/lib/utils";
import { StudioProject } from "@/types";

type Tool = 'select' | 'pen' | 'pixel' | 'fill' | 'dropper' | 'text' | 'rect' | 'circle' | 'line' | 'eraser' | 'crop';
type RightTab = 'capas' | 'ajustes' | 'filtros';

const COLOR_PALETTES = {
  zentry: ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#FFFFFF', '#09090B'],
  cyberpunk: ['#00FFCC', '#FF0055', '#FFE600', '#0033FF', '#9900FF', '#FF6600', '#00FF66', '#111116'],
  arcade: ['#E03C28', '#FFFFFF', '#1B1E23', '#416EB3', '#F3A83B', '#3C8842', '#693D84', '#997577'],
  pastel: ['#FFB5E8', '#AFF8DB', '#BFFCC6', '#FFCBC1', '#DCD3FF', '#ACE7FF', '#FFF5BA', '#6E7783'],
};

interface EditorClientProps {
  canvasId: string;
  initialProject?: StudioProject;
}

export default function EditorClient({ canvasId, initialProject }: EditorClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileType = initialProject?.type || searchParams.get('type') || 'canvas'; 
  const queryTitle = searchParams.get('title');
  const decodedQueryTitle = queryTitle ? decodeURIComponent(queryTitle) : null;
  const initialTitleValue = initialProject?.title || decodedQueryTitle || (canvasId === 'new' || canvasId.startsWith('temp-') ? 'Obra sin título' : `Proyecto ${canvasId}`);
  
  // Estados Generales
  const [currentProjectId, setCurrentProjectId] = useState<string>(initialProject?.id || canvasId);
  const [title, setTitle] = useState(initialTitleValue);
  const [zoom, setZoom] = useState(100);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [rightTab, setRightTab] = useState<RightTab>(fileType === 'image' ? 'filtros' : 'capas');
  const [isPending, startTransition] = useTransition();

  // Estados de Dibujo y Lienzo (Canvas / Pixel Art)
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTool, setActiveTool] = useState<Tool>(fileType === 'image' ? 'crop' : 'pen');
  const [selectedPalette, setSelectedPalette] = useState<keyof typeof COLOR_PALETTES>('zentry');
  const [selectedColor, setSelectedColor] = useState<string>('#8B5CF6');
  const [strokeWidth, setStrokeWidth] = useState<number>(6);
  const [isPixelArtMode, setIsPixelArtMode] = useState<boolean>(initialProject?.metadata?.isPixelArtMode || false);
  const [gridSize, setGridSize] = useState<number>(16);
  const [mirrorMode, setMirrorMode] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Historial Undo / Redo
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState<number>(-1);

  // Estados de Edición de Documento (Texto Estructurado)
  const [docContent, setDocContent] = useState<string>(
    initialProject?.content || `# ${initialTitleValue}\n\nComienza a redactar tu guión, notas de diseño o manifiesto creativo con formato enriquecido...`
  );
  const [docAlignment, setDocAlignment] = useState<'left' | 'center' | 'right' | 'justify'>('left');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Estados de Editor de Fotografía / Imagen (Filtros & Recorte)
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [blur, setBlur] = useState<number>(0);
  const [sepia, setSepia] = useState<number>(0);
  const [hueRotate, setHueRotate] = useState<number>(0);
  const [invert, setInvert] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // Estados de Recorte (Crop)
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [cropAspect, setCropAspect] = useState<'free' | '1:1' | '16:9' | '9:16' | '4:5'>('free');
  const [cropBox, setCropBox] = useState<{ x: number; y: number; w: number; h: number }>({ x: 60, y: 50, w: 480, h: 360 });

  // Estados de Reproducción Multimedia (Video / Audio)
  const [isPlaying, setIsPlaying] = useState(false);
  const [mediaProgress, setMediaProgress] = useState(0); 
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [trimIn, setTrimIn] = useState<number>(0);
  const [trimOut, setTrimOut] = useState<number>(100);
  const [splitPoints, setSplitPoints] = useState<number[]>([]);

  // Inicializar Canvas (con imagen previa del backend si existe)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (initialProject?.thumbnail_url) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory([snap]);
        setHistoryStep(0);
      };
      img.onerror = () => {
        if (history.length === 0) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          const initialSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
          setHistory([initialSnapshot]);
          setHistoryStep(0);
        }
      };
      img.src = getImageUrl(initialProject.thumbnail_url);
      return;
    }

    if (history.length === 0) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const initialSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([initialSnapshot]);
      setHistoryStep(0);
    }
  }, [initialProject?.thumbnail_url]);

  // Intervalo de reproducción Multimedia
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setMediaProgress((prev) => {
        if (prev >= trimOut) {
          setIsPlaying(false);
          return trimIn;
        }
        return prev + (0.5 * playbackSpeed);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, trimIn, trimOut]);

  // Guardar estado en Historial
  const pushCanvasState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(snapshot);
    if (newHistory.length > 25) newHistory.shift();
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyStep > 0) {
      const prevStep = historyStep - 1;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.putImageData(history[prevStep], 0, 0);
      setHistoryStep(prevStep);
      toast.info("Acción deshecha");
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      const nextStep = historyStep + 1;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.putImageData(history[nextStep], 0, 0);
      setHistoryStep(nextStep);
      toast.info("Acción rehecha");
    }
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoordinates(e);

    if (activeTool === 'dropper') {
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1)}`;
      setSelectedColor(hex);
      setActiveTool('pen');
      toast.success(`Color tomado: ${hex}`);
      return;
    }

    if (activeTool === 'fill') {
      ctx.fillStyle = selectedColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      pushCanvasState();
      toast.info("Lienzo rellenado");
      return;
    }

    if (activeTool === 'pen' || activeTool === 'eraser' || activeTool === 'pixel') {
      setIsDrawing(true);
      if (isPixelArtMode || activeTool === 'pixel') {
        drawPixel(x, y);
        if (mirrorMode) drawPixel(canvas.width - x, y);
      } else {
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoordinates(e);

    if (isPixelArtMode || activeTool === 'pixel') {
      drawPixel(x, y);
      if (mirrorMode) drawPixel(canvas.width - x, y);
      return;
    }

    ctx.strokeStyle = activeTool === 'eraser' ? '#FFFFFF' : selectedColor;
    ctx.lineWidth = activeTool === 'eraser' ? strokeWidth * 2.5 : strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();

    if (mirrorMode) {
      ctx.moveTo(canvas.width - x, y);
      ctx.lineTo(canvas.width - x, y);
      ctx.stroke();
    }
  };

  const drawPixel = (rawX: number, rawY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = gridSize;
    const snapX = Math.floor(rawX / size) * size;
    const snapY = Math.floor(rawY / size) * size;

    ctx.fillStyle = activeTool === 'eraser' ? '#FFFFFF' : selectedColor;
    ctx.fillRect(snapX, snapY, size, size);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      pushCanvasState();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    pushCanvasState();
    toast.info("Lienzo restablecido en blanco");
  };

  const applyCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y, w, h } = cropBox;
    if (w <= 10 || h <= 10) {
      toast.error("Área de recorte inválida");
      return;
    }

    const croppedData = ctx.getImageData(x, y, w, h);
    canvas.width = w;
    canvas.height = h;
    ctx.putImageData(croppedData, 0, 0);
    setIsCropping(false);
    pushCanvasState();
    toast.success(`Lienzo recortado a ${w}x${h}px`);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          canvas.width = img.width > 1200 ? 1200 : img.width;
          canvas.height = (img.height * canvas.width) / img.width;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setImageSrc(event.target?.result as string);
          pushCanvasState();
          toast.success("Imagen cargada con éxito");
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBlur(0);
    setSepia(0);
    setHueRotate(0);
    setInvert(0);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    toast.info("Filtros restablecidos");
  };

  const applyDocFormat = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = docContent.substring(start, end);
    const replacement = `${prefix}${selected || 'texto'}${suffix}`;

    const newContent = docContent.substring(0, start) + replacement + docContent.substring(end);
    setDocContent(newContent);
  };

  const handleSave = () => {
    setIsSaving(true);

    const canvas = canvasRef.current;
    const dataUrl = canvas ? canvas.toDataURL('image/png') : undefined;

    startTransition(async () => {
      try {
        const isNumeric = !isNaN(Number(currentProjectId)) && Number(currentProjectId) > 0;
        const res = await saveStudioProjectAction({
          id: isNumeric ? currentProjectId : undefined,
          title,
          type: fileType,
          content: fileType === 'document' ? docContent : undefined,
          imageBlob: dataUrl,
          metadata: {
            zoom,
            aspectRatio,
            isPixelArtMode,
            lastEdited: new Date().toISOString()
          }
        });

        if (res.success) {
          if (res.data?.id && String(res.data.id) !== currentProjectId) {
            const newId = String(res.data.id);
            setCurrentProjectId(newId);
            window.history.replaceState(null, '', `/studio/${newId}?type=${fileType}`);
          }
          setIsSaving(false);
          setSaved(true);
          toast.success("¡Proyecto guardado con éxito!");
          setTimeout(() => setSaved(false), 2500);
        } else {
          setIsSaving(false);
          toast.error(res.error || "No se pudo guardar el proyecto");
        }
      } catch (err) {
        setIsSaving(false);
        toast.error("Error al sincronizar con el servidor");
      }
    });
  };

  const handleExport = () => {
    if (fileType === 'document') {
      const blob = new Blob([docContent], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '_')}.md`;
      a.click();
      toast.success("Documento descargado (.md)");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${title.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success("Imagen exportada (.png)");
  };

  // --- PANEL DERECHO UNIFICADO ---
  const renderRightPanel = () => (
    <div className="hidden lg:flex w-72 border-l border-zentry-border bg-zentry-card/95 backdrop-blur-md flex-col shrink-0">
      <div className="flex border-b border-zentry-border">
        {fileType === 'image' && (
          <button 
            onClick={() => setRightTab('filtros')}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition-colors ${rightTab === 'filtros' ? 'text-zentry-text-1 border-b-2 border-zentry-accent' : 'text-zentry-text-2 hover:text-zentry-text-1'}`}
          >
            Filtros
          </button>
        )}
        <button 
          onClick={() => setRightTab('capas')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition-colors ${rightTab === 'capas' ? 'text-zentry-text-1 border-b-2 border-zentry-accent' : 'text-zentry-text-2 hover:text-zentry-text-1'}`}
        >
          Capas
        </button>
        <button 
          onClick={() => setRightTab('ajustes')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition-colors ${rightTab === 'ajustes' ? 'text-zentry-text-1 border-b-2 border-zentry-accent' : 'text-zentry-text-2 hover:text-zentry-text-1'}`}
        >
          Ajustes
        </button>
      </div>

      <div className="flex-1 p-5 flex flex-col gap-5 overflow-y-auto custom-scrollbar">
        {rightTab === 'filtros' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-zentry-text-1 flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-zentry-accent" /> Filtros en Vivo
              </span>
              <button onClick={resetFilters} className="text-[11px] text-zentry-text-2 hover:text-zentry-accent font-bold transition-colors">
                Restablecer
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between text-zentry-text-2 mb-1">
                  <span className="font-semibold">Brillo</span>
                  <span className="font-mono text-zentry-text-1">{brightness}%</span>
                </div>
                <input type="range" min={20} max={200} value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className="w-full accent-zentry-accent h-1.5 bg-zentry-bg rounded-lg cursor-pointer" />
              </div>

              <div>
                <div className="flex justify-between text-zentry-text-2 mb-1">
                  <span className="font-semibold">Contraste</span>
                  <span className="font-mono text-zentry-text-1">{contrast}%</span>
                </div>
                <input type="range" min={20} max={200} value={contrast} onChange={(e) => setContrast(Number(e.target.value))} className="w-full accent-zentry-accent h-1.5 bg-zentry-bg rounded-lg cursor-pointer" />
              </div>

              <div>
                <div className="flex justify-between text-zentry-text-2 mb-1">
                  <span className="font-semibold">Saturación</span>
                  <span className="font-mono text-zentry-text-1">{saturation}%</span>
                </div>
                <input type="range" min={0} max={200} value={saturation} onChange={(e) => setSaturation(Number(e.target.value))} className="w-full accent-zentry-accent h-1.5 bg-zentry-bg rounded-lg cursor-pointer" />
              </div>

              <div>
                <div className="flex justify-between text-zentry-text-2 mb-1">
                  <span className="font-semibold">Tono (Hue)</span>
                  <span className="font-mono text-zentry-text-1">{hueRotate}°</span>
                </div>
                <input type="range" min={0} max={360} value={hueRotate} onChange={(e) => setHueRotate(Number(e.target.value))} className="w-full accent-zentry-accent h-1.5 bg-zentry-bg rounded-lg cursor-pointer" />
              </div>

              <div>
                <div className="flex justify-between text-zentry-text-2 mb-1">
                  <span className="font-semibold">Desenfoque (Blur)</span>
                  <span className="font-mono text-zentry-text-1">{blur}px</span>
                </div>
                <input type="range" min={0} max={20} value={blur} onChange={(e) => setBlur(Number(e.target.value))} className="w-full accent-zentry-accent h-1.5 bg-zentry-bg rounded-lg cursor-pointer" />
              </div>

              <div>
                <div className="flex justify-between text-zentry-text-2 mb-1">
                  <span className="font-semibold">Sepia</span>
                  <span className="font-mono text-zentry-text-1">{sepia}%</span>
                </div>
                <input type="range" min={0} max={100} value={sepia} onChange={(e) => setSepia(Number(e.target.value))} className="w-full accent-zentry-accent h-1.5 bg-zentry-bg rounded-lg cursor-pointer" />
              </div>
            </div>

            <div className="h-px bg-zentry-border my-2" />

            <div className="space-y-2">
              <span className="text-xs font-bold text-zentry-text-2 uppercase tracking-wider">Orientación</span>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setRotation((r) => (r + 90) % 360)} className="p-2.5 bg-zentry-bg border border-zentry-border rounded-xl text-xs font-bold text-zentry-text-1 hover:border-zentry-accent flex items-center justify-center gap-1.5 transition-colors">
                  <RotateCw className="w-3.5 h-3.5" /> Rotar 90°
                </button>
                <button onClick={() => setFlipH(!flipH)} className="p-2.5 bg-zentry-bg border border-zentry-border rounded-xl text-xs font-bold text-zentry-text-1 hover:border-zentry-accent flex items-center justify-center gap-1.5 transition-colors">
                  <FlipHorizontal className="w-3.5 h-3.5" /> Espejo
                </button>
              </div>
            </div>
          </div>
        )}

        {rightTab === 'capas' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zentry-bg border border-zentry-accent/40 text-xs font-bold text-zentry-text-1 shadow-sm">
              <span className="flex items-center gap-2"><Layers className="w-4 h-4 text-zentry-accent" /> Capa de Dibujo</span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">Activa</span>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zentry-bg/60 hover:bg-zentry-bg text-xs font-medium text-zentry-text-2 transition-colors cursor-pointer border border-zentry-border">
              <span className="flex items-center gap-2"><ImageIcon className="w-4 h-4 text-zentry-text-2" /> Fondo Blanco</span>
              <span className="text-[10px] text-zinc-500 font-mono">800x600</span>
            </div>
          </div>
        )}

        {rightTab === 'ajustes' && (
          <div className="flex flex-col gap-4 text-xs">
            <div>
              <label className="font-extrabold text-zentry-text-2 mb-1.5 block uppercase tracking-wider">Formato de Exportación</label>
              <select className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-3 py-2.5 text-zentry-text-1 font-semibold focus:outline-none focus:border-zentry-accent">
                <option>PNG (Máxima fidelidad)</option>
                <option>WEBP (Web Ultra Rápido)</option>
                <option>JPEG (Comprimido)</option>
                <option>PDF (Documento Impreso)</option>
              </select>
            </div>

            <div>
              <label className="font-extrabold text-zentry-text-2 mb-1.5 block uppercase tracking-wider">Detalles de Recompensa</label>
              <div className="p-4 bg-zentry-bg border border-zentry-border rounded-2xl space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-zentry-text-2">Tipo de Proyecto:</span>
                  <span className="font-bold text-zentry-text-1 uppercase bg-zentry-card px-2 py-0.5 rounded-md border border-zentry-border">{fileType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zentry-text-2">Recompensa Zentry:</span>
                  <span className="font-extrabold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">+50 Coins</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // --- ENTORNOS DE TRABAJO ---

  // 1. LIENZO DIGITAL & PIXEL ART
  const renderCanvasWorkspace = () => (
    <>
      <div className="w-16 border-r border-zentry-border bg-zentry-card/90 backdrop-blur-md flex flex-col items-center py-4 gap-2 shrink-0 overflow-y-auto custom-scrollbar">
        <ToolBtn icon={MousePointer2} tool="select" active={activeTool} onClick={setActiveTool} label="Seleccionar" />
        <ToolBtn icon={PenTool} tool="pen" active={activeTool} onClick={setActiveTool} label="Pincel" />
        <ToolBtn icon={Grid} tool="pixel" active={activeTool} onClick={setActiveTool} label="Lápiz Pixel" />
        <ToolBtn icon={PaintBucket} tool="fill" active={activeTool} onClick={setActiveTool} label="Rellenar Lienzo" />
        <ToolBtn icon={Pipette} tool="dropper" active={activeTool} onClick={setActiveTool} label="Cuentagotas" />
        <ToolBtn icon={Eraser} tool="eraser" active={activeTool} onClick={setActiveTool} label="Borrador" />
        <ToolBtn icon={Crop} tool="crop" active={activeTool} onClick={() => { setActiveTool('crop'); setIsCropping(!isCropping); }} label="Recortar Lienzo" />
        
        <div className="w-8 h-px bg-zentry-border my-1.5" />

        <button 
          onClick={() => setIsPixelArtMode(!isPixelArtMode)}
          className={`p-2.5 rounded-2xl transition-all ${isPixelArtMode ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'text-zentry-text-2 hover:bg-zentry-bg'}`}
          title="Modo Cuadrícula Pixel Art"
        >
          <Grid className="w-4 h-4" />
        </button>

        <button 
          onClick={() => setMirrorMode(!mirrorMode)}
          className={`p-2.5 rounded-2xl transition-all ${mirrorMode ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-zentry-text-2 hover:bg-zentry-bg'}`}
          title="Modo Espejo Horizontal"
        >
          <FlipHorizontal className="w-4 h-4" />
        </button>

        <button onClick={handleUndo} disabled={historyStep <= 0} className="p-2.5 text-zentry-text-2 hover:text-zentry-text-1 disabled:opacity-25 rounded-xl" title="Deshacer (Ctrl+Z)">
          <Undo2 className="w-4 h-4" />
        </button>
        <button onClick={handleRedo} disabled={historyStep >= history.length - 1} className="p-2.5 text-zentry-text-2 hover:text-zentry-text-1 disabled:opacity-25 rounded-xl" title="Rehacer (Ctrl+Y)">
          <Redo2 className="w-4 h-4" />
        </button>
        <button onClick={clearCanvas} className="p-2.5 text-zentry-text-2 hover:text-red-400 rounded-xl transition-colors" title="Limpiar Lienzo">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 bg-[#101014] relative overflow-auto flex flex-col items-center justify-center p-6 custom-scrollbar">
        
        {/* Barra Superior de Herramientas */}
        <div className="mb-4 bg-zentry-card border border-zentry-border px-4 py-2 rounded-2xl shadow-xl flex flex-wrap items-center gap-4 z-10">
          
          <div className="flex items-center gap-2">
            <select 
              value={selectedPalette} 
              onChange={(e) => setSelectedPalette(e.target.value as keyof typeof COLOR_PALETTES)}
              className="bg-zentry-bg border border-zentry-border text-zentry-text-1 text-xs font-bold rounded-xl px-2.5 py-1 focus:outline-none"
            >
              <option value="zentry">Paleta Zentry</option>
              <option value="cyberpunk">Cyberpunk 2099</option>
              <option value="arcade">Arcade 8-bit</option>
              <option value="pastel">Pastel Dream</option>
            </select>

            <div className="flex items-center gap-1.5">
              {COLOR_PALETTES[selectedPalette].map(c => (
                <button 
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={`w-5 h-5 rounded-full border border-white/20 transition-transform ${selectedColor === c ? 'scale-125 ring-2 ring-zentry-accent' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="h-4 w-px bg-zentry-border" />

          <div className="flex items-center gap-1.5 text-xs text-zentry-text-2 font-bold">
            <input 
              type="color" 
              value={selectedColor} 
              onChange={(e) => setSelectedColor(e.target.value)} 
              className="w-6 h-6 rounded-lg cursor-pointer bg-transparent border-0" 
            />
            <span className="font-mono uppercase text-[11px] text-zentry-text-1">{selectedColor}</span>
          </div>

          <div className="h-4 w-px bg-zentry-border" />

          <div className="flex items-center gap-2 text-xs font-bold text-zentry-text-2">
            <span>{isPixelArtMode ? 'Pixel:' : 'Grosor:'}</span>
            {isPixelArtMode ? (
              <select 
                value={gridSize} 
                onChange={(e) => setGridSize(Number(e.target.value))}
                className="bg-zentry-bg border border-zentry-border text-zentry-text-1 text-xs rounded-lg px-2 py-1 font-mono"
              >
                <option value={8}>8x8</option>
                <option value={16}>16x16</option>
                <option value={32}>32x32</option>
              </select>
            ) : (
              <input 
                type="range" 
                min={1} 
                max={50} 
                value={strokeWidth} 
                onChange={(e) => setStrokeWidth(Number(e.target.value))} 
                className="w-20 accent-zentry-accent" 
              />
            )}
            {!isPixelArtMode && <span className="text-zentry-text-1 w-6 font-mono">{strokeWidth}px</span>}
          </div>

          {isCropping && (
            <button 
              onClick={applyCrop} 
              className="px-3.5 py-1.5 bg-emerald-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1 shadow-md hover:bg-emerald-600 transition-colors"
            >
              <Check className="w-3.5 h-3.5" /> Aplicar Recorte
            </button>
          )}

        </div>

        {/* Contenedor del Canvas */}
        <div 
          className="shadow-2xl relative transition-transform duration-150 bg-white rounded-3xl overflow-hidden border border-zentry-border" 
          style={{ width: '800px', height: '600px', transform: `scale(${zoom / 100})` }}
        >
          {isPixelArtMode && (
            <div 
              className="absolute inset-0 opacity-20 pointer-events-none z-10" 
              style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: `${gridSize}px ${gridSize}px` }} 
            />
          )}
          {mirrorMode && (
            <div className="absolute top-0 bottom-0 left-1/2 w-px border-r border-dashed border-blue-500/50 pointer-events-none z-10" />
          )}

          {isCropping && (
            <div 
              className="absolute border-2 border-emerald-400 bg-emerald-400/15 pointer-events-none z-20 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]"
              style={{ left: `${cropBox.x}px`, top: `${cropBox.y}px`, width: `${cropBox.w}px`, height: `${cropBox.h}px` }}
            />
          )}

          <canvas 
            ref={canvasRef}
            width={800}
            height={600}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className={`w-full h-full ${activeTool === 'pen' || activeTool === 'pixel' ? 'cursor-crosshair' : activeTool === 'eraser' ? 'cursor-cell' : 'cursor-default'}`}
          />
        </div>
      </div>
      
      {renderRightPanel()}
    </>
  );

  // 2. DOCUMENTO DE TEXTO (NOTION / WORD ENRIQUECIDO)
  const renderDocumentWorkspace = () => {
    const wordCount = docContent.trim() ? docContent.trim().split(/\s+/).length : 0;
    const charCount = docContent.length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    return (
      <div className="flex-1 flex flex-col bg-zentry-bg">
        <div className="h-12 border-b border-zentry-border bg-zentry-card px-4 sm:px-6 flex items-center justify-between shrink-0 overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-1">
            <button onClick={() => applyDocFormat('**', '**')} className="p-2 text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-bg rounded-xl font-black" title="Negrita (**texto**)">
              <Bold className="w-4 h-4" />
            </button>
            <button onClick={() => applyDocFormat('*', '*')} className="p-2 text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-bg rounded-xl italic" title="Cursiva (*texto*)">
              <Italic className="w-4 h-4" />
            </button>
            <button onClick={() => applyDocFormat('<u>', '</u>')} className="p-2 text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-bg rounded-xl underline" title="Subrayado">
              <Underline className="w-4 h-4" />
            </button>
            <button onClick={() => applyDocFormat('~~', '~~')} className="p-2 text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-bg rounded-xl line-through" title="Tachado (~~texto~~)">
              <Strikethrough className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-zentry-border mx-1" />

            <button onClick={() => applyDocFormat('# ')} className="p-2 text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-bg rounded-xl font-extrabold" title="Título Principal (H1)">
              <Heading1 className="w-4 h-4" />
            </button>
            <button onClick={() => applyDocFormat('## ')} className="p-2 text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-bg rounded-xl font-extrabold" title="Subtítulo (H2)">
              <Heading2 className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-zentry-border mx-1" />

            <button onClick={() => applyDocFormat('- ')} className="p-2 text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-bg rounded-xl" title="Lista con Viñetas">
              <List className="w-4 h-4" />
            </button>
            <button onClick={() => applyDocFormat('1. ')} className="p-2 text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-bg rounded-xl" title="Lista Numerada">
              <ListOrdered className="w-4 h-4" />
            </button>
            <button onClick={() => applyDocFormat('> ')} className="p-2 text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-bg rounded-xl" title="Cita">
              <Quote className="w-4 h-4" />
            </button>
            <button onClick={() => applyDocFormat('```\n', '\n```')} className="p-2 text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-bg rounded-xl" title="Bloque de Código">
              <Code className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-zentry-border mx-1" />

            <button onClick={() => setDocAlignment('left')} className={`p-2 rounded-xl ${docAlignment === 'left' ? 'text-zentry-accent bg-zentry-bg' : 'text-zentry-text-2 hover:text-zentry-text-1'}`} title="Alinear Izquierda">
              <AlignLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setDocAlignment('center')} className={`p-2 rounded-xl ${docAlignment === 'center' ? 'text-zentry-accent bg-zentry-bg' : 'text-zentry-text-2 hover:text-zentry-text-1'}`} title="Centrar">
              <AlignCenter className="w-4 h-4" />
            </button>
            <button onClick={() => setDocAlignment('right')} className={`p-2 rounded-xl ${docAlignment === 'right' ? 'text-zentry-accent bg-zentry-bg' : 'text-zentry-text-2 hover:text-zentry-text-1'}`} title="Alinear Derecha">
              <AlignRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-zentry-text-2">
            <span>{wordCount} palabras</span>
            <span>{charCount} caracteres</span>
            <span className="text-zentry-accent font-bold">~{readTime} min lectura</span>
          </div>
        </div>

        <div className="flex-1 bg-[#101014] overflow-y-auto p-4 sm:p-8 flex justify-center custom-scrollbar">
          <div className="max-w-4xl w-full bg-zentry-card border border-zentry-border rounded-3xl p-6 sm:p-12 shadow-2xl min-h-[750px] flex flex-col space-y-6">
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Título del Documento..."
              data-gramm="false"
              data-gramm_editor="false"
              data-enable-grammarly="false"
              spellCheck={false}
              autoComplete="off"
              className="text-2xl sm:text-3xl font-black text-zentry-text-1 bg-transparent border-b border-zentry-border/50 pb-3 focus:outline-none focus:border-zentry-accent tracking-tight"
            />

            <textarea 
              ref={textareaRef}
              value={docContent}
              onChange={(e) => setDocContent(e.target.value)}
              placeholder="Comienza a redactar tu historia o guión..."
              data-gramm="false"
              data-gramm_editor="false"
              data-enable-grammarly="false"
              spellCheck={false}
              autoComplete="off"
              style={{ textAlign: docAlignment }}
              className="w-full flex-1 bg-transparent text-sm sm:text-base leading-relaxed text-zentry-text-1 focus:outline-none resize-none custom-scrollbar font-sans min-h-[500px]"
            />
          </div>
        </div>
      </div>
    );
  };

  // 3. EDITOR DE FOTOGRAFÍA / ARTE CON FILTROS Y RECORTE
  const renderImageWorkspace = () => (
    <>
      <div className="w-16 border-r border-zentry-border bg-zentry-card/90 backdrop-blur-md flex flex-col items-center py-4 gap-3 shrink-0">
        <input type="file" ref={imageInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
        <button onClick={() => imageInputRef.current?.click()} className="p-2.5 bg-zentry-accent text-white rounded-2xl shadow-md hover:opacity-90 transition-opacity" title="Cargar otra imagen">
          <Plus className="w-5 h-5" />
        </button>
        <button onClick={() => setRightTab('filtros')} className={`p-2.5 rounded-2xl transition-all ${rightTab === 'filtros' ? 'bg-zentry-bg text-zentry-accent' : 'text-zentry-text-2 hover:bg-zentry-bg'}`} title="Ajustes de Color">
          <SlidersHorizontal className="w-5 h-5" />
        </button>
        <button onClick={() => setIsCropping(!isCropping)} className={`p-2.5 rounded-2xl transition-all ${isCropping ? 'bg-emerald-500 text-white shadow-md' : 'text-zentry-text-2 hover:bg-zentry-bg'}`} title="Modo Recorte (Crop)">
          <Crop className="w-5 h-5" />
        </button>
        <button onClick={() => setRotation(r => (r + 90) % 360)} className="p-2.5 text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-bg rounded-2xl" title="Rotar 90°">
          <RotateCw className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 bg-[#101014] relative overflow-hidden flex flex-col items-center justify-center p-8">
        
        {isCropping && (
          <div className="mb-4 bg-zentry-card border border-zentry-border px-4 py-2 rounded-2xl flex items-center gap-3 shadow-xl z-20">
            <span className="text-xs font-extrabold text-zentry-text-1 flex items-center gap-1.5"><Crop className="w-4 h-4 text-emerald-400" /> Relación de Recorte:</span>
            {(['free', '1:1', '16:9', '9:16', '4:5'] as const).map(asp => (
              <button 
                key={asp}
                onClick={() => setCropAspect(asp)}
                className={`px-3 py-1 rounded-xl text-xs font-black uppercase transition-all ${cropAspect === asp ? 'bg-emerald-500 text-white shadow-sm' : 'bg-zentry-bg text-zentry-text-2 hover:text-zentry-text-1'}`}
              >
                {asp}
              </button>
            ))}
            <button onClick={applyCrop} className="ml-2 px-3.5 py-1 bg-emerald-500 text-white rounded-xl text-xs font-extrabold hover:bg-emerald-600 transition-colors">
              Aplicar
            </button>
          </div>
        )}

        <div 
          className="max-w-3xl w-full bg-zentry-card border border-zentry-border rounded-3xl flex items-center justify-center relative overflow-hidden shadow-2xl transition-all"
          style={{ 
            filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hueRotate}deg) blur(${blur}px) sepia(${sepia}%) invert(${invert}%)`,
            transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1}) scale(${zoom / 100})`
          }}
        >
          <canvas ref={canvasRef} width={800} height={600} className="w-full h-auto object-contain rounded-2xl" />
        </div>
      </div>

      {renderRightPanel()}
    </>
  );

  // 4. SUITE MULTIMEDIA: VIDEO & AUDIO CON LÍNEA DE TIEMPO
  const renderMediaWorkspace = () => {
    const totalSeconds = 180; 
    const currentSeconds = Math.floor((mediaProgress / 100) * totalSeconds);
    const formatTime = (secs: number) => {
      const m = Math.floor(secs / 60).toString().padStart(2, '0');
      const s = (secs % 60).toString().padStart(2, '0');
      return `00:${m}:${s}`;
    };

    const handleSplit = () => {
      if (!splitPoints.includes(mediaProgress)) {
        setSplitPoints([...splitPoints, mediaProgress].sort((a, b) => a - b));
        toast.info(`Corte fijado en ${formatTime(currentSeconds)}`);
      }
    };

    return (
      <div className="flex-1 flex flex-col bg-black/95">
        
        {/* Visor de Video / Audio */}
        <div className="flex-1 relative flex items-center justify-center p-6">
          <div className={`w-full max-w-2xl bg-zentry-card border border-zentry-border/50 rounded-3xl flex flex-col items-center justify-center gap-4 shadow-2xl relative overflow-hidden transition-all ${
            aspectRatio === '16:9' ? 'aspect-video' : aspectRatio === '9:16' ? 'aspect-[9/16] max-h-[420px]' : 'aspect-square max-h-[420px]'
          }`}>
            {fileType === 'video' ? (
              <Video className={`w-16 h-16 ${isPlaying ? 'text-zentry-accent animate-pulse' : 'text-zentry-text-2/40'}`} />
            ) : (
              <Music className={`w-16 h-16 ${isPlaying ? 'text-zentry-accent animate-pulse' : 'text-zentry-text-2/40'}`} />
            )}
            
            <p className="text-zentry-text-1 font-extrabold text-sm">
              {fileType === 'video' ? 'Monitor de Video HD' : 'Monitor de Audio Estéreo'} ({aspectRatio})
            </p>

            {fileType === 'audio' && (
              <div className="absolute bottom-6 left-8 right-8 h-14 flex items-end justify-center gap-1.5 opacity-70">
                {[...Array(28)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-2.5 rounded-t-full transition-all duration-150 ${isPlaying ? 'bg-zentry-accent' : 'bg-zentry-text-2/40'}`} 
                    style={{ height: isPlaying ? `${Math.floor(Math.random() * 85) + 15}%` : '20%' }} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Línea de Tiempo con Corte */}
        <div className="h-56 bg-zentry-card border-t border-zentry-border p-4 flex flex-col justify-between shrink-0">
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

              <button onClick={() => setMediaProgress(Math.max(trimIn, mediaProgress - 5))} className="p-2 text-zentry-text-2 hover:text-zentry-text-1 rounded-xl">
                <Rewind className="w-4 h-4" />
              </button>
              <button onClick={() => setMediaProgress(Math.min(trimOut, mediaProgress + 5))} className="p-2 text-zentry-text-2 hover:text-zentry-text-1 rounded-xl">
                <FastForward className="w-4 h-4" />
              </button>

              <div className="h-4 w-px bg-zentry-border mx-1" />

              <button 
                onClick={handleSplit} 
                className="px-3.5 py-1.5 bg-zentry-bg border border-zentry-border hover:border-zentry-accent text-zentry-text-1 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-colors"
                title="Dividir clip en el cabezal"
              >
                <Scissors className="w-3.5 h-3.5 text-zentry-accent" /> Dividir / Cortar
              </button>
            </div>

            <div className="flex items-center gap-3">
              <select 
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                className="bg-zentry-bg border border-zentry-border rounded-xl px-3 py-1 text-xs font-bold text-zentry-text-1 focus:outline-none"
              >
                <option value={0.5}>0.5x</option>
                <option value={1.0}>1.0x (Normal)</option>
                <option value={1.5}>1.5x</option>
                <option value={2.0}>2.0x</option>
              </select>

              {fileType === 'video' && (
                <select 
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as '16:9' | '9:16' | '1:1')}
                  className="bg-zentry-bg border border-zentry-border rounded-xl px-3 py-1 text-xs font-bold text-zentry-text-1 focus:outline-none"
                >
                  <option value="16:9">16:9 (Horizontal)</option>
                  <option value="9:16">9:16 (Shorts/Reels)</option>
                  <option value="1:1">1:1 (Cuadrado)</option>
                </select>
              )}

              <button onClick={() => setIsMuted(!isMuted)} className="p-2 text-zentry-text-2 hover:text-zentry-text-1 rounded-xl">
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div 
            className="h-24 bg-zentry-bg rounded-2xl border border-zentry-border relative flex flex-col justify-center overflow-hidden cursor-pointer shadow-inner p-2 gap-1.5" 
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              setMediaProgress((clickX / rect.width) * 100);
            }}
          >
            <div className={`h-8 rounded-xl relative overflow-hidden flex items-center px-3 ${fileType === 'video' ? 'bg-purple-600/30 border border-purple-500/40 text-purple-300' : 'bg-blue-600/30 border border-blue-500/40 text-blue-300'} text-[10px] font-bold`}>
              <span>{fileType === 'video' ? 'Pista de Video Principal' : 'Pista de Audio Master'}</span>
              {splitPoints.map(p => (
                <div key={p} className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 z-10" style={{ left: `${p}%` }} />
              ))}
            </div>

            <div className="h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold flex items-center px-3">
              <span>Pista de Efectos & Sonido Ambiente</span>
            </div>

            <div className="absolute top-0 bottom-0 w-1 bg-red-500 z-20 shadow-[0_0_10px_rgba(239,68,68,0.9)] pointer-events-none" style={{ left: `${mediaProgress}%` }} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-6rem)] sm:h-[calc(100vh-2rem)] flex flex-col bg-zentry-bg border border-zentry-border rounded-3xl overflow-hidden shadow-2xl mt-2 sm:mt-4">
      
      {/* Barra Superior del Editor */}
      <div className="h-14 border-b border-zentry-border bg-zentry-card flex items-center justify-between px-4 sm:px-6 shrink-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <button onClick={() => router.push('/studio')} className="text-zentry-text-2 hover:text-zentry-text-1 transition-colors p-1.5 rounded-xl hover:bg-zentry-bg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="h-4 w-px bg-zentry-border" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase px-2.5 py-1 rounded-xl bg-zentry-bg border border-zentry-border text-zentry-accent">
              {fileType}
            </span>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="bg-transparent font-extrabold text-sm sm:text-base text-zentry-text-1 focus:outline-none focus:border-b border-zentry-accent px-1 w-44 sm:w-64 truncate" 
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {(fileType === 'canvas' || fileType === 'image') && (
            <div className="hidden sm:flex items-center gap-1.5 bg-zentry-bg border border-zentry-border rounded-2xl p-1">
              <button onClick={() => setZoom(z => Math.max(10, z - 10))} className="p-1 text-zentry-text-2 hover:text-zentry-text-1 rounded-lg"><ZoomOut className="w-4 h-4" /></button>
              <span className="text-xs font-mono font-bold text-zentry-text-1 w-10 text-center">{zoom}%</span>
              <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="p-1 text-zentry-text-2 hover:text-zentry-text-1 rounded-lg"><ZoomIn className="w-4 h-4" /></button>
            </div>
          )}
          
          <button 
            onClick={handleExport}
            className="hidden sm:flex items-center gap-2 text-xs font-extrabold text-zentry-text-1 bg-zentry-bg border border-zentry-border px-3.5 py-2 rounded-2xl transition-colors hover:bg-zentry-card shadow-sm"
          >
            <Download className="w-4 h-4 text-zentry-accent" /> Exportar
          </button>
          
          <button 
            onClick={handleSave}
            disabled={isSaving || saved}
            className={`flex items-center gap-2 text-xs font-black px-5 py-2.5 rounded-2xl transition-all shadow-md ${
              saved ? 'bg-emerald-500 text-white' : 'text-zentry-bg bg-zentry-text-1 hover:opacity-90'
            }`}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Área Central del Editor */}
      <div className="flex-1 flex overflow-hidden">
        {fileType === 'canvas' && renderCanvasWorkspace()}
        {fileType === 'document' && renderDocumentWorkspace()}
        {fileType === 'image' && renderImageWorkspace()}
        {(fileType === 'video' || fileType === 'audio') && renderMediaWorkspace()}
      </div>

    </div>
  );
}

function ToolBtn({ icon: Icon, tool, active, onClick, label }: { icon: ElementType, tool: Tool, active: Tool, onClick: (t: Tool) => void, label: string }) {
  return (
    <button 
      onClick={() => onClick(tool)} 
      className={`p-2.5 rounded-2xl transition-all ${
        active === tool 
          ? 'bg-zentry-accent text-white shadow-lg shadow-zentry-accent/30' 
          : 'text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-bg'
      }`} 
      title={label}
    >
      <Icon className="w-4 h-4" />
    </button>
  )
}
