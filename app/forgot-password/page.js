'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

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

  async function handleSubmit() {
    if (!email) { setError('Please enter your email address.'); return }
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3000/reset-password',
    })

    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh', background: '#f5f4f0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'DM Sans, sans-serif', padding: '20px',
      }}>
        <div style={{
          width: '100%', maxWidth: '420px', background: '#fff',
          borderRadius: '16px', overflow: 'hidden',
          border: '0.5px solid rgba(0,0,0,0.1)',
        }}>
          <div style={{ background: '#085041', padding: '32px 28px 28px' }}>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', fontWeight: '600', color: '#E1F5EE', letterSpacing: '-0.02em' }}>MRN</div>
            <div style={{ fontSize: '12px', color: '#9FE1CB', letterSpacing: '0.06em', marginTop: '2px' }}>THE INSIDER NETWORK · FOR THE UMMAH</div>
          </div>
          <div style={{ padding: '32px 28px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 20px' }}>✉</div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', fontWeight: '500', color: '#111', marginBottom: '12px' }}>Check your email</div>
            <div style={{ fontSize: '14px', color: '#888', lineHeight: '1.7', marginBottom: '24px' }}>
              We sent a password reset link to{' '}
              <span style={{ color: '#085041', fontWeight: '500' }}>{email}</span>.
              Click the link to set a new password.
            </div>
            <div style={{ background: '#E1F5EE', borderRadius: '10px', padding: '14px 16px', marginBottom: '24px', textAlign: 'left' }}>
              <div style={{ fontSize: '13px', color: '#085041', lineHeight: '1.6' }}>
                <div style={{ fontWeight: '500', marginBottom: '6px' }}>Didn't get the email?</div>
                <div>• Check your spam or junk folder</div>
                <div>• Make sure you entered the right email</div>
                <div>• The link expires in 1 hour</div>
              </div>
            </div>
            <button
              onClick={() => { setSubmitted(false); setEmail('') }}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'transparent', color: '#085041', border: '0.5px solid #085041', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', fontWeight: '500', cursor: 'pointer', marginBottom: '12px' }}
            >
              Try a different email
            </button>
            <div style={{ fontSize: '13px', color: '#888' }}>
              Remember your password?{' '}
              <a href="/login" style={{ color: '#085041', fontWeight: '500', textDecoration: 'none' }}>Sign in</a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#f5f4f0',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'DM Sans, sans-serif', padding: '20px',
    }}>
      <div style={{
        width: '100%', maxWidth: '420px', background: '#fff',
        borderRadius: '16px', overflow: 'hidden',
        border: '0.5px solid rgba(0,0,0,0.1)',
      }}>
        {/* Header */}
        <div style={{ background: '#085041', padding: '32px 28px 28px' }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', fontWeight: '600', color: '#E1F5EE', letterSpacing: '-0.02em' }}>MRN</div>
          <div style={{ fontSize: '12px', color: '#9FE1CB', letterSpacing: '0.06em', marginTop: '2px' }}>THE INSIDER NETWORK · FOR THE UMMAH</div>
          <div style={{ fontSize: '20px', color: '#E1F5EE', marginTop: '16px', fontWeight: '500' }}>Reset your password</div>
        </div>

        {/* Form */}
        <div style={{ padding: '28px' }}>
          <div style={{ fontSize: '14px', color: '#888', lineHeight: '1.6', marginBottom: '20px' }}>
            Enter the email address you registered with and we'll send you a reset link.
          </div>

          {error && (
            <div style={{ background: '#FCEBEB', border: '0.5px solid #F09595', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#A32D2D', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <label style={labelStyle}>EMAIL ADDRESS</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="you@email.com"
            style={inputStyle}
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%', padding: '13px', borderRadius: '8px',
              background: loading ? '#888' : '#085041',
              color: '#E1F5EE', border: 'none',
              fontFamily: 'DM Sans, sans-serif', fontSize: '14px',
              fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '16px',
            }}
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </button>

          <div style={{ textAlign: 'center', fontSize: '13px', color: '#888' }}>
            Remember your password?{' '}
            <a href="/login" style={{ color: '#085041', fontWeight: '500', textDecoration: 'none' }}>Sign in</a>
          </div>
        </div>
      </div>
    </div>
  )
}