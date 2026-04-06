'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import BackButton from '../../../app/components/ui/BackButton'

const NOTIFICATION_TYPES = {
  insider: [
    {
      id: 'pitch_received',
      label: 'Pitch received',
      sub: 'When a seeker pitches you for a referral',
      default: 'off',
    },
    {
      id: 'match_accepted',
      label: 'Match accepted',
      sub: 'When you accept a pitch and a chat opens',
      default: 'inapp',
    },
    {
      id: 'pipeline_updates',
      label: 'Pipeline updates',
      sub: 'When a seeker updates their interview stage',
      default: 'both',
    },
    {
      id: 'messages',
      label: 'New messages',
      sub: 'When a matched seeker sends you a message',
      default: 'inapp',
    },
    {
      id: 'barakah_points',
      label: 'Barakah Points',
      sub: 'When you earn points for a referral milestone',
      default: 'both',
    },
  ],
  seeker: [
    {
      id: 'pitch_accepted',
      label: 'Pitch accepted',
      sub: 'When an insider accepts your pitch',
      default: 'both',
    },
    {
      id: 'pitch_declined',
      label: 'Pitch declined',
      sub: 'When an insider declines your pitch',
      default: 'both',
    },
    {
      id: 'messages',
      label: 'New messages',
      sub: 'When an insider sends you a message',
      default: 'both',
    },
  ],
}

const OPTIONS = [
  { value: 'both',  label: 'Email & in-app' },
  { value: 'email', label: 'Email only'      },
  { value: 'inapp', label: 'In-app only'     },
  { value: 'off',   label: 'Off'             },
]

export default function NotificationsPage() {
  const [userRole, setUserRole] = useState('seeker')
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSavedState] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/login'; return }

      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()

      const role = user?.role === 'both' ? 'seeker' : (user?.role || 'seeker')
      setUserRole(role)

      // Set defaults based on role
      const defaults = {}
      NOTIFICATION_TYPES[role].forEach(n => {
        defaults[n.id] = n.default
      })
      setSettings(defaults)
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave() {
    setSaving(true)
    // In a future phase this will save to a notifications_settings table
    // For now we store in localStorage as a placeholder
    localStorage.setItem('mrn_notification_settings', JSON.stringify(settings))
    await new Promise(r => setTimeout(r, 500))
    setSaving(false)
    setSavedState(true)
    setTimeout(() => setSavedState(false), 2000)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f4f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif', color: '#888' }}>
        Loading...
      </div>
    )
  }

  const notifTypes = NOTIFICATION_TYPES[userRole]

  return (
    <div style={{ minHeight: '100vh', background: '#f5f4f0', fontFamily: 'DM Sans, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#085041', padding: '16px 20px' }}>
        <BackButton />
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', fontWeight: '500', color: '#E1F5EE' }}>
          Notifications
        </div>
        <div style={{ fontSize: '12px', color: '#9FE1CB', marginTop: '2px' }}>
          Choose how you want to be notified
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Info banner */}
        <div style={{ background: '#E1F5EE', border: '0.5px solid #9FE1CB', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', fontSize: '13px', color: '#085041', lineHeight: '1.6' }}>
          {userRole === 'insider'
            ? 'Pitch notifications are off by default — check your feed when you\'re ready to review pitches. You\'ll be notified when seekers update their interview stage so you can track your Barakah Points.'
            : 'You\'ll be notified when an insider accepts or declines your pitch, and when they message you.'}
        </div>

        {/* Notification rows */}
        <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
          {notifTypes.map((notif, i) => (
            <div key={notif.id} style={{ padding: '14px 16px', borderBottom: i < notifTypes.length - 1 ? '0.5px solid rgba(0,0,0,0.06)' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#111' }}>{notif.label}</div>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{notif.sub}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSettings(prev => ({ ...prev, [notif.id]: opt.value }))}
                    style={{
                      padding: '5px 12px', borderRadius: '20px', fontSize: '12px',
                      fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
                      background: settings[notif.id] === opt.value ? '#085041' : '#f9f8f5',
                      color: settings[notif.id] === opt.value ? '#E1F5EE' : '#888',
                      border: `0.5px solid ${settings[notif.id] === opt.value ? '#085041' : 'rgba(0,0,0,0.1)'}`,
                      transition: 'all 0.15s',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%', padding: '13px', borderRadius: '8px',
            background: saved ? '#1D9E75' : saving ? '#888' : '#085041',
            color: '#E1F5EE', border: 'none',
            fontFamily: 'DM Sans, sans-serif', fontSize: '14px',
            fontWeight: '500', cursor: saving ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}
        >
          {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save preferences'}
        </button>
      </div>
    </div>
  )
}