'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Badge from './ui/Badge'
import Card from './ui/Card'

export default function SeekerProfile() {
    const router = useRouter() 
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const userId = session.user.id

      // Load user basic info
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      // Load seeker profile
      const { data: seekerProfile } = await supabase
        .from('seeker_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      // Load employment
      const { data: employment } = await supabase
        .from('employment')
        .select('*')
        .eq('user_id', userId)
        .order('display_order')

      // Load education
      const { data: education } = await supabase
        .from('education')
        .select('*')
        .eq('user_id', userId)
        .single()

      // Load portfolio
      const { data: portfolio } = await supabase
        .from('portfolio_links')
        .select('*')
        .eq('user_id', userId)
        .order('display_order')

      // Load badges
      const { data: badges } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', userId)

      const logoColors = [
        { background: '#E8F0FE', color: '#1a73e8' },
        { background: '#E6F4EA', color: '#1e8e3e' },
        { background: '#FEF3E2', color: '#E37400' },
        { background: '#EEEDFE', color: '#7F77DD' },
        { background: '#E1F5EE', color: '#085041' },
      ]

      setProfile({
        id: userId,
        name: user?.full_name || '',
        tag: user?.tag_line || '',
        status: seekerProfile?.seeking_status || 'Actively seeking referrals',
        summary: seekerProfile?.summary || '',
        avatarUrl: user?.avatar_url || null,
        linkedinUrl: user?.linkedin_url || '',
        badges: badges || [],
        employment: (employment || []).map((emp, i) => ({
          ...emp,
          logo: emp.company ? emp.company[0].toUpperCase() : '?',
          logoStyle: logoColors[i % logoColors.length],
          current: emp.is_current,
          dates: emp.start_year && emp.end_year
            ? `${emp.start_year} – ${emp.is_current ? 'Present' : emp.end_year}`
            : '',
        })),
        education: education ? {
          school: education.school || '',
          degreeType: education.degree_type || '',
          focus: education.focus || '',
          year: education.graduation_year || '',
          notGraduated: education.not_graduated || false,
        } : { school: '', degreeType: '', focus: '', year: '', notGraduated: false },
        portfolio: (portfolio || []).map(p => ({
          ...p,
          logo: p.name ? p.name[0].toUpperCase() : '?',
          logoStyle: { background: '#F1EFE8', color: '#2C2C2A' },
        })),
        jobPrefs: {
          location: seekerProfile?.current_location || '',
          relocate: seekerProfile?.relocate_preference || '',
          cities: seekerProfile?.target_cities || [],
          workPref: seekerProfile?.work_preference || '',
          visa: seekerProfile?.visa_status || '',
        },
      })

      setLoading(false)
    }

    loadProfile()
  }, [])

  function updateProfile(key, val) {
    setProfile(prev => ({ ...prev, [key]: val }))
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#888', fontFamily: 'DM Sans, sans-serif' }}>
        Loading profile...
      </div>
    )
  }

  if (!profile) return null

  const sectionHdrStyle = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px',
  }
  const sectionLblStyle = {
    fontSize: '11px', fontWeight: '500', color: '#888', letterSpacing: '0.06em',
  }
  const editBtnStyle = {
    fontSize: '11px', padding: '3px 10px', borderRadius: '6px',
    border: '0.5px solid rgba(0,0,0,0.15)', background: 'transparent',
    fontFamily: 'DM Sans, sans-serif', color: '#888', cursor: 'pointer',
  }

  return (
    <div>
      {/* Hero */}
      <HeroSection profile={profile} updateProfile={updateProfile} />

      <div style={{ height: '12px', background: '#f9f8f5' }} />

      {/* Job Preferences */}
      <Card>
        <div style={{ padding: '14px 16px' }}>
          <JobPrefsSection
            prefs={profile.jobPrefs}
            onSave={(val) => updateProfile('jobPrefs', val)}
            sectionHdrStyle={sectionHdrStyle}
            sectionLblStyle={sectionLblStyle}
            editBtnStyle={editBtnStyle}
          />
        </div>
      </Card>

      {/* Employment */}
      <Card>
        <div style={{ padding: '14px 16px' }}>
          <EmploymentSection
            employment={profile.employment}
            onSave={(val) => updateProfile('employment', val)}
            sectionHdrStyle={sectionHdrStyle}
            sectionLblStyle={sectionLblStyle}
            editBtnStyle={editBtnStyle}
          />
        </div>
      </Card>

      {/* Education */}
      <Card>
        <div style={{ padding: '14px 16px' }}>
          <EducationSection
            education={profile.education}
            onSave={(val) => updateProfile('education', val)}
            sectionHdrStyle={sectionHdrStyle}
            sectionLblStyle={sectionLblStyle}
            editBtnStyle={editBtnStyle}
          />
        </div>
      </Card>

      {/* Portfolio */}
      <Card>
        <div style={{ padding: '14px 16px' }}>
          <PortfolioSection
            portfolio={profile.portfolio}
            onSave={(val) => updateProfile('portfolio', val)}
            sectionHdrStyle={sectionHdrStyle}
            sectionLblStyle={sectionLblStyle}
            editBtnStyle={editBtnStyle}
          />
        </div>
      </Card>

      {/* Settings */}
      <Card style={{ marginBottom: '12px' }}>
        {[
          { icon: '🔔', bg: '#E1F5EE', label: 'Notifications',              sub: 'Match alerts, pitch responses',   href: '/settings/notifications'     },
          { icon: '⚙',  bg: '#FAEEDA', label: 'Halal workplace preferences', sub: 'Filter companies by culture fit', href: '/settings/halal-preferences'  },
          { icon: '◈',  bg: '#EEEDFE', label: 'Account & billing',           sub: 'Plan, payment, success gift',     href: '/settings/account'            },
        ].map((item) => (
          <div key={item.label} onClick={() => router.push(item.href)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderBottom: '0.5px solid rgba(0,0,0,0.06)', cursor: 'pointer' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>{item.icon}</div>
            <div>
              <div style={{ fontSize: '14px', color: '#111' }}>{item.label}</div>
              <div style={{ fontSize: '12px', color: '#888' }}>{item.sub}</div>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: '16px', color: '#ccc' }}>›</span>
          </div>
        ))}
      </Card>

      <div style={{ height: '16px' }} />
    </div>
  )
}

