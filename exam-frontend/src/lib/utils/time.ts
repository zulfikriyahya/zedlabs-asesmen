// src/lib/utils/time.ts
import { formatDistanceToNow, format, differenceInSeconds } from 'date-fns';

export function formatTimeRemaining(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours} jam ${minutes} menit`;
  }
  
  return `${minutes} menit`;
}

export function formatRelativeTime(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), 'dd/MM/yyyy HH:mm');
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'dd/MM/yyyy');
}

export function formatTime(date: Date | string): string {
  return format(new Date(date), 'HH:mm');
}

export function getTimeRemaining(endDate: Date | string): number {
  return Math.max(0, differenceInSeconds(new Date(endDate), new Date()));
}

export function isWithinTimeWindow(startDate: Date | string, endDate: Date | string): boolean {
  const now = new Date();
  return now >= new Date(startDate) && now <= new Date(endDate);
}