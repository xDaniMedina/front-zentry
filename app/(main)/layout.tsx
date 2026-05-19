import Navbar from '@/components/shared/Navbar'
import { createClient } from '@/lib/supabase/server'
import { Toaster } from 'sonner';
import { redirect } from 'next/navigation'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar user={user} />
      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
        <Toaster theme="dark" position="bottom-right" richColors />
      </main>
    </div>
  )
}
