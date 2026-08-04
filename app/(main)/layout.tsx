// app/(main)/layout.tsx

// import { createClient } from '@/lib/supabase/server'
// import { redirect } from 'next/navigation'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  /* 
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }
  */
  const mockUser = {
    id: 'demo-user-123',
    email: 'dani@zentry.art',
    user_metadata: {
      username: 'danielarte',
      display_name: 'Daniel Artesano',
    }
  }

  return (
    <div className="min-h-screen bg-zentry-bg text-zentry-text-1">
      {/* Si le pasabas la prop 'user' al Sidebar o Navbar, pásale el mockUser */}
      {/* <Navbar user={mockUser} /> */}
      
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}