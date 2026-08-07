import LeftSidebar from "@/components/feed/LeftSidebar";
import RightSidebar from "@/components/feed/RightSidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  
  const sidebarMockData = {
    username: "danielarte",
    discipline: "Ilustración Digital",
    posts: 12,
    followers: 340,
    following: 89,
    coins: 285,
    coinsToday: 15
  };

  return (
    <div className="flex min-h-screen bg-zentry-bg text-zentry-text-1">
      
      {/* 1. BARRA IZQUIERDA */}
      <div className="hidden md:flex w-64 lg:w-72 border-r border-zentry-border shrink-0 sticky top-0 h-screen overflow-y-auto hide-scrollbar">
        <LeftSidebar {...sidebarMockData} />
      </div>

      {/* 2. CONTENIDO CENTRAL */}
      <main className="flex-1 min-w-0 overflow-x-hidden bg-zentry-bg">
        {children}
      </main>

      {/* 3. BARRA DERECHA */}
      <div className="hidden xl:flex w-80 border-l border-zentry-border shrink-0 sticky top-0 h-screen overflow-y-auto hide-scrollbar">
        <RightSidebar />
      </div>

    </div>
  )
}