/* ── HERO SECTION ── */
function HeroSection({ profile, updateProfile }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({
    name: profile.name, tag: profile.tag,
    status: profile.status, summary: profile.summary
  })
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  function startEdit() { setEditing(true) }

  async function save() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session.user.id

      // Name change logging + limit check
      if (draft.name.trim() !== profile.name.trim()) {
        const oneYearAgo = new Date()
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

        const { count: changeCount } = await supabase
          .from('name_change_log')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('changed_at', oneYearAgo.toISOString())

        if (changeCount >= 3) {
          alert("You've reached the maximum name changes for this year.")
          return
        }

        // Log the name change
        await supabase.from('name_change_log').insert({
          user_id: userId,
          old_name: profile.name,
          new_name: draft.name,
        })

        // Flag account on 2nd+ change
        if (changeCount >= 1) {
          await supabase.from('users').update({
            is_flagged: true,
            flag_reason: 'Multiple name changes',
            flagged_at: new Date().toISOString(),
          }).eq('id', userId)
        }
      }

      await supabase
        .from('users')
        .update({
          full_name: draft.name,
          tag_line: draft.tag,
        })
        .eq('id', userId)

      await supabase
        .from('seeker_profiles')
        .update({
          seeking_status: draft.status,
          summary: draft.summary,
        })
        .eq('user_id', userId)

      updateProfile('name', draft.name)
      updateProfile('tag', draft.tag)
      updateProfile('status', draft.status)
      updateProfile('summary', draft.summary)
      updateProfile('avatarUrl', avatarUrl)
      setEditing(false)
    } catch (err) {
      alert('Error saving profile. Please try again.')
      console.error(err)
    }
  }

  function cancel() {
    setDraft({
      name: profile.name, tag: profile.tag,
      status: profile.status, summary: profile.summary
    })
    setAvatarUrl(profile.avatarUrl || null)
    setEditing(false)
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be smaller than 2MB.')
      return
    }

    setUploading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session.user.id
      const fileExt = file.name.split('.').pop()
      const filePath = `${userId}/${userId}.${fileExt}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const publicUrl = data.publicUrl

      // Update avatar_url in users table
      await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', userId)

      setAvatarUrl(publicUrl)
    } catch (err) {
      alert('Error uploading photo. Please try again.')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const inputStyle = {
    width: '100%', borderRadius: '8px',
    border: '0.5px solid rgba(0,0,0,0.2)',
    padding: '9px 12px', marginBottom: '10px',
    fontFamily: 'DM Sans, sans-serif', fontSize: '13px',
    color: '#111', outline: 'none', background: '#fff',
  }

  // Get initials from name
  const initials = profile.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'SK'

  return (
    <div style={{ background: '#085041', padding: '20px 20px 0' }}>
      <div style={{ background: '#fff', borderRadius: '14px 14px 0 0', overflow: 'hidden' }}>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '14px', padding: '16px 16px 0' }}>
          {/* Avatar — clickable in edit mode */}
          <div
            onClick={editing ? () => fileInputRef.current?.click() : undefined}
            style={{
              width: '68px', height: '68px', borderRadius: '50%',
              background: avatarUrl ? 'transparent' : '#FAEEDA',
              color: '#633806',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '500', fontSize: '22px', flexShrink: 0,
              cursor: editing ? 'pointer' : 'default',
              position: 'relative', overflow: 'hidden',
              border: editing ? '2px dashed #085041' : 'none',
            }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              initials
            )}

            {/* Upload overlay */}
            {editing && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(8,80,65,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%',
              }}>
                <span style={{ fontSize: '20px' }}>
                  {uploading ? '⏳' : '📷'}
                </span>
              </div>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            style={{ display: 'none' }}
          />

          {!editing && (
            <button onClick={startEdit} style={{
              marginLeft: 'auto', marginBottom: '4px',
              fontSize: '12px', padding: '6px 14px', borderRadius: '8px',
              border: '0.5px solid rgba(0,0,0,0.15)', background: 'transparent',
              fontFamily: 'DM Sans, sans-serif', color: '#888', cursor: 'pointer',
            }}>
              ✎ Edit
            </button>
          )}
        </div>

        {editing ? (
          <div style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px', letterSpacing: '0.04em', fontWeight: '500' }}>
              PROFILE PHOTO
            </div>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '14px' }}>
              {uploading ? 'Uploading...' : 'Tap the photo above to upload. Max 2MB. Optional.'}
            </div>

            <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', letterSpacing: '0.04em', marginBottom: '4px' }}>FULL NAME</div>
            <input value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} style={inputStyle} />
            <div style={{ fontSize: '11px', color: '#888', marginBottom: '10px', lineHeight: '1.5' }}>
              Name changes are logged and reviewed to maintain community trust.
            </div>

            <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', letterSpacing: '0.04em', marginBottom: '4px' }}>TITLE / TAG LINE</div>
            <input value={draft.tag} onChange={e => setDraft(d => ({ ...d, tag: e.target.value }))} style={inputStyle} />

            <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', letterSpacing: '0.04em', marginBottom: '4px' }}>STATUS</div>
            <select value={draft.status} onChange={e => setDraft(d => ({ ...d, status: e.target.value }))} style={{ ...inputStyle, appearance: 'none' }}>
              <option>Actively seeking referrals</option>
              <option>Open to opportunities</option>
              <option>Not looking right now</option>
            </select>

            <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', letterSpacing: '0.04em', marginBottom: '4px' }}>EXECUTIVE SUMMARY</div>
            <textarea value={draft.summary} onChange={e => setDraft(d => ({ ...d, summary: e.target.value }))} rows={4} style={{ ...inputStyle, resize: 'vertical' }} />

            <SaveCancel onSave={save} onCancel={cancel} />
          </div>
        ) : (
          <>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', fontWeight: '500', color: '#111', padding: '10px 16px 2px' }}>{profile.name}</div>
            <div style={{ fontSize: '13px', color: '#0F6E56', fontWeight: '500', padding: '0 16px 8px' }}>{profile.tag}</div>
            <div style={{ margin: '0 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                fontSize: '12px', padding: '4px 10px',
                borderRadius: '20px',
                background: profile.status === 'Actively seeking referrals' ? '#FAEEDA' : '#F1EFE8',
                color: profile.status === 'Actively seeking referrals' ? '#633806' : '#888',
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: profile.status === 'Actively seeking referrals' ? '#633806' : '#aaa', opacity: 0.7 }} />
                {profile.status}
              </div>
              <button
                onClick={async () => {
                  const newStatus = profile.status === 'Actively seeking referrals'
                    ? 'Not looking right now'
                    : 'Actively seeking referrals'
                  const { data: { session } } = await supabase.auth.getSession()
                  if (!session) return
                  await supabase
                    .from('seeker_profiles')
                    .update({ seeking_status: newStatus })
                    .eq('user_id', session.user.id)
                  updateProfile('status', newStatus)
                }}
                style={{
                  fontSize: '12px', padding: '4px 12px', borderRadius: '20px',
                  border: '0.5px solid rgba(0,0,0,0.15)', background: 'transparent',
                  fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
                  color: profile.status === 'Actively seeking referrals' ? '#A32D2D' : '#085041',
                }}
              >
                {profile.status === 'Actively seeking referrals' ? 'Pause profile' : 'Resume profile'}
              </button>
            </div>
            <div style={{ height: '0.5px', background: 'rgba(0,0,0,0.08)', margin: '0 16px' }} />
            <div style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', letterSpacing: '0.06em', marginBottom: '8px' }}>EXECUTIVE SUMMARY</div>
              <div style={{ fontSize: '13px', color: '#111', lineHeight: '1.6' }}>{profile.summary}</div>
            </div>
            <div style={{ height: '0.5px', background: 'rgba(0,0,0,0.08)', margin: '0 16px' }} />
            <div style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', letterSpacing: '0.06em', marginBottom: '8px' }}>TRUST BADGES</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <Badge label="Community Verified" color="teal" />
                <Badge label="Portfolio Linked" color="amber" />
                <Badge label="2 References" color="purple" />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ── JOB PREFERENCES SECTION ── */
function JobPrefsSection({ prefs, onSave, sectionHdrStyle, sectionLblStyle, editBtnStyle }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(prefs)
  const [cityInput, setCityInput] = useState('')
  const [citySuggestions, setCitySuggestions] = useState([])
  const [locationSuggestions, setLocationSuggestions] = useState([])

  const cities = [
    'Austin, TX','Atlanta, GA','Boston, MA','Chicago, IL','Dallas, TX',
    'Denver, CO','Houston, TX','Los Angeles, CA','Miami, FL','Nashville, TN',
    'New York, NY','Philadelphia, PA','Phoenix, AZ','Portland, OR',
    'San Francisco, CA','Seattle, WA','Washington, DC','Remote',
  ]

  const [saved, setSaved] = useState({ ...prefs })

  function startEdit() { setDraft({ ...saved }); setEditing(true) }
  async function save() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      await supabase
        .from('seeker_profiles')
        .update({
          current_location: draft.location,
          relocate_preference: draft.relocate,
          target_cities: draft.cities,
          work_preference: draft.workPref,
          visa_status: draft.visa,
        })
        .eq('user_id', session.user.id)

      setSaved({ ...draft })
      onSave(draft)
      setEditing(false)
    } catch (err) {
      alert('Error saving preferences. Please try again.')
      console.error(err)
    }
  }
  function cancel() { setDraft({ ...saved }); setEditing(false) }

  function handleLocationInput(val) {
    setDraft(d => ({ ...d, location: val }))
    if (val.length < 2) { setLocationSuggestions([]); return }
    setLocationSuggestions(cities.filter(c => c.toLowerCase().includes(val.toLowerCase())))
  }

  function handleCityInput(val) {
    setCityInput(val)
    if (val.length < 2) { setCitySuggestions([]); return }
    setCitySuggestions(cities.filter(c => c.toLowerCase().includes(val.toLowerCase()) && !draft.cities.includes(c)))
  }

  function addCity(city) {
    setDraft(d => ({ ...d, cities: [...d.cities, city] }))
    setCityInput(''); setCitySuggestions([])
  }

  function removeCity(city) {
    setDraft(d => ({ ...d, cities: d.cities.filter(c => c !== city) }))
  }

  const inputStyle = {
    width: '100%', borderRadius: '8px',
    border: '0.5px solid rgba(0,0,0,0.15)',
    padding: '9px 12px',
    fontFamily: 'DM Sans, sans-serif', fontSize: '13px',
    color: '#111', outline: 'none', background: '#fff',
  }

  const optionStyle = (selected) => ({
    padding: '9px 12px', borderRadius: '8px', fontSize: '13px',
    cursor: 'pointer', marginBottom: '6px',
    background: selected ? '#085041' : '#f9f8f5',
    color: selected ? '#E1F5EE' : '#111',
    border: `0.5px solid ${selected ? '#085041' : 'rgba(0,0,0,0.08)'}`,
    display: 'flex', alignItems: 'center', gap: '8px',
  })

  const dropdownStyle = {
    position: 'absolute', top: '100%', left: 0, right: 0,
    background: '#fff', border: '0.5px solid rgba(0,0,0,0.15)',
    borderRadius: '8px', marginTop: '4px', zIndex: 20,
    overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  }

  const RadioDot = ({ selected }) => (
    <span style={{
      width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
      border: `2px solid ${selected ? '#E1F5EE' : '#ccc'}`,
      background: selected ? '#E1F5EE' : 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {selected && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#085041' }} />}
    </span>
  )

  if (!editing) {
    return (
      <>
        <div style={sectionHdrStyle}>
          <span style={sectionLblStyle}>JOB PREFERENCES</span>
          <button onClick={startEdit} style={editBtnStyle}>✎ Edit</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[
            { label: 'Current location', value: prefs.location  },
            { label: 'Open to relocate', value: prefs.relocate  },
            { label: 'Work preference',  value: prefs.workPref  },
            { label: 'Target cities',    value: prefs.cities.join(', ') },
          ].map(p => (
            <div key={p.label} style={{ background: '#f9f8f5', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: '10px', padding: '10px 12px' }}>
              <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>{p.label}</div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#111' }}>{p.value}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '10px', background: '#f9f8f5', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: '10px', padding: '10px 12px' }}>
          <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>Visa sponsorship</div>
          <div style={{ fontSize: '13px', fontWeight: '500', color: '#0F6E56' }}>{prefs.visa}</div>
        </div>
      </>
    )
  }

  return (
    <>
      <div style={sectionHdrStyle}>
        <span style={sectionLblStyle}>JOB PREFERENCES</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Location */}
        <div>
          <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '6px', fontWeight: '500', letterSpacing: '0.04em' }}>CURRENT LOCATION</label>
          <div style={{ position: 'relative' }}>
            <input value={draft.location} onChange={e => handleLocationInput(e.target.value)} placeholder="Type your city..." style={inputStyle} />
            {locationSuggestions.length > 0 && (
              <div style={dropdownStyle}>
                {locationSuggestions.map(s => (
                  <div key={s} onClick={() => { setDraft(d => ({ ...d, location: s })); setLocationSuggestions([]) }}
                    style={{ padding: '10px 12px', fontSize: '13px', cursor: 'pointer', borderBottom: '0.5px solid rgba(0,0,0,0.06)', color: '#111' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f9f8f5'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >{s}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Relocate */}
        <div>
          <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '6px', fontWeight: '500', letterSpacing: '0.04em' }}>OPEN TO RELOCATE</label>
          {['Yes — within US', 'Yes — open to relocate globally', 'Not open to relocating'].map(opt => (
            <div key={opt} onClick={() => setDraft(d => ({ ...d, relocate: opt }))} style={optionStyle(draft.relocate === opt)}>
              <RadioDot selected={draft.relocate === opt} />{opt}
            </div>
          ))}
        </div>

        {/* Target Cities */}
        <div>
          <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '6px', fontWeight: '500', letterSpacing: '0.04em' }}>TARGET CITIES</label>
          {draft.cities.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              {draft.cities.map(city => (
                <span key={city} style={{ background: '#085041', color: '#E1F5EE', fontSize: '12px', padding: '4px 10px', borderRadius: '20px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  {city} <span onClick={() => removeCity(city)} style={{ opacity: 0.7 }}>✕</span>
                </span>
              ))}
            </div>
          )}
          <div style={{ position: 'relative' }}>
            <input value={cityInput} onChange={e => handleCityInput(e.target.value)} placeholder="Type a city to add..." style={inputStyle} />
            {citySuggestions.length > 0 && (
              <div style={dropdownStyle}>
                {citySuggestions.map(s => (
                  <div key={s} onClick={() => addCity(s)}
                    style={{ padding: '10px 12px', fontSize: '13px', cursor: 'pointer', borderBottom: '0.5px solid rgba(0,0,0,0.06)', color: '#111', display: 'flex', justifyContent: 'space-between' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f9f8f5'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >{s}<span style={{ color: '#085041', fontSize: '12px', fontWeight: '500' }}>+ Add</span></div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Work Pref */}
        <div>
          <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '6px', fontWeight: '500', letterSpacing: '0.04em' }}>WORK PREFERENCE</label>
          {['Remote', 'Hybrid', 'In-office'].map(opt => (
            <div key={opt} onClick={() => setDraft(d => ({ ...d, workPref: opt }))} style={optionStyle(draft.workPref === opt)}>
              <RadioDot selected={draft.workPref === opt} />{opt}
            </div>
          ))}
        </div>

        {/* Visa */}
        <div>
          <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '6px', fontWeight: '500', letterSpacing: '0.04em' }}>VISA SPONSORSHIP</label>
          {[
            'Not required — US citizen',
            'Not required — Green card / PR',
            'Required — H1B transfer',
            'Required — OPT / STEM OPT',
            'Required — Need full sponsorship',
          ].map(opt => (
            <div key={opt} onClick={() => setDraft(d => ({ ...d, visa: opt }))} style={optionStyle(draft.visa === opt)}>
              <RadioDot selected={draft.visa === opt} />{opt}
            </div>
          ))}
        </div>

      </div>
      <SaveCancel onSave={save} onCancel={cancel} />
    </>
  )
}
/* ── EMPLOYMENT SECTION ── */
function EmploymentSection({ employment, onSave, sectionHdrStyle, sectionLblStyle, editBtnStyle }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(employment)

  const [saved, setSaved] = useState(employment.map(e => ({ ...e })))

  function startEdit() { setDraft(saved.map(e => ({ ...e }))); setEditing(true) }
  async function save() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session.user.id

      await supabase
        .from('employment')
        .delete()
        .eq('user_id', userId)

      if (draft.length > 0) {
        await supabase
          .from('employment')
          .insert(draft.map((emp, i) => ({
            user_id: userId,
            role: emp.role,
            company: emp.company,
            start_year: emp.startYear || emp.start_year || '',
            end_year: emp.endYear || emp.end_year || '',
            is_current: emp.current || emp.is_current || false,
            display_order: i,
          })))
      }

      setSaved(draft.map(e => ({ ...e })))
      onSave(draft)
      setEditing(false)
    } catch (err) {
      alert('Error saving employment. Please try again.')
      console.error(err)
    }
  }
  function cancel() { setDraft(saved.map(e => ({ ...e }))); setEditing(false) }

  function updateRow(i, field, val) {
    setDraft(prev => prev.map((row, idx) => idx === i ? { ...row, [field]: val } : row))
  }

  function addRow() {
    setDraft(prev => [...prev, {
      logo: '?', logoStyle: { background: '#F1EFE8', color: '#2C2C2A' },
      role: '', company: '', startYear: '', endYear: '', current: false,
    }])
  }

  function removeRow(i) {
    setDraft(prev => prev.filter((_, idx) => idx !== i))
  }

  const years = Array.from({ length: new Date().getFullYear() - 1979 }, (_, i) => String(new Date().getFullYear() - i))

  const inputStyle = {
    width: '100%', borderRadius: '8px',
    border: '0.5px solid rgba(0,0,0,0.15)',
    padding: '8px 10px', marginBottom: '6px',
    fontFamily: 'DM Sans, sans-serif', fontSize: '13px',
    color: '#111', outline: 'none', background: '#fff',
  }

  const selectStyle = {
    ...inputStyle,
    appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23888'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
    paddingRight: '28px', cursor: 'pointer',
  }

  if (!editing) {
    return (
      <>
        <div style={sectionHdrStyle}>
          <span style={sectionLblStyle}>EMPLOYMENT HISTORY</span>
          <button onClick={startEdit} style={editBtnStyle}>✎ Edit</button>
        </div>
        {employment.map((emp, i) => (
          <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: i === employment.length - 1 ? '0' : '14px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', flexShrink: 0, ...emp.logoStyle }}>{emp.logo}</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#111' }}>
                {emp.role}
                {emp.current && <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '20px', background: '#E1F5EE', color: '#085041', fontWeight: '500', marginLeft: '6px' }}>Current</span>}
              </div>
              <div style={{ fontSize: '12px', color: '#888' }}>{emp.company}</div>
              <div style={{ fontSize: '11px', color: '#aaa', marginTop: '1px' }}>
                {emp.startYear && emp.endYear ? `${emp.startYear} – ${emp.current ? 'Present' : emp.endYear}` : emp.dates}
              </div>
            </div>
          </div>
        ))}
      </>
    )
  }

  return (
    <>
      <div style={sectionHdrStyle}><span style={sectionLblStyle}>EMPLOYMENT HISTORY</span></div>
      {draft.map((emp, i) => (
        <div key={i} style={{ background: '#f9f8f5', borderRadius: '10px', padding: '12px', marginBottom: '10px', position: 'relative' }}>
          <button onClick={() => removeRow(i)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#aaa' }}>✕</button>

          <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>JOB TITLE</label>
          <input value={emp.role} onChange={e => updateRow(i, 'role', e.target.value)} placeholder="e.g. Senior Product Manager" style={inputStyle} />

          <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>COMPANY</label>
          <input value={emp.company} onChange={e => updateRow(i, 'company', e.target.value)} placeholder="e.g. Google" style={inputStyle} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '6px' }}>
            <div>
              <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>START YEAR</label>
              <select value={emp.startYear || ''} onChange={e => updateRow(i, 'startYear', e.target.value)} style={selectStyle}>
                <option value="">Year</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>END YEAR</label>
              <select value={emp.endYear || ''} onChange={e => updateRow(i, 'endYear', e.target.value)} disabled={emp.current} style={{ ...selectStyle, opacity: emp.current ? 0.4 : 1 }}>
                <option value="">Year</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#555', cursor: 'pointer', marginTop: '4px' }}>
            <input type="checkbox" checked={emp.current || false} onChange={e => updateRow(i, 'current', e.target.checked)} />
            I currently work here
          </label>
        </div>
      ))}
      <button onClick={addRow} style={{ width: '100%', padding: '9px', borderRadius: '8px', background: 'transparent', border: '0.5px dashed rgba(0,0,0,0.2)', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: '#888', cursor: 'pointer', marginBottom: '4px' }}>
        + Add position
      </button>
      <SaveCancel onSave={save} onCancel={cancel} />
    </>
  )
}

/* ── EDUCATION SECTION ── */
function EducationSection({ education, onSave, sectionHdrStyle, sectionLblStyle, editBtnStyle }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(education)
  const [schoolInput, setSchoolInput] = useState('')
  const [schoolSuggestions, setSchoolSuggestions] = useState([])
  const [schoolLoading, setSchoolLoading] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState(null)

  const [saved, setSaved] = useState({
    school: education.school || '',
    degreeType: education.degreeType || '',
    focus: education.focus || '',
    year: education.year || '',
    notGraduated: education.notGraduated || false,
  })

  function startEdit() {
    setDraft({
      school: saved.school || '',
      degreeType: saved.degreeType || '',
      focus: saved.focus || '',
      year: saved.year || '',
      notGraduated: saved.notGraduated || false,
    })
    setSchoolInput(saved.school || '')
    setEditing(true)
  }

  function cancel() {
    setDraft({
      school: saved.school || '',
      degreeType: saved.degreeType || '',
      focus: saved.focus || '',
      year: saved.year || '',
      notGraduated: saved.notGraduated || false,
    })
    setSchoolInput(saved.school || '')
    setEditing(false)
  }

  const manualUniversities = [
    'University of Texas at Austin',
    'University of Texas at San Antonio',
    'University of Texas at Houston',
    'University of Texas Health Science Center',
    'Massachusetts Institute of Technology (MIT)',
    'Harvard University',
    'Stanford University',
    'Yale University',
    'Princeton University',
    'Columbia University',
    'University of Pennsylvania',
    'Cornell University',
    'Dartmouth College',
    'Brown University',
    'Duke University',
    'Northwestern University',
    'Johns Hopkins University',
    'Vanderbilt University',
    'Rice University',
    'Notre Dame University',
    'Georgetown University',
    'Carnegie Mellon University',
    'University of California, Berkeley',
    'University of California, Los Angeles (UCLA)',
    'University of California, San Diego',
    'University of California, Davis',
    'University of California, Irvine',
    'University of California, Santa Barbara',
    'University of Michigan, Ann Arbor',
    'University of Virginia',
    'University of North Carolina at Chapel Hill',
    'Georgia Institute of Technology',
    'University of Florida',
    'Florida State University',
    'University of Georgia',
    'Ohio State University',
    'Pennsylvania State University',
    'Purdue University',
    'Indiana University',
    'University of Illinois at Urbana-Champaign',
    'University of Wisconsin-Madison',
    'University of Minnesota',
    'University of Iowa',
    'University of Missouri',
    'Washington University in St. Louis',
    'University of Chicago',
    'Emory University',
    'Wake Forest University',
    'Tulane University',
    'Boston University',
    'Boston College',
    'Northeastern University',
    'Tufts University',
    'Brandeis University',
    'University of Southern California (USC)',
    'New York University (NYU)',
    'Fordham University',
    'Rutgers University',
    'University of Maryland',
    'American University',
    'George Washington University',
    'Howard University',
    'Spelman College',
    'Morehouse College',
    'Hampton University',
    'Texas A&M University',
    'Texas Tech University',
    'Baylor University',
    'Southern Methodist University (SMU)',
    'Texas Christian University (TCU)',
    'University of Houston',
    'Arizona State University',
    'University of Arizona',
    'University of Colorado Boulder',
    'Colorado State University',
    'University of Utah',
    'Brigham Young University (BYU)',
    'University of Nevada, Las Vegas',
    'University of Oregon',
    'Oregon State University',
    'University of Washington',
    'Washington State University',
    'University of Nevada, Reno',
    'University of New Mexico',
    'University of Oklahoma',
    'Oklahoma State University',
    'University of Arkansas',
    'University of Mississippi',
    'Mississippi State University',
    'University of Alabama',
    'Auburn University',
    'University of Tennessee',
    'University of Kentucky',
    'University of Louisville',
    'University of South Carolina',
    'Clemson University',
    'Virginia Tech',
    'University of Pittsburgh',
    'Temple University',
    'Drexel University',
    'Villanova University',
    'Lehigh University',
    'Case Western Reserve University',
    'University of Miami',
    'Florida International University',
    'University of Tampa',
    'Seton Hall University',
    'University of Connecticut',
    'University of Rhode Island',
    'University of New Hampshire',
    'University of Vermont',
    'University of Maine',
    'Syracuse University',
    'Rochester Institute of Technology',
    'Rensselaer Polytechnic Institute (RPI)',
    'Worcester Polytechnic Institute (WPI)',
    'Stevens Institute of Technology',
    'New Jersey Institute of Technology (NJIT)',
    'Montclair State University',
    'Rutgers University-Newark',
    'Kean University',
    'William Paterson University',
  ]

  async function handleSchoolInput(val) {
    setSchoolInput(val)
    setDraft(d => ({ ...d, school: val }))
    if (val.length < 3) { setSchoolSuggestions([]); return }
    if (searchTimeout) clearTimeout(searchTimeout)
    setSchoolLoading(true)
    const t = setTimeout(async () => {
      try {
        const lower = val.toLowerCase()
        const words = lower.split(' ').filter(w => w.length > 1)

        const manualMatches = manualUniversities.filter(u => {
          const uLower = u.toLowerCase()
          return words.every(w => uLower.includes(w)) ||
                 (words.some(w => uLower.includes(w)) && uLower.includes(lower))
        }).slice(0, 5)

        const res = await fetch(`http://universities.hipolabs.com/search?name=${encodeURIComponent(val)}`)
        const data = await res.json()
        const apiResults = [...new Set(data.map(u => u.name))]
          .filter(name => !manualMatches.includes(name))
          .slice(0, 6)

        const combined = [...manualMatches, ...apiResults].slice(0, 10)
        setSchoolSuggestions(combined)
      } catch {
        setSchoolSuggestions([])
      } finally {
        setSchoolLoading(false)
      }
    }, 400)
    setSearchTimeout(t)
  }

  async function save() {
    const currentYear = new Date().getFullYear()
    const selectedYear = parseInt(draft.year)

    if (!draft.school.trim()) {
      alert('Please enter your school name.'); return
    }
    if (!draft.degreeType) {
      alert('Please select a degree type.'); return
    }
    if (!draft.year) {
      alert('Please select a graduation year.'); return
    }
    if (draft.notGraduated && selectedYear < currentYear) {
      alert(`Expected graduation year must be ${currentYear} or later. If you have already graduated, uncheck "not graduated yet".`)
      return
    }
    if (!draft.notGraduated && selectedYear > currentYear) {
      alert(`Graduation year cannot be in the future. If you haven't graduated yet, check "I have not graduated yet".`)
      return
    }

    const toSave = {
      school: draft.school,
      degreeType: draft.degreeType,
      focus: draft.focus,
      year: draft.year,
      notGraduated: draft.notGraduated || false,
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session.user.id

      const { data: existing } = await supabase
        .from('education')
        .select('id')
        .eq('user_id', userId)
        .single()

      if (existing) {
        await supabase
          .from('education')
          .update({
            school: toSave.school,
            degree_type: toSave.degreeType,
            focus: toSave.focus,
            graduation_year: toSave.year,
            not_graduated: toSave.notGraduated,
          })
          .eq('user_id', userId)
      } else {
        await supabase
          .from('education')
          .insert({
            user_id: userId,
            school: toSave.school,
            degree_type: toSave.degreeType,
            focus: toSave.focus,
            graduation_year: toSave.year,
            not_graduated: toSave.notGraduated,
          })
      }

      setSaved({ ...toSave })
      onSave(toSave)
      setEditing(false)
    } catch (err) {
      alert('Error saving education. Please try again.')
      console.error(err)
    }
  }

  const currentYear = new Date().getFullYear()
  const gradYears = Array.from({ length: currentYear + 6 - 1979 }, (_, i) => String(currentYear + 5 - i))

  const degreeTypes = [
    'High School Diploma',
    'Associate of Arts (AA)',
    'Associate of Science (AS)',
    'Bachelor of Arts (BA)',
    'Bachelor of Science (BS)',
    'Bachelor of Fine Arts (BFA)',
    'Bachelor of Business Administration (BBA)',
    'Bachelor of Engineering (BEng)',
    'Master of Arts (MA)',
    'Master of Science (MS)',
    'Master of Business Administration (MBA)',
    'Master of Engineering (MEng)',
    'Master of Education (MEd)',
    'Master of Public Health (MPH)',
    'Master of Social Work (MSW)',
    'Juris Doctor (JD)',
    'Doctor of Medicine (MD)',
    'Doctor of Philosophy (PhD)',
    'Doctor of Education (EdD)',
    'Other',
  ]

  const focusAreas = [
    'Accounting', 'Aerospace Engineering', 'Architecture',
    'Biomedical Engineering', 'Business Administration',
    'Chemical Engineering', 'Civil Engineering',
    'Communications', 'Computer Engineering',
    'Computer Science', 'Data Science',
    'Economics', 'Electrical Engineering',
    'Electrical & Computer Engineering', 'Environmental Science',
    'Finance', 'Graphic Design', 'Human Resources',
    'Industrial Engineering', 'Information Systems',
    'Information Technology', 'Journalism',
    'Kinesiology', 'Law', 'Management',
    'Marketing', 'Mathematics', 'Mechanical Engineering',
    'Medicine', 'Neuroscience', 'Nursing',
    'Philosophy', 'Physics', 'Political Science',
    'Psychology', 'Public Health', 'Public Policy',
    'Social Work', 'Sociology', 'Software Engineering',
    'Statistics', 'Supply Chain Management', 'Other',
  ]

  const inputStyle = {
    width: '100%', borderRadius: '8px',
    border: '0.5px solid rgba(0,0,0,0.15)',
    padding: '9px 12px', marginBottom: '10px',
    fontFamily: 'DM Sans, sans-serif', fontSize: '13px',
    color: '#111', outline: 'none', background: '#fff',
  }

  const selectStyle = {
    ...inputStyle,
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23888'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
    paddingRight: '28px', cursor: 'pointer',
  }

  const labelStyle = {
    fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px', fontWeight: '500', letterSpacing: '0.04em',
  }

  if (!editing) {
    return (
      <>
        <div style={sectionHdrStyle}>
          <span style={sectionLblStyle}>EDUCATION</span>
          <button onClick={startEdit} style={editBtnStyle}>✎ Edit</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EEEDFE', color: '#3C3489', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>🎓</div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '500', color: '#111' }}>{education.school}</div>
            <div style={{ fontSize: '12px', color: '#888' }}>
              {education.degreeType} {education.focus ? `· ${education.focus}` : education.degree ? `· ${education.degree}` : ''}
            </div>
            <div style={{ fontSize: '11px', color: '#aaa', marginTop: '1px' }}>
              {education.notGraduated
                ? `Expected graduation: ${education.year}`
                : `Graduated: ${education.year}`}
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div style={sectionHdrStyle}><span style={sectionLblStyle}>EDUCATION</span></div>

      <label style={labelStyle}>SCHOOL / UNIVERSITY</label>
      <div style={{ position: 'relative', marginBottom: '10px' }}>
        <input
          value={schoolInput}
          onChange={e => handleSchoolInput(e.target.value)}
          placeholder="Start typing your university..."
          style={{ ...inputStyle, marginBottom: '0' }}
        />
        {schoolLoading && (
          <div style={{
            position: 'absolute', right: '12px', top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '11px', color: '#888',
          }}>
            Searching...
          </div>
        )}
        {schoolSuggestions.length > 0 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            background: '#fff', border: '0.5px solid rgba(0,0,0,0.15)',
            borderRadius: '8px', marginTop: '4px', zIndex: 20,
            overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}>
            {schoolSuggestions.map(s => (
              <div
                key={s}
                onClick={() => {
                  setSchoolInput(s)
                  setDraft(d => ({ ...d, school: s }))
                  setSchoolSuggestions([])
                }}
                style={{
                  padding: '10px 12px', fontSize: '13px', cursor: 'pointer',
                  borderBottom: '0.5px solid rgba(0,0,0,0.06)', color: '#111',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f9f8f5'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                {s}
              </div>
            ))}
          </div>
        )}
      </div>
      <label style={labelStyle}>DEGREE TYPE</label>
      <select
        value={draft.degreeType || ''}
        onChange={e => setDraft(d => ({ ...d, degreeType: e.target.value }))}
        style={selectStyle}
      >
        <option value="">Select degree type...</option>
        {degreeTypes.map(d => <option key={d} value={d}>{d}</option>)}
      </select>

      <label style={labelStyle}>FIELD OF STUDY / FOCUS AREA</label>
      <select
        value={draft.focus || ''}
        onChange={e => setDraft(d => ({ ...d, focus: e.target.value }))}
        style={selectStyle}
      >
        <option value="">Select field of study...</option>
        {focusAreas.map(f => <option key={f} value={f}>{f}</option>)}
      </select>

      <label style={labelStyle}>GRADUATION DATE</label>
      <select
        value={draft.year || ''}
        onChange={e => setDraft(d => ({ ...d, year: e.target.value }))}
        style={selectStyle}
      >
        <option value="">Select year...</option>
        {gradYears.map(y => <option key={y} value={y}>{y}</option>)}
      </select>

      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#555', cursor: 'pointer', marginBottom: '14px' }}>
        <input
          type="checkbox"
          checked={draft.notGraduated || false}
          onChange={e => setDraft(d => ({ ...d, notGraduated: e.target.checked }))}
        />
        I have not graduated yet — show as expected graduation date
      </label>

      <SaveCancel onSave={save} onCancel={cancel} />
    </>
  )
}

