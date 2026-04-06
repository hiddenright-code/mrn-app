'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import BackButton from '../../../app/components/ui/BackButton'

const HALAL_FILTERS = [
  {
    id: 'prayer_room',
    label: 'Prayer room available',
    sub: 'Company has a designated prayer space',
    icon: '🕌',
  },
  {
    id: 'halal_food',
    label: 'Halal food options nearby',
    sub: 'Halal restaurants or cafeteria options available',
    icon: '🥗',
  },
  {
    id: 'muslim_erg',
    label: 'Muslim ERG exists',
    sub: 'Company has a Muslim Employee Resource Group',
    icon: '🤝',
  },
  {
    id: 'flexible_prayer',
    label: 'Flexible hours for prayer',
    sub: 'Accommodates Jumu\'ah and daily prayer times',
    icon: '🕐',
  },
  {
    id: 'no_alcohol_events',
    label: 'No alcohol at company events',
    sub: 'Company events are alcohol-free or provide alternatives',
    icon: '✓',
  },
]

export default function HalalPreferencesPage() {
  const [selected, setSelected] = useState([])
  const [saving, setSaving] = useState(false)
  const [saved, setSavedState] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/login'; return }
      // Load saved preferences from localStorage for now
      const stored = localStorage.getItem('mrn_halal_prefs')
      if (stored) setSelected(JSON.parse(stored))
      setLoading(false)
    }
    load()
  }, [])

  function toggleFilter(id) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  async function handleSave() {
    setSaving(true)
    localStorage.setItem('mrn_halal_prefs', JSON.stringify(selected))
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

  return (
    <div style={{ minHeight: '100vh', background: '#f5f4f0', fontFamily: 'DM Sans, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#085041', padding: '16px 20px' }}>
        <BackButton />
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', fontWeight: '500', color: '#E1F5EE' }}>
          Halal workplace preferences
        </div>
        <div style={{ fontSize: '12px', color: '#9FE1CB', marginTop: '2px' }}>
          Filter companies by what matters to you
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Info */}
        <div style={{ background: '#E1F5EE', border: '0.5px solid #9FE1CB', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', fontSize: '13px', color: '#085041', lineHeight: '1.6' }}>
          Select the workplace features that are important to you. These preferences will be used to highlight matching companies in your feed.
        </div>

        {/* Filter options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {HALAL_FILTERS.map(filter => {
            const isSelected = selected.includes(filter.id)
            return (
              <div
                key={filter.id}
                onClick={() => toggleFilter(filter.id)}
                style={{
                  background: '#fff',
                  border: `0.5px solid ${isSelected ? '#085041' : 'rgba(0,0,0,0.1)'}`,
                  borderRadius: '12px', padding: '14px 16px',
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', gap: '14px',
                  transition: 'border-color 0.15s',
                }}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: isSelected ? '#085041' : '#f9f8f5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px', flexShrink: 0,
                  transition: 'background 0.15s',
                }}>
                  {filter.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#111' }}>{filter.label}</div>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{filter.sub}</div>
                </div>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                  background: isSelected ? '#085041' : 'transparent',
                  border: `2px solid ${isSelected ? '#085041' : '#ccc'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isSelected && <span style={{ color: '#fff', fontSize: '12px', fontWeight: '500' }}>✓</span>}
                </div>
              </div>
            )
          })}
        </div>

        {selected.length > 0 && (
          <div style={{ background: '#FAEEDA', border: '0.5px solid #FAC775', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#633806' }}>
            {selected.length} preference{selected.length !== 1 ? 's' : ''} selected — companies matching these will be highlighted in your feed.
          </div>
        )}

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