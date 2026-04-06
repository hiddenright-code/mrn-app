'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import BackButton from '../../../app/components/ui/BackButton'

export default function AccountPage() {
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/login'; return }
      setEmail(session.user.email)
      setLoading(false)
    }
    load()
  }, [])

  async function handlePasswordChange() {
    setPasswordError('')
    setPasswordSuccess(false)

    if (!newPassword || !confirmNewPassword) {
      setPasswordError('Please fill in all password fields.')
      return
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.')
      return
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters.')
      return
    }
    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError('Password must contain at least one uppercase letter.')
      return
    }
    if (!/[0-9]/.test(newPassword)) {
      setPasswordError('Password must contain at least one number.')
      return
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      setPasswordError('Password must contain at least one special character.')
      return
    }

    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSavingPassword(false)

    if (error) {
      setPasswordError(error.message)
    } else {
      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
      setTimeout(() => setPasswordSuccess(false), 3000)
    }
  }

  async function handleDeleteAccount() {
    if (deleteInput !== 'DELETE') {
      alert('Please type DELETE to confirm.')
      return
    }

    setDeleting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session.user.id

      // Delete all user data in order
      await supabase.from('portfolio_links').delete().eq('user_id', userId)
      await supabase.from('education').delete().eq('user_id', userId)
      await supabase.from('employment').delete().eq('user_id', userId)
      await supabase.from('seeker_profiles').delete().eq('user_id', userId)
      await supabase.from('insider_profiles').delete().eq('user_id', userId)
      await supabase.from('badges').delete().eq('user_id', userId)
      await supabase.from('barakah_log').delete().eq('user_id', userId)
      await supabase.from('notifications').delete().eq('user_id', userId)
      await supabase.from('users').delete().eq('id', userId)

      await supabase.auth.signOut()
      window.location.href = '/register'
    } catch (err) {
      alert('Error deleting account. Please try again.')
      console.error(err)
      setDeleting(false)
    }
  }

  const inputStyle = {
    width: '100%', borderRadius: '8px',
    border: '0.5px solid rgba(0,0,0,0.2)',
    padding: '11px 14px', marginBottom: '12px',
    fontFamily: 'DM Sans, sans-serif', fontSize: '14px',
    color: '#111', outline: 'none', background: '#fff',
  }

  const labelStyle = {
    fontSize: '11px', fontWeight: '500', color: '#888',
    letterSpacing: '0.04em', display: 'block', marginBottom: '6px',
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f4f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif', color: '#888' }}>
        Loading...
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f4f0', fontFamily: 'DM Sans, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#085041', padding: '16px 20px' }}>
        <BackButton />
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', fontWeight: '500', color: '#E1F5EE' }}>
          Account & billing
        </div>
        <div style={{ fontSize: '12px', color: '#9FE1CB', marginTop: '2px' }}>
          Manage your account settings
        </div>
      </div>

      <div style={{ padding: '16px' }}>

        {/* Account info */}
        <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', letterSpacing: '0.06em', marginBottom: '12px' }}>ACCOUNT INFO</div>
          <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>Email address</div>
          <div style={{ fontSize: '14px', fontWeight: '500', color: '#111', marginBottom: '4px' }}>{email}</div>
          <div style={{ fontSize: '12px', color: '#888' }}>To change your email address please contact support.</div>
        </div>

        {/* Current plan */}
        <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', letterSpacing: '0.06em', marginBottom: '12px' }}>CURRENT PLAN</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '500', color: '#111' }}>Free plan</div>
              <div style={{ fontSize: '13px', color: '#888', marginTop: '2px' }}>Full access during beta</div>
            </div>
            <span style={{ background: '#E1F5EE', color: '#085041', fontSize: '12px', padding: '4px 10px', borderRadius: '20px', fontWeight: '500' }}>
              Active
            </span>
          </div>
        </div>

        {/* Change password */}
        <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', letterSpacing: '0.06em', marginBottom: '12px' }}>CHANGE PASSWORD</div>

          {passwordError && (
            <div style={{ background: '#FCEBEB', border: '0.5px solid #F09595', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#A32D2D', marginBottom: '12px' }}>
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div style={{ background: '#E1F5EE', border: '0.5px solid #9FE1CB', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#085041', marginBottom: '12px' }}>
              ✓ Password changed successfully!
            </div>
          )}

          <label style={labelStyle}>NEW PASSWORD</label>
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="Min. 8 characters"
            style={inputStyle}
          />

          <label style={labelStyle}>CONFIRM NEW PASSWORD</label>
          <input
            type="password"
            value={confirmNewPassword}
            onChange={e => setConfirmNewPassword(e.target.value)}
            placeholder="••••••••"
            style={inputStyle}
          />

          <button
            onClick={handlePasswordChange}
            disabled={savingPassword}
            style={{
              width: '100%', padding: '12px', borderRadius: '8px',
              background: savingPassword ? '#888' : '#085041',
              color: '#E1F5EE', border: 'none',
              fontFamily: 'DM Sans, sans-serif', fontSize: '14px',
              fontWeight: '500', cursor: savingPassword ? 'not-allowed' : 'pointer',
            }}
          >
            {savingPassword ? 'Updating...' : 'Update password'}
          </button>
        </div>

        {/* Delete account */}
        <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '12px', padding: '16px', marginBottom: '32px' }}>
          <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', letterSpacing: '0.06em', marginBottom: '12px' }}>ACCOUNT</div>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                width: '100%', padding: '12px', borderRadius: '8px',
                background: 'transparent', color: '#A32D2D',
                border: '0.5px solid #F09595',
                fontFamily: 'DM Sans, sans-serif', fontSize: '14px',
                fontWeight: '500', cursor: 'pointer',
              }}
            >
              Delete account
            </button>
          ) : (
            <div>
              <div style={{ background: '#FCEBEB', border: '0.5px solid #F09595', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#A32D2D', marginBottom: '8px' }}>
                  Are you sure?
                </div>
                <div style={{ fontSize: '13px', color: '#A32D2D', lineHeight: '1.6', marginBottom: '12px' }}>
                  This will permanently delete your account, profile, matches, and all data. This cannot be undone.
                </div>
                <div style={{ fontSize: '13px', color: '#A32D2D', marginBottom: '8px', fontWeight: '500' }}>
                  Type DELETE to confirm:
                </div>
                <input
                  value={deleteInput}
                  onChange={e => setDeleteInput(e.target.value)}
                  placeholder="DELETE"
                  style={{
                    width: '100%', borderRadius: '8px',
                    border: '0.5px solid #F09595',
                    padding: '10px 12px', marginBottom: '12px',
                    fontFamily: 'DM Sans, sans-serif', fontSize: '14px',
                    color: '#A32D2D', outline: 'none', background: '#fff',
                  }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting || deleteInput !== 'DELETE'}
                    style={{
                      flex: 1, padding: '11px', borderRadius: '8px',
                      background: deleteInput === 'DELETE' ? '#A32D2D' : '#D3D1C7',
                      color: '#fff', border: 'none',
                      fontFamily: 'DM Sans, sans-serif', fontSize: '14px',
                      fontWeight: '500', cursor: deleteInput === 'DELETE' ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {deleting ? 'Deleting...' : 'Delete my account'}
                  </button>
                  <button
                    onClick={() => { setShowDeleteConfirm(false); setDeleteInput('') }}
                    style={{
                      padding: '11px 16px', borderRadius: '8px',
                      background: 'transparent', color: '#888',
                      border: '0.5px solid rgba(0,0,0,0.15)',
                      fontFamily: 'DM Sans, sans-serif', fontSize: '14px', cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}