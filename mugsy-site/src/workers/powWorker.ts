// Web worker to solve ALTCHA PoW: find nonce so SHA-256(prefix + nonceHex) has N leading zero bits
self.onmessage = async (e: MessageEvent) => {
  const { prefix, difficulty } = e.data as { prefix: string; difficulty: number }
  const enc = new TextEncoder()
  let nonce = 0
  function countLeadingZeroBits(bytes: Uint8Array): number {
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
  while (true) {
    const nHex = nonce.toString(16)
    const input = enc.encode(prefix + nHex)
    const hash = await crypto.subtle.digest('SHA-256', input)
    const view = new Uint8Array(hash)
    if (countLeadingZeroBits(view) >= difficulty) {
      ;(self as any).postMessage({ nonce: nHex })
      return
    }
    nonce++
  }
}

