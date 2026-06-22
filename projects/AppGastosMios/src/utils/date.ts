import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export function currentMonthKey(): string {
  return format(new Date(), 'yyyy-MM')
}

export function monthKeyToLabel(key: string): string {
  const [year, month] = key.split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)
  return format(date, 'MMMM yyyy', { locale: es })
}

export function formatDate(iso: string): string {
  return format(parseISO(iso), "d MMM, HH:mm", { locale: es })
}

export function formatShortDate(iso: string): string {
  return format(parseISO(iso), "d/MM/yyyy", { locale: es })
}

export function nowISO(): string {
  return new Date().toISOString()
}

export function monthKeyForDay(dayOfMonth: number): string {
  const now = new Date()
  const day = Math.min(dayOfMonth, new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate())
  const date = new Date(now.getFullYear(), now.getMonth(), day)
  return date.toISOString()
}
