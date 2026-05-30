import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://rfvaayygjfmrhkpzxzmk.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmdmFheXlnamZtcmhrcHp4em1rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA0MTE0NywiZXhwIjoyMDk1NjE3MTQ3fQ.nqNAgDG1exl9gHFPcyMt1BXQihRkW7U1cgurhsalxK8'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const users = [
  { name: 'Aninha',    email: 'elisaknauft@gmail.com',         password: 'senha123' },
  { name: 'Nely',      email: 'nely.knauft@gmail.com',         password: 'senha123' },
  { name: 'Guilherme', email: 'guilhermeknauft@gmail.com',     password: 'senha123' },
  { name: 'Maria',     email: 'mariaknauftnogueira@gmail.com', password: 'senha123' },
  { name: 'Clara',     email: 'claraknauft@gmail.com',         password: 'senha123' },
]

for (const u of users) {
  process.stdout.write(`Creating ${u.name} (${u.email})... `)

  // 1. Create auth user
  const { data, error } = await supabase.auth.admin.createUser({
    email: u.email,
    password: u.password,
    email_confirm: true,   // skip confirmation email
  })

  if (error) {
    console.log(`❌ Auth error: ${error.message}`)
    continue
  }

  const userId = data.user.id

  // 2. Upsert into public.users (trigger may have already created the row)
  const { error: profileError } = await supabase.from('users').upsert({
    id: userId,
    name: u.name,
    is_admin: false,
    onboarding_completed: false,
  }, { onConflict: 'id' })

  if (profileError) {
    console.log(`⚠️  Profile error: ${profileError.message}`)
  }

  // 3. Ensure streak row exists
  await supabase.from('streaks').upsert({
    user_id: userId,
    current_streak: 0,
    longest_streak: 0,
    last_checkin_date: null,
  }, { onConflict: 'user_id' })

  // 4. Ensure points row exists
  await supabase.from('points').upsert({
    user_id: userId,
    total_points: 0,
    monthly_points: 0,
  }, { onConflict: 'user_id' })

  console.log(`✅ Done (id: ${userId})`)
}

console.log('\nAll done! Family members can now log in at your app URL.')
