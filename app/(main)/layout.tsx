import LeftSidebar from "@/components/feed/LeftSidebar";
import RightSidebar from "@/components/feed/RightSidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-zentry-bg text-zentry-text-1 justify-center w-full">
      {/* max-w-[1400px] contiene toda la app, justify-between separa las columnas */}
      <div className="flex w-full max-w-[1400px] justify-between">
        
        {/* 1. BARRA IZQUIERDA (Controlamos el ancho solo desde aquí) */}
        <div className="hidden md:flex w-[80px] lg:w-[260px] shrink-0 sticky top-0 h-screen overflow-y-auto hide-scrollbar border-r border-zentry-border">
          <LeftSidebar />
        </div>

        {/* 2. CONTENIDO CENTRAL (Feed / Perfil) */}
        {/* max-w-2xl asegura que el centro nunca crezca de más, protegiendo a la barra derecha */}
        <main className="flex-1 w-full max-w-2xl mx-auto overflow-x-hidden bg-zentry-bg pb-24 md:pb-0">
          {children}
        </main>

        {/* 3. BARRA DERECHA */}
        {/* Cambié xl:flex a lg:flex para que aparezca en más pantallas de laptops normales */}
        <div className="hidden lg:flex w-[300px] shrink-0 sticky top-0 h-screen overflow-y-auto hide-scrollbar border-l border-zentry-border">
          <RightSidebar />
        </div>
        
      </div>
    </div>
  )
}