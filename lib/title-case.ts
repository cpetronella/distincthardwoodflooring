/** Capitalize names and locations while preserving deliberate internal capitals. */
export function titleCase(value: string) {
  return value.trim().replace(/(^|[\s'-])([\p{L}]+(?:[\p{M}]+)?)/gu, (match, separator: string, word: string) => {
    const normalized = word === word.toUpperCase() || word === word.toLowerCase()
      ? word.toLowerCase()
      : word;
    return separator + normalized.charAt(0).toUpperCase() + normalized.slice(1);
  });
}
