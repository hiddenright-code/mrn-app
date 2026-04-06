'use client'
import { useState, useMemo } from 'react'
import { supabase } from '../../lib/supabase'

function PasswordRule({ met, text }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      fontSize: '12px', marginBottom: '6px',
      color: met ? '#0F6E56' : '#A32D2D',
    }}>
      <span style={{
        width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
        background: met ? '#E1F5EE' : '#FCEBEB',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '11px', fontWeight: '500',
      }}>
        {met ? '✓' : '✕'}
      </span>
      {text}
    </div>
  )
}

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [showRules, setShowRules] = useState(false)

  const rules = useMemo(() => ({
    minLength:   password.length >= 8,
    hasUpper:    /[A-Z]/.test(password),
    hasLower:    /[a-z]/.test(password),
    hasNumber:   /[0-9]/.test(password),
    hasSpecial:  /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    passwordsMatch: password === confirmPassword && confirmPassword.length > 0,
  }), [password, confirmPassword])

  const allRulesMet = Object.values(rules).every(Boolean)

  async function handleRegister() {
    if (!email) {
      setError('Please enter your email address.')
      return
    }
    if (!allRulesMet) {
      setError('Please make sure all password rules are met.')
      return
    }

    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'http://localhost:3000/auth/callback',
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSubmitted(true)
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

  if (submitted) {
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
          <div style={{ background: '#085041', padding: '32px 28px 28px' }}>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', fontWeight: '600', color: '#E1F5EE', letterSpacing: '-0.02em' }}>MRN</div>
            <div style={{ fontSize: '12px', color: '#9FE1CB', letterSpacing: '0.06em', marginTop: '2px' }}>THE INSIDER NETWORK · FOR THE UMMAH</div>
          </div>
          <div style={{ padding: '32px 28px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 20px' }}>✉</div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', fontWeight: '500', color: '#111', marginBottom: '12px' }}>Check your email</div>
            <div style={{ fontSize: '14px', color: '#888', lineHeight: '1.7', marginBottom: '24px' }}>
              We sent a confirmation link to{' '}
              <span style={{ color: '#085041', fontWeight: '500' }}>{email}</span>.
              Click the link to confirm your account and complete your profile setup.
            </div>
            <div style={{ background: '#E1F5EE', borderRadius: '10px', padding: '14px 16px', marginBottom: '24px', textAlign: 'left' }}>
              <div style={{ fontSize: '13px', color: '#085041', lineHeight: '1.6' }}>
                <div style={{ fontWeight: '500', marginBottom: '6px' }}>Didn't get the email?</div>
                <div>• Check your spam or junk folder</div>
                <div>• Make sure you entered the right email</div>
                <div>• The link expires in 1 hour</div>
              </div>
            </div>
            <button onClick={() => { setSubmitted(false); setEmail(''); setPassword(''); setConfirmPassword('') }} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'transparent', color: '#085041', border: '0.5px solid #085041', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', fontWeight: '500', cursor: 'pointer', marginBottom: '12px' }}>
              Use a different email
            </button>
            <div style={{ fontSize: '13px', color: '#888', lineHeight: '1.6' }}>
              Already confirmed?{' '}
              <a href="/login" style={{ color: '#085041', fontWeight: '500', textDecoration: 'none' }}>Sign in</a>
              <br />
              <span style={{ fontSize: '12px', color: '#aaa', marginTop: '4px', display: 'block' }}>
                If you already signed up with this email, signing up again will send a new confirmation link and invalidate the old one.
              </span>
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
        width: '100%', maxWidth: '420px',
        background: '#fff', borderRadius: '16px',
        overflow: 'hidden', border: '0.5px solid rgba(0,0,0,0.1)',
      }}>
        {/* Header */}
        <div style={{ background: '#085041', padding: '32px 28px 28px' }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', fontWeight: '600', color: '#E1F5EE', letterSpacing: '-0.02em' }}>MRN</div>
          <div style={{ fontSize: '12px', color: '#9FE1CB', letterSpacing: '0.06em', marginTop: '2px' }}>THE INSIDER NETWORK · FOR THE UMMAH</div>
          <div style={{ fontSize: '20px', color: '#E1F5EE', marginTop: '16px', fontWeight: '500' }}>Create your account</div>
        </div>

        {/* Form */}
        <div style={{ padding: '28px' }}>
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
            placeholder="you@email.com"
            style={inputStyle}
          />

          <label style={labelStyle}>PASSWORD</label>
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setShowRules(true) }}
            placeholder="Min. 8 characters"
            style={{
              ...inputStyle,
              borderColor: showRules && !rules.minLength ? 'rgba(163,45,45,0.4)' : 'rgba(0,0,0,0.2)',
            }}
          />

          {/* Password rules */}
          {showRules && (
            <div style={{
              background: '#f9f8f5', borderRadius: '8px',
              padding: '12px 14px', marginBottom: '12px',
              border: '0.5px solid rgba(0,0,0,0.08)',
            }}>
              <PasswordRule met={rules.minLength}      text="At least 8 characters" />
              <PasswordRule met={rules.hasUpper}       text="At least one uppercase letter" />
              <PasswordRule met={rules.hasLower}       text="At least one lowercase letter" />
              <PasswordRule met={rules.hasNumber}      text="At least one number" />
              <PasswordRule met={rules.hasSpecial}     text="At least one special character (!@#$...)" />
            </div>
          )}

          <label style={labelStyle}>CONFIRM PASSWORD</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            style={{
              ...inputStyle,
              borderColor: confirmPassword.length > 0 && !rules.passwordsMatch
                ? 'rgba(163,45,45,0.4)'
                : 'rgba(0,0,0,0.2)',
            }}
            onKeyDown={e => e.key === 'Enter' && allRulesMet && handleRegister()}
          />

          {/* Passwords match indicator */}
          {confirmPassword.length > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '12px', marginBottom: '12px',
              color: rules.passwordsMatch ? '#0F6E56' : '#A32D2D',
            }}>
              <span style={{
                width: '18px', height: '18px', borderRadius: '50%',
                background: rules.passwordsMatch ? '#E1F5EE' : '#FCEBEB',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: '500', flexShrink: 0,
              }}>
                {rules.passwordsMatch ? '✓' : '✕'}
              </span>
              {rules.passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
            </div>
          )}

          <button
            onClick={handleRegister}
            disabled={loading || !allRulesMet}
            style={{
              width: '100%', padding: '13px',
              borderRadius: '8px',
              background: !allRulesMet ? '#D3D1C7' : loading ? '#888' : '#085041',
              color: '#E1F5EE', border: 'none',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px', fontWeight: '500',
              cursor: !allRulesMet || loading ? 'not-allowed' : 'pointer',
              marginBottom: '16px',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <div style={{ textAlign: 'center', fontSize: '13px', color: '#888' }}>
            Already have an account?{' '}
            <a href="/login" style={{ color: '#085041', fontWeight: '500', textDecoration: 'none' }}>Sign in</a>
          </div>
        </div>
      </div>
    </div>
  )
}