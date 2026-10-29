/**
 * Extracts the initials from the first two words of a name in uppercase.
 */
export function getInitials(name: string): string {
  if (!name) return 'PA';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'PA';
  if (parts.length === 1) {
    const single = parts[0]!;
    return single.slice(0, 2).toUpperCase();
  }
  const first = parts[0]![0] || '';
  const second = parts[1]![0] || '';
  return (first + second).toUpperCase();
}

/**
 * Cleans phone number by stripping spaces, symbols, and optional +591 / 591 prefix.
 */
export function cleanBolivianPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('591') && digits.length === 11) {
    return digits.slice(3);
  }
  return digits;
}

/**
 * Checks if phone is a valid 8-digit Bolivian mobile number starting with 6 or 7.
 */
export function isValidBolivianPhone(phone: string): boolean {
  return /^[67]\d{7}$/.test(phone);
}

