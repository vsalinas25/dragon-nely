import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatInTimeZone } from 'date-fns-tz'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Brazil timezone (UTC-3)
export const TZ = 'America/Sao_Paulo'

export function todayInBrazil(): string {
  return formatInTimeZone(new Date(), TZ, 'yyyy-MM-dd')
}

export function formatDateBR(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date
  return format(d, 'dd/MM/yyyy')
}

export function formatTimeBR(date: string | Date): string {
  return formatInTimeZone(new Date(date), TZ, 'HH:mm')
}

export function greetingText(name: string): string {
  const hour = parseInt(formatInTimeZone(new Date(), TZ, 'HH'))
  if (hour < 12) return `Bom dia, ${name}! 🌅`
  if (hour < 18) return `Boa tarde, ${name}! ☀️`
  return `Boa noite, ${name}! 🌙`
}

export function formatPoints(pts: number | undefined | null): string {
  return (pts ?? 0).toLocaleString('pt-BR')
}

export function weightChangePct(start: number, current: number): number {
  if (start === 0) return 0
  return ((current - start) / start) * 100
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function timeAgo(date: string): string {
  const now = new Date()
  const then = new Date(date)
  const diff = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (diff < 60) return 'agora mesmo'
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `há ${Math.floor(diff / 3600)}h`
  return `há ${Math.floor(diff / 86400)} dias`
}
