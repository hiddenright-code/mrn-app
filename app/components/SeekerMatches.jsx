'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import ChatsPage from './ChatsPage'

export default function SeekerMatches() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [pitches, setPitches] = useState([])
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
    bonus_pending: 'Gift sent',
  }
  const stageIndex = {
    matched: 0, submitted: 1, interviewing: 2, hired: 3, bonus_pending: 4,
  }

  // Stages seeker can update to
  const seekerUpdatableStages = ['interviewing', 'hired', 'bonus_pending']

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
      .eq('seeker_id', userId)
      .order('created_at', { ascending: false })

    // Load pending pitches
    const { data: pitchData } = await supabase
      .from('pitches')
      .select('*, company:company_id(name)')
      .eq('seeker_id', userId)
      .eq('status', 'pending')

    // Load declined pitches
    const { data: declinedPitches } = await supabase
      .from('pitches')
      .select('*, company:company_id(name)')
      .eq('seeker_id', userId)
      .eq('status', 'declined')

    setPitches([...(pitchData || []), ...(declinedPitches || [])])

    if (!matchData || matchData.length === 0) {
      setMatches([])
      setLoading(false)
      return
    }

    const companyIds = matchData.map(m => m.company_id)
    const insiderIds = matchData.map(m => m.insider_id)

    const { data: companies } = await supabase
      .from('companies')
      .select('id, name')
      .in('id', companyIds)

    const { data: insiderProfiles } = await supabase
      .from('insider_profiles')
      .select('user_id, company, role_level, anonymity_on')
      .in('user_id', insiderIds)

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
        company: companies?.find(c => c.id === match.company_id) || null,
        insider: insiderProfiles?.find(i => i.user_id === match.insider_id) || null,
        unreadCount: unreadPerMatch.find(u => u.matchId === match.id)?.count || 0,
        lastMessage: lastMessages.find(m => m.matchId === match.id)?.message || null,
      }))

    setMatches(enriched)

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

  async function updateStage(matchId, newStage) {
    setUpdatingStage(matchId)
    try {
      const { error } = await supabase
        .from('matches')
        .update({ stage: newStage })
        .eq('id', matchId)

      if (error) throw error

      setMatches(prev => prev.map(m =>
        m.id === matchId ? { ...m, stage: newStage } : m
      ))
    } catch (err) {
      alert('Error updating stage. Please try again.')
    } finally {
      setUpdatingStage(null)
    }
  }

  const statusColor = {
    matched:       { background: '#E1F5EE', color: '#085041' },
    submitted:     { background: '#FAEEDA', color: '#633806' },
    interviewing:  { background: '#E1F5EE', color: '#085041' },
    hired:         { background: '#EEEDFE', color: '#3C3489' },
    bonus_pending: { background: '#EEEDFE', color: '#3C3489' },
  }

  const statusLabel = {
    matched:       'Matched',
    submitted:     'Submitted',
    interviewing:  'Interviewing',
    hired:         'Hired ✓',
    bonus_pending: 'Gift sent',
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#888', fontFamily: 'DM Sans, sans-serif' }}>
        Loading matches...
      </div>
    )
  }

  return (
    <div>
      <div style={{ padding: '16px 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '17px', fontWeight: '500', color: '#111' }}>Your applications</div>
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

      {showChats && <ChatsPage onClose={() => setShowChats(false)} />}

      {/* Active matches */}
      {matches.length === 0 && pitches.length === 0 ? (
        <div style={{ padding: '40px 16px', textAlign: 'center', color: '#888', fontSize: '14px' }}>
          No matches yet. Pitch an insider to get started!
        </div>
      ) : (
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

          {/* Active matches */}
          {matches.map(match => {
            const currentStageIdx = stageIndex[match.stage] || 0
            const nextStage = seekerUpdatableStages.find(s => stageIndex[s] > currentStageIdx)

            return (
              <div key={match.id} style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '12px', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#E8F0FE', color: '#1a73e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '13px', flexShrink: 0 }}>
                    {match.company?.name?.[0] || '?'}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#111' }}>
                      {match.company?.name} · {match.insider?.role_level || 'Insider'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                      {match.insider?.anonymity_on ? 'Referred by insider (identity locked)' : `Referred by ${match.insider?.role_level} @ ${match.insider?.company}`}
                    </div>
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

                  {/* Update stage — only show if there's an action for the seeker */}
                  {seekerUpdatableStages.filter(s => stageIndex[s] === currentStageIdx + 1).length > 0 && match.stage !== 'bonus_pending' && (
                    <div style={{ background: '#f9f8f5', borderRadius: '8px', padding: '10px 12px', marginBottom: '10px' }}>
                      <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Update your status:</div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {seekerUpdatableStages
                          .filter(s => stageIndex[s] === currentStageIdx + 1)
                          .map(s => (
                            <button
                              key={s}
                              onClick={() => updateStage(match.id, s)}
                              disabled={updatingStage === match.id}
                              style={{
                                padding: '6px 12px', borderRadius: '20px', fontSize: '12px',
                                background: '#085041', color: '#E1F5EE', border: 'none',
                                fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', fontWeight: '500',
                              }}
                            >
                              {updatingStage === match.id ? 'Updating...' : `Mark as ${stageLabels[s]}`}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => window.location.href = `/chat?match=${match.id}`}
                      style={{ flex: 1, padding: '8px 0', borderRadius: '8px', background: '#085041', color: '#E1F5EE', border: 'none', fontFamily: 'DM Sans, sans-serif', fontSize: '12px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
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
                  {/* Last message preview */}
                  {match.lastMessage && (
                    <div style={{ fontSize: '12px', color: '#888', margin: '6px 0 0', background: '#f9f8f5', borderRadius: '6px', padding: '6px 10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {match.lastMessage.sender_id === currentUserId ? 'You: ' : ''}{match.lastMessage.content}
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Pending pitches */}
          {pitches.filter(p => p.status === 'pending').map(pitch => (
            <div key={pitch.id} style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#E8F0FE', color: '#1a73e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '13px', flexShrink: 0 }}>
                  {pitch.company?.name?.[0] || '?'}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#111' }}>{pitch.company?.name}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>Pitch sent · awaiting review</div>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: '11px', padding: '3px 8px', borderRadius: '20px', fontWeight: '500', background: '#FAEEDA', color: '#633806' }}>
                  Pending
                </span>
              </div>
            </div>
          ))}

          {/* Declined pitches */}
          {pitches.filter(p => p.status === 'declined').map(pitch => (
            <div key={pitch.id} style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '0.5px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#E8F0FE', color: '#1a73e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '13px', flexShrink: 0 }}>
                  {pitch.company?.name?.[0] || '?'}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#111' }}>{pitch.company?.name}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>Pitch declined</div>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: '11px', padding: '3px 8px', borderRadius: '20px', fontWeight: '500', background: '#FCEBEB', color: '#A32D2D' }}>
                  Declined
                </span>
              </div>
              {/* Show decline reasons */}
              {pitch.decline_reasons && pitch.decline_reasons.length > 0 && (
                <div style={{ padding: '12px 16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', letterSpacing: '0.06em', marginBottom: '8px' }}>REASON</div>
                  {pitch.decline_reasons.map((reason, i) => (
                    <div key={i} style={{ fontSize: '13px', color: '#111', padding: '6px 0', borderBottom: i < pitch.decline_reasons.length - 1 ? '0.5px solid rgba(0,0,0,0.06)' : 'none' }}>
                      · {reason}
                    </div>
                  ))}
                  {pitch.decline_comment && (
                    <div style={{ marginTop: '8px', fontSize: '13px', color: '#888', fontStyle: 'italic' }}>
                      "{pitch.decline_comment}"
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

        </div>
      )}
      <div style={{ height: '16px' }} />
    </div>
  )
}