'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Camera, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getInitials, cn } from '@/lib/utils'
import type { User } from '@/types'

interface AvatarProps {
  user: Pick<User, 'id' | 'name' | 'avatar_url'>
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  editable?: boolean
  onUpload?: (url: string) => void
}

const SIZE_MAP = {
  sm: { container: 'w-8 h-8',   text: 'text-xs',  camera: 'w-3 h-3' },
  md: { container: 'w-10 h-10', text: 'text-sm',  camera: 'w-3.5 h-3.5' },
  lg: { container: 'w-14 h-14', text: 'text-lg',  camera: 'w-4 h-4' },
  xl: { container: 'w-20 h-20', text: 'text-2xl', camera: 'w-5 h-5' },
}

const BG_COLORS = [
  'bg-[#1D9E75]/25 text-[#2ECC8A]',
  'bg-[#E0A800]/25 text-[#FFE566]',
  'bg-[#2ECC8A]/20 text-[#A8F0D0]',
  'bg-[#FFE566]/15 text-[#E0A800]',
  'bg-[#A8F0D0]/15 text-[#1D9E75]',
  'bg-[#092920]/60 text-[#6DD4A8]',
]

function colorForName(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return BG_COLORS[Math.abs(hash) % BG_COLORS.length]
}

export default function Avatar({ user, size = 'md', className, editable = false, onUpload }: AvatarProps) {
  const { container, text, camera } = SIZE_MAP[size]
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [localUrl, setLocalUrl] = useState<string | null>(null)
  const supabase = createClient()

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    // Preview immediately
    setLocalUrl(URL.createObjectURL(file))

    const ext = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (!uploadError) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const url = `${data.publicUrl}?t=${Date.now()}`

      await supabase.from('users').update({ avatar_url: url }).eq('id', user.id)
      onUpload?.(url)
    }
    setUploading(false)
  }

  const displayUrl = localUrl ?? user.avatar_url
  const colorClass = colorForName(user.name)

  const avatarContent = displayUrl ? (
    <div className={cn('relative rounded-full overflow-hidden flex-shrink-0', container, className)}>
      <Image src={displayUrl} alt={user.name} fill className="object-cover" unoptimized />
    </div>
  ) : (
    <div className={cn(
      'rounded-full flex-shrink-0 flex items-center justify-center font-bold flex-shrink-0',
      container, text, colorClass, className
    )}>
      {getInitials(user.name)}
    </div>
  )

  if (!editable) return avatarContent

  return (
    <div className="relative flex-shrink-0 group cursor-pointer" onClick={() => fileRef.current?.click()}>
      {avatarContent}

      {/* Camera badge */}
      <div className={cn(
        'absolute -bottom-0.5 -right-0.5 rounded-full flex items-center justify-center border-2',
        size === 'xl' ? 'w-7 h-7' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
      )} style={{ background: '#1D9E75', borderColor: '#0D3B2E' }}>
        {uploading
          ? <Loader2 className={cn(camera, 'text-white animate-spin')} />
          : <Camera className={cn(camera, 'text-white')} />
        }
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  )
}
