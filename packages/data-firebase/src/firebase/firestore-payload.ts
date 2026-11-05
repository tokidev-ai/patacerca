/** Firestore rechaza valores `undefined`; elimínalos antes de setDoc. */
export function omitUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => omitUndefinedDeep(item)) as T;
  }
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      if (val !== undefined) {
        out[key] = omitUndefinedDeep(val);
      }
    }
    return out as T;
  }
  return value;
}
