import { useState } from 'react'
import SiteHeader from './components/SiteHeader'
import SiteFooter from './components/SiteFooter'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type Participant = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  tier: 'free' | 'pathfinder' | 'keymaster'
  walletAddress: string
  status: 'active' | 'on-hold' | 'disqualified'
  referralCode: string
  registeredDate: string
  ciphersSolved: number
}

type AdminUser = {
  id: string
  name: string
  email: string
  role: 'super-admin' | 'admin' | 'moderator'
  lastLogin: string
}

type PromoterType = 'individual' | 'company'

type PromoterStatus = 'pending' | 'active' | 'removed'

type Promoter = {
  id: string
  type: PromoterType
  status: PromoterStatus
  referralCode: string
  registeredDate: string

  // Individual fields
  firstName?: string
  middleName?: string
  lastName?: string
  phone?: string
  email?: string
  xAccount?: string
  telegramAccount?: string
  discordAccount?: string

  // Company fields
  companyName?: string
  companyLicense?: string
  companyAddress?: string
  companyWebsite?: string
  companyX?: string
  companyTelegram?: string
  companyDiscord?: string
  contactPersonName?: string
  contactPersonEmail?: string
  contactPersonPhone?: string

  // Common fields
  forecastedParticipants: number
  walletAddress: string
  actualParticipants: number
}

type PromoterDraft = Partial<Promoter> & { draftId: string; savedAt: string }

type Page = 'dashboard' | 'admins' | 'communications' | 'promoters'

