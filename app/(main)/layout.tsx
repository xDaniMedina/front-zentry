import LeftSidebar from "@/components/feed/LeftSidebar";
import RightSidebar from "@/components/feed/RightSidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-zentry-bg text-zentry-text-1 justify-center w-full selection:bg-zentry-accent/20">
      <div className="flex w-full max-w-[1500px] justify-between">
        
        {/* 1. BARRA IZQUIERDA: Oculta en móvil (<768px), compacta en tablet (768-1024px), completa en desktop (>1024px) */}
        <aside className="hidden md:flex w-[76px] lg:w-[240px] xl:w-[270px] shrink-0 sticky top-0 h-screen overflow-y-auto hide-scrollbar border-r border-zentry-border z-30">
          <LeftSidebar />
        </aside>

        {/* 2. CONTENIDO CENTRAL (Feed / Perfil / Explorar): Fluido con padding adaptable */}
        <main className="flex-1 w-full min-w-0 max-w-3xl mx-auto overflow-x-hidden bg-zentry-bg px-3 sm:px-6 lg:px-8 pb-24 md:pb-8">
          {children}
        </main>

        {/* 3. BARRA DERECHA: Oculta en móvil y tablet (<1200px / xl), visible en pantallas grandes */}
        <aside className="hidden xl:flex w-[300px] 2xl:w-[330px] shrink-0 sticky top-0 h-screen overflow-y-auto hide-scrollbar border-l border-zentry-border z-30">
          <RightSidebar />
        </aside>
        
      </div>
    </div>
  )
}