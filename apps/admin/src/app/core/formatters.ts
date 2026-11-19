import type { WalkerStatus } from './models';

export const STATUS_LABEL: Record<WalkerStatus, string> = {
  pending: 'Sin verificar',
  in_review: 'En revisión',
  approved: 'Aprobado',
};

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'PA';
  if (parts.length === 1) return (parts[0] ?? 'PA').slice(0, 2).toUpperCase();
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
}

export function formatDate(ms?: number): string {
  if (!ms) return '—';
  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ms));
}
