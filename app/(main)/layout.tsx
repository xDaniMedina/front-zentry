import PresencePing from "@/components/shared/PresencePing";
import LeftSidebar from "@/components/feed/LeftSidebar";
import RightSidebar from "@/components/feed/RightSidebar";
import ThemeAmbientBackground from "@/components/shared/ThemeAmbientBackground";
import AchievementWatcher from "@/components/shared/AchievementWatcher";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-zentry-bg text-zentry-text-1 justify-center w-full selection:bg-zentry-accent/20 relative">
      {/* Fondo ambiental interactivo basado en el tema equipado en la tienda */}
      <ThemeAmbientBackground />

      <div className="flex w-full max-w-[1500px] justify-between relative z-10">
        
        {/* 1. BARRA IZQUIERDA: 72px (solo iconos) en tablet, 220-250px con textos en laptop/desktop */}
        <aside className="hidden md:flex w-[72px] lg:w-[220px] xl:w-[250px] shrink-0 sticky top-0 h-screen overflow-y-auto hide-scrollbar border-r border-zentry-border/80 z-30 bg-zentry-bg/40 backdrop-blur-sm">
          <LeftSidebar />
        </aside>

        {/* 2. CONTENIDO CENTRAL: min-w-0 evita que medios/textos largos desborden al hacer zoom */}
        <main className="flex-1 w-full min-w-0 max-w-5xl mx-auto overflow-x-hidden px-3 sm:px-5 lg:px-6 pb-24 md:pb-8 relative">
          <PresencePing />
          <AchievementWatcher />
          {children}
        </main>

        {/* 3. BARRA DERECHA: desde 1280px (xl) con ancho fluido; con zoom alto (<1280px) se oculta y el
            contenido central ocupa el espacio. Sus modales usan portal, así que no quedan recortados. */}
        <aside className="hidden xl:flex w-[clamp(260px,20vw,300px)] shrink-0 sticky top-0 h-screen overflow-y-auto hide-scrollbar border-l border-zentry-border/80 z-30 bg-zentry-bg/40 backdrop-blur-sm">
          <RightSidebar />
        </aside>
        
      </div>
    </div>
  )
}
