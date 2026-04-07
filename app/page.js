'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import RoleToggle from './components/RoleToggle'
import BottomNav from './components/BottomNav'
import InsiderFeed from './components/InsiderFeed'
import InsiderMatches from './components/InsiderMatches'
import InsiderProfile from './components/InsiderProfile'
import InsiderPitches from './components/InsiderPitches'
import SeekerCompanies from './components/SeekerCompanies'
import SeekerMatches from './components/SeekerMatches'
import SeekerProfile from './components/SeekerProfile'
import PitchSheet from './components/PitchSheet'

export default function Home() {
  const [role, setRole] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [page, setPage] = useState(null)
  const [pitchCompany, setPitchCompany] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [pitchCount, setPitchCount] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        window.location.href = '/login'
        return
      }

      const { data: user } = await supabase
        .from('users')
        .select('onboarding_complete, role')
        .eq('id', session.user.id)
        .single()

      if (!user?.onboarding_complete) {
        window.location.href = '/onboarding'
        return
      }

      const dbRole = user?.role || 'seeker'
      setUserRole(dbRole)

      // Only use sessionStorage if it matches the current user's role
      const lastPage = sessionStorage.getItem('mrn_last_page')
      const lastRole = sessionStorage.getItem('mrn_last_role')
      const storedUserId = sessionStorage.getItem('mrn_user_id')

      // If stored user id doesn't match current user clear sessionStorage
      if (storedUserId !== session.user.id) {
        sessionStorage.clear()
        sessionStorage.setItem('mrn_user_id', session.user.id)
      }

      const validLastRole = storedUserId === session.user.id ? lastRole : null
      const validLastPage = storedUserId === session.user.id ? lastPage : null

      if (dbRole === 'insider') {
        setRole(validLastRole || 'insider')
        setPage(validLastPage || 'feed')
      } else if (dbRole === 'seeker') {
        setRole(validLastRole || 'seeker')
        setPage(validLastPage || 'companies')
      } else if (dbRole === 'both') {
        setRole(validLastRole || 'insider')
        setPage(validLastPage || 'feed')
      }

      // Load pending pitch count for insiders
      if (dbRole === 'insider' || dbRole === 'both') {
        const { count } = await supabase
          .from('pitches')
          .select('*', { count: 'exact', head: true })
          .eq('insider_id', session.user.id)
          .eq('status', 'pending')
        setPitchCount(count || 0)
      }

      // Load unread message count
      const { data: userMatches } = await supabase
        .from('matches')
        .select('id')
        .or(`seeker_id.eq.${session.user.id},insider_id.eq.${session.user.id}`)

      if (userMatches && userMatches.length > 0) {
        const matchIds = userMatches.map(m => m.id)
        const { count: unread } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .in('match_id', matchIds)
          .eq('is_read', false)
          .neq('sender_id', session.user.id)
        setUnreadCount(unread || 0)
      }

      // Load unread pipeline notifications (submitted stage updates)
      const { count: pipelineUnread } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .eq('type', 'pipeline_update')
        .eq('read', false)

      if (pipelineUnread > 0) {
        setUnreadCount(prev => prev + pipelineUnread)
      }

      setAuthChecked(true)
    }
    checkSession()
  }, [])

  function handleSetRole(newRole) {
    setRole(newRole)
    sessionStorage.setItem('mrn_last_role', newRole)
    if (newRole === 'insider') {
      setPage('feed')
      sessionStorage.setItem('mrn_last_page', 'feed')
    }
    if (newRole === 'seeker') {
      setPage('companies')
      sessionStorage.setItem('mrn_last_page', 'companies')
    }
  }

  function renderPage() {
    if (!role || !page) return null
    if (role === 'insider') {
      if (page === 'feed')    return <InsiderFeed />
      if (page === 'pitches') return <InsiderPitches onPitchResolved={() => setPitchCount(prev => Math.max(0, prev - 1))} />
      if (page === 'matches') return <InsiderMatches />
      if (page === 'profile') return <InsiderProfile />
    }
    if (role === 'seeker') {
      if (page === 'companies') return <SeekerCompanies onPitch={(co) => setPitchCompany(co)} />
      if (page === 'matches')   return <SeekerMatches />
      if (page === 'profile')   return <SeekerProfile />
    }
  }

  if (!authChecked) {
    return (
      <div style={{
        minHeight: '100vh', background: '#f5f4f0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'DM Sans, sans-serif', fontSize: '14px', color: '#085041',
      }}>
        Loading...
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#f5f4f0',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: '#f9f8f5',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}>
        {/* Status Bar */}
        <div style={{
          background: '#085041',
          color: '#9FE1CB',
          fontSize: '11px',
          letterSpacing: '0.08em',
          padding: '8px 20px 6px',
          display: 'flex',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <span>9:41</span>
          <span>Muslim Referral Network</span>
          <span>●●●</span>
        </div>

        {/* Top Nav */}
        <div style={{
          background: '#085041',
          padding: '12px 20px 14px',
          flexShrink: 0,
        }}>
          <div style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '21px', fontWeight: '600',
            letterSpacing: '-0.02em', color: '#E1F5EE',
          }}>
            MRN
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{
              fontSize: '11px', color: '#9FE1CB',
              letterSpacing: '0.06em', marginTop: '1px',
            }}>
              THE INSIDER NETWORK · FOR THE UMMAH
            </div>
            <button
              onClick={async () => {
                await supabase.auth.signOut()
                sessionStorage.clear()
                window.location.href = '/login'
              }}
              style={{
                background: 'transparent', border: 'none',
                color: '#9FE1CB', fontSize: '11px',
                cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
              }}
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Role Toggle — only show if user signed up as both */}
        {userRole === 'both' && (
          <RoleToggle role={role} setRole={handleSetRole} />
        )}

        {/* Scrollable Page Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}>
          {renderPage()}
        </div>

        {/* Bottom Nav */}
        <BottomNav role={role} page={page} pitchCount={pitchCount} unreadCount={unreadCount} setPage={async (p) => {
          setPage(p)
          sessionStorage.setItem('mrn_last_page', p)
          sessionStorage.setItem('mrn_last_role', role)

          // Clear pipeline notifications when seeker visits matches
          if (p === 'matches' && role === 'seeker') {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
              await supabase
                .from('notifications')
                .update({ read: true })
                .eq('user_id', session.user.id)
                .eq('type', 'pipeline_update')
                .eq('read', false)
              setUnreadCount(prev => {
                // Recalculate by removing pipeline notifications
                return Math.max(0, prev)
              })
              // Re-query to get accurate count after clearing
              const { data: userMatches } = await supabase
                .from('matches')
                .select('id')
                .or(`seeker_id.eq.${session.user.id},insider_id.eq.${session.user.id}`)
              if (userMatches?.length > 0) {
                const matchIds = userMatches.map(m => m.id)
                const { count: unread } = await supabase
                  .from('messages')
                  .select('*', { count: 'exact', head: true })
                  .in('match_id', matchIds)
                  .eq('is_read', false)
                  .neq('sender_id', session.user.id)
                setUnreadCount(unread || 0)
              } else {
                setUnreadCount(0)
              }
            }
          }
        }} />

        {/* Pitch Sheet */}
        {pitchCompany && (
          <PitchSheet
            company={pitchCompany}
            onClose={() => setPitchCompany(null)}
          />
        )}
      </div>
    </div>
  )
}