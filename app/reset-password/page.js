'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [ready, setReady] = useState(false)

  const rules = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    passwordsMatch: password === confirmPassword && confirmPassword.length > 0,
  }
  const allRulesMet = Object.values(rules).every(Boolean)

  useEffect(() => {
    // Supabase sends the reset token as a hash fragment
    // We need to let the auth state settle before allowing password update
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleReset() {
    if (!allRulesMet) { setError('Please make sure all password rules are met.'); return }
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => { window.location.href = '/login' }, 2500)
    }
  }

  const inputStyle = {
    width: '100%', borderRadius: '8px',
    border: '0.5px solid rgba(0,0,0,0.2)',
    padding: '12px 14px', marginBottom: '8px',
    fontFamily: 'DM Sans, sans-serif', fontSize: '14px',
    color: '#111', outline: 'none', background: '#fff',
  }

  const labelStyle = {
    fontSize: '11px', fontWeight: '500', color: '#888',
    letterSpacing: '0.04em', display: 'block', marginBottom: '6px',
  }

  const ruleStyle = (met) => ({
    fontSize: '12px', color: met ? '#1D9E75' : '#aaa',
    display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px',
  })

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f4f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '420px', background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '0.5px solid rgba(0,0,0,0.1)' }}>
          <div style={{ background: '#085041', padding: '32px 28px 28px' }}>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', fontWeight: '600', color: '#E1F5EE', letterSpacing: '-0.02em' }}>MRN</div>
            <div style={{ fontSize: '12px', color: '#9FE1CB', letterSpacing: '0.06em', marginTop: '2px' }}>THE INSIDER NETWORK · FOR THE UMMAH</div>
          </div>
          <div style={{ padding: '32px 28px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 20px' }}>✓</div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', fontWeight: '500', color: '#111', marginBottom: '12px' }}>Password updated!</div>
            <div style={{ fontSize: '14px', color: '#888', lineHeight: '1.7' }}>
              Your password has been reset successfully. Redirecting you to sign in...
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f4f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '0.5px solid rgba(0,0,0,0.1)' }}>
        {/* Header */}
        <div style={{ background: '#085041', padding: '32px 28px 28px' }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', fontWeight: '600', color: '#E1F5EE', letterSpacing: '-0.02em' }}>MRN</div>
          <div style={{ fontSize: '12px', color: '#9FE1CB', letterSpacing: '0.06em', marginTop: '2px' }}>THE INSIDER NETWORK · FOR THE UMMAH</div>
          <div style={{ fontSize: '20px', color: '#E1F5EE', marginTop: '16px', fontWeight: '500' }}>Set new password</div>
        </div>

        {/* Form */}
        <div style={{ padding: '28px' }}>
          {!ready && (
            <div style={{ background: '#FAEEDA', border: '0.5px solid #FAC775', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#633806', marginBottom: '16px' }}>
              Verifying your reset link...
            </div>
          )}

          {error && (
            <div style={{ background: '#FCEBEB', border: '0.5px solid #F09595', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#A32D2D', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <label style={labelStyle}>NEW PASSWORD</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            style={inputStyle}
          />

          {/* Password rules */}
          <div style={{ marginBottom: '16px' }}>
            <div style={ruleStyle(rules.minLength)}><span>{rules.minLength ? '✓' : '○'}</span> At least 8 characters</div>
            <div style={ruleStyle(rules.hasUppercase)}><span>{rules.hasUppercase ? '✓' : '○'}</span> One uppercase letter</div>
            <div style={ruleStyle(rules.hasNumber)}><span>{rules.hasNumber ? '✓' : '○'}</span> One number</div>
            <div style={ruleStyle(rules.hasSpecial)}><span>{rules.hasSpecial ? '✓' : '○'}</span> One special character</div>
          </div>

          <label style={labelStyle}>CONFIRM NEW PASSWORD</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleReset()}
            placeholder="Re-enter password"
            style={{ ...inputStyle, marginBottom: '4px' }}
          />
          {confirmPassword.length > 0 && (
            <div style={{ ...ruleStyle(rules.passwordsMatch), marginBottom: '16px' }}>
              <span>{rules.passwordsMatch ? '✓' : '○'}</span>
              {rules.passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
            </div>
          )}

          <button
            onClick={handleReset}
            disabled={loading || !allRulesMet || !ready}
            style={{
              width: '100%', padding: '13px', borderRadius: '8px',
              background: !allRulesMet || !ready ? '#D3D1C7' : loading ? '#888' : '#085041',
              color: '#E1F5EE', border: 'none',
              fontFamily: 'DM Sans, sans-serif', fontSize: '14px',
              fontWeight: '500', cursor: !allRulesMet || !ready || loading ? 'not-allowed' : 'pointer',
              marginBottom: '16px', transition: 'background 0.2s',
            }}
          >
            {loading ? 'Updating...' : 'Update password'}
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