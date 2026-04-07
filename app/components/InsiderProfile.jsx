'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Badge from './ui/Badge'
import Card from './ui/Card'
import { buildInsiderProfileBadges } from '../../lib/badges'

export default function InsiderProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const userId = session.user.id

      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      const { data: insider } = await supabase
        .from('insider_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      const { data: employment } = await supabase
        .from('employment')
        .select('*')
        .eq('user_id', userId)
        .order('display_order')

      const { data: education } = await supabase
        .from('education')
        .select('*')
        .eq('user_id', userId)
        .single()

      const { data: badges } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', userId)

      const { data: vault } = await supabase
        .from('referral_vault')
        .select('*')
        .eq('user_id', userId)

      const { data: barakahLog } = await supabase
        .from('barakah_log')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      const totalPoints = barakahLog
        ? barakahLog.reduce((sum, item) => sum + item.points, 0)
        : 0

      // Load referral stats for badges
      const { count: referralCount } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('insider_id', userId)
        .in('stage', ['submitted', 'interviewing', 'hired', 'bonus_pending', 'complete'])

      const { count: hireCount } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('insider_id', userId)
        .in('stage', ['hired', 'bonus_pending', 'complete'])

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
        avatarUrl: user?.avatar_url || null,
        linkedinUrl: user?.linkedin_url || '',
        about: user?.about || '',
        company: insider?.company || '',
        roleLevel: insider?.role_level || '',
        department: insider?.department || '',
        anonymityOn: insider?.anonymity_on ?? true,
        openToReferring: insider?.open_to_referring ?? true,
        barakahPoints: totalPoints,
        barakahLog: barakahLog || [],
        badges: badges || [],
        referralCount: referralCount || 0,
        hireCount: hireCount || 0,
        vault: vault || [],
        employment: (employment || []).map((emp, i) => ({
          ...emp,
          logo: emp.company ? emp.company[0].toUpperCase() : '?',
          logoStyle: logoColors[i % logoColors.length],
        })),
        education: education || null,
      })

      setLoading(false)
    }
    load()
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

  const badgeMap = {
    community_verified: { label: 'Community Verified', color: 'teal' },
    top_referrer: { label: 'Top Referrer', color: 'purple' },
    halal_friendly_advocate: { label: 'Halal-Friendly Advocate', color: 'amber' },
    portfolio_linked: { label: 'Portfolio Linked', color: 'amber' },
  }

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
      <HeroSection profile={profile} updateProfile={updateProfile} />

      <div style={{ height: '12px', background: '#f9f8f5' }} />

      <Card>
        <div style={{ padding: '14px 16px' }}>
          <CompanySection
            profile={profile}
            updateProfile={updateProfile}
            sectionHdrStyle={sectionHdrStyle}
            sectionLblStyle={sectionLblStyle}
            editBtnStyle={editBtnStyle}
          />
        </div>
      </Card>

      <Card>
        <div style={{ padding: '14px 16px' }}>
          <EmploymentSection
            employment={profile.employment}
            onSave={(val) => updateProfile('employment', val)}
            sectionHdrStyle={sectionHdrStyle}
            sectionLblStyle={sectionLblStyle}
            editBtnStyle={editBtnStyle}
            userId={profile.id}
          />
        </div>
      </Card>

      <Card>
        <div style={{ padding: '14px 16px' }}>
          <EducationSection
            education={profile.education}
            onSave={(val) => updateProfile('education', val)}
            sectionHdrStyle={sectionHdrStyle}
            sectionLblStyle={sectionLblStyle}
            editBtnStyle={editBtnStyle}
            userId={profile.id}
          />
        </div>
      </Card>

      <Card>
        <div style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', letterSpacing: '0.06em', marginBottom: '12px' }}>BARAKAH POINTS</div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
            <div style={{ flex: 1, background: '#f9f8f5', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: '10px', padding: '10px 12px' }}>
              <div style={{ fontSize: '20px', fontWeight: '500', color: '#633806' }}>{profile.barakahPoints}</div>
              <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>Total points</div>
            </div>
            <div style={{ flex: 1, background: '#f9f8f5', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: '10px', padding: '10px 12px' }}>
              <div style={{ fontSize: '20px', fontWeight: '500', color: '#633806' }}>{profile.barakahLog.filter(l => l.points > 0).length}</div>
              <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>Events</div>
            </div>
          </div>
          {profile.barakahLog.map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
              <div>
                <div style={{ fontSize: '13px', color: '#111' }}>{item.event}</div>
                <div style={{ fontSize: '11px', color: '#888' }}>{new Date(item.created_at).toLocaleDateString()}</div>
              </div>
              <span style={{ fontSize: '13px', fontWeight: '500', color: item.points > 0 ? '#0F6E56' : '#BA7517' }}>
                {item.points > 0 ? '+' : ''}{item.points} pts
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', letterSpacing: '0.06em', marginBottom: '8px' }}>REFERRAL LINK VAULT</div>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>Shared privately only after a mutual match.</div>
          {profile.vault.length === 0 ? (
            <div style={{ fontSize: '13px', color: '#888', marginBottom: '12px' }}>No referral links yet.</div>
          ) : (
            profile.vault.map(v => (
              <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '6px', background: '#E8F0FE', color: '#1a73e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600' }}>
                  {v.company[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#111' }}>{v.company}</div>
                  <div style={{ fontSize: '11px', color: '#888' }}>{v.referral_link.substring(0, 30)}***</div>
                </div>
                <button onClick={() => { navigator.clipboard.writeText(v.referral_link); alert('Copied!') }} style={{ marginLeft: 'auto', fontSize: '11px', padding: '4px 10px', borderRadius: '6px', border: '0.5px solid rgba(0,0,0,0.15)', background: 'transparent', fontFamily: 'DM Sans, sans-serif', color: '#888', cursor: 'pointer' }}>Copy</button>
              </div>
            ))
          )}
          <AddVaultLink userId={profile.id} onAdd={(newLink) => setProfile(prev => ({ ...prev, vault: [...prev.vault, newLink] }))} />
        </div>
      </Card>

      <Card style={{ marginBottom: '12px' }}>
        {[
          { icon: '🔔', bg: '#E1F5EE', label: 'Notifications',              sub: 'Referral requests, match alerts',   href: '/settings/notifications'    },
          { icon: '⚙',  bg: '#FAEEDA', label: 'Halal workplace preferences', sub: 'Prayer rooms, dietary, culture',    href: '/settings/halal-preferences' },
          { icon: '◈',  bg: '#EEEDFE', label: 'Account & billing',           sub: 'Plan, payment, Barakah redemption', href: '/settings/account'           },
        ].map(item => (
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
    name: profile.name,
    tag: profile.tag,
    about: profile.about,
    openToReferring: profile.openToReferring,
    anonymityOn: profile.anonymityOn,
  })
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const [saved, setSaved] = useState({
    name: profile.name,
    tag: profile.tag,
    about: profile.about,
    openToReferring: profile.openToReferring,
    anonymityOn: profile.anonymityOn,
  })

  function startEdit() { setDraft({ ...saved }); setEditing(true) }
  function cancel() { setDraft({ ...saved }); setAvatarUrl(profile.avatarUrl || null); setEditing(false) }

  async function save() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session.user.id

      // Name change logging + limit check
      if (draft.name.trim() !== saved.name.trim()) {
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
          old_name: saved.name,
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

      await supabase.from('users').update({
        full_name: draft.name,
        tag_line: draft.tag,
        about: draft.about,
      }).eq('id', userId)

      await supabase.from('insider_profiles').update({
        open_to_referring: draft.openToReferring,
        anonymity_on: draft.anonymityOn,
      }).eq('user_id', userId)

      updateProfile('name', draft.name)
      updateProfile('tag', draft.tag)
      updateProfile('about', draft.about)
      updateProfile('openToReferring', draft.openToReferring)
      updateProfile('anonymityOn', draft.anonymityOn)
      updateProfile('avatarUrl', avatarUrl)
      setSaved({ ...draft })
      setEditing(false)
    } catch (err) {
      alert('Error saving. Please try again.')
    }
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('Please upload an image file.'); return }
    if (file.size > 2 * 1024 * 1024) { alert('Image must be smaller than 2MB.'); return }
    setUploading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session.user.id
      const fileExt = file.name.split('.').pop()
      const filePath = `${userId}/${userId}.${fileExt}`
      await supabase.storage.from('avatars').upload(filePath, file, { upsert: true })
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      await supabase.from('users').update({ avatar_url: data.publicUrl }).eq('id', userId)
      setAvatarUrl(data.publicUrl)
    } catch (err) {
      alert('Error uploading photo.')
    } finally {
      setUploading(false)
    }
  }

  const initials = profile.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??'

  const inputStyle = {
    width: '100%', borderRadius: '8px',
    border: '0.5px solid rgba(0,0,0,0.2)',
    padding: '9px 12px', marginBottom: '10px',
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

  return (
    <div style={{ background: '#085041', padding: '20px 20px 0' }}>
      <div style={{ background: '#fff', borderRadius: '14px 14px 0 0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '14px', padding: '16px 16px 0' }}>
          <div
            onClick={editing ? () => fileInputRef.current?.click() : undefined}
            style={{
              width: '68px', height: '68px', borderRadius: '50%',
              background: avatarUrl ? 'transparent' : '#E1F5EE',
              color: '#085041', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontWeight: '500', fontSize: '22px',
              flexShrink: 0, cursor: editing ? 'pointer' : 'default',
              position: 'relative', overflow: 'hidden',
              border: editing ? '2px dashed #085041' : 'none',
            }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : initials}
            {editing && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(8,80,65,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                <span style={{ fontSize: '20px' }}>{uploading ? '⏳' : '📷'}</span>
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
          {!editing && (
            <button onClick={startEdit} style={{ marginLeft: 'auto', marginBottom: '4px', fontSize: '12px', padding: '6px 14px', borderRadius: '8px', border: '0.5px solid rgba(0,0,0,0.15)', background: 'transparent', fontFamily: 'DM Sans, sans-serif', color: '#888', cursor: 'pointer' }}>
              ✎ Edit
            </button>
          )}
        </div>

        {editing ? (
          <div style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px', letterSpacing: '0.04em', fontWeight: '500' }}>PROFILE PHOTO</div>
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

            <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', letterSpacing: '0.04em', marginBottom: '4px' }}>ABOUT</div>
            <textarea value={draft.about} onChange={e => setDraft(d => ({ ...d, about: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Tell seekers about yourself and why you like referring..." />

            <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', letterSpacing: '0.04em', marginBottom: '8px' }}>OPEN TO REFERRING</div>
            {[true, false].map(val => (
              <div key={String(val)} onClick={() => setDraft(d => ({ ...d, openToReferring: val }))} style={optionStyle(draft.openToReferring === val)}>
                <RadioDot selected={draft.openToReferring === val} />
                {val ? 'Yes — open to referring' : 'Not referring right now'}
              </div>
            ))}

            <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', letterSpacing: '0.04em', marginBottom: '8px', marginTop: '10px' }}>ANONYMITY MODE</div>
            {[
              { val: true,  label: 'Keep me anonymous',     sub: 'Seekers see your role level only' },
              { val: false, label: 'Show my real identity',  sub: 'Seekers see your real name and company' },
            ].map(opt => (
              <div key={String(opt.val)} onClick={() => setDraft(d => ({ ...d, anonymityOn: opt.val }))} style={optionStyle(draft.anonymityOn === opt.val)}>
                <RadioDot selected={draft.anonymityOn === opt.val} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '500' }}>{opt.label}</div>
                  <div style={{ fontSize: '11px', opacity: 0.8 }}>{opt.sub}</div>
                </div>
              </div>
            ))}

            <SaveCancel onSave={save} onCancel={cancel} />
          </div>
        ) : (
          <>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', fontWeight: '500', color: '#111', padding: '10px 16px 2px' }}>{profile.name}</div>
            <div style={{ fontSize: '13px', color: '#0F6E56', fontWeight: '500', padding: '0 16px 8px' }}>
              {profile.roleLevel} {profile.company ? `@ ${profile.company}` : ''}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '0 16px 12px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '4px 10px', borderRadius: '20px', background: profile.openToReferring ? '#E1F5EE' : '#F1EFE8', color: profile.openToReferring ? '#085041' : '#888' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', opacity: 0.7 }} />
                {profile.openToReferring ? 'Open to referring' : 'Not referring right now'}
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '4px 10px', borderRadius: '20px', background: profile.anonymityOn ? '#FAEEDA' : '#F1EFE8', color: profile.anonymityOn ? '#633806' : '#888' }}>
                <span style={{ fontSize: '11px' }}>{profile.anonymityOn ? '🔒' : '👤'}</span>
                {profile.anonymityOn ? 'Anonymous to seekers' : 'Identity visible to seekers'}
              </div>
            </div>
            {profile.about && (
              <>
                <div style={{ height: '0.5px', background: 'rgba(0,0,0,0.08)', margin: '0 16px' }} />
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', letterSpacing: '0.06em', marginBottom: '8px' }}>ABOUT</div>
                  <div style={{ fontSize: '13px', color: '#111', lineHeight: '1.6' }}>{profile.about}</div>
                </div>
              </>
            )}
            {(() => {
              const dynamicBadges = buildInsiderProfileBadges({
                badges: profile.badges || [],
                insiderProfile: { role_level: profile.roleLevel },
                education: profile.education,
                employment: profile.employment || [],
                referralCount: profile.referralCount || 0,
                hireCount: profile.hireCount || 0,
              })
              return dynamicBadges.length > 0 ? (
                <>
                  <div style={{ height: '0.5px', background: 'rgba(0,0,0,0.08)', margin: '0 16px' }} />
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', letterSpacing: '0.06em', marginBottom: '8px' }}>BADGES</div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {dynamicBadges.map((badge, i) => (
                        <Badge key={i} label={badge.label} color={badge.color} />
                      ))}
                    </div>
                  </div>
                </>
              ) : null
            })()}
          </>
        )}
      </div>
    </div>
  )
}

/* ── COMPANY SECTION ── */
function CompanySection({ profile, updateProfile, sectionHdrStyle, sectionLblStyle, editBtnStyle }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({
    company: profile.company,
    roleLevel: profile.roleLevel,
    department: profile.department,
  })
  const [saved, setSaved] = useState({
    company: profile.company,
    roleLevel: profile.roleLevel,
    department: profile.department,
  })

  function startEdit() { setDraft({ ...saved }); setEditing(true) }
  function cancel() { setDraft({ ...saved }); setEditing(false) }

  async function save() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      await supabase.from('insider_profiles').update({
        company: draft.company,
        role_level: draft.roleLevel,
        department: draft.department,
      }).eq('user_id', session.user.id)

      updateProfile('company', draft.company)
      updateProfile('roleLevel', draft.roleLevel)
      updateProfile('department', draft.department)
      setSaved({ ...draft })
      setEditing(false)
    } catch (err) {
      alert('Error saving. Please try again.')
    }
  }

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
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
    paddingRight: '32px', cursor: 'pointer',
  }

  const roleLevels = ['Intern','Entry Level','Associate','Mid Level','Senior','Staff','Principal','Lead','Manager','Senior Manager','Director','Senior Director','VP','SVP','C-Suite / Executive']
  const departments = ['Engineering','Product','Design','Data Science','Marketing','Sales','Finance','HR / People Ops','Legal','Operations','Research','Customer Success','Business Development','Other']

  if (!editing) {
    return (
      <>
        <div style={sectionHdrStyle}>
          <span style={sectionLblStyle}>COMPANY & ROLE</span>
          <button onClick={startEdit} style={editBtnStyle}>✎ Edit</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[
            { label: 'Company',    value: profile.company    },
            { label: 'Role level', value: profile.roleLevel  },
            { label: 'Department', value: profile.department },
          ].map(p => (
            <div key={p.label} style={{ background: '#f9f8f5', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: '10px', padding: '10px 12px' }}>
              <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>{p.label}</div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#111' }}>{p.value || '—'}</div>
            </div>
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      <div style={sectionHdrStyle}><span style={sectionLblStyle}>COMPANY & ROLE</span></div>
      <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>COMPANY</label>
      <input value={draft.company} onChange={e => setDraft(d => ({ ...d, company: e.target.value }))} placeholder="e.g. Google" style={inputStyle} />
      <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>ROLE LEVEL</label>
      <select value={draft.roleLevel} onChange={e => setDraft(d => ({ ...d, roleLevel: e.target.value }))} style={selectStyle}>
        <option value="">Select level...</option>
        {roleLevels.map(r => <option key={r} value={r}>{r}</option>)}
      </select>
      <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>DEPARTMENT</label>
      <select value={draft.department} onChange={e => setDraft(d => ({ ...d, department: e.target.value }))} style={selectStyle}>
        <option value="">Select department...</option>
        {departments.map(d => <option key={d} value={d}>{d}</option>)}
      </select>
      <SaveCancel onSave={save} onCancel={cancel} />
    </>
  )
}

/* ── EMPLOYMENT SECTION ── */
function EmploymentSection({ employment, onSave, sectionHdrStyle, sectionLblStyle, editBtnStyle, userId }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(employment.map(e => ({ ...e })))
  const [saved, setSaved] = useState(employment.map(e => ({ ...e })))

  const years = Array.from({ length: new Date().getFullYear() - 1979 }, (_, i) => String(new Date().getFullYear() - i))

  function startEdit() { setDraft(saved.map(e => ({ ...e }))); setEditing(true) }
  function cancel() { setDraft(saved.map(e => ({ ...e }))); setEditing(false) }

  async function save() {
    try {
      await supabase.from('employment').delete().eq('user_id', userId)
      if (draft.length > 0) {
        await supabase.from('employment').insert(draft.map((emp, i) => ({
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
      alert('Error saving employment.')
    }
  }

  function updateRow(i, field, val) {
    setDraft(prev => prev.map((row, idx) => idx === i ? { ...row, [field]: val } : row))
  }

  function addRow() {
    setDraft(prev => [...prev, { logo: '?', logoStyle: { background: '#F1EFE8', color: '#2C2C2A' }, role: '', company: '', startYear: '', endYear: '', current: false }])
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

  const selectStyle = {
    ...inputStyle,
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23888'/%3E%3C/svg%3E")`,
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
        {employment.length === 0 ? (
          <div style={{ fontSize: '13px', color: '#888' }}>No employment history added yet.</div>
        ) : employment.map((emp, i) => (
          <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: i === employment.length - 1 ? '0' : '14px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', flexShrink: 0, ...emp.logoStyle }}>{emp.logo}</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#111' }}>
                {emp.role}
                {emp.is_current && <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '20px', background: '#E1F5EE', color: '#085041', fontWeight: '500', marginLeft: '6px' }}>Current</span>}
              </div>
              <div style={{ fontSize: '12px', color: '#888' }}>{emp.company}</div>
              <div style={{ fontSize: '11px', color: '#aaa', marginTop: '1px' }}>
                {emp.start_year} – {emp.is_current ? 'Present' : emp.end_year}
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
          <input value={emp.role} onChange={e => updateRow(i, 'role', e.target.value)} placeholder="e.g. Senior Engineer" style={inputStyle} />
          <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>COMPANY</label>
          <input value={emp.company} onChange={e => updateRow(i, 'company', e.target.value)} placeholder="e.g. Google" style={inputStyle} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '6px' }}>
            <div>
              <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>START YEAR</label>
              <select value={emp.startYear || emp.start_year || ''} onChange={e => updateRow(i, 'startYear', e.target.value)} style={selectStyle}>
                <option value="">Year</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>END YEAR</label>
              <select value={emp.endYear || emp.end_year || ''} onChange={e => updateRow(i, 'endYear', e.target.value)} disabled={emp.current || emp.is_current} style={{ ...selectStyle, opacity: (emp.current || emp.is_current) ? 0.4 : 1 }}>
                <option value="">Year</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#555', cursor: 'pointer' }}>
            <input type="checkbox" checked={emp.current || emp.is_current || false} onChange={e => updateRow(i, 'current', e.target.checked)} />
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
function EducationSection({ education, onSave, sectionHdrStyle, sectionLblStyle, editBtnStyle, userId }) {
  const [editing, setEditing] = useState(false)
  const initialEd = {
    school: education?.school || '',
    degreeType: education?.degree_type || '',
    focus: education?.focus || '',
    year: education?.graduation_year || '',
    notGraduated: education?.not_graduated || false,
  }
  const [draft, setDraft] = useState(initialEd)
  const [saved, setSaved] = useState(initialEd)
  const [schoolInput, setSchoolInput] = useState(education?.school || '')
  const [schoolSuggestions, setSchoolSuggestions] = useState([])
  const [schoolLoading, setSchoolLoading] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState(null)

  const currentYear = new Date().getFullYear()
  const gradYears = Array.from({ length: currentYear + 6 - 1979 }, (_, i) => String(currentYear + 5 - i))

  const manualUniversities = [
    'University of Texas at Austin','Massachusetts Institute of Technology (MIT)',
    'Harvard University','Stanford University','Yale University','Princeton University',
    'Columbia University','University of Pennsylvania','Cornell University',
    'University of California, Berkeley','University of California, Los Angeles (UCLA)',
    'University of Michigan, Ann Arbor','Georgia Institute of Technology',
    'Carnegie Mellon University','New York University (NYU)','Boston University',
    'Northeastern University','University of Southern California (USC)',
    'Texas A&M University','University of Florida','Ohio State University',
    'University of Illinois at Urbana-Champaign','Purdue University',
    'University of Washington','University of Wisconsin-Madison',
  ]

  const degreeTypes = [
    'High School Diploma','Associate of Arts (AA)','Associate of Science (AS)',
    'Bachelor of Arts (BA)','Bachelor of Science (BS)','Bachelor of Fine Arts (BFA)',
    'Bachelor of Business Administration (BBA)','Bachelor of Engineering (BEng)',
    'Master of Arts (MA)','Master of Science (MS)','Master of Business Administration (MBA)',
    'Master of Engineering (MEng)','Juris Doctor (JD)','Doctor of Medicine (MD)',
    'Doctor of Philosophy (PhD)','Other',
  ]

  const focusAreas = [
    'Computer Science','Software Engineering','Electrical Engineering',
    'Mechanical Engineering','Business Administration','Finance','Marketing',
    'Data Science','Product Management','Economics','Mathematics','Physics',
    'Chemistry','Biology','Psychology','Communications','Law','Medicine','Other',
  ]

  function startEdit() { setDraft({ ...saved }); setSchoolInput(saved.school || ''); setEditing(true) }
  function cancel() { setDraft({ ...saved }); setSchoolInput(saved.school || ''); setEditing(false) }

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
          return words.every(w => uLower.includes(w)) || (words.some(w => uLower.includes(w)) && uLower.includes(lower))
        }).slice(0, 5)
        const res = await fetch(`http://universities.hipolabs.com/search?name=${encodeURIComponent(val)}`)
        const data = await res.json()
        const apiResults = [...new Set(data.map(u => u.name))].filter(name => !manualMatches.includes(name)).slice(0, 6)
        setSchoolSuggestions([...manualMatches, ...apiResults].slice(0, 10))
      } catch { setSchoolSuggestions([]) }
      finally { setSchoolLoading(false) }
    }, 400)
    setSearchTimeout(t)
  }

  async function save() {
    const selectedYear = parseInt(draft.year)
    if (!draft.school.trim()) { alert('Please enter your school name.'); return }
    if (!draft.degreeType) { alert('Please select a degree type.'); return }
    if (!draft.year) { alert('Please select a graduation year.'); return }
    if (draft.notGraduated && selectedYear < currentYear) {
      alert(`Expected graduation year must be ${currentYear} or later.`); return
    }
    if (!draft.notGraduated && selectedYear > currentYear) {
      alert(`Graduation year cannot be in the future.`); return
    }

    const toSave = { school: draft.school, degreeType: draft.degreeType, focus: draft.focus, year: draft.year, notGraduated: draft.notGraduated || false }

    try {
      const { data: existing } = await supabase.from('education').select('id').eq('user_id', userId).single()
      if (existing) {
        await supabase.from('education').update({ school: toSave.school, degree_type: toSave.degreeType, focus: toSave.focus, graduation_year: toSave.year, not_graduated: toSave.notGraduated }).eq('user_id', userId)
      } else {
        await supabase.from('education').insert({ user_id: userId, school: toSave.school, degree_type: toSave.degreeType, focus: toSave.focus, graduation_year: toSave.year, not_graduated: toSave.notGraduated })
      }
      setSaved({ ...toSave })
      onSave(toSave)
      setEditing(false)
    } catch (err) { alert('Error saving education.') }
  }

  const inputStyle = {
    width: '100%', borderRadius: '8px', border: '0.5px solid rgba(0,0,0,0.15)',
    padding: '9px 12px', marginBottom: '10px',
    fontFamily: 'DM Sans, sans-serif', fontSize: '13px',
    color: '#111', outline: 'none', background: '#fff',
  }
  const selectStyle = {
    ...inputStyle, appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23888'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '32px', cursor: 'pointer',
  }
  const labelStyle = { fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px', fontWeight: '500', letterSpacing: '0.04em' }
  const dropdownStyle = { position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '0.5px solid rgba(0,0,0,0.15)', borderRadius: '8px', marginTop: '4px', zIndex: 20, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }

  if (!editing) {
    return (
      <>
        <div style={sectionHdrStyle}>
          <span style={sectionLblStyle}>EDUCATION</span>
          <button onClick={startEdit} style={editBtnStyle}>✎ Edit</button>
        </div>
        {!education ? (
          <div style={{ fontSize: '13px', color: '#888' }}>No education added yet.</div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EEEDFE', color: '#3C3489', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>🎓</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#111' }}>{education.school}</div>
              <div style={{ fontSize: '12px', color: '#888' }}>{education.degree_type} {education.focus ? `· ${education.focus}` : ''}</div>
              <div style={{ fontSize: '11px', color: '#aaa', marginTop: '1px' }}>
                {education.not_graduated ? `Expected ${education.graduation_year}` : `Graduated ${education.graduation_year}`}
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <div style={sectionHdrStyle}><span style={sectionLblStyle}>EDUCATION</span></div>
      <label style={labelStyle}>SCHOOL / UNIVERSITY</label>
      <div style={{ position: 'relative', marginBottom: '10px' }}>
        <input value={schoolInput} onChange={e => handleSchoolInput(e.target.value)} placeholder="Start typing your university..." style={{ ...inputStyle, marginBottom: '0' }} />
        {schoolLoading && <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: '#888' }}>Searching...</div>}
        {schoolSuggestions.length > 0 && (
          <div style={dropdownStyle}>
            {schoolSuggestions.map(s => (
              <div key={s} onClick={() => { setSchoolInput(s); setDraft(d => ({ ...d, school: s })); setSchoolSuggestions([]) }}
                style={{ padding: '10px 12px', fontSize: '13px', cursor: 'pointer', borderBottom: '0.5px solid rgba(0,0,0,0.06)', color: '#111' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f9f8f5'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >{s}</div>
            ))}
          </div>
        )}
      </div>
      <label style={labelStyle}>DEGREE TYPE</label>
      <select value={draft.degreeType || ''} onChange={e => setDraft(d => ({ ...d, degreeType: e.target.value }))} style={selectStyle}>
        <option value="">Select degree type...</option>
        {degreeTypes.map(d => <option key={d} value={d}>{d}</option>)}
      </select>
      <label style={labelStyle}>FIELD OF STUDY</label>
      <select value={draft.focus || ''} onChange={e => setDraft(d => ({ ...d, focus: e.target.value }))} style={selectStyle}>
        <option value="">Select field of study...</option>
        {focusAreas.map(f => <option key={f} value={f}>{f}</option>)}
      </select>
      <label style={labelStyle}>GRADUATION DATE</label>
      <select value={draft.year || ''} onChange={e => setDraft(d => ({ ...d, year: e.target.value }))} style={selectStyle}>
        <option value="">Select year...</option>
        {gradYears.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#555', cursor: 'pointer', marginBottom: '14px' }}>
        <input type="checkbox" checked={draft.notGraduated || false} onChange={e => setDraft(d => ({ ...d, notGraduated: e.target.checked }))} />
        I have not graduated yet — show as expected graduation date
      </label>
      <SaveCancel onSave={save} onCancel={cancel} />
    </>
  )
}

/* ── ADD VAULT LINK ── */
function AddVaultLink({ userId, onAdd }) {
  const [adding, setAdding] = useState(false)
  const [company, setCompany] = useState('')
  const [link, setLink] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    if (!company.trim() || !link.trim()) { alert('Please enter both company name and referral link.'); return }
    setSaving(true)
    const { data, error } = await supabase.from('referral_vault').insert({ user_id: userId, company, referral_link: link }).select().single()
    if (!error && data) { onAdd(data); setCompany(''); setLink(''); setAdding(false) }
    else alert('Error saving link.')
    setSaving(false)
  }

  const inputStyle = { width: '100%', borderRadius: '8px', border: '0.5px solid rgba(0,0,0,0.15)', padding: '9px 12px', marginBottom: '8px', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: '#111', outline: 'none', background: '#fff' }

  if (!adding) return (
    <button onClick={() => setAdding(true)} style={{ width: '100%', marginTop: '10px', padding: '10px', borderRadius: '8px', background: '#085041', color: '#E1F5EE', border: 'none', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
      + Add referral link
    </button>
  )

  return (
    <div style={{ marginTop: '12px', background: '#f9f8f5', borderRadius: '10px', padding: '12px' }}>
      <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Company name" style={inputStyle} />
      <input value={link} onChange={e => setLink(e.target.value)} placeholder="Referral link URL" style={inputStyle} />
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={handleAdd} disabled={saving} style={{ flex: 1, padding: '9px', borderRadius: '8px', background: '#085041', color: '#E1F5EE', border: 'none', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button onClick={() => setAdding(false)} style={{ padding: '9px 14px', borderRadius: '8px', background: 'transparent', color: '#888', border: '0.5px solid rgba(0,0,0,0.12)', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
      </div>
    </div>
  )
}

/* ── SAVE/CANCEL ── */
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