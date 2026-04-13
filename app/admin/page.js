'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

// ─── Constants ────────────────────────────────────────────────────────────────

const BADGE_TYPES = [
  { key: 'community_verified',     label: 'Community Verified',     color: '#085041', bg: '#E1F5EE' },
  { key: 'top_referrer',           label: 'Top Referrer',           color: '#3C3489', bg: '#EEEDFE' },
  { key: 'halal_friendly_advocate',label: 'Halal-Friendly Advocate',color: '#633806', bg: '#FAEEDA' },
  { key: 'portfolio_linked',       label: 'Portfolio Linked',       color: '#633806', bg: '#FAEEDA' },
]

const STAGE_LABELS = {
  matched: 'Matched', submitted: 'Submitted', interviewing: 'Interviewing',
  hired: 'Hired', bonus_pending: 'Bonus Pending', complete: 'omplete',
}

const STAGE_COLORS = {
  matched:       { background: '#E1F5EE', color: '#085041' },
  submitted:     { background: '#FAEEDA', color: '#633806' },
  interviewing:  { background: '#E1F5EE', color: '#085041' },
  hired:         { background: '#EEEDFE', color: '#3C3489' },
  bonus_pending: { background: '#EEEDFE', color: '#3C3489' },
  complete:      { background: '#F1EFE8', color: '#2C2C2A' },
}

// ─── Shared Styles ────────────────────────────────────────────────────────────

const cardStyle = {
  background: '#fff',
  border: '0.5px solid rgba(0,0,0,0.1)',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '10px',
}

const labelStyle = {
  fontSize: '11px', fontWeight: '500', color: '#888',
  letterSpacing: '0.06em', marginBottom: '6px', display: 'block',
}

const inputStyle = {
  width: '100%', borderRadius: '8px',
  border: '0.5px solid rgba(0,0,0,0.15)',
  padding: '9px 12px', marginBottom: '10px',
  fontFamily: 'DM Sans, sans-serif', fontSize: '13px',
  color: '#111', outline: 'none', background: '#fff',
  boxSizing: 'border-box',
}

const btnPrimary = {
  padding: '8px 16px', borderRadius: '8px',
  background: '#085041', color: '#E1F5EE',
  border: 'none', fontFamily: 'DM Sans, sans-serif',
  fontSize: '13px', fontWeight: '500', cursor: 'pointer',
}

const btnDanger = {
  padding: '8px 16px', borderRadius: '8px',
  background: '#A32D2D', color: '#fff',
  border: 'none', fontFamily: 'DM Sans, sans-serif',
  fontSize: '13px', fontWeight: '500', cursor: 'pointer',
}

const btnGhost = {
  padding: '8px 16px', borderRadius: '8px',
  background: 'transparent', color: '#888',
  border: '0.5px solid rgba(0,0,0,0.15)',
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '13px', cursor: 'pointer',
}

// ─── Pill Badge ───────────────────────────────────────────────────────────────

function Pill({ label, bg, color }) {
  return (
    <span style={{
      fontSize: '11px', padding: '3px 8px', borderRadius: '20px',
      fontWeight: '500', background: bg, color,
      display: 'inline-block', marginRight: '4px', marginBottom: '4px',
    }}>
      {label}
    </span>
  )
}

// ─── Section: Stats ───────────────────────────────────────────────────────────

