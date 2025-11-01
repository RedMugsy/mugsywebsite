export const tokenClaimAbi = [
  // Legacy/simple
  { type: 'function', name: 'claim', stateMutability: 'nonpayable', inputs: [], outputs: [] },
  // Optional view functions (if present on your contract)
  { type: 'function', name: 'claimable', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'function', name: 'canClaim', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'bool' }] },
  // Hybrid entrypoints (Merkle + Voucher)
  { type: 'function', name: 'claimMerkle', stateMutability: 'nonpayable', inputs: [
    { name: 'to', type: 'address' },
    { name: 'amount', type: 'uint256' },
    { name: 'proof', type: 'bytes32[]' },
  ], outputs: [] },
  { type: 'function', name: 'claimVoucher', stateMutability: 'nonpayable', inputs: [
    { name: 'to', type: 'address' },
    { name: 'amount', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'expiry', type: 'uint256' },
    { name: 'campaignId', type: 'uint256' },
    { name: 'signature', type: 'bytes' },
  ], outputs: [] },
] as const
