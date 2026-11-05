import { cleanBolivianPhone } from './formatting.rule';

export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = cleanBolivianPhone(phone);
  return `https://wa.me/591${digits}?text=${encodeURIComponent(message)}`;
}
