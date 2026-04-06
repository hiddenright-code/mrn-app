'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [unconfirmed, setUnconfirmed] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  async function handleLogin() {
    if (!email || !password) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    setError('')
    setUnconfirmed(false)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed') ||
          error.message.toLowerCase().includes('not confirmed')) {
        setUnconfirmed(true)
        setError('')
      } else {
        setError(error.message)
      }
      setLoading(false)
    } else {
      window.location.href = '/'
    }
  }

  async function handleResend() {
    setResendLoading(true)
    setResendSuccess(false)
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: 'http://localhost:3000/auth/callback',
      },
    })
    setResendLoading(false)
    if (!error) {
      setResendSuccess(true)
    } else {
      setError('Could not resend email. Please try again.')
    }
  }

  const inputStyle = {
    width: '100%', borderRadius: '8px',
    border: '0.5px solid rgba(0,0,0,0.2)',
    padding: '12px 14px', marginBottom: '12px',
    fontFamily: 'DM Sans, sans-serif', fontSize: '14px',
    color: '#111', outline: 'none', background: '#fff',
  }

  const labelStyle = {
    fontSize: '11px', fontWeight: '500', color: '#888',
    letterSpacing: '0.04em', display: 'block', marginBottom: '6px',
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#f5f4f0',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'DM Sans, sans-serif', padding: '20px',
    }}>
      <div style={{
        width: '100%', maxWidth: '420px',
        background: '#fff', borderRadius: '16px',
        overflow: 'hidden', border: '0.5px solid rgba(0,0,0,0.1)',
      }}>
        {/* Header */}
        <div style={{ background: '#085041', padding: '32px 28px 28px' }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', fontWeight: '600', color: '#E1F5EE', letterSpacing: '-0.02em' }}>MRN</div>
          <div style={{ fontSize: '12px', color: '#9FE1CB', letterSpacing: '0.06em', marginTop: '2px' }}>THE INSIDER NETWORK · FOR THE UMMAH</div>
          <div style={{ fontSize: '20px', color: '#E1F5EE', marginTop: '16px', fontWeight: '500' }}>Welcome back</div>
        </div>

        {/* Form */}
        <div style={{ padding: '28px' }}>

          {/* Unconfirmed email warning */}
          {unconfirmed && (
            <div style={{
              background: '#FAEEDA', border: '0.5px solid #FAC775',
              borderRadius: '10px', padding: '14px 16px', marginBottom: '16px',
            }}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#633806', marginBottom: '6px' }}>
                Please confirm your email first
              </div>
              <div style={{ fontSize: '13px', color: '#633806', lineHeight: '1.6', marginBottom: '12px' }}>
                We sent a confirmation link to{' '}
                <span style={{ fontWeight: '500' }}>{email}</span>.
                Please check your inbox and click the link before signing in.
              </div>

              {resendSuccess ? (
                <div style={{
                  background: '#E1F5EE', borderRadius: '8px',
                  padding: '8px 12px', fontSize: '13px', color: '#085041',
                }}>
                  ✓ Confirmation email resent! Check your inbox.
                </div>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resendLoading}
                  style={{
                    width: '100%', padding: '10px',
                    borderRadius: '8px', background: '#633806',
                    color: '#FAEEDA', border: 'none',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '13px', fontWeight: '500',
                    cursor: resendLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {resendLoading ? 'Sending...' : 'Resend confirmation email'}
                </button>
              )}
            </div>
          )}

          {/* General error */}
          {error && (
            <div style={{
              background: '#FCEBEB', border: '0.5px solid #F09595',
              borderRadius: '8px', padding: '10px 14px',
              fontSize: '13px', color: '#A32D2D', marginBottom: '16px',
            }}>
              {error}
            </div>
          )}

          <label style={labelStyle}>EMAIL ADDRESS</label>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setUnconfirmed(false); setResendSuccess(false) }}
            placeholder="you@email.com"
            style={inputStyle}
          />

          <label style={labelStyle}>PASSWORD</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            style={inputStyle}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%', padding: '13px',
              borderRadius: '8px', background: loading ? '#888' : '#085041',
              color: '#E1F5EE', border: 'none',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px', fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '16px',
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div style={{ textAlign: 'center', fontSize: '13px', color: '#888' }}>
            Don't have an account?{' '}
            <a href="/register" style={{ color: '#085041', fontWeight: '500', textDecoration: 'none' }}>
              Sign up
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}