export default function TreasureHuntAdmin() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null)
  const [editForm, setEditForm] = useState<Partial<Participant>>({})

  // Promoter Management
  const [showPromoterForm, setShowPromoterForm] = useState(false)
  const [promoterFormType, setPromoterFormType] = useState<PromoterType>('individual')
  const [promoterFormData, setPromoterFormData] = useState<Partial<Promoter>>({
    type: 'individual',
    forecastedParticipants: 0,
    walletAddress: ''
  })
  const [_editingDraft, setEditingDraft] = useState<PromoterDraft | null>(null)
  const [showRejectionForm, setShowRejectionForm] = useState<Promoter | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  // Search, Sort, Filter state
  const [promoterSearch, setPromoterSearch] = useState('')
  const [promoterSortBy, setPromoterSortBy] = useState<'participants' | 'date'>('date')
  const [promoterSortOrder, setPromoterSortOrder] = useState<'asc' | 'desc'>('desc')
  const [promoterFilterType, setPromoterFilterType] = useState<'all' | 'individual' | 'company'>('all')
  const [promoterFilterStatus, setPromoterFilterStatus] = useState<'all' | PromoterStatus>('all')

  // Communication state
  const [messageType, setMessageType] = useState<'email' | 'portal' | 'both'>('both')
  const [messageRecipients, setMessageRecipients] = useState<'all' | 'tier-specific'>('all')
  const [selectedTier, setSelectedTier] = useState<'free' | 'pathfinder' | 'keymaster'>('free')
  const [messageSubject, setMessageSubject] = useState('')
  const [messageBody, setMessageBody] = useState('')

  // Sample data
  const tierData = [
    { name: 'Free Loader', value: 145, color: '#888888' },
    { name: 'Pathfinder', value: 212, color: '#ff1a4b' },
    { name: 'Key Master', value: 130, color: '#00F0FF' }
  ]

  const dailySignups = [
    { date: 'Nov 17', free: 12, pathfinder: 18, keymaster: 9 },
    { date: 'Nov 18', free: 15, pathfinder: 22, keymaster: 11 },
    { date: 'Nov 19', free: 19, pathfinder: 28, keymaster: 15 },
    { date: 'Nov 20', free: 21, pathfinder: 31, keymaster: 18 },
    { date: 'Nov 21', free: 17, pathfinder: 25, keymaster: 13 },
    { date: 'Nov 22', free: 23, pathfinder: 35, keymaster: 21 },
    { date: 'Nov 23', free: 38, pathfinder: 53, keymaster: 43 }
  ]

  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      tier: 'keymaster',
      walletAddress: '5Gjc...x7Kp',
      status: 'active',
      referralCode: 'PROMO123',
      registeredDate: '2024-11-20',
      ciphersSolved: 3
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+1234567891',
      tier: 'pathfinder',
      walletAddress: '8Mnb...y9Op',
      status: 'active',
      referralCode: 'PROMO456',
      registeredDate: '2024-11-21',
      ciphersSolved: 2
    }
  ])

  const [promoters, setPromoters] = useState<Promoter[]>([
    {
      id: '1',
      type: 'individual',
      status: 'active',
      referralCode: 'PROMO123',
      registeredDate: '2024-11-15',
      firstName: 'Alice',
      middleName: 'M',
      lastName: 'Johnson',
      phone: '+1234567890',
      email: 'alice@example.com',
      xAccount: '@alicejohnson',
      forecastedParticipants: 100,
      walletAddress: '7Abc...d4Ef',
      actualParticipants: 87
    },
    {
      id: '2',
      type: 'company',
      status: 'pending',
      referralCode: 'CORP456',
      registeredDate: '2024-11-22',
      companyName: 'Crypto Marketing Inc',
      companyLicense: 'LIC123456',
      companyAddress: '123 Main St, City',
      companyWebsite: 'https://cryptomarketing.com',
      contactPersonName: 'Bob Smith',
      contactPersonEmail: 'bob@cryptomarketing.com',
      contactPersonPhone: '+1987654321',
      forecastedParticipants: 500,
      walletAddress: '',
      actualParticipants: 0
    }
  ])

  const [drafts, setDrafts] = useState<PromoterDraft[]>([])

  const [admins, _setAdmins] = useState<AdminUser[]>([
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@redmugsy.com',
      role: 'super-admin',
      lastLogin: '2024-11-23 10:30'
    }
  ])

  const totalParticipants = tierData.reduce((sum, tier) => sum + tier.value, 0)

  const handleEditParticipant = (participant: Participant) => {
    setEditingParticipant(participant)
    setEditForm(participant)
  }

  const handleSaveEdit = () => {
    if (editingParticipant && editForm) {
      setParticipants(participants.map(p =>
        p.id === editingParticipant.id ? { ...p, ...editForm } : p
      ))
      setEditingParticipant(null)
      setEditForm({})
    }
  }

  const handleStatusChange = (participantId: string, newStatus: Participant['status']) => {
    setParticipants(participants.map(p =>
      p.id === participantId ? { ...p, status: newStatus } : p
    ))
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Sending message:', {
      type: messageType,
      recipients: messageRecipients,
      tier: selectedTier,
      subject: messageSubject,
      body: messageBody
    })
    alert('Message sent successfully!')
    setMessageSubject('')
    setMessageBody('')
  }

  // Promoter Management Functions
  const generateReferralCode = () => {
    return 'PROMO' + Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const handleRegisterPromoter = () => {
    const newPromoter: Promoter = {
      ...promoterFormData as Promoter,
      id: Date.now().toString(),
      status: 'active',
      referralCode: generateReferralCode(),
      registeredDate: new Date().toISOString().split('T')[0],
      actualParticipants: 0
    }

    setPromoters([...promoters, newPromoter])

    // Send email (in production)
    const email = promoterFormData.type === 'individual'
      ? promoterFormData.email
      : promoterFormData.contactPersonEmail

    console.log('Sending welcome email to:', email, {
      username: email,
      temporaryPassword: 'TempPass' + Math.random().toString(36).substring(2, 8),
      referralCode: newPromoter.referralCode
    })

    alert(`Promoter registered successfully!\nReferral Code: ${newPromoter.referralCode}\nWelcome email sent to ${email}`)

    setShowPromoterForm(false)
    resetPromoterForm()
  }

  const handleSaveDraft = () => {
    const draft: PromoterDraft = {
      ...promoterFormData,
      draftId: Date.now().toString(),
      savedAt: new Date().toISOString()
    }
    setDrafts([...drafts, draft])
    alert('Draft saved successfully!')
    setShowPromoterForm(false)
    resetPromoterForm()
  }

  const handleLoadDraft = (draft: PromoterDraft) => {
    setPromoterFormData(draft)
    setPromoterFormType(draft.type || 'individual')
    setEditingDraft(draft)
    setShowPromoterForm(true)
  }

  const handleDeleteDraft = (draftId: string) => {
    setDrafts(drafts.filter(d => d.draftId !== draftId))
  }

  const resetPromoterForm = () => {
    setPromoterFormData({
      type: 'individual',
      forecastedParticipants: 0,
      walletAddress: ''
    })
    setPromoterFormType('individual')
    setEditingDraft(null)
  }

  const handleApprovePromoter = (promoterId: string) => {
    const promoter = promoters.find(p => p.id === promoterId)
    if (!promoter) return

    // Generate referral code if not already present
    const referralCode = promoter.referralCode || generateReferralCode()

    // Generate temporary password
    const temporaryPassword = 'TempPass' + Math.random().toString(36).substring(2, 10).toUpperCase()

    // Get email
    const email = promoter.type === 'individual'
      ? promoter.email
      : promoter.contactPersonEmail

    // Get username (using email)
    const username = email

    // Update promoter status and add referral code
    const updatedPromoters = promoters.map(p =>
      p.id === promoterId
        ? { ...p, status: 'active' as PromoterStatus, referralCode }
        : p
    )
    setPromoters(updatedPromoters)

    // Send email notification (In production, this would call an API endpoint)
    console.log('===== PROMOTER APPROVED - SENDING WELCOME EMAIL =====')
    console.log('To:', email)
    console.log('Subject: Welcome to Red Mugsy Treasure Hunt - Promoter Access')
    console.log('Email Content:')
    console.log(`  Username: ${username}`)
    console.log(`  Temporary Password: ${temporaryPassword}`)
    console.log(`  Referral Code: ${referralCode}`)
    console.log('  Login URL: https://redmugsy.com/treasure-hunt/promoters')
    console.log('=====================================================')

    alert(
      `✅ Promoter Approved!\n\n` +
      `📧 Welcome email sent to: ${email}\n\n` +
      `Details:\n` +
      `• Username: ${username}\n` +
      `• Temporary Password: ${temporaryPassword}\n` +
      `• Referral Code: ${referralCode}\n\n` +
      `The promoter has been added to the master database.`
    )
  }

  const handleRejectPromoter = (promoter: Promoter, withReason: boolean) => {
    if (withReason) {
      setShowRejectionForm(promoter)
    } else {
      setPromoters(promoters.filter(p => p.id !== promoter.id))
      alert('Promoter rejected')
    }
  }

  const handleSendRejection = () => {
    if (showRejectionForm) {
      setPromoters(promoters.filter(p => p.id !== showRejectionForm.id))
      console.log('Sending rejection email with reason:', rejectionReason)
      alert('Rejection email sent with feedback')
      setShowRejectionForm(null)
      setRejectionReason('')
    }
  }

  const getStatusBadge = (status: Participant['status']) => {
    const colors = {
      'active': 'bg-green-500/20 text-green-400 border-green-500/30',
      'on-hold': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'disqualified': 'bg-red-500/20 text-red-400 border-red-500/30'
    }
    return (
      <span className={`px-2 py-1 rounded text-xs border ${colors[status]}`}>
        {status.toUpperCase()}
      </span>
    )
  }

  const getTierBadge = (tier: Participant['tier']) => {
    const colors = {
      'free': 'bg-gray-500/20 text-gray-400',
      'pathfinder': 'bg-[#ff1a4b]/20 text-[#ff1a4b]',
      'keymaster': 'bg-[#00F0FF]/20 text-[#00F0FF]'
    }
    const labels = {
      'free': '🪫 Free Loader',
      'pathfinder': '🧭 Pathfinder',
      'keymaster': '🔑 Key Master'
    }
    return (
      <span className={`px-3 py-1 rounded text-sm ${colors[tier]}`}>
        {labels[tier]}
      </span>
    )
  }

  const getPromoterStatusBadge = (status: PromoterStatus) => {
    const colors = {
      'pending': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'active': 'bg-green-500/20 text-green-400 border-green-500/30',
      'removed': 'bg-red-500/20 text-red-400 border-red-500/30'
    }
    return (
      <span className={`px-2 py-1 rounded text-xs border ${colors[status]}`}>
        {status.toUpperCase()}
      </span>
    )
  }

  const pendingPromoters = promoters.filter(p => p.status === 'pending')
  const activePromoters = promoters.filter(p => p.status === 'active')
  const removedPromoters = promoters.filter(p => p.status === 'removed')

  // Filter, search, and sort promoters
  const getFilteredAndSortedPromoters = () => {
    let filtered = [...promoters]

    // Apply search filter
    if (promoterSearch.trim()) {
      const searchLower = promoterSearch.toLowerCase().trim()
      filtered = filtered.filter(p => {
        const name = p.type === 'individual'
          ? `${p.firstName} ${p.lastName}`.toLowerCase()
          : (p.companyName || '').toLowerCase()

        const wallet = (p.walletAddress || '').toLowerCase()
        const referralCode = (p.referralCode || '').toLowerCase()

        return name.includes(searchLower) ||
               wallet.includes(searchLower) ||
               referralCode.includes(searchLower)
      })
    }

    // Apply type filter
    if (promoterFilterType !== 'all') {
      filtered = filtered.filter(p => p.type === promoterFilterType)
    }

    // Apply status filter
    if (promoterFilterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === promoterFilterStatus)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (promoterSortBy === 'participants') {
        const diff = (a.actualParticipants || 0) - (b.actualParticipants || 0)
        return promoterSortOrder === 'asc' ? diff : -diff
      } else {
        // Sort by date
        const dateA = new Date(a.registeredDate || 0).getTime()
        const dateB = new Date(b.registeredDate || 0).getTime()
        const diff = dateA - dateB
        return promoterSortOrder === 'asc' ? diff : -diff
      }
    })

    return filtered
  }

  const filteredPromoters = getFilteredAndSortedPromoters()

  return (
    <div className="min-h-screen bg-black text-slate-200 antialiased">
      <SiteHeader />

      <div className="flex min-h-screen">
        {/* Left Sidebar */}
        <aside className="w-64 bg-[#0a0b0f] border-r border-white/10 pt-8">
          <div className="px-4 mb-8">
            <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
            <p className="text-sm text-slate-400 mt-1">Treasure Hunt</p>
          </div>

          <nav className="space-y-1 px-2">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`w-full text-left px-4 py-3 rounded-lg transition ${
                currentPage === 'dashboard'
                  ? 'bg-[#ff1a4b] text-white font-semibold'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              📊 Dashboard & Participants
            </button>
            <button
              onClick={() => setCurrentPage('promoters')}
              className={`w-full text-left px-4 py-3 rounded-lg transition ${
                currentPage === 'promoters'
                  ? 'bg-[#ff1a4b] text-white font-semibold'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              🎯 Promoter Management
            </button>
            <button
              onClick={() => setCurrentPage('admins')}
              className={`w-full text-left px-4 py-3 rounded-lg transition ${
                currentPage === 'admins'
                  ? 'bg-[#ff1a4b] text-white font-semibold'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              👥 Administrator Management
            </button>
            <button
              onClick={() => setCurrentPage('communications')}
              className={`w-full text-left px-4 py-3 rounded-lg transition ${
                currentPage === 'communications'
                  ? 'bg-[#ff1a4b] text-white font-semibold'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              📧 Communication Portal
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {/* PAGE 1: DASHBOARD & PARTICIPANTS */}
          {currentPage === 'dashboard' && (
            <div className="space-y-12">
              {/* Dashboard content - keeping existing code */}
              <section>
                <h1 className="text-4xl font-bold text-white mb-8">Dashboard</h1>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="card bg-gradient-to-br from-[#ff1a4b]/20 to-[#ff1a4b]/5 border-[#ff1a4b]">
                    <h3 className="text-sm text-slate-400 uppercase tracking-wider mb-2">Total Participants</h3>
                    <p className="text-5xl font-bold text-white">{totalParticipants}</p>
                  </div>
                  <div className="card">
                    <h3 className="text-sm text-slate-400 uppercase tracking-wider mb-2">Active</h3>
                    <p className="text-5xl font-bold text-green-400">
                      {participants.filter(p => p.status === 'active').length}
                    </p>
                  </div>
                  <div className="card">
                    <h3 className="text-sm text-slate-400 uppercase tracking-wider mb-2">On Hold / Disqualified</h3>
                    <p className="text-5xl font-bold text-yellow-400">
                      {participants.filter(p => p.status !== 'active').length}
                    </p>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="card">
                    <h3 className="text-2xl font-bold text-white mb-6">Tier Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={tierData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {tierData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#0f1115', border: '1px solid #333', borderRadius: 8, color: '#fff' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="card">
                    <h3 className="text-2xl font-bold text-white mb-6">Daily Signups</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dailySignups}>
                        <XAxis dataKey="date" stroke="#888" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#888" style={{ fontSize: '12px' }} />
                        <Tooltip contentStyle={{ background: '#0f1115', border: '1px solid #333', borderRadius: 8, color: '#fff' }} />
                        <Legend />
                        <Bar dataKey="free" stackId="a" fill="#888888" name="Free Loader" />
                        <Bar dataKey="pathfinder" stackId="a" fill="#ff1a4b" name="Pathfinder" />
                        <Bar dataKey="keymaster" stackId="a" fill="#00F0FF" name="Key Master" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </section>

              {/* Participants Table */}
              <section>
                <h2 className="text-3xl font-bold text-white mb-6">All Participants</h2>

                <div className="card overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-3 text-slate-300 font-semibold">Name</th>
                        <th className="text-left py-3 px-3 text-slate-300 font-semibold">Email</th>
                        <th className="text-left py-3 px-3 text-slate-300 font-semibold">Phone</th>
                        <th className="text-left py-3 px-3 text-slate-300 font-semibold">Tier</th>
                        <th className="text-left py-3 px-3 text-slate-300 font-semibold">Status</th>
                        <th className="text-left py-3 px-3 text-slate-300 font-semibold">Ciphers</th>
                        <th className="text-left py-3 px-3 text-slate-300 font-semibold">Registered</th>
                        <th className="text-right py-3 px-3 text-slate-300 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participants.map((participant) => (
                        <tr key={participant.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-4 px-3 text-white">
                            {participant.firstName} {participant.lastName}
                          </td>
                          <td className="py-4 px-3 text-slate-300">{participant.email}</td>
                          <td className="py-4 px-3 text-slate-300">{participant.phone}</td>
                          <td className="py-4 px-3">{getTierBadge(participant.tier)}</td>
                          <td className="py-4 px-3">{getStatusBadge(participant.status)}</td>
                          <td className="py-4 px-3 text-white font-semibold">{participant.ciphersSolved}/10</td>
                          <td className="py-4 px-3 text-slate-300">{participant.registeredDate}</td>
                          <td className="py-4 px-3">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditParticipant(participant)}
                                className="p-2 rounded hover:bg-white/10 text-[#00F0FF]"
                                title="Edit Participant"
                              >
                                ✏️
                              </button>
                              {participant.status === 'active' && (
                                <button
                                  onClick={() => handleStatusChange(participant.id, 'on-hold')}
                                  className="px-3 py-1 rounded bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 text-xs"
                                  title="Put On Hold"
                                >
                                  Hold
                                </button>
                              )}
                              {participant.status !== 'disqualified' && (
                                <button
                                  onClick={() => handleStatusChange(participant.id, 'disqualified')}
                                  className="px-3 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs"
                                  title="Disqualify"
                                >
                                  Disqualify
                                </button>
                              )}
                              {participant.status !== 'active' && (
                                <button
                                  onClick={() => handleStatusChange(participant.id, 'active')}
                                  className="px-3 py-1 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30 text-xs"
                                  title="Reactivate"
                                >
                                  Activate
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* PAGE 2: PROMOTER MANAGEMENT */}
          {currentPage === 'promoters' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h1 className="text-4xl font-bold text-white">Promoter Management</h1>
                <button
                  onClick={() => setShowPromoterForm(true)}
                  className="btn-neo px-6 py-3"
                >
                  + Register New Promoter
                </button>
              </div>

              {/* Dashboard Stats */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="card bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border-yellow-500/30">
                  <h3 className="text-sm text-slate-400 uppercase tracking-wider mb-2">New Requests</h3>
                  <p className="text-5xl font-bold text-yellow-400">{pendingPromoters.length}</p>
                </div>
                <div className="card bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/30">
                  <h3 className="text-sm text-slate-400 uppercase tracking-wider mb-2">Active Promoters</h3>
                  <p className="text-5xl font-bold text-green-400">{activePromoters.length}</p>
                </div>
                <div className="card bg-gradient-to-br from-red-500/20 to-red-500/5 border-red-500/30">
                  <h3 className="text-sm text-slate-400 uppercase tracking-wider mb-2">Removed/Canceled</h3>
                  <p className="text-5xl font-bold text-red-400">{removedPromoters.length}</p>
                </div>
              </div>

              {/* Pending Requests */}
              {pendingPromoters.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">Pending Registration Requests</h2>
                  <div className="card overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-3 text-slate-300 font-semibold">Type</th>
                          <th className="text-left py-3 px-3 text-slate-300 font-semibold">Name</th>
                          <th className="text-left py-3 px-3 text-slate-300 font-semibold">Email</th>
                          <th className="text-left py-3 px-3 text-slate-300 font-semibold">Forecasted</th>
                          <th className="text-left py-3 px-3 text-slate-300 font-semibold">Date</th>
                          <th className="text-right py-3 px-3 text-slate-300 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingPromoters.map((promoter) => (
                          <tr key={promoter.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-4 px-3">
                              <span className={`px-2 py-1 rounded text-xs ${
                                promoter.type === 'individual' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                              }`}>
                                {promoter.type.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-4 px-3 text-white">
                              {promoter.type === 'individual'
                                ? `${promoter.firstName} ${promoter.lastName}`
                                : promoter.companyName
                              }
                            </td>
                            <td className="py-4 px-3 text-slate-300">
                              {promoter.type === 'individual' ? promoter.email : promoter.contactPersonEmail}
                            </td>
                            <td className="py-4 px-3 text-slate-300">{promoter.forecastedParticipants}</td>
                            <td className="py-4 px-3 text-slate-300">{promoter.registeredDate}</td>
                            <td className="py-4 px-3">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleApprovePromoter(promoter.id)}
                                  className="px-3 py-1 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30 text-xs"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectPromoter(promoter, false)}
                                  className="px-3 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() => handleRejectPromoter(promoter, true)}
                                  className="px-3 py-1 rounded bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 text-xs"
                                >
                                  Reject w/ Reason
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* All Promoters */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">All Promoters</h2>

                {/* Search, Sort, and Filter Controls */}
                <div className="card mb-4 space-y-4">
                  {/* Search Bar */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Search Promoters
                    </label>
                    <input
                      type="text"
                      placeholder="Search by name, wallet address, or referral code..."
                      value={promoterSearch}
                      onChange={(e) => setPromoterSearch(e.target.value)}
                      className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:border-[#00F0FF] focus:outline-none"
                    />
                  </div>

                  {/* Sort and Filter Controls */}
                  <div className="grid md:grid-cols-4 gap-4">
                    {/* Sort By */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Sort By</label>
                      <select
                        value={promoterSortBy}
                        onChange={(e) => setPromoterSortBy(e.target.value as 'participants' | 'date')}
                        className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-2 text-white focus:border-[#00F0FF] focus:outline-none"
                      >
                        <option value="date">Registration Date</option>
                        <option value="participants">Participants Count</option>
                      </select>
                    </div>

                    {/* Sort Order */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Order</label>
                      <select
                        value={promoterSortOrder}
                        onChange={(e) => setPromoterSortOrder(e.target.value as 'asc' | 'desc')}
                        className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-2 text-white focus:border-[#00F0FF] focus:outline-none"
                      >
                        <option value="desc">Descending</option>
                        <option value="asc">Ascending</option>
                      </select>
                    </div>

                    {/* Filter by Type */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
                      <select
                        value={promoterFilterType}
                        onChange={(e) => setPromoterFilterType(e.target.value as any)}
                        className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-2 text-white focus:border-[#00F0FF] focus:outline-none"
                      >
                        <option value="all">All Types</option>
                        <option value="individual">Individual</option>
                        <option value="company">Company</option>
                      </select>
                    </div>

                    {/* Filter by Status */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                      <select
                        value={promoterFilterStatus}
                        onChange={(e) => setPromoterFilterStatus(e.target.value as any)}
                        className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-2 text-white focus:border-[#00F0FF] focus:outline-none"
                      >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="removed">Removed</option>
                      </select>
                    </div>
                  </div>

                  {/* Results Count */}
                  <div className="text-sm text-slate-400">
                    Showing {filteredPromoters.length} of {promoters.length} promoters
                  </div>
                </div>

                <div className="card overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-3 text-slate-300 font-semibold">Type</th>
                        <th className="text-left py-3 px-3 text-slate-300 font-semibold">Name</th>
                        <th className="text-left py-3 px-3 text-slate-300 font-semibold">Wallet</th>
                        <th className="text-left py-3 px-3 text-slate-300 font-semibold">Referral Code</th>
                        <th className="text-left py-3 px-3 text-slate-300 font-semibold">Status</th>
                        <th className="text-left py-3 px-3 text-slate-300 font-semibold">Participants</th>
                        <th className="text-left py-3 px-3 text-slate-300 font-semibold">Registered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPromoters.map((promoter) => (
                        <tr key={promoter.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-4 px-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              promoter.type === 'individual' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                            }`}>
                              {promoter.type.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-4 px-3 text-white">
                            {promoter.type === 'individual'
                              ? `${promoter.firstName} ${promoter.lastName}`
                              : promoter.companyName
                            }
                          </td>
                          <td className="py-4 px-3 text-slate-400 font-mono text-xs">
                            {promoter.walletAddress
                              ? `${promoter.walletAddress.slice(0, 6)}...${promoter.walletAddress.slice(-4)}`
                              : '-'
                            }
                          </td>
                          <td className="py-4 px-3 text-[#00F0FF] font-mono">{promoter.referralCode}</td>
                          <td className="py-4 px-3">{getPromoterStatusBadge(promoter.status)}</td>
                          <td className="py-4 px-3 text-white">
                            {promoter.actualParticipants} / {promoter.forecastedParticipants}
                          </td>
                          <td className="py-4 px-3 text-slate-300">{promoter.registeredDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Drafts Section */}
              {drafts.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">Drafts</h2>
                  <div className="card overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-3 text-slate-300 font-semibold">Type</th>
                          <th className="text-left py-3 px-3 text-slate-300 font-semibold">Name</th>
                          <th className="text-left py-3 px-3 text-slate-300 font-semibold">Saved At</th>
                          <th className="text-right py-3 px-3 text-slate-300 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {drafts.map((draft) => (
                          <tr key={draft.draftId} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-4 px-3">
                              <span className="px-2 py-1 rounded text-xs bg-gray-500/20 text-gray-400">
                                {draft.type?.toUpperCase() || 'DRAFT'}
                              </span>
                            </td>
                            <td className="py-4 px-3 text-white">
                              {draft.type === 'individual'
                                ? `${draft.firstName || ''} ${draft.lastName || ''}`
                                : draft.companyName || 'Untitled Draft'
                              }
                            </td>
                            <td className="py-4 px-3 text-slate-300">
                              {new Date(draft.savedAt).toLocaleString()}
                            </td>
                            <td className="py-4 px-3">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleLoadDraft(draft)}
                                  className="p-2 rounded hover:bg-white/10 text-[#00F0FF]"
                                  title="Edit Draft"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDeleteDraft(draft.draftId)}
                                  className="px-3 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </div>
          )}

          {/* PAGE 3: ADMINISTRATOR MANAGEMENT */}
          {currentPage === 'admins' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h1 className="text-4xl font-bold text-white">Administrator Management</h1>
                <button className="btn-neo px-6 py-3">
                  + Add New Admin
                </button>
              </div>

              <div className="card overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-3 text-slate-300 font-semibold">Name</th>
                      <th className="text-left py-3 px-3 text-slate-300 font-semibold">Email</th>
                      <th className="text-left py-3 px-3 text-slate-300 font-semibold">Role</th>
                      <th className="text-left py-3 px-3 text-slate-300 font-semibold">Last Login</th>
                      <th className="text-right py-3 px-3 text-slate-300 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map((admin) => (
                      <tr key={admin.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-4 px-3 text-white font-semibold">{admin.name}</td>
                        <td className="py-4 px-3 text-slate-300">{admin.email}</td>
                        <td className="py-4 px-3">
                          <span className={`px-3 py-1 rounded text-sm ${
                            admin.role === 'super-admin'
                              ? 'bg-[#ff1a4b]/20 text-[#ff1a4b]'
                              : admin.role === 'admin'
                              ? 'bg-[#00F0FF]/20 text-[#00F0FF]'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {admin.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-slate-300">{admin.lastLogin}</td>
                        <td className="py-4 px-3">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-2 rounded hover:bg-white/10 text-[#00F0FF]" title="Edit">
                              ✏️
                            </button>
                            <button className="px-3 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs">
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PAGE 4: COMMUNICATION PORTAL */}
          {currentPage === 'communications' && (
            <div className="space-y-8">
              <h1 className="text-4xl font-bold text-white">Communication Portal</h1>

              <form onSubmit={handleSendMessage} className="card space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Message Type
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="messageType"
                        value="email"
                        checked={messageType === 'email'}
                        onChange={(e) => setMessageType(e.target.value as any)}
                        className="text-[#ff1a4b]"
                      />
                      <span className="text-white">Email Only</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="messageType"
                        value="portal"
                        checked={messageType === 'portal'}
                        onChange={(e) => setMessageType(e.target.value as any)}
                        className="text-[#ff1a4b]"
                      />
                      <span className="text-white">Web Portal Only</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="messageType"
                        value="both"
                        checked={messageType === 'both'}
                        onChange={(e) => setMessageType(e.target.value as any)}
                        className="text-[#ff1a4b]"
                      />
                      <span className="text-white">Both</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Recipients
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="recipients"
                        value="all"
                        checked={messageRecipients === 'all'}
                        onChange={(e) => setMessageRecipients(e.target.value as any)}
                        className="text-[#ff1a4b]"
                      />
                      <span className="text-white">All Participants</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="recipients"
                        value="tier-specific"
                        checked={messageRecipients === 'tier-specific'}
                        onChange={(e) => setMessageRecipients(e.target.value as any)}
                        className="text-[#ff1a4b]"
                      />
                      <span className="text-white">Specific Tier</span>
                    </label>

                    {messageRecipients === 'tier-specific' && (
                      <div className="ml-6 flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="tier"
                            value="free"
                            checked={selectedTier === 'free'}
                            onChange={(e) => setSelectedTier(e.target.value as any)}
                            className="text-[#ff1a4b]"
                          />
                          <span className="text-slate-300">🪫 Free Loader</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="tier"
                            value="pathfinder"
                            checked={selectedTier === 'pathfinder'}
                            onChange={(e) => setSelectedTier(e.target.value as any)}
                            className="text-[#ff1a4b]"
                          />
                          <span className="text-slate-300">🧭 Pathfinder</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="tier"
                            value="keymaster"
                            checked={selectedTier === 'keymaster'}
                            onChange={(e) => setSelectedTier(e.target.value as any)}
                            className="text-[#ff1a4b]"
                          />
                          <span className="text-slate-300">🔑 Key Master</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-slate-300 mb-2">
                    Subject <span className="text-[#ff1a4b]">*</span>
                  </label>
                  <input
                    id="subject"
                    type="text"
                    required
                    className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white focus:border-[#ff1a4b] focus:outline-none"
                    value={messageSubject}
                    onChange={(e) => setMessageSubject(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                    Message <span className="text-[#ff1a4b]">*</span>
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={10}
                    className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white focus:border-[#ff1a4b] focus:outline-none resize-none font-mono"
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    placeholder="Enter your message here..."
                  />
                </div>

                <div className="flex gap-4">
                  <button type="submit" className="btn-neo px-8 py-3">
                    Send Message
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMessageSubject('')
                      setMessageBody('')
                    }}
                    className="px-8 py-3 rounded-lg border border-white/10 hover:bg-white/5"
                  >
                    Clear
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Edit Participant Modal */}
      {editingParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-[#0b0d12] border border-white/10 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-white mb-6">Edit Participant</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">First Name</label>
                  <input
                    type="text"
                    className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-2 text-white"
                    value={editForm.firstName || ''}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Last Name</label>
                  <input
                    type="text"
                    className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-2 text-white"
                    value={editForm.lastName || ''}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-2 text-white"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Phone</label>
                <input
                  type="tel"
                  className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-2 text-white"
                  value={editForm.phone || ''}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Tier</label>
                <select
                  className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-2 text-white"
                  value={editForm.tier || ''}
                  onChange={(e) => setEditForm({ ...editForm, tier: e.target.value as any })}
                >
                  <option value="free">Free Loader</option>
                  <option value="pathfinder">Pathfinder</option>
                  <option value="keymaster">Key Master</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Status</label>
                <select
                  className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-2 text-white"
                  value={editForm.status || ''}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                >
                  <option value="active">Active</option>
                  <option value="on-hold">On Hold</option>
                  <option value="disqualified">Disqualified</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSaveEdit}
                className="flex-1 btn-neo py-3"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setEditingParticipant(null)
                  setEditForm({})
                }}
                className="flex-1 px-6 py-3 rounded-lg border border-white/10 hover:bg-white/5"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Promoter Registration Form Modal */}
      {showPromoterForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#0b0d12] border border-white/10 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-white mb-6">Register New Promoter</h3>

            <div className="space-y-6">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Promoter Type <span className="text-[#ff1a4b]">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="promoterType"
                      value="individual"
                      checked={promoterFormType === 'individual'}
                      onChange={(e) => {
                        setPromoterFormType(e.target.value as PromoterType)
                        setPromoterFormData({ ...promoterFormData, type: e.target.value as PromoterType })
                      }}
                      className="text-[#ff1a4b]"
                    />
                    <span className="text-white">Individual</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="promoterType"
                      value="company"
                      checked={promoterFormType === 'company'}
                      onChange={(e) => {
                        setPromoterFormType(e.target.value as PromoterType)
                        setPromoterFormData({ ...promoterFormData, type: e.target.value as PromoterType })
                      }}
                      className="text-[#ff1a4b]"
                    />
                    <span className="text-white">Company</span>
                  </label>
                </div>
              </div>

              {/* Individual Fields */}
              {promoterFormType === 'individual' && (
                <div className="space-y-4 border-t border-white/10 pt-6">
                  <h4 className="text-lg font-semibold text-white">Individual Information</h4>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">First Name *</label>
                      <input
                        type="text"
                        className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-2 text-white"
                        value={promoterFormData.firstName || ''}
                        onChange={(e) => setPromoterFormData({ ...promoterFormData, firstName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Middle Name</label>
                      <input
                        type="text"
                        className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-2 text-white"
                        value={promoterFormData.middleName || ''}
                        onChange={(e) => setPromoterFormData({ ...promoterFormData, middleName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Last Name *</label>
                      <input
                        type="text"
                        className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-2 text-white"
                        value={promoterFormData.lastName || ''}
                        onChange={(e) => setPromoterFormData({ ...promoterFormData, lastName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-2 text-white"
                        value={promoterFormData.phone || ''}
                        onChange={(e) => setPromoterFormData({ ...promoterFormData, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Email Address *</label>
                      <input
                        type="email"
                        className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-2 text-white"
                        value={promoterFormData.email || ''}
                        onChange={(e) => setPromoterFormData({ ...promoterFormData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">X Account</label>
                      <input
                        type="text"
                        placeholder="@username"
                        className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-2 text-white"
                        value={promoterFormData.xAccount || ''}
                        onChange={(e) => setPromoterFormData({ ...promoterFormData, xAccount: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Telegram Account</label>
                      <input
                        type="text"
                        placeholder="@username"
                        className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-2 text-white"
                        value={promoterFormData.telegramAccount || ''}
                        onChange={(e) => setPromoterFormData({ ...promoterFormData, telegramAccount: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Discord</label>
                      <input
                        type="text"
                        placeholder="username#0000"
                        className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-2 text-white"
                        value={promoterFormData.discordAccount || ''}
                        onChange={(e) => setPromoterFormData({ ...promoterFormData, discordAccount: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Company Fields */}
              {promoterFormType === 'company' && (
                <div className="space-y-4 border-t border-white/10 pt-6">
                  <h4 className="text-lg font-semibold text-white">Company Information</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Company Name *</label>
                      <input
                        type="text"
                        className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-2 text-white"
                        value={promoterFormData.companyName || ''}
                        onChange={(e) => setPromoterFormData({ ...promoterFormData, companyName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Company License</label>
                      <input
                        type="text"
                        className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-2 text-white"
                        value={promoterFormData.companyLicense || ''}
                        onChange={(e) => setPromoterFormData({ ...promoterFormData, companyLicense: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Company Address</label>
                      <input
                        type="text"
                        className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-2 text-white"
                        value={promoterFormData.companyAddress || ''}
                        onChange={(e) => setPromoterFormData({ ...promoterFormData, companyAddress: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Company Website</label>
                      <input
                        type="url"
                        placeholder="https://"
                        className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-2 text-white"
                        value={promoterFormData.companyWebsite || ''}
                        onChange={(e) => setPromoterFormData({ ...promoterFormData, companyWebsite: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Company X Account</label>
                      <input
                        type="text"
                        placeholder="@company"
                        className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-2 text-white"
                        value={promoterFormData.companyX || ''}
                        onChange={(e) => setPromoterFormData({ ...promoterFormData, companyX: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Company Telegram</label>
                      <input
                        type="text"
                        placeholder="@company"
                        className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-2 text-white"
                        value={promoterFormData.companyTelegram || ''}
                        onChange={(e) => setPromoterFormData({ ...promoterFormData, companyTelegram: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Company Discord</label>
                      <input
                        type="text"
                        className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-2 text-white"
                        value={promoterFormData.companyDiscord || ''}
                        onChange={(e) => setPromoterFormData({ ...promoterFormData, companyDiscord: e.target.value })}
                      />
                    </div>
                  </div>

                  <h4 className="text-lg font-semibold text-white pt-4">Contact Person</h4>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Full Name *</label>
                      <input
                        type="text"
                        className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-2 text-white"
                        value={promoterFormData.contactPersonName || ''}
                        onChange={(e) => setPromoterFormData({ ...promoterFormData, contactPersonName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Email *</label>
                      <input
                        type="email"
                        className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-2 text-white"
                        value={promoterFormData.contactPersonEmail || ''}
                        onChange={(e) => setPromoterFormData({ ...promoterFormData, contactPersonEmail: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Phone *</label>
                      <input
                        type="tel"
                        className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-2 text-white"
                        value={promoterFormData.contactPersonPhone || ''}
                        onChange={(e) => setPromoterFormData({ ...promoterFormData, contactPersonPhone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Common Fields */}
              <div className="space-y-4 border-t border-white/10 pt-6">
                <h4 className="text-lg font-semibold text-white">Additional Information</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Forecasted Number of Participants *</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-2 text-white"
                      value={promoterFormData.forecastedParticipants || 0}
                      onChange={(e) => setPromoterFormData({ ...promoterFormData, forecastedParticipants: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Wallet Address</label>
                    <input
                      type="text"
                      placeholder="Solana wallet address"
                      className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-2 text-white font-mono"
                      value={promoterFormData.walletAddress || ''}
                      onChange={(e) => setPromoterFormData({ ...promoterFormData, walletAddress: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleSaveDraft}
                className="px-6 py-3 rounded-lg border border-white/10 hover:bg-white/5 text-white"
              >
                Save Draft
              </button>
              <button
                onClick={() => {
                  setShowPromoterForm(false)
                  resetPromoterForm()
                }}
                className="px-6 py-3 rounded-lg border border-white/10 hover:bg-white/5 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleRegisterPromoter}
                className="flex-1 btn-neo py-3"
              >
                Register Promoter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Feedback Modal */}
      {showRejectionForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#0b0d12] border border-white/10 rounded-2xl p-8 max-w-2xl w-full">
            <h3 className="text-2xl font-bold text-white mb-4">Rejection Feedback</h3>
            <p className="text-slate-300 mb-6">
              Provide feedback on why this promoter registration was rejected:
            </p>

            <textarea
              rows={6}
              className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white focus:border-[#ff1a4b] focus:outline-none resize-none"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
            />

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => {
                  setShowRejectionForm(null)
                  setRejectionReason('')
                }}
                className="px-6 py-3 rounded-lg border border-white/10 hover:bg-white/5 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSendRejection}
                className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-6 py-3 rounded-lg font-semibold"
              >
                Send Rejection Email
              </button>
            </div>
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  )
}
