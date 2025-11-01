export function isoToFlag(iso2: string): string {
  if (!iso2 || iso2.length !== 2) return ''
  return iso2.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)))
}