function StatsSection() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [
        { count: totalUsers },
        { count: totalInsiders },
        { count: totalSeekers },
        { count: totalMatches },
        { count: totalHires },
        { count: flaggedUsers },
        { count: bannedUsers },
        { data: barakahData },
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'insider'),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'seeker'),
        supabase.from('matches').select('*', { count: 'exact', head: true }),
        supabase.from('matches').select('*', { count: 'exact', head: true }).in('stage', ['hired', 'bonus_pending', 'complete']),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_flagged', true),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_banned', true),
        supabase.from('barakah_log').select('points'),
      ])

      const totalBarakah = (barakahData || []).reduce((sum, r) => sum + (r.points || 0), 0)

      setStats({
        totalUsers: totalUsers || 0,
        totalInsiders: totalInsiders || 0,
        totalSeekers: totalSeekers || 0,
        totalMatches: totalMatches || 0,
        totalHires: totalHires || 0,
        flaggedUsers: flaggedUsers || 0,
        bannedUsers: bannedUsers || 0,
        totalBarakah,
      })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div style={{ color: '#888', fontSize: '13px' }}>Loading stats...</div>

  const statCards = [
    { label: 'Total Users',       value: stats.totalUsers,     bg: '#E1F5EE', color: '#085041' },
    { label: 'Insiders',          value: stats.totalInsiders,  bg: '#EEEDFE', color: '#3C3489' },
    { label: 'Seekers',           value: stats.totalSeekers,   bg: '#FAEEDA', color: '#633806' },
    { label: 'Total Matches',     value: stats.totalMatches,   bg: '#E8F0FE', color: '#1a73e8' },
    { label: 'Total Hires',       value: stats.totalHires,     bg: '#E6F4EA', color: '#1e8e3e' },
    { label: 'Barakah Points',    value: stats.totalBarakah,   bg: '#FEF3E2', color: '#E37400' },
    { label: 'Flagged Users',     value: stats.flaggedUsers,   bg: '#FCEBEB', color: '#A32D2D' },
    { label: 'Banned Users',      value: stats.bannedUsers,    bg: '#F1EFE8', color: '#2C2C2A' },
  ]

  return (
    <div>
      <div style={{ fontSize: '16px', fontWeight: '600', color: '#111', marginBottom: '16px' }}>Platform Stats</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
        {statCards.map(s => (
          <div key={s.label} style={{ ...cardStyle, marginBottom: 0, background: s.bg, border: 'none', textAlign: 'center', padding: '20px 12px' }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: s.color, fontFamily: 'Playfair Display, serif' }}>{s.value.toLocaleString()}</div>
            <div style={{ fontSize: '12px', color: s.color, opacity: 0.8, marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Section: Users ───────────────────────────────────────────────────────────

function UsersSection() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => { loadUsers() }, [])

  async function loadUsers() {
    setLoading(true)
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, tag_line, role, is_flagged, flag_reason, is_banned, is_admin, created_at')
      .order('created_at', { ascending: false })

    console.log('loadUsers — data:', data, 'error:', error)

    if (!data) { setLoading(false); return }

    // Load badges for all users in one query
    const { data: allBadges } = await supabase
      .from('badges')
      .select('user_id, badge_type')

    const badgeMap = {}
    ;(allBadges || []).forEach(b => {
      if (!badgeMap[b.user_id]) badgeMap[b.user_id] = []
      badgeMap[b.user_id].push(b.badge_type)
    })

    setUsers(data.map(u => ({ ...u, badges: badgeMap[u.id] || [] })))
    setLoading(false)
  }

  async function toggleBan(user) {
    setActionLoading(user.id + '-ban')
    const newBanned = !user.is_banned
    const { error } = await supabase
      .from('users')
      .update({ is_banned: newBanned })
      .eq('id', user.id)
    if (!error) {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_banned: newBanned } : u))
    }
    setActionLoading(null)
  }

  const filtered = users.filter(u =>
    !search ||
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div style={{ color: '#888', fontSize: '13px' }}>Loading users...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '16px', fontWeight: '600', color: '#111' }}>All Users ({users.length})</div>
      </div>
      <input
        style={{ ...inputStyle, marginBottom: '16px' }}
        placeholder="Search by name or role..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {filtered.map(user => (
        <div key={user.id} style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#111' }}>{user.full_name || 'No name'}</span>
                <Pill
                  label={user.role || 'unknown'}
                  bg={user.role === 'insider' ? '#EEEDFE' : user.role === 'seeker' ? '#E1F5EE' : '#F1EFE8'}
                  color={user.role === 'insider' ? '#3C3489' : user.role === 'seeker' ? '#085041' : '#2C2C2A'}
                />
                {user.is_admin && <Pill label="Admin" bg="#085041" color="#E1F5EE" />}
                {user.is_banned && <Pill label="Banned" bg="#FCEBEB" color="#A32D2D" />}
                {user.is_flagged && <Pill label="Flagged" bg="#FEF3E2" color="#E37400" />}
              </div>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>{user.tag_line || '—'}</div>
              <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '8px' }}>
                ID: {user.id.slice(0, 8)}... · Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              {user.badges.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {user.badges.map(b => {
                    const def = BADGE_TYPES.find(bt => bt.key === b)
                    return def ? <Pill key={b} label={def.label} bg={def.bg} color={def.color} /> : null
                  })}
                </div>
              )}
              {user.is_flagged && user.flag_reason && (
                <div style={{ fontSize: '12px', color: '#E37400', marginTop: '6px' }}>⚑ {user.flag_reason}</div>
              )}
            </div>
            <div style={{ flexShrink: 0 }}>
              {user.is_admin ? (
                <span style={{
                  padding: '8px 16px', borderRadius: '8px',
                  background: '#F1EFE8', color: '#aaa',
                  fontSize: '13px', fontWeight: '500',
                  fontFamily: 'DM Sans, sans-serif',
                }}>
                  Admin
                </span>
              ) : (
                <button
                  onClick={() => toggleBan(user)}
                  disabled={actionLoading === user.id + '-ban'}
                  style={user.is_banned ? { ...btnPrimary, background: '#085041' } : btnDanger}
                >
                  {actionLoading === user.id + '-ban' ? '...' : user.is_banned ? 'Unban' : 'Ban'}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', color: '#888', fontSize: '13px', padding: '40px' }}>No users found.</div>
      )}
    </div>
  )
}

