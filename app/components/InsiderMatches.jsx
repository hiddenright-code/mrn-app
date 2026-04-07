'use client'
import { useState, useEffect, useRef } from 'react'
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
    bonus_pending: 'Bonus pending',
  }

  const [activeTab, setActiveTab] = useState('active')
  const activeTabRef = useRef('active')

  useEffect(() => {
    activeTabRef.current = activeTab
    load()
  }, [activeTab])

  async function load() {
    const tab = activeTabRef.current
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const userId = session.user.id
    setCurrentUserId(userId)

    const { data, error } = await supabase
      .rpc('get_matches_with_meta', {
        p_user_id: userId,
        p_archived: activeTabRef.current === 'archived',
      })

    if (error) {
      console.error('Error loading matches:', error)
      setLoading(false)
      return
    }
  

    // Filter to only insider's matches
    const insiderMatches = (data || []).filter(m => m.insider_id === userId)

    const enriched = insiderMatches.map(m => ({
      id: m.match_id,
      seeker_id: m.seeker_id,
      insider_id: m.insider_id,
      company_id: m.company_id,
      stage: m.stage,
      chat_enabled: m.chat_enabled,
      chat_ended: m.chat_ended,
      created_at: m.match_created_at,
      unreadCount: Number(m.unread_count) || 0,
      lastMessage: m.last_message_id ? {
        id: m.last_message_id,
        content: m.last_message_content,
        sender_id: m.last_message_sender_id,
        created_at: m.last_message_created_at,
        is_read: m.last_message_is_read,
      } : null,
      seeker: {
        id: m.seeker_id,
        full_name: m.seeker_full_name,
        tag_line: m.seeker_tag_line,
        avatar_url: m.seeker_avatar_url,
      },
      company: {
        id: m.company_id,
        name: m.company_name,
      },
    }))

    setMatches(enriched)
    setTotalUnread(enriched.reduce((sum, m) => sum + m.unreadCount, 0))

    // Load barakah points separately (not part of match meta)
    const { data: barakahLog } = await supabase
      .from('barakah_log')
      .select('points')
      .eq('user_id', userId)
    const total = barakahLog?.reduce((sum, item) => sum + item.points, 0) || 0
    setBarakahPoints(total)

    setLoading(false)
  }

  async function updateStage(matchId, newStage, seekerId = null) {
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

      // Notify seeker when insider marks submitted
      if (newStage === 'submitted' && seekerId) {
        await supabase
          .from('notifications')
          .insert({
            user_id: seekerId,
            type: 'pipeline_update',
            message: 'Your referral has been submitted! Check your matches for an update.',
            read: false,
            related_id: matchId,
          })
      }
    } catch (err) {
      alert('Error updating stage. Please try again.')
    } finally {
      setUpdatingStage(null)
    }
  }

  async function archiveMatch(matchId, reason) {
    try {
      const { error } = await supabase
        .from('matches')
        .update({
          is_archived: true,
          archived_at: new Date().toISOString(),
          archive_reason: reason,
        })
        .eq('id', matchId)
      if (error) throw error
      setMatches(prev => prev.filter(m => m.id !== matchId))
    } catch (err) {
      alert('Error archiving match. Please try again.')
    }
  }

  async function unarchiveMatch(matchId) {
    try {
      await supabase
        .from('matches')
        .update({
          is_archived: false,
          archived_at: null,
          archive_reason: null,
        })
        .eq('id', matchId)
      setMatches(prev => prev.filter(m => m.id !== matchId))
    } catch (err) {
      alert('Error unarchiving match. Please try again.')
    }
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
      {showChats && <ChatsPage onClose={() => { setShowChats(false); load() }} />}
      <div>
        {/* Barakah Points */}
        <Card style={{ margin: '10px 16px 12px' }}>
          <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
              🌿
            </div>
            <div>
              <div style={{ fontSize: '13px', color: '#888', fontFamily: 'DM Sans, sans-serif' }}>Barakah Points</div>
              <div style={{ fontSize: '22px', fontWeight: '600', color: '#085041', fontFamily: 'DM Sans, sans-serif' }}>{barakahPoints}</div>
            </div>
          </div>
        </Card>

        {/* Tab toggle */}
        <div style={{ padding: '8px 16px', display: 'flex', gap: '8px' }}>
          {['active', 'archived'].map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setMatches([]) }}
              style={{
                padding: '6px 16px', borderRadius: '20px', fontSize: '12px',
                fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', fontWeight: '500',
                background: activeTab === tab ? '#085041' : '#f9f8f5',
                color: activeTab === tab ? '#E1F5EE' : '#888',
                border: `0.5px solid ${activeTab === tab ? '#085041' : 'rgba(0,0,0,0.1)'}`,
              }}
            >
              {tab === 'active' ? 'Active' : 'Archived'}
            </button>
          ))}
        </div>

        {/* Header */}
        <div style={{ padding: '0 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '17px', fontWeight: '500', color: '#111' }}>
            {activeTab === 'active' ? 'Your referrals' : 'Archived referrals'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '12px', color: '#888' }}>{matches.length} {activeTab}</div>
            <button
              onClick={() => setShowChats(true)}
              style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
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

                    {/* Insider can mark submitted */}
                    {match.stage === 'matched' && (
                      <div style={{ marginBottom: '10px' }}>
                        <button
                          onClick={() => updateStage(match.id, 'submitted', match.seeker_id)}
                          disabled={updatingStage === match.id}
                          style={{ width: '100%', padding: '7px', borderRadius: '8px', background: '#f9f8f5', color: '#085041', border: '0.5px solid #9FE1CB', fontFamily: 'DM Sans, sans-serif', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}
                        >
                          {updatingStage === match.id ? 'Updating...' : 'Mark as Submitted'}
                        </button>
                      </div>
                    )}

                    {/* Last message preview */}
                    {match.lastMessage && (
                      <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px', background: '#f9f8f5', borderRadius: '6px', padding: '6px 10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {match.lastMessage.sender_id === currentUserId ? 'You: ' : ''}{match.lastMessage.content}
                      </div>
                    )}

                    {/* Chat + Archive buttons */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {activeTab === 'active' ? (
                        <>
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
                          <button
                            onClick={() => archiveMatch(match.id, 'manual_insider')}
                            style={{ padding: '8px 12px', borderRadius: '8px', background: 'transparent', color: '#888', border: '0.5px solid rgba(0,0,0,0.12)', fontFamily: 'DM Sans, sans-serif', fontSize: '12px', cursor: 'pointer' }}
                          >
                            Archive
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => unarchiveMatch(match.id)}
                          style={{ flex: 1, padding: '8px 0', borderRadius: '8px', background: '#f9f8f5', color: '#085041', border: '0.5px solid #9FE1CB', fontFamily: 'DM Sans, sans-serif', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}
                        >
                          Unarchive
                        </button>
                      )}
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