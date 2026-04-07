'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import BackButton from '../components/ui/BackButton'

export default function ChatPage() {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [match, setMatch] = useState(null)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [isInsider, setIsInsider] = useState(false)
  const [otherUser, setOtherUser] = useState(null)
  const [vaultLink, setVaultLink] = useState(null)
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const messagesEndRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const userId = session.user.id
      setCurrentUserId(userId)

      const params = new URLSearchParams(window.location.search)
      const matchId = params.get('match')
      if (!matchId) { router.push('/'); return }

      const { data: matchData } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single()

      if (!matchData) { router.push('/'); return }

      if (matchData.seeker_id !== userId && matchData.insider_id !== userId) {
        router.push('/')
        return
      }

      const userIsInsider = matchData.insider_id === userId
      setIsInsider(userIsInsider)
      setMatch(matchData)

      const otherUserId = userIsInsider ? matchData.seeker_id : matchData.insider_id

      const { data: otherUserData } = await supabase
        .from('users')
        .select('id, full_name, tag_line, avatar_url')
        .eq('id', otherUserId)
        .single()

      setOtherUser(otherUserData)

      // Load vault link for insider
      if (userIsInsider) {
        const { data: company } = await supabase
          .from('companies')
          .select('name')
          .eq('id', matchData.company_id)
          .single()

        const { data: vaultData } = await supabase
          .from('referral_vault')
          .select('*')
          .eq('user_id', userId)
          .eq('company', company?.name)
          .single()

        if (vaultData) setVaultLink(vaultData)
      }

      // Load messages
      const { data: messageData } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true })

      setMessages(messageData || [])

      // Mark messages as read via RPC — faster and confirmed before navigation
      await supabase.rpc('mark_messages_read', {
        p_match_id: matchId,
        p_user_id: userId,
      })

      setLoading(false)

      // Real time subscription
      const channel = supabase
        .channel(`chat-${matchId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        }, (payload) => {
          if (payload.new.match_id === matchId) {
            setMessages(prev => {
              if (prev.find(m => m.id === payload.new.id)) return prev
              // Auto mark as read if recipient is viewing chat
              if (payload.new.sender_id !== userId) {
                supabase
                  .from('messages')
                  .update({ is_read: true })
                  .eq('id', payload.new.id)
                payload.new.is_read = true
              }
              return [...prev, payload.new]
            })
          }
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
        }, (payload) => {
          if (payload.new.match_id === matchId) {
            setMessages(prev => prev.map(m =>
              m.id === payload.new.id ? { ...m, is_read: payload.new.is_read } : m
            ))
          }
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${matchId}`,
        }, (payload) => {
          setMatch(payload.new)
        })
        .subscribe()

      return () => supabase.removeChannel(channel)
    }

    load()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!newMessage.trim() || !match) return
    if (match.chat_ended) return
    if (!isInsider && !match.chat_enabled) return

    const messageContent = newMessage.trim()
    setSending(true)
    setNewMessage('')

    // If insider sending first message — enable chat
    if (isInsider && !match.chat_enabled) {
      await supabase
        .from('matches')
        .update({ chat_enabled: true })
        .eq('id', match.id)
      setMatch(prev => ({ ...prev, chat_enabled: true }))
    }

    // Optimistically add message to UI immediately
    const tempId = `temp-${Date.now()}`
    const tempMessage = {
      id: tempId,
      match_id: match.id,
      sender_id: currentUserId,
      content: messageContent,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempMessage])

    // Save to database
    const { data, error } = await supabase
      .from('messages')
      .insert({
        match_id: match.id,
        sender_id: currentUserId,
        content: messageContent,
      })
      .select()
      .single()

    if (error) {
      // Remove temp message and restore input so user doesn't lose their message
      setMessages(prev => prev.filter(m => m.id !== tempId))
      setNewMessage(messageContent)
      alert('Failed to send message. Please try again.')
    } else if (data) {
      // Replace temp message with real one from database
      setMessages(prev => prev.map(m => m.id === tempId ? data : m))
    }

    setSending(false)
  }

  async function endChat() {
    await supabase
      .from('matches')
      .update({ chat_ended: true })
      .eq('id', match.id)
    setMatch(prev => ({ ...prev, chat_ended: true }))
    setShowEndConfirm(false)
  }

  const otherInitials = otherUser?.full_name
    ? otherUser.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??'

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f4f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif', color: '#085041' }}>
        Loading chat...
      </div>
    )
  }

  const chatLocked = !match?.chat_enabled && !isInsider
  const chatEnded = match?.chat_ended

  return (
    <div style={{ minHeight: '100vh', background: '#f5f4f0', fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column', maxWidth: '420px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ background: '#085041', padding: '16px 20px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <BackButton />
          {isInsider && !chatEnded && (
            <button
              onClick={() => setShowEndConfirm(true)}
              style={{ background: 'transparent', border: '0.5px solid rgba(255,255,255,0.3)', color: '#9FE1CB', fontSize: '11px', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
            >
              End chat
            </button>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: '#E1F5EE', color: '#085041',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: '500', fontSize: '14px', flexShrink: 0, overflow: 'hidden',
          }}>
            {otherUser?.avatar_url ? (
              <img src={otherUser.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : otherInitials}
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '500', color: '#E1F5EE' }}>
              {otherUser?.full_name || 'Chat'}
            </div>
            <div style={{ fontSize: '12px', color: '#9FE1CB' }}>
              {chatEnded ? 'Chat ended' : match?.chat_enabled ? 'Active' : 'Not yet started'}
            </div>
          </div>
        </div>
      </div>

      {/* End chat confirmation */}
      {showEndConfirm && (
        <div style={{ margin: '12px 16px', background: '#FCEBEB', border: '0.5px solid #F09595', borderRadius: '10px', padding: '14px' }}>
          <div style={{ fontSize: '14px', fontWeight: '500', color: '#A32D2D', marginBottom: '8px' }}>End this chat?</div>
          <div style={{ fontSize: '13px', color: '#A32D2D', marginBottom: '12px', lineHeight: '1.5' }}>
            Both you and the seeker will be able to read the history but no new messages can be sent.
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={endChat} style={{ flex: 1, padding: '9px', borderRadius: '8px', background: '#A32D2D', color: '#fff', border: 'none', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
              Yes, end chat
            </button>
            <button onClick={() => setShowEndConfirm(false)} style={{ padding: '9px 16px', borderRadius: '8px', background: 'transparent', color: '#888', border: '0.5px solid rgba(0,0,0,0.12)', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

        {/* Chat locked state for seeker */}
        {chatLocked && (
          <div style={{ textAlign: 'center', background: '#FAEEDA', border: '0.5px solid #FAC775', borderRadius: '10px', padding: '16px', margin: '8px 0' }}>
            <div style={{ fontSize: '13px', fontWeight: '500', color: '#633806', marginBottom: '4px' }}>Waiting for insider</div>
            <div style={{ fontSize: '12px', color: '#BA7517', lineHeight: '1.5' }}>
              The insider will open the chat when they're ready. You'll be notified when they send their first message.
            </div>
          </div>
        )}

        {/* Chat ended banner */}
        {chatEnded && (
          <div style={{ textAlign: 'center', background: '#f9f8f5', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '10px', padding: '12px', margin: '8px 0' }}>
            <div style={{ fontSize: '13px', color: '#888' }}>This chat has ended. You can still read the history above.</div>
          </div>
        )}

        {/* Insider prompt to start chat */}
        {isInsider && !match?.chat_enabled && !chatEnded && messages.length === 0 && (
          <div style={{ textAlign: 'center', background: '#E1F5EE', border: '0.5px solid #9FE1CB', borderRadius: '10px', padding: '16px', margin: '8px 0' }}>
            <div style={{ fontSize: '13px', fontWeight: '500', color: '#085041', marginBottom: '4px' }}>Start the conversation</div>
            <div style={{ fontSize: '12px', color: '#0F6E56', lineHeight: '1.5' }}>
              Send your first message to open this chat. The seeker will be notified and can then reply.
            </div>
          </div>
        )}

        {messages.length === 0 && match?.chat_enabled && (
          <div style={{ textAlign: 'center', color: '#888', fontSize: '13px', padding: '20px' }}>
            No messages yet.
          </div>
        )}

        {messages.map(msg => {
          const isMe = msg.sender_id === currentUserId
          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '75%', padding: '10px 14px',
                borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: isMe ? '#085041' : '#fff',
                color: isMe ? '#E1F5EE' : '#111',
                fontSize: '13px', lineHeight: '1.5',
                border: isMe ? 'none' : '0.5px solid rgba(0,0,0,0.1)',
              }}>
                {msg.content}
                <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '4px', textAlign: isMe ? 'right' : 'left', display: 'flex', alignItems: 'center', justifyContent: isMe ? 'flex-end' : 'flex-start', gap: '4px' }}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {isMe && (
                    <span style={{ fontSize: '11px', opacity: msg.is_read ? 1 : 0.5 }}>
                      {msg.is_read ? '✓✓' : '✓'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Vault link for insider */}
      {vaultLink && isInsider && !chatEnded && (
        <div style={{ margin: '0 16px 8px', background: '#E1F5EE', border: '0.5px solid #9FE1CB', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '12px', color: '#085041' }}>🔗 Your referral link for {vaultLink.company}</div>
          <button onClick={() => { navigator.clipboard.writeText(vaultLink.referral_link); alert('Copied!') }} style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', border: '0.5px solid #085041', background: 'transparent', color: '#085041', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            Copy
          </button>
        </div>
      )}

      {/* Input */}
      {!chatEnded && (
        <div style={{ padding: '12px 16px 24px', background: '#fff', borderTop: '0.5px solid rgba(0,0,0,0.1)', display: 'flex', gap: '8px', flexShrink: 0 }}>
          {chatLocked ? (
            <div style={{ flex: 1, padding: '10px 16px', background: '#f9f8f5', borderRadius: '20px', fontSize: '13px', color: '#aaa', border: '0.5px solid rgba(0,0,0,0.1)' }}>
              Waiting for insider to start chat...
            </div>
          ) : (
            <>
              <input
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder={isInsider && !match?.chat_enabled ? 'Send first message to open chat...' : 'Type a message...'}
                style={{ flex: 1, borderRadius: '20px', border: '0.5px solid rgba(0,0,0,0.15)', padding: '10px 16px', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: '#111', outline: 'none', background: '#fff' }}
              />
              <button
                onClick={sendMessage}
                disabled={sending || !newMessage.trim()}
                style={{ width: '40px', height: '40px', borderRadius: '50%', background: newMessage.trim() ? '#085041' : '#D3D1C7', color: '#fff', border: 'none', cursor: newMessage.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}
              >
                →
              </button>
            </>
          )}
        </div>
      )}

      {chatEnded && (
        <div style={{ padding: '16px', background: '#fff', borderTop: '0.5px solid rgba(0,0,0,0.1)', textAlign: 'center', fontSize: '13px', color: '#888' }}>
          This chat has ended
        </div>
      )}
    </div>
  )
}