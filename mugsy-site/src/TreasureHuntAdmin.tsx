import { useState } from 'react'
import SiteHeader from './components/SiteHeader'
import SiteFooter from './components/SiteFooter'
import { motion } from 'framer-motion'
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

type Page = 'dashboard' | 'admins' | 'communications'

export default function TreasureHuntAdmin() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null)
  const [editForm, setEditForm] = useState<Partial<Participant>>({})

  // Communication state
  const [messageType, setMessageType] = useState<'email' | 'portal' | 'both'>('both')
  const [messageRecipients, setMessageRecipients] = useState<'all' | 'tier-specific'>('all')
  const [selectedTier, setSelectedTier] = useState<'free' | 'pathfinder' | 'keymaster'>('free')
  const [messageSubject, setMessageSubject] = useState('')
  const [messageBody, setMessageBody] = useState('')

  // Sample data - in production, this would come from an API
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
    },
    {
      id: '3',
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob.johnson@example.com',
      phone: '+1234567892',
      tier: 'free',
      walletAddress: '',
      status: 'on-hold',
      referralCode: '',
      registeredDate: '2024-11-22',
      ciphersSolved: 1
    }
  ])

  const [admins, setAdmins] = useState<AdminUser[]>([
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@redmugsy.com',
      role: 'super-admin',
      lastLogin: '2024-11-23 10:30'
    },
    {
      id: '2',
      name: 'Moderator User',
      email: 'moderator@redmugsy.com',
      role: 'moderator',
      lastLogin: '2024-11-23 09:15'
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
              {/* Section 1: Dashboard */}
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
                  {/* Pie Chart */}
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
                        <Tooltip
                          contentStyle={{ background: '#0f1115', border: '1px solid #333', borderRadius: 8, color: '#fff' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Bar Chart */}
                  <div className="card">
                    <h3 className="text-2xl font-bold text-white mb-6">Daily Signups</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dailySignups}>
                        <XAxis dataKey="date" stroke="#888" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#888" style={{ fontSize: '12px' }} />
                        <Tooltip
                          contentStyle={{ background: '#0f1115', border: '1px solid #333', borderRadius: 8, color: '#fff' }}
                        />
                        <Legend />
                        <Bar dataKey="free" stackId="a" fill="#888888" name="Free Loader" />
                        <Bar dataKey="pathfinder" stackId="a" fill="#ff1a4b" name="Pathfinder" />
                        <Bar dataKey="keymaster" stackId="a" fill="#00F0FF" name="Key Master" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </section>

              {/* Section 2: Participants Table */}
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

          {/* PAGE 2: ADMINISTRATOR MANAGEMENT */}
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

          {/* PAGE 3: COMMUNICATION PORTAL */}
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

      <SiteFooter />
    </div>
  )
}
