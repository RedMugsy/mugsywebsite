// PoW helper matching server: sha256(nonce|n) leading zero bits
export async function sha256(buf: Uint8Array): Promise<Uint8Array> {
  const copy = new Uint8Array(buf) // ensure standalone ArrayBuffer
  const digest = await crypto.subtle.digest('SHA-256', copy.buffer as ArrayBuffer)
  return new Uint8Array(digest)
}

export function concat(a: Uint8Array, b: Uint8Array, c?: Uint8Array) {
  const out = new Uint8Array(a.length + b.length + (c?.length || 0))
  out.set(a, 0); out.set(b, a.length); if (c) out.set(c, a.length + b.length)
  return out
}

export function countLeadingZeroBits(bytes: Uint8Array): number {
  let bits = 0
  for (const byte of bytes) {
    if (byte === 0) { bits += 8; continue }
    let z = 0
    for (let i = 7; i >= 0; i--) { if ((byte & (1 << i)) === 0) z++; else break }
    bits += z
    break
  }
  return bits
}

export async function solvePow(prefix: string, difficulty: number, maxIters = 5_000_000): Promise<number> {
  const prefixBytes = new TextEncoder().encode(prefix)
  for (let n = 0; n < maxIters; n++) {
    const nBytes = new TextEncoder().encode(String(n))
    const input = concat(prefixBytes, nBytes)
    const digest = await sha256(input)
    if (countLeadingZeroBits(digest) >= difficulty) return n
    if (n % 10000 === 0) await new Promise(r=>setTimeout(r)) // yield
  }
  throw new Error('PoW not found within limit')
}