/* ── PORTFOLIO SECTION ── */
function PortfolioSection({ portfolio, onSave, sectionHdrStyle, sectionLblStyle, editBtnStyle }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(portfolio)

  const [saved, setSaved] = useState(portfolio.map(p => ({ ...p })))

  function startEdit() { setDraft(saved.map(p => ({ ...p }))); setEditing(true) }
  async function save() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session.user.id

      await supabase
        .from('portfolio_links')
        .delete()
        .eq('user_id', userId)

      if (draft.length > 0) {
        await supabase
          .from('portfolio_links')
          .insert(draft.map((p, i) => ({
            user_id: userId,
            name: p.name,
            link: p.link,
            display_order: i,
          })))
      }

      setSaved(draft.map(p => ({ ...p })))
      onSave(draft)
      setEditing(false)
    } catch (err) {
      alert('Error saving portfolio. Please try again.')
      console.error(err)
    }
  }
  function cancel() { setDraft(saved.map(p => ({ ...p }))); setEditing(false) }

  function updateRow(i, field, val) {
    setDraft(prev => prev.map((row, idx) => idx === i ? { ...row, [field]: val } : row))
  }

  function addRow() {
    setDraft(prev => [...prev, { logo: '🔗', logoStyle: { background: '#F1EFE8', color: '#2C2C2A' }, name: '', link: '' }])
  }

  function removeRow(i) {
    setDraft(prev => prev.filter((_, idx) => idx !== i))
  }

  const inputStyle = {
    width: '100%', borderRadius: '8px',
    border: '0.5px solid rgba(0,0,0,0.15)',
    padding: '8px 10px', marginBottom: '6px',
    fontFamily: 'DM Sans, sans-serif', fontSize: '13px',
    color: '#111', outline: 'none', background: '#fff',
  }

  if (!editing) {
    return (
      <>
        <div style={sectionHdrStyle}>
          <span style={sectionLblStyle}>PORTFOLIO & LINKS</span>
          <button onClick={startEdit} style={editBtnStyle}>✎ Edit</button>
        </div>
        {portfolio.map((v, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: i < portfolio.length - 1 ? '0.5px solid rgba(0,0,0,0.06)' : 'none' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600', ...v.logoStyle }}>{v.logo}</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#111' }}>{v.name}</div>
              <div style={{ fontSize: '11px', color: '#888' }}>{v.link}</div>
            </div>
            <button onClick={() => alert('Copied!')} style={{ marginLeft: 'auto', fontSize: '11px', padding: '4px 10px', borderRadius: '6px', border: '0.5px solid rgba(0,0,0,0.15)', background: 'transparent', fontFamily: 'DM Sans, sans-serif', color: '#888', cursor: 'pointer' }}>Copy</button>
          </div>
        ))}
      </>
    )
  }

  return (
    <>
      <div style={sectionHdrStyle}><span style={sectionLblStyle}>PORTFOLIO & LINKS</span></div>
      {draft.map((v, i) => (
        <div key={i} style={{ background: '#f9f8f5', borderRadius: '10px', padding: '12px', marginBottom: '10px', position: 'relative' }}>
          <button onClick={() => removeRow(i)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#aaa' }}>✕</button>
          <input value={v.name} onChange={e => updateRow(i, 'name', e.target.value)} placeholder="Label (e.g. LinkedIn)" style={inputStyle} />
          <input value={v.link} onChange={e => updateRow(i, 'link', e.target.value)} placeholder="URL (e.g. linkedin.com/in/...)" style={inputStyle} />
        </div>
      ))}
      <button onClick={addRow} style={{ width: '100%', padding: '9px', borderRadius: '8px', background: 'transparent', border: '0.5px dashed rgba(0,0,0,0.2)', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: '#888', cursor: 'pointer', marginBottom: '4px' }}>
        + Add link
      </button>
      <SaveCancel onSave={save} onCancel={cancel} />
    </>
  )
}

/* ── SHARED SAVE/CANCEL BUTTONS ── */
function SaveCancel({ onSave, onCancel }) {
  return (
    <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
      <button onClick={onSave} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#085041', color: '#E1F5EE', border: 'none', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
        Save changes
      </button>
      <button onClick={onCancel} style={{ padding: '10px 16px', borderRadius: '8px', background: 'transparent', color: '#888', border: '0.5px solid rgba(0,0,0,0.12)', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', cursor: 'pointer' }}>
        Cancel
      </button>
    </div>
  )
}