// ─── Section: Flagged ─────────────────────────────────────────────────────────

function FlaggedSection() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedUser, setExpandedUser] = useState(null)
  const [nameLogs, setNameLogs] = useState({})
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => { loadFlagged() }, [])

  async function loadFlagged() {
    setLoading(true)
    const { data } = await supabase
      .from('users')
      .select('id, full_name, tag_line, role, flag_reason, flagged_at, is_banned')
      .eq('is_flagged', true)
      .order('flagged_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  async function loadNameLog(userId) {
    if (nameLogs[userId]) {
      setExpandedUser(expandedUser === userId ? null : userId)
      return
    }
    const { data } = await supabase
      .from('name_change_log')
      .select('old_name, new_name, changed_at')
      .eq('user_id', userId)
      .order('changed_at', { ascending: false })
    setNameLogs(prev => ({ ...prev, [userId]: data || [] }))
    setExpandedUser(userId)
  }

  async function unflagUser(userId) {
    setActionLoading(userId + '-unflag')
    const { error } = await supabase
      .from('users')
      .update({ is_flagged: false, flag_reason: null, flagged_at: null })
      .eq('id', userId)
    if (!error) setUsers(prev => prev.filter(u => u.id !== userId))
    setActionLoading(null)
  }

  async function banUser(userId) {
    setActionLoading(userId + '-ban')
    const { error } = await supabase
      .from('users')
      .update({ is_banned: true })
      .eq('id', userId)
    if (!error) setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_banned: true } : u))
    setActionLoading(null)
  }

  if (loading) return <div style={{ color: '#888', fontSize: '13px' }}>Loading flagged users...</div>

  if (users.length === 0) return (
    <div style={{ textAlign: 'center', padding: '60px', color: '#888', fontSize: '14px' }}>
      ✓ No flagged users.
    </div>
  )

  return (
    <div>
      <div style={{ fontSize: '16px', fontWeight: '600', color: '#111', marginBottom: '16px' }}>
        Flagged Users ({users.length})
      </div>
      {users.map(user => (
        <div key={user.id} style={{ ...cardStyle, border: '0.5px solid #F0C070' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#111' }}>{user.full_name || 'No name'}</span>
                <Pill
                  label={user.role || 'unknown'}
                  bg={user.role === 'insider' ? '#EEEDFE' : '#E1F5EE'}
                  color={user.role === 'insider' ? '#3C3489' : '#085041'}
                />
                {user.is_banned && <Pill label="Banned" bg="#FCEBEB" color="#A32D2D" />}
              </div>
              <div style={{ fontSize: '12px', color: '#E37400', marginBottom: '4px' }}>⚑ {user.flag_reason}</div>
              <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '10px' }}>
                Flagged {user.flagged_at ? new Date(user.flagged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
              </div>
              <button
                onClick={() => loadNameLog(user.id)}
                style={{ ...btnGhost, fontSize: '12px', padding: '5px 12px', marginBottom: '8px' }}
              >
                {expandedUser === user.id ? 'Hide name log ↑' : 'View name log ↓'}
              </button>
              {expandedUser === user.id && (
                <div style={{ background: '#f5f4f0', borderRadius: '8px', padding: '10px 12px', marginBottom: '8px' }}>
                  {nameLogs[user.id]?.length === 0 ? (
                    <div style={{ fontSize: '12px', color: '#888' }}>No name changes logged.</div>
                  ) : nameLogs[user.id]?.map((log, i) => (
                    <div key={i} style={{ fontSize: '12px', color: '#555', marginBottom: '6px', lineHeight: '1.5' }}>
                      <span style={{ color: '#888' }}>{new Date(log.changed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      {' · '}
                      <span style={{ textDecoration: 'line-through', color: '#aaa' }}>{log.old_name}</span>
                      {' → '}
                      <span style={{ fontWeight: '500', color: '#111' }}>{log.new_name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
              <button
                onClick={() => unflagUser(user.id)}
                disabled={!!actionLoading}
                style={btnGhost}
              >
                {actionLoading === user.id + '-unflag' ? '...' : 'Unflag'}
              </button>
              {!user.is_banned && (
                <button
                  onClick={() => banUser(user.id)}
                  disabled={!!actionLoading}
                  style={btnDanger}
                >
                  {actionLoading === user.id + '-ban' ? '...' : 'Ban'}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Section: Badges ──────────────────────────────────────────────────────────

function BadgesSection() {
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userBadges, setUserBadges] = useState([])
  const [actionLoading, setActionLoading] = useState(null)
  const [successMsg, setSuccessMsg] = useState('')

  async function searchUsers() {
    if (!search.trim()) return
    setSearching(true)
    const { data } = await supabase
      .from('users')
      .select('id, full_name, tag_line, role')
      .ilike('full_name', `%${search}%`)
      .limit(10)
    setSearchResults(data || [])
    setSearching(false)
  }

  async function selectUser(user) {
    setSelectedUser(user)
    setSearchResults([])
    setSearch('')
    const { data } = await supabase
      .from('badges')
      .select('badge_type')
      .eq('user_id', user.id)
    setUserBadges((data || []).map(b => b.badge_type))
    setSuccessMsg('')
  }

  async function awardBadge(badgeType) {
    if (!selectedUser) return
    setActionLoading(badgeType)
    const { error } = await supabase
      .from('badges')
      .insert({ user_id: selectedUser.id, badge_type: badgeType })
    if (!error) {
      setUserBadges(prev => [...prev, badgeType])
      setSuccessMsg(`✓ Awarded ${BADGE_TYPES.find(b => b.key === badgeType)?.label}`)
      setTimeout(() => setSuccessMsg(''), 3000)
    }
    setActionLoading(null)
  }

  async function revokeBadge(badgeType) {
    if (!selectedUser) return
    setActionLoading(badgeType)
    const { error } = await supabase
      .from('badges')
      .delete()
      .eq('user_id', selectedUser.id)
      .eq('badge_type', badgeType)
    if (!error) {
      setUserBadges(prev => prev.filter(b => b !== badgeType))
      setSuccessMsg(`✓ Revoked ${BADGE_TYPES.find(b => b.key === badgeType)?.label}`)
      setTimeout(() => setSuccessMsg(''), 3000)
    }
    setActionLoading(null)
  }

  return (
    <div>
      <div style={{ fontSize: '16px', fontWeight: '600', color: '#111', marginBottom: '16px' }}>Badge Management</div>

      {/* Search */}
      <div style={cardStyle}>
        <label style={labelStyle}>SEARCH USER</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
            placeholder="Type a name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchUsers()}
          />
          <button onClick={searchUsers} disabled={searching} style={btnPrimary}>
            {searching ? '...' : 'Search'}
          </button>
        </div>
        {searchResults.length > 0 && (
          <div style={{ marginTop: '8px', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
            {searchResults.map(u => (
              <div
                key={u.id}
                onClick={() => selectUser(u)}
                style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '0.5px solid rgba(0,0,0,0.06)', background: '#fff', fontSize: '13px' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f5f4f0'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                <span style={{ fontWeight: '500', color: '#111' }}>{u.full_name}</span>
                <span style={{ color: '#888', marginLeft: '8px' }}>{u.role} · {u.tag_line || '—'}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected user + badge controls */}
      {selectedUser && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#111' }}>{selectedUser.full_name}</div>
              <div style={{ fontSize: '12px', color: '#888' }}>{selectedUser.role} · {selectedUser.tag_line || '—'}</div>
            </div>
            <button onClick={() => setSelectedUser(null)} style={{ ...btnGhost, fontSize: '12px', padding: '5px 10px' }}>✕ Clear</button>
          </div>

          {successMsg && (
            <div style={{ background: '#E1F5EE', border: '0.5px solid #9FE1CB', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: '#085041', marginBottom: '12px' }}>
              {successMsg}
            </div>
          )}

          <label style={labelStyle}>BADGES</label>
          {BADGE_TYPES.map(badge => {
            const hasBadge = userBadges.includes(badge.key)
            return (
              <div key={badge.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Pill label={badge.label} bg={badge.bg} color={badge.color} />
                  {hasBadge && <span style={{ fontSize: '11px', color: '#1e8e3e' }}>✓ Active</span>}
                </div>
                <button
                  onClick={() => hasBadge ? revokeBadge(badge.key) : awardBadge(badge.key)}
                  disabled={actionLoading === badge.key}
                  style={hasBadge ? btnDanger : btnPrimary}
                >
                  {actionLoading === badge.key ? '...' : hasBadge ? 'Revoke' : 'Award'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Section: Matches ─────────────────────────────────────────────────────────

function MatchesSection() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { loadMatches() }, [])

  async function loadMatches() {
    setLoading(true)

    // Load matches with seeker + insider names + company name
    const { data: matchData } = await supabase
      .from('matches')
      .select(`
        id, stage, created_at, is_archived, is_stale,
        seeker:seeker_id ( id, full_name, tag_line ),
        insider:insider_id ( id, full_name, tag_line ),
        company:company_id ( id, name )
      `)
      .order('created_at', { ascending: false })

    setMatches(matchData || [])
    setLoading(false)
  }

  const filtered = matches.filter(m => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      m.seeker?.full_name?.toLowerCase().includes(q) ||
      m.insider?.full_name?.toLowerCase().includes(q) ||
      m.company?.name?.toLowerCase().includes(q) ||
      m.stage?.toLowerCase().includes(q)
    )
  })

  if (loading) return <div style={{ color: '#888', fontSize: '13px' }}>Loading matches...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '16px', fontWeight: '600', color: '#111' }}>All Matches ({matches.length})</div>
      </div>
      <input
        style={{ ...inputStyle, marginBottom: '16px' }}
        placeholder="Search by seeker, insider, company, or stage..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {filtered.map(match => (
        <div key={match.id} style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#111' }}>
                  {match.company?.name || 'Unknown Co.'}
                </span>
                <span style={{
                  fontSize: '11px', padding: '3px 8px', borderRadius: '20px',
                  fontWeight: '500', ...(STAGE_COLORS[match.stage] || { background: '#F1EFE8', color: '#2C2C2A' })
                }}>
                  {STAGE_LABELS[match.stage] || match.stage}
                </span>
                {match.is_stale && <Pill label="Stale" bg="#FCEBEB" color="#A32D2D" />}
                {match.is_archived && <Pill label="Archived" bg="#F1EFE8" color="#888" />}
              </div>
              <div style={{ fontSize: '12px', color: '#555', marginBottom: '2px' }}>
                <span style={{ color: '#888' }}>Seeker: </span>{match.seeker?.full_name || '—'}
              </div>
              <div style={{ fontSize: '12px', color: '#555', marginBottom: '2px' }}>
                <span style={{ color: '#888' }}>Insider: </span>{match.insider?.full_name || '—'}
              </div>
              <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>
                {new Date(match.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                {' · ID: '}{match.id.slice(0, 8)}...
              </div>
            </div>
          </div>
        </div>
      ))}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', color: '#888', fontSize: '13px', padding: '40px' }}>No matches found.</div>
      )}
    </div>
  )
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const [checking, setChecking] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [activeSection, setActiveSection] = useState('stats')

  useEffect(() => {
    async function checkAdmin() {
      // Wait for auth state to settle before checking session
      const { data: { session } } = await new Promise(resolve => {
        supabase.auth.getSession().then(resolve)
      })

      if (!session) {
        // Retry once after a short delay in case session is still loading
        await new Promise(r => setTimeout(r, 500))
        const { data: { session: retrySession } } = await supabase.auth.getSession()
        if (!retrySession) { window.location.href = '/login'; return }
      }

      const activeSession = session || (await supabase.auth.getSession()).data.session

      const { data: user, error: userError } = await supabase
        .from('users')
        .select('is_admin, is_banned')
        .eq('id', activeSession.user.id)
        .single()

      console.log('Admin check — user:', user, 'error:', userError, 'session id:', activeSession?.user?.id)

      if (!user?.is_admin || user?.is_banned) {
        console.log('Redirecting — is_admin:', user?.is_admin, 'is_banned:', user?.is_banned)
        window.location.href = '/'
        return
      }

      setAuthorized(true)
      setChecking(false)
    }
    checkAdmin()
  }, [])

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f4f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif', color: '#888' }}>
        Checking access...
      </div>
    )
  }

  if (!authorized) return null

  const navItems = [
    { key: 'stats',   label: '📊 Stats' },
    { key: 'users',   label: '👥 Users' },
    { key: 'flagged', label: '⚑ Flagged' },
    { key: 'badges',  label: '🏅 Badges' },
    { key: 'matches', label: '🤝 Matches' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f5f4f0', fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ background: '#085041', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', fontWeight: '500', color: '#E1F5EE' }}>MRN Admin</div>
          <div style={{ fontSize: '11px', color: '#9FE1CB', letterSpacing: '0.06em', marginTop: '1px' }}>PLATFORM DASHBOARD</div>
        </div>
        <button
          onClick={() => window.location.href = '/'}
          style={{ background: 'transparent', border: '0.5px solid rgba(255,255,255,0.3)', color: '#9FE1CB', fontSize: '12px', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
        >
          ← Back to app
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Sidebar */}
        <div style={{ width: '180px', background: '#fff', borderRight: '0.5px solid rgba(0,0,0,0.08)', padding: '16px 0', flexShrink: 0, overflowY: 'auto' }}>
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveSection(item.key)}
              style={{
                width: '100%', textAlign: 'left',
                padding: '10px 20px', border: 'none',
                background: activeSection === item.key ? '#E1F5EE' : 'transparent',
                color: activeSection === item.key ? '#085041' : '#555',
                fontSize: '13px', fontWeight: activeSection === item.key ? '500' : '400',
                cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                borderLeft: activeSection === item.key ? '3px solid #085041' : '3px solid transparent',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {activeSection === 'stats'   && <StatsSection />}
          {activeSection === 'users'   && <UsersSection />}
          {activeSection === 'flagged' && <FlaggedSection />}
          {activeSection === 'badges'  && <BadgesSection />}
          {activeSection === 'matches' && <MatchesSection />}
        </div>
      </div>
    </div>
  )
}
