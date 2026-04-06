'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Card from './ui/Card'
import ChatsPage from './ChatsPage'

export default function InsiderMatches() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [barakahPoints, setBarakahPoints] = useState(0)
  const [updatingStage, setUpdatingStage] = useState(null)
  const [showChats, setShowChats] = useState(false)
  const [totalUnread, setTotalUnread] = useState(0)
  const [currentUserId, setCurrentUserId] = useState(null)

  const stages = ['matched', 'submitted', 'interviewing', 'hired', 'bonus_pending']
  const stageLabels = {
    matched: 'Matched',
    submitted: 'Submitted',
    interviewing: 'Interview',
    hired: 'Hired',
    bonus_pending: 'Bonus',
  }
  const stageIndex = {
    matched: 0, submitted: 1, interviewing: 2, hired: 3, bonus_pending: 4,
  }

  useEffect(() => {
    load()
    // Check if returning from a chat
    const chatRead = sessionStorage.getItem('mrn_chat_read')
    if (chatRead) {
      sessionStorage.removeItem('mrn_chat_read')
      load()
    }
  }, [])

  async function load() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const userId = session.user.id
    setCurrentUserId(session.user.id)

    // Load matches
    const { data: matchData } = await supabase
      .from('matches')
      .select('*')
      .eq('insider_id', userId)
      .order('created_at', { ascending: false })

    if (!matchData || matchData.length === 0) {
      setMatches([])
      setLoading(false)
      return
    }

    // Load seeker info
    const seekerIds = matchData.map(m => m.seeker_id)
    const companyIds = matchData.map(m => m.company_id)

    const { data: seekerUsers } = await supabase
      .from('users')
      .select('id, full_name, tag_line, avatar_url')
      .in('id', seekerIds)

    const { data: companies } = await supabase
      .from('companies')
      .select('id, name')
      .in('id', companyIds)

    // Load unread count per match
      const unreadPerMatch = await Promise.all(
        matchData.map(async (match) => {
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('match_id', match.id)
            .eq('is_read', false)
            .neq('sender_id', userId)
          return { matchId: match.id, count: count || 0 }
        })
      )

      // Load last message per match
      const lastMessages = await Promise.all(
        matchData.map(async (match) => {
          const { data } = await supabase
            .from('messages')
            .select('content, created_at, sender_id')
            .eq('match_id', match.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
          return { matchId: match.id, message: data }
        })
      )

      const enriched = matchData.map(match => ({
        ...match,
        seeker: seekerUsers?.find(u => u.id === match.seeker_id) || null,
        company: companies?.find(c => c.id === match.company_id) || null,
        unreadCount: unreadPerMatch.find(u => u.matchId === match.id)?.count || 0,
        lastMessage: lastMessages.find(m => m.matchId === match.id)?.message || null,
      }))

    setMatches(enriched)

    // Load barakah points
    const { data: barakahLog } = await supabase
      .from('barakah_log')
      .select('points')
      .eq('user_id', userId)

    const total = barakahLog?.reduce((sum, item) => sum + item.points, 0) || 0
      setBarakahPoints(total)

      // Load total unread count
      const allMatchIds = enriched.map(m => m.id)
      if (allMatchIds.length > 0) {
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .in('match_id', allMatchIds)
          .eq('is_read', false)
          .neq('sender_id', userId)
        setTotalUnread(count || 0)
      }

      setLoading(false)
    }

  const statusColor = {
    matched:      { background: '#E1F5EE', color: '#085041' },
    submitted:    { background: '#FAEEDA', color: '#633806' },
    interviewing: { background: '#E1F5EE', color: '#085041' },
    hired:        { background: '#EEEDFE', color: '#3C3489' },
    bonus_pending:{ background: '#EEEDFE', color: '#3C3489' },
  }

  const statusLabel = {
    matched:       'Matched',
    submitted:     'Submitted',
    interviewing:  'Interviewing',
    hired:         'Hired ✓',
    bonus_pending: 'Bonus pending',
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#888', fontFamily: 'DM Sans, sans-serif' }}>
        Loading matches...
      </div>
    )
  }

  return (
    <>
      {showChats && <ChatsPage onClose={() => setShowChats(false)} />}
      <div>
      {/* Barakah Points */}
      <Card style={{ margin: '10px 16px 12px' }}>
        <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FAEEDA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>✦</div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: '500', color: '#633806' }}>{barakahPoints} Barakah Points</div>
            <div style={{ fontSize: '12px', color: '#888' }}>{matches.filter(m => m.stage === 'hired').length} referrals hired · {matches.length} total</div>
          </div>
        </div>
      </Card>

      {/* Section header */}
      <div style={{ padding: '14px 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '17px', fontWeight: '500', color: '#111' }}>Your referrals</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '12px', color: '#888' }}>{matches.length} active</div>
          <button
            onClick={() => setShowChats(true)}
            style={{
              position: 'relative', background: 'none', border: 'none',
              cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '20px' }}>💬</span>
            {totalUnread > 0 && (
              <span style={{
                position: 'absolute', top: '0', right: '0',
                background: '#E24B4A', color: '#fff',
                fontSize: '9px', fontWeight: '500',
                width: '16px', height: '16px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1.5px solid #fff',
              }}>
                {totalUnread > 9 ? '9+' : totalUnread}
              </span>
            )}
          </button>
        </div>
      </div>

      {matches.length === 0 ? (
        <div style={{ padding: '40px 16px', textAlign: 'center', color: '#888', fontSize: '14px' }}>
          No matches yet. Accept a pitch to get started!
        </div>
      ) : (
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {matches.map(match => {
            const initials = match.seeker?.full_name
              ? match.seeker.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
              : '??'
            const currentStageIdx = stageIndex[match.stage] || 0

            return (
              <div key={match.id} style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '12px', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#E1F5EE', color: '#085041', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '500', flexShrink: 0, overflow: 'hidden' }}>
                    {match.seeker?.avatar_url ? (
                      <img src={match.seeker.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : initials}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#111' }}>
                      {match.seeker?.full_name} → {match.company?.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888' }}>{match.seeker?.tag_line}</div>
                  </div>
                  <span style={{ marginLeft: 'auto', fontSize: '11px', padding: '3px 8px', borderRadius: '20px', fontWeight: '500', ...statusColor[match.stage] }}>
                    {statusLabel[match.stage]}
                  </span>
                </div>

                {/* Pipeline */}
                <div style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                    {stages.map((stage, i) => (
                      <div key={stage} style={{ display: 'flex', alignItems: 'center', flex: i < stages.length - 1 ? 1 : 'none' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                          <div style={{
                            width: '8px', height: '8px', borderRadius: '50%',
                            background: i < currentStageIdx ? '#1D9E75' : i === currentStageIdx ? '#0F6E56' : '#D3D1C7',
                            boxShadow: i === currentStageIdx ? '0 0 0 3px #E1F5EE' : 'none',
                          }} />
                          <span style={{ fontSize: '10px', color: i <= currentStageIdx ? '#0F6E56' : '#aaa', whiteSpace: 'nowrap' }}>
                            {stageLabels[stage]}
                          </span>
                        </div>
                        {i < stages.length - 1 && (
                          <div style={{ flex: 1, height: '1px', margin: '0 2px', marginBottom: '11px', background: i < currentStageIdx ? '#1D9E75' : '#D3D1C7' }} />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Bonus pending notice */}
                  {match.stage === 'bonus_pending' && (
                    <div style={{ background: '#EEEDFE', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: '#3C3489', marginBottom: '10px' }}>
                      Success gift pending from seeker.
                    </div>
                  )}
                {/* Last message preview */}
                  {match.lastMessage && (
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px', background: '#f9f8f5', borderRadius: '6px', padding: '6px 10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {match.lastMessage.sender_id === currentUserId ? 'You: ' : ''}{match.lastMessage.content}
                    </div>
                  )}
                  {/* Chat button */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => window.location.href = `/chat?match=${match.id}`}
                      style={{ flex: 1, padding: '8px 0', borderRadius: '8px', background: '#085041', color: '#E1F5EE', border: 'none', fontFamily: 'DM Sans, sans-serif', fontSize: '12px', fontWeight: '500', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      {match.unreadCount > 0 && (
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E24B4A', flexShrink: 0 }} />
                      )}
                      Open chat
                      {match.unreadCount > 0 && (
                        <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.25)', padding: '1px 6px', borderRadius: '10px' }}>
                          {match.unreadCount}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      <div style={{ height: '16px' }} />
    </div>
    </>
  )
}