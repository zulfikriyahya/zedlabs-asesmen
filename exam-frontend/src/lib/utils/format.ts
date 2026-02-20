import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

export function formatDate(iso: string, fmt = 'dd MMM yyyy'): string {
  return format(parseISO(iso), fmt, { locale: localeId })
}

export function formatDateTime(iso: string): string {
  return format(parseISO(iso), 'dd MMM yyyy, HH:mm', { locale: localeId })
}

export function formatRelative(iso: string): string {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: localeId })
}

export function formatScore(score: number | null, max: number | null): string {
  if (score === null || max === null) return '-'
  return `${score}/${max} (${Math.round((score / max) * 100)}%)`
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`
}
