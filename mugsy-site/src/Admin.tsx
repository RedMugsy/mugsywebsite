import { useEffect, useState } from 'react'
import SiteHeader from './components/SiteHeader'
import SiteFooter from './components/SiteFooter'

export default function Admin() {
  // Use contact API for admin panel
  const CONTACT_API = (import.meta as any).env?.VITE_CONTACT_API || 'https://mugsywebsite-production-b065.up.railway.app'
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'loading'|'need-auth'|'ok'>('loading')
  const [rows, setRows] = useState<any[]>([])
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPurpose, setFilterPurpose] = useState('')
  const [query, setQuery] = useState('')
  const [replyFor, setReplyFor] = useState<any | null>(null)
  const [replySubject, setReplySubject] = useState('')
  const [replyBody, setReplyBody] = useState('')
  const [noteFor, setNoteFor] = useState<string | null>(null)
  const [noteBody, setNoteBody] = useState('')
  const [detail, setDetail] = useState<{loading: boolean; data: any|null}>({ loading: false, data: null })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(25)
  const [total, setTotal] = useState(0)
  const [pageInput, setPageInput] = useState('1')

  async function load() {
    setError('')
    try {
      const params = new URLSearchParams()
      params.set('limit', String(limit))
      params.set('page', String(page))
      if (filterStatus) params.set('status', filterStatus)
      if (filterPurpose) params.set('purpose', filterPurpose)
      if (query) params.set('q', query)
      const r = await fetch(`${CONTACT_API}/api/admin/submissions?`+params.toString(), { credentials: 'include' })
      if (r.status === 401) { setStatus('need-auth'); return }
      const data = await r.json()
      setRows(data.rows || [])
      setTotal(Number(data.total || 0))
      setStatus('ok')
    } catch (e:any) { setError(e?.message||'Failed to load'); setStatus('need-auth') }
  }

  useEffect(()=>{
    // Initialize filters from URL
    try {
      const p = new URLSearchParams(window.location.search)
      const fs = p.get('status') || ''
      const fp = p.get('purpose') || ''
      const q = p.get('q') || ''
      const pg = parseInt(p.get('page') || '1', 10)
      const lm = parseInt(p.get('limit') || '25', 10)
      const id = p.get('id') || ''
      if (fs) setFilterStatus(fs)
      if (fp) setFilterPurpose(fp)
      if (q) setQuery(q)
      const allowed = [10,25,50,100]
      setLimit(allowed.includes(lm) ? lm : 25)
      const pVal = isNaN(pg) || pg < 1 ? 1 : pg
      setPage(pVal)
      setPageInput(String(pVal))
      if (id) {
        // preload detail drawer via deep link
        (async () => {
          setDetail({ loading: true, data: null })
          try {
            const resp = await fetch(`${CONTACT_API}/api/admin/submissions/${id}`, { credentials: 'include' })
            const data = await resp.json()
            setDetail({ loading: false, data })
          } catch { setDetail({ loading: false, data: null }) }
        })()
      }
    } catch {}
    load()
  }, [])

  function syncURL() {
    try {
      const p = new URLSearchParams()
      if (filterStatus) p.set('status', filterStatus)
      if (filterPurpose) p.set('purpose', filterPurpose)
      if (query) p.set('q', query)
      p.set('page', String(page))
      p.set('limit', String(limit))
      const search = p.toString()
      const url = search ? `?${search}` : window.location.pathname
      window.history.replaceState(null, '', url)
    } catch {}
  }

  // Analytics: fire on page/limit change and reload
  useEffect(()=>{
    try {
      ;(window as any).dataLayer = (window as any).dataLayer || []
      ;(window as any).dataLayer.push({ event: 'admin_page_view', page, limit })
    } catch {}
    syncURL()
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit])

  async function requestMagic() {
    setError('')
    try {
      await fetch(`${CONTACT_API}/api/auth/magic-link/request`, { method: 'POST', headers: { 'Content-Type':'application/json' }, credentials: 'include', body: JSON.stringify({ email }) })
      alert('Magic link sent (check email). After clicking it, reload this page.')
    } catch (e:any) { setError(e?.message||'Failed to request magic link') }
  }

  return (
    <div className="min-h-dvh bg-[#0a0b0f] text-slate-200">
      <SiteHeader />

      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-extrabold text-white">Admin</h1>

        {status === 'need-auth' && (
          <div className="mt-6 rounded-xl border border-white/10 bg-black/60 p-4 max-w-xl">
            <h2 className="text-xl font-bold text-white mb-2">Sign in via Magic Link</h2>
            <p className="text-sm text-slate-400 mb-3">Enter your admin email to receive a one-time sign-in link (valid 15 minutes).</p>
            <div className="flex gap-2">
              <input className="flex-1 rounded-lg bg-black/50 border border-white/10 px-3 py-2" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" />
              <button onClick={requestMagic} className="rounded-md px-4 py-2 bg-[#00F0FF] text-black font-semibold">Send Link</button>
            </div>
            {error && <p className="text-[#ff8fa0] text-sm mt-2">{error}</p>}
            <p className="text-xs text-slate-400 mt-3">After clicking the email link, reload this page to view submissions.</p>
          </div>
        )}

        {status === 'ok' && (
          <div className="mt-4 flex flex-wrap gap-2 items-end">
            <div>
              <label htmlFor="filter-status" className="block text-xs text-slate-400">Status</label>
              <select id="filter-status" className="rounded bg-black/50 border border-white/10 px-2 py-1" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
                <option value="">All</option>
                {['NEW','IN_REVIEW','CLOSED','SPAM'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400">Purpose</label>
              <input className="rounded bg-black/50 border border-white/10 px-2 py-1" placeholder="e.g., Support" value={filterPurpose} onChange={e=>setFilterPurpose(e.target.value)} />
            </div>
            <div className="flex-1 min-w-40">
              <label className="block text-xs text-slate-400">Search</label>
              <input className="w-full rounded bg-black/50 border border-white/10 px-2 py-1" placeholder="name, email, subject, message" value={query} onChange={e=>setQuery(e.target.value)} />
            </div>
            <button onClick={()=>{ setPage(1); syncURL(); load() }} className="rounded-md px-3 py-2 bg-[#00F0FF] text-black font-semibold">Apply</button>
          </div>
        )}
        {status === 'ok' && (
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <button className="rounded-md px-3 py-1 border border-white/10 disabled:opacity-50" disabled={page<=1} onClick={()=>setPage(Math.max(1, page-1))}>Prev</button>
            <label htmlFor="page-input" className="sr-only">Page number</label>
            <span>Page</span>
            <input id="page-input" type="number" min={1} className="w-16 rounded bg-black/50 border border-white/10 px-2 py-1" value={pageInput} onChange={e=>setPageInput(e.target.value)} aria-label="Page number" />
            <button className="rounded-md px-2 py-1 border border-white/10" onClick={()=>{
              const n = parseInt(pageInput,10)
              const max = Math.max(1, Math.ceil(total / limit))
              const next = isNaN(n)?1: Math.min(Math.max(1,n), max)
              setPage(next)
            }}>Go</button>
            <span>of {Math.max(1, Math.ceil(total/limit))}</span>
            <label htmlFor="limit-select" className="ml-4">Limit</label>
            <select id="limit-select" className="rounded bg-black/50 border border-white/10 px-2 py-1" value={limit} onChange={e=>{ const v = parseInt(e.target.value,10); setLimit([10,25,50,100].includes(v)?v:25); setPage(1); }}>
              {[10,25,50,100].map(x => <option key={x} value={x}>{x}</option>)}
            </select>
            <button className="rounded-md px-3 py-1 border border-white/10 disabled:opacity-50" disabled={page >= Math.max(1, Math.ceil(total/limit))} onClick={()=>{
              const max = Math.max(1, Math.ceil(total/limit))
              setPage(Math.min(page+1, max))
            }}>Next</button>
            <span className="text-slate-400 ml-2">Total: {total}</span>
          </div>
        )}

        {status === 'ok' && (
          <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Request ID</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Purpose</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r:any) => (
                  <tr key={r.id} className="odd:bg-white/0 even:bg-white/[0.025]">
                    <td className="px-3 py-2">{new Date(r.createdAt).toLocaleString()}</td>
                    <td className="px-3 py-2">
                      <button className="underline text-[#00F0FF]" onClick={async ()=>{
                        setDetail({ loading: true, data: null })
                        try {
                          // push id into URL for deep-linking
                          const cur = new URLSearchParams(window.location.search)
                          cur.set('id', r.id)
                          const qs = cur.toString()
                          window.history.pushState(null, '', qs ? `?${qs}` : window.location.pathname)
                          const resp = await fetch(`${CONTACT_API}/api/admin/submissions/${r.id}`, { credentials: 'include' })
                          const data = await resp.json()
                          setDetail({ loading: false, data })
                        } catch { setDetail({ loading: false, data: null }) }
                      }}>{r.requestId}</button>
                    </td>
                    <td className="px-3 py-2">{r.name}</td>
                    <td className="px-3 py-2">{r.email}</td>
                    <td className="px-3 py-2">{r.purpose}</td>
                    <td className="px-3 py-2">
                      <select className="rounded bg-black/50 border border-white/10 px-2 py-1" defaultValue={r.status} onChange={async e=>{
                        await fetch(`${CONTACT_API}/api/admin/submissions/${r.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, credentials:'include', body: JSON.stringify({ status: e.target.value }) });
                        load()
                      }}>
                        {['NEW','IN_REVIEW','CLOSED','SPAM'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <button className="underline text-[#00F0FF] mr-2" onClick={()=>{ setReplyFor(r); setReplySubject(`Re: ${r.subject}`); setReplyBody(''); }}>Reply</button>
                      <button className="underline text-slate-300" onClick={()=>{ setNoteFor(r.id); setNoteBody(''); }}>Note</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Detail drawer */}
        {detail.data && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/60" onClick={()=>setDetail({loading:false, data:null})} />
            <div className="absolute right-0 top-0 h-full w-full sm:w-[34rem] bg-[#0b0d12] border-l border-white/10 shadow-xl overflow-y-auto">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-white font-bold">Submission Detail</h3>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 rounded border border-white/10" onClick={()=>{
                    try {
                      const cur = new URLSearchParams(window.location.search)
                      cur.set('id', detail.data.submission.id)
                      navigator.clipboard.writeText(window.location.pathname + '?' + cur.toString())
                    } catch {}
                  }}>Copy Link</button>
                  <button className="px-3 py-1 rounded border border-white/10" onClick={()=>{
                  setDetail({loading:false, data:null})
                  try {
                    const cur = new URLSearchParams(window.location.search)
                    cur.delete('id')
                    const qs = cur.toString()
                    window.history.pushState(null, '', qs ? `?${qs}` : window.location.pathname)
                  } catch {}
                }}>Close</button>
                </div>
              </div>
              <div className="p-4 text-sm text-slate-300 space-y-3">
                <p><span className="text-slate-400">Request ID:</span> {detail.data.submission.requestId}</p>
                <p><span className="text-slate-400">Date:</span> {new Date(detail.data.submission.createdAt).toLocaleString()}</p>
                <p><span className="text-slate-400">Name:</span> {detail.data.submission.name}</p>
                <p><span className="text-slate-400">Email:</span> {detail.data.submission.email}</p>
                <p><span className="text-slate-400">Purpose:</span> {detail.data.submission.purpose}</p>
                {detail.data.submission.otherReason && (<p><span className="text-slate-400">Other Reason:</span> {detail.data.submission.otherReason}</p>)}
                <p><span className="text-slate-400">Subject:</span> {detail.data.submission.subject}</p>
                <div>
                  <p className="text-slate-400">Message:</p>
                  <pre className="whitespace-pre-wrap break-words bg-black/30 rounded p-2 border border-white/10 text-slate-200">{detail.data.submission.message}</pre>
                </div>
                <div>
                  <p className="text-slate-400">Notes:</p>
                  <div className="space-y-2">
                    {detail.data.notes?.length ? detail.data.notes.map((n:any)=>(
                      <div key={n.id} className="bg-black/30 rounded p-2 border border-white/10">
                        <div className="text-xs text-slate-400">{new Date(n.createdAt).toLocaleString()}</div>
                        <div>{n.body}</div>
                      </div>
                    )) : <p className="text-slate-500">No notes</p>}
                  </div>
                </div>
                <div className="pt-2 flex gap-2">
                  <button className="rounded-md px-3 py-2 bg-[#00F0FF] text-black font-semibold" onClick={()=>{ setReplyFor(detail.data.submission); setReplySubject(`Re: ${detail.data.submission.subject}`); setReplyBody(''); }}>Reply</button>
                  <button className="rounded-md px-3 py-2 border border-white/10" onClick={()=>{ setNoteFor(detail.data.submission.id); setNoteBody(''); }}>Add Note</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {noteFor && (
          <div className="mt-6 rounded-xl border border-white/10 bg-black/60 p-4 max-w-xl">
            <h3 className="text-lg font-bold text-white mb-2">Add Note</h3>
            <label htmlFor="note-body" className="sr-only">Note content</label>
            <textarea id="note-body" className="w-full rounded bg-black/50 border border-white/10 px-3 py-2" rows={4} value={noteBody} onChange={e=>setNoteBody(e.target.value)} placeholder="Enter your note here..." />
            <div className="mt-2 flex gap-2">
              <button className="rounded-md px-3 py-2 bg-[#00F0FF] text-black font-semibold" onClick={async ()=>{
                await fetch(`${CONTACT_API}/api/admin/submissions/${noteFor}/notes`, { method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include', body: JSON.stringify({ body: noteBody }) })
                setNoteFor(null); setNoteBody(''); load()
              }}>Save Note</button>
              <button className="rounded-md px-3 py-2 border border-white/10" onClick={()=>{ setNoteFor(null); setNoteBody('') }}>Cancel</button>
            </div>
          </div>
        )}

        {replyFor && (
          <div className="mt-6 rounded-xl border border-white/10 bg-black/60 p-4 max-w-xl">
            <h3 className="text-lg font-bold text-white mb-2">Reply to {replyFor.email}</h3>
            <label htmlFor="reply-subject" className="sr-only">Reply subject</label>
            <input id="reply-subject" className="w-full rounded bg-black/50 border border-white/10 px-3 py-2 mb-2" value={replySubject} onChange={e=>setReplySubject(e.target.value)} placeholder="Reply subject" />
            <label htmlFor="reply-body" className="sr-only">Reply message</label>
            <textarea id="reply-body" className="w-full rounded bg-black/50 border border-white/10 px-3 py-2" rows={6} value={replyBody} onChange={e=>setReplyBody(e.target.value)} placeholder="Your reply message..." />
            <div className="mt-2 flex gap-2">
              <button className="rounded-md px-3 py-2 bg-[#00F0FF] text-black font-semibold" onClick={async ()=>{
                await fetch(`${CONTACT_API}/api/admin/submissions/${replyFor.id}/reply`, { method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include', body: JSON.stringify({ subject: replySubject, message: replyBody }) })
                setReplyFor(null); setReplySubject(''); setReplyBody('')
              }}>Send Reply</button>
              <button className="rounded-md px-3 py-2 border border-white/10" onClick={()=>{ setReplyFor(null); }}>Cancel</button>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}



