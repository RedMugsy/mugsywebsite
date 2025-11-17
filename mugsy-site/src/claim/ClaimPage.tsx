import { useEffect, useState } from 'react'
import { Turnstile } from './turnstile'
import { tokenClaimAbi } from './abi/tokenClaim'
import '@rainbow-me/rainbowkit/styles.css'
import { WagmiProvider, http, createConfig, useAccount, useChainId, useSwitchChain, useReadContract, useSimulateContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { mainnet, base, arbitrum, optimism, polygon } from 'wagmi/chains'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const SITEKEY = (
  (import.meta as any).env?.VITE_TURNSTILE_SITEKEY_CLAIM as string
) || (
  (import.meta as any).env?.VITE_TURNSTILE_SITEKEY as string
) || '0x4AAAAAAB-gYLApRvUyjKDX'
const CONTRACT = (import.meta as any).env?.VITE_CLAIM_CONTRACT as `0x${string}`
const FEATURE = ((import.meta as any).env?.VITE_FEATURE_CLAIM || 'false') === 'true'
const TARGET_CHAIN_ID = Number((import.meta as any).env?.VITE_CLAIM_CHAIN_ID || 1)
const RPC_URL = (import.meta as any).env?.VITE_CLAIM_RPC_URL || undefined

const explorerByChain: Record<number, { name: string; base: string }> = {
  1: { name: 'Ethereum', base: 'https://etherscan.io' },
  8453: { name: 'Base', base: 'https://basescan.org' },
  42161: { name: 'Arbitrum', base: 'https://arbiscan.io' },
  10: { name: 'Optimism', base: 'https://optimistic.etherscan.io' },
  137: { name: 'Polygon', base: 'https://polygonscan.com' },
}

type Elig = { method: 'merkle'|'voucher'|'none'; amount?: string; campaignId?: string|number; proof?: string[]; nonce?: string|number; expiry?: string|number; signature?: string }

function ClaimInner() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [turnstileToken, setTurnstileToken] = useState('')
  const [verified, setVerified] = useState(false)
  const [eligStr, setEligStr] = useState<string>('—')
  const [eligOk, setEligOk] = useState<boolean>(false)
  const [teleErr, setTeleErr] = useState('')
  const [elig, setElig] = useState<Elig>({ method: 'none' })

  const chainMismatch = isConnected && chainId !== TARGET_CHAIN_ID
  const explorer = explorerByChain[TARGET_CHAIN_ID]

  async function verifyHuman(token: string) {
    try {
      const r = await fetch('/api/claim/turnstile-verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ token }) })
      const j = await r.json()
      setVerified(!!j?.ok)
    } catch { setVerified(false) }
  }
  useEffect(()=>{ if (turnstileToken) verifyHuman(turnstileToken) }, [turnstileToken])

  // Eligibility: fetch from backend (hybrid)
  useEffect(()=>{
    (async () => {
      if (!isConnected || !address) { setElig({ method:'none' }); setEligStr('-'); setEligOk(false); return }
      try {
        const r = await fetch(`/api/claim/eligibility?address=${address}`)
        const j = await r.json() as Elig
        setElig(j)
        if (j?.amount != null) setEligStr(String(j.amount))
      } catch { setElig({ method:'none' }) }
      try { await fetch('/api/claim/log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'eligibility_check', chainId: TARGET_CHAIN_ID, contract: CONTRACT, address }) }) } catch {}
    })()
  }, [isConnected, address])

  // Try claimable(address) uint256
  const claimable = useReadContract({
    address: CONTRACT,
    abi: tokenClaimAbi as any,
    functionName: 'claimable',
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address },
  }) as any
  // Try canClaim(address) bool
  const canClaim = useReadContract({
    address: CONTRACT,
    abi: tokenClaimAbi as any,
    functionName: 'canClaim',
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address },
  }) as any

  useEffect(()=>{
    try {
      if (claimable?.data !== undefined) {
        const v = BigInt(claimable.data || 0n)
        const isEligible = v > 0n
        setEligStr(isEligible ? v.toString() : '0')
        setEligOk(isEligible)
        return
      }
    } catch {}
    try {
      if (canClaim?.data !== undefined) {
        const b = !!canClaim.data
        setEligStr(b ? 'eligible' : 'not eligible')
        setEligOk(b)
        return
      }
    } catch {}
    setEligStr('—')
    setEligOk(false)
  }, [claimable?.data, canClaim?.data])

  // Simulate claim – dynamic based on method
  const fn = elig?.method === 'merkle' ? 'claimMerkle' : elig?.method === 'voucher' ? 'claimVoucher' : 'claim'
  const args = (() => {
    if (fn === 'claimMerkle') return [address, BigInt(elig.amount || '0'), (elig.proof||[]) ]
    if (fn === 'claimVoucher') return [address, BigInt(elig.amount || '0'), BigInt(elig.nonce||'0'), BigInt(elig.expiry||'0'), BigInt(elig.campaignId||'0'), (elig.signature||'0x')]
    return []
  })()
  const sim = useSimulateContract({
    address: CONTRACT,
    abi: tokenClaimAbi as any,
    functionName: fn as any,
    args: (fn==='claim') ? undefined : (args as any),
    query: { enabled: isConnected && verified && !chainMismatch && (elig.method!=='none') },
  }) as any

  const { writeContract, data: txHash, isPending: sending } = useWriteContract()
  const receipt = useWaitForTransactionReceipt({ hash: txHash })

  async function telemetry(type: string, status: string, error?: string) {
    try { await fetch('/api/claim/log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, status, chainId: TARGET_CHAIN_ID, contract: CONTRACT, address, error }) }) } catch {}
  }

  function prepareAndClaim() {
    setTeleErr('')
    if (!isConnected) { setTeleErr('Connect wallet'); return }
    if (chainMismatch) { setTeleErr('Wrong network'); return }
    if (!verified) { setTeleErr('Please verify first'); return }
    if (!eligOk) { setTeleErr('Not eligible to claim'); return }
    if (!sim?.data) { setTeleErr(sim?.error?.shortMessage || 'Simulation not ready'); return }
    telemetry('claim_attempt', 'start')
    try {
      writeContract(sim.data.request)
      telemetry('claim_attempt', 'sent')
    } catch (e: any) {
      const msg = e?.shortMessage || e?.message || 'send_error'
      setTeleErr(msg)
      telemetry('claim_attempt', 'error', msg)
    }
  }

  // Log mined / error states
  useEffect(()=>{
    if (receipt?.isSuccess) telemetry('claim_attempt', 'mined')
    if ((receipt as any)?.isError) telemetry('claim_attempt', 'error', String((receipt as any)?.error?.message || 'receipt_error'))
  }, [receipt?.isSuccess, (receipt as any)?.isError])

  return (
    <div className="min-h-dvh text-slate-200" style={{ backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0) 0%, #ff1a4b30 100%)' }}>
      <SiteHeader />

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        
        <header className="space-y-2">
          <h1 className="text-3xl font-extrabold text-white">Red Mugsy — Token Claim</h1>
          <p className="text-sm text-slate-300">
            Contract: <a className="underline" href={explorer ? `${explorer.base}/address/${CONTRACT}` : '#'} target="_blank" rel="noopener noreferrer"><span className="font-mono">{CONTRACT}</span></a> {explorer ? `on ${explorer.name}` : ''}
          </p>
        </header>

      <section className="rounded-xl border border-white/10 p-4 bg-black/50">
        <h2 className="font-semibold mb-2">1) Verify you’re human</h2>
        <Turnstile sitekey={SITEKEY} onToken={setTurnstileToken} />
        <p className="text-xs mt-2">{verified ? '✅ Verified' : 'Awaiting verification…'}</p>
      </section>

      <section className="rounded-xl border border-white/10 p-4 bg-black/50">
        <h2 className="font-semibold mb-2">2) Connect wallet & switch network</h2>
        {chainMismatch && (
          <button className="btn-neo px-4 py-2" onClick={()=>switchChain({ chainId: TARGET_CHAIN_ID })}>
            Switch network
          </button>
        )}
      </section>

      <section className="rounded-xl border border-white/10 p-4 bg-black/50">
        <h2 className="font-semibold mb-2">3) Prepare & Claim</h2>
        <div className="text-sm text-slate-400 mb-3">
          Eligibility: <span className={eligOk ? 'text-green-400' : 'text-red-400'}>{eligStr}</span> {eligOk ? '✅' : '❌'}
          <br />
          Simulation: {sim.isSuccess ? '✅ ok' : sim.isError ? '❌ ' + (sim.error as any)?.shortMessage : '…'}
        </div>
        <button
          disabled={!isConnected || chainMismatch || !verified || !eligOk || !sim.isSuccess || sending}
          onClick={prepareAndClaim}
          className="btn-neo px-6 py-3 disabled:opacity-60"
        >
          {sending ? 'Submitting…' : 'Claim'}
        </button>
        {txHash && (
          <p className="text-xs mt-2 break-all">
            Tx: {explorer ? <a className="underline" href={`${explorer.base}/tx/${txHash}`} target="_blank" rel="noopener noreferrer">{txHash}</a> : txHash}
          </p>
        )}
        {receipt.isSuccess && <p className="text-xs mt-2">✅ Confirmed in block {receipt.data?.blockNumber?.toString()}</p>}
        {teleErr && <p className="text-xs mt-2 text-[#ff8fa0]">{String(teleErr)}</p>}
      </section>

      <section className="rounded-xl border border-white/10 p-4 bg-black/40">
        <h3 className="font-semibold">Safety</h3>
        <ul className="text-xs text-slate-400 list-disc pl-5 mt-1">
          <li>Never share your seed phrase or private key.</li>
          <li>Always verify the contract address shown above.</li>
          <li>Only use this page at redmugsy.com domains.</li>
        </ul>
      </section>
      </main>
      <SiteFooter />
    </div>
  )
}

export default function ClaimPage() {
  if (!FEATURE) {
    return <div className="max-w-xl mx-auto p-6"><h1 className="text-xl font-bold">Claim is not enabled</h1><p className="text-slate-400 mt-2">Check back soon.</p></div>
  }
  const chain = [mainnet, base, arbitrum, optimism, polygon].find(c=>c.id===TARGET_CHAIN_ID) || mainnet
  const config = createConfig({
    chains: [chain],
    transports: ({ [chain.id]: http(RPC_URL) } as any),
    ssr: false,
  })
  const queryClient = new QueryClient()
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          <ClaimInner />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

