import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BottomNav from '@/components/shared/BottomNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F8FEFB' }}>
      <main className="flex-1 max-w-md mx-auto w-full">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
