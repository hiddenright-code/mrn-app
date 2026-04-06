'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function ChatsPage({ onClose }) {
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState(null)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const userId = session.user.id
      setCurrentUserId(userId)

      // Load all matches with last message
      const { data: matchData } = await supabase
        .from('matches')
        .select('*')
        .or(`seeker_id.eq.${userId},insider_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      if (!matchData || matchData.length === 0) {
        setChats([])
        setLoading(false)
        return
      }

      const matchIds = matchData.map(m => m.id)
      const otherUserIds = matchData.map(m =>
        m.seeker_id === userId ? m.insider_id : m.seeker_id
      )
      const companyIds = matchData.map(m => m.company_id)

      // Load other users info
      const { data: otherUsers } = await supabase
        .from('users')
        .select('id, full_name, avatar_url')
        .in('id', otherUserIds)

      // Load companies
      const { data: companies } = await supabase
        .from('companies')
        .select('id, name')
        .in('id', companyIds)

      // Load last message for each match
      const lastMessages = await Promise.all(
        matchIds.map(async (matchId) => {
          const { data } = await supabase
            .from('messages')
            .select('*')
            .eq('match_id', matchId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
          return { matchId, message: data }
        })
      )

      // Load unread count per match
      const unreadCounts = await Promise.all(
        matchIds.map(async (matchId) => {
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('match_id', matchId)
            .eq('is_read', false)
            .neq('sender_id', userId)
          return { matchId, count: count || 0 }
        })
      )

      const enriched = matchData.map(match => {
        const otherUserId = match.seeker_id === userId ? match.insider_id : match.seeker_id
        const lastMsg = lastMessages.find(m => m.matchId === match.id)
        const unread = unreadCounts.find(u => u.matchId === match.id)
        return {
          ...match,
          otherUser: otherUsers?.find(u => u.id === otherUserId) || null,
          company: companies?.find(c => c.id === match.company_id) || null,
          lastMessage: lastMsg?.message || null,
          unreadCount: unread?.count || 0,
        }
      })

      // Sort by last message time
      enriched.sort((a, b) => {
        const aTime = a.lastMessage?.created_at || a.created_at
        const bTime = b.lastMessage?.created_at || b.created_at
        return new Date(bTime) - new Date(aTime)
      })

      setChats(enriched)
      setLoading(false)
    }
    load()
  }, [])

  function formatTime(timestamp) {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    if (days === 1) return 'Yesterday'
    if (days < 7) return date.toLocaleDateString([], { weekday: 'short' })
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: '50%',
      transform: 'translateX(-50%)',
      width: '100%', maxWidth: '420px',
      height: '100vh', background: '#f5f4f0',
      zIndex: 200, display: 'flex', flexDirection: 'column',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      {/* Header */}
      <div style={{ background: '#085041', padding: '16px 20px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', fontWeight: '500', color: '#E1F5EE' }}>
            Chats
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#9FE1CB', fontSize: '14px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* Chat list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#888', fontSize: '14px' }}>
            Loading chats...
          </div>
        ) : chats.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#888', fontSize: '14px' }}>
            No chats yet. Accept a pitch to start chatting!
          </div>
        ) : (
          chats.map(chat => {
            const hasUnread = chat.unreadCount > 0
            const chatLocked = !chat.chat_enabled
            const chatEnded = chat.chat_ended
            const initials = chat.otherUser?.full_name
              ? chat.otherUser.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
              : '??'

            return (
              <div
                key={chat.id}
                onClick={() => {
                  if (!chatLocked) window.location.href = `/chat?match=${chat.id}`
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '14px 16px',
                  background: hasUnread ? '#f0faf6' : '#fff',
                  borderBottom: '0.5px solid rgba(0,0,0,0.06)',
                  cursor: chatLocked ? 'default' : 'pointer',
                  opacity: chatLocked ? 0.6 : 1,
                }}
              >
                {/* Avatar */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    width: '46px', height: '46px', borderRadius: '50%',
                    background: '#E1F5EE', color: '#085041',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '500', fontSize: '15px', overflow: 'hidden',
                  }}>
                    {chat.otherUser?.avatar_url ? (
                      <img src={chat.otherUser.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : initials}
                  </div>
                  {hasUnread && (
                    <div style={{
                      position: 'absolute', top: '0', right: '0',
                      width: '14px', height: '14px', borderRadius: '50%',
                      background: '#E24B4A', border: '2px solid #fff',
                    }} />
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                    <div style={{ fontSize: '14px', fontWeight: hasUnread ? '500' : '400', color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {chat.otherUser?.full_name || 'Unknown'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#aaa', flexShrink: 0, marginLeft: '8px' }}>
                      {formatTime(chat.lastMessage?.created_at)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '13px', color: hasUnread ? '#085041' : '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, fontWeight: hasUnread ? '500' : '400' }}>
                      {chatEnded ? 'Chat ended' :
                       chatLocked ? 'Waiting for insider to start chat...' :
                       chat.lastMessage ? (
                         chat.lastMessage.sender_id === currentUserId ? `You: ${chat.lastMessage.content}` : chat.lastMessage.content
                       ) : 'No messages yet'}
                    </div>
                    {hasUnread && (
                      <div style={{
                        background: '#085041', color: '#fff',
                        fontSize: '11px', fontWeight: '500',
                        minWidth: '20px', height: '20px',
                        borderRadius: '10px', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        padding: '0 6px', marginLeft: '8px', flexShrink: 0,
                      }}>
                        {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>
                    {chat.company?.name} · {chat.stage}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}