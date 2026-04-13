'use client'
import { useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

export default function AuthCallback() {
  useEffect(() => {
    async function handleCallback() {
      try {
        // Get the session from the URL hash/params
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error)
          window.location.href = '/login?error=confirmation_failed'
          return
        }

        if (session) {
          // Check if onboarding is complete
          const { data: user } = await supabase
            .from('users')
            .select('onboarding_complete')
            .eq('id', session.user.id)
            .single()

          // If user row doesn't exist yet, trigger was slow — go to onboarding anyway
          if (user?.onboarding_complete) {
            window.location.href = '/'
          } else {
            window.location.href = '/onboarding'
          }
        } else {
          // No session yet — wait for Supabase to process the token
          // Add timeout so we don't spin forever
          const timeout = setTimeout(() => {
            window.location.href = '/login?error=confirmation_failed'
          }, 10000)

          supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
              clearTimeout(timeout)
              supabase
                .from('users')
                .select('onboarding_complete')
                .eq('id', session.user.id)
                .single()
                .then(({ data: user }) => {
                  if (user?.onboarding_complete) {
                    window.location.href = '/'
                  } else {
                    window.location.href = '/onboarding'
                  }
                })
            }
          })
        }
      } catch (err) {
        console.error('Unexpected error:', err)
        window.location.href = '/login'
      }
    }

    handleCallback()
  }, [])

  return (
    <div style={{
      minHeight: '100vh', background: '#f5f4f0',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%',
          background: '#E1F5EE', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: '24px', margin: '0 auto 16px',
        }}>
          ✓
        </div>
        <div style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: '20px', fontWeight: '500',
          color: '#111', marginBottom: '8px',
        }}>
          Confirming your account...
        </div>
        <div style={{ fontSize: '14px', color: '#888' }}>
          Please wait while we set up your profile.
        </div>
      </div>
    </div>
  )
}