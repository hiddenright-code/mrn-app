'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Badge from './ui/Badge'
import Card from './ui/Card'
import { buildSeekerFeedBadges } from '../../lib/badges'

export default function InsiderFeed() {
  const [insiderProfile, setInsiderProfile] = useState(null)
  const [seekers, setSeekers] = useState([])
  const [loading, setLoading] = useState(true)
  const [anonOn, setAnonOn] = useState(true)
  const [activeReferrals, setActiveReferrals] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({ visa: '', workPref: '', relocation: '', location: '', educationStatus: '' })
  const [pendingFilters, setPendingFilters] = useState({ visa: '', workPref: '', relocation: '', location: '', educationStatus: '' })

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const userId = session.user.id

      // Load insider profile
      const { data: insider } = await supabase
        .from('insider_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (insider) {
        setInsiderProfile(insider)
        setAnonOn(insider.anonymity_on)
      }

      // Load active matches for tracker
      const { data: matches } = await supabase
        .from('matches')
        .select(`
          *,
          seeker:seeker_id (
            full_name,
            tag_line
          )
        `)
        .eq('insider_id', userId)
        .not('stage', 'eq', 'complete')

      setActiveReferrals(matches || [])

      // Load seekers for talent feed
      const { data: seekerProfiles } = await supabase
        .from('seeker_profiles')
        .select(`
          *,
          user:user_id (
            id,
            full_name,
            tag_line,
            avatar_url,
            linkedin_url
          ),
          badges:user_id (
            badge_type
          )
        `)
        .eq('seeking_status', 'Actively seeking referrals')
        .limit(20)

      if (!seekerProfiles || seekerProfiles.length === 0) {
        setSeekers([])
        setLoading(false)
        return
      }

      // Load education + employment for all seekers in one query each
      const seekerIds = seekerProfiles.map(s => s.user_id)

      const [{ data: allEducation }, { data: allEmployment }] = await Promise.all([
        supabase.from('education').select('*').in('user_id', seekerIds),
        supabase.from('employment').select('*').in('user_id', seekerIds),
      ])

      // Enrich each seeker with their education + employment
      const enriched = seekerProfiles.map(s => ({
        ...s,
        education: allEducation?.find(e => e.user_id === s.user_id) || null,
        employment: allEmployment?.filter(e => e.user_id === s.user_id) || [],
      }))

      setSeekers(enriched)
      setLoading(false)
    }
    load()
  }, [])

  async function toggleAnon() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const newVal = !anonOn
    setAnonOn(newVal)
    await supabase
      .from('insider_profiles')
      .update({ anonymity_on: newVal })
      .eq('user_id', session.user.id)
  }

  async function handleOfferReferral(seekerId, seekerName) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    // Check if pitch already exists
    const { data: existing } = await supabase
      .from('pitches')
      .select('id')
      .eq('insider_id', session.user.id)
      .eq('seeker_id', seekerId)
      .single()

    if (existing) {
      alert('You have already offered a referral to this person.')
      return
    }

    alert(`Referral offer sent to ${seekerName}! They will be notified.`)
  }

  const stageProgress = {
    matched: 1, submitted: 2, interviewing: 3, hired: 4, bonus_pending: 5,
  }

  const stages = ['Submitted', 'Interviewing', 'Hired', 'Bonus']

  const activeFilterCount = Object.values(filters).filter(v => v !== '').length

  const filteredSeekers = seekers.filter(seeker => {
    if (filters.visa) {
      const noVisa = seeker.visa_status?.includes('Not required')
      if (filters.visa === 'no_visa' && !noVisa) return false
      if (filters.visa === 'visa_required' && noVisa) return false
    }
    if (filters.workPref && seeker.work_preference !== filters.workPref) return false
    if (filters.relocation) {
      const openToRelocate = seeker.relocate_preference && seeker.relocate_preference !== 'Not open to relocating'
      if (filters.relocation === 'yes' && !openToRelocate) return false
      if (filters.relocation === 'no' && openToRelocate) return false
    }
    if (filters.location && !seeker.current_location?.toLowerCase().includes(filters.location.toLowerCase())) return false
    if (filters.educationStatus) {
      const isStudent = seeker.education?.not_graduated === true
      if (filters.educationStatus === 'student' && !isStudent) return false
      if (filters.educationStatus === 'graduate' && isStudent) return false
    }
    return true
  })

  const avatarColors = [
    { background: '#E1F5EE', color: '#085041' },
    { background: '#FAEEDA', color: '#633806' },
    { background: '#EEEDFE', color: '#3C3489' },
    { background: '#F1EFE8', color: '#2C2C2A' },
  ]

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#888', fontFamily: 'DM Sans, sans-serif' }}>
        Loading feed...
      </div>
    )
  }

  return (
    <div>
      {/* Filter button */}
      <div style={{ padding: '8px 16px 0', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => { setPendingFilters({ ...filters }); setShowFilters(true) }}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px', borderRadius: '20px', fontSize: '12px',
            fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', fontWeight: '500',
            background: activeFilterCount > 0 ? '#085041' : '#f9f8f5',
            color: activeFilterCount > 0 ? '#E1F5EE' : '#888',
            border: `0.5px solid ${activeFilterCount > 0 ? '#085041' : 'rgba(0,0,0,0.1)'}`,
          }}
        >
          ⚙ Filters
          {activeFilterCount > 0 && (
            <span style={{
              background: '#E1F5EE', color: '#085041',
              borderRadius: '50%', width: '16px', height: '16px',
              fontSize: '10px', fontWeight: '700',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter sheet */}
      {showFilters && (
        <>
          <div
            onClick={() => setShowFilters(false)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100 }}
          />
          <div style={{
            position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
            width: '100%', maxWidth: '420px', background: '#fff',
            borderRadius: '16px 16px 0 0', padding: '20px 20px 32px',
            zIndex: 101, maxHeight: '80vh', overflowY: 'auto',
          }}>
            <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: '#D3D1C7', margin: '0 auto 16px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', fontWeight: '500', color: '#111' }}>Filter talent</div>
              {Object.values(pendingFilters).some(v => v !== '') && (
                <button
                  onClick={() => setPendingFilters({ visa: '', workPref: '', relocation: '', location: '', educationStatus: '' })}
                  style={{ fontSize: '12px', color: '#A32D2D', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Visa filter */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', letterSpacing: '0.06em', marginBottom: '8px' }}>VISA SPONSORSHIP</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { value: '', label: 'Any' },
                  { value: 'no_visa', label: 'US Citizen / Green Card PR' },
                  { value: 'visa_required', label: 'Requires Sponsorship' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setPendingFilters(p => ({ ...p, visa: opt.value }))}
                    style={{
                      padding: '6px 14px', borderRadius: '20px', fontSize: '12px',
                      fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
                      background: pendingFilters.visa === opt.value ? '#085041' : '#f9f8f5',
                      color: pendingFilters.visa === opt.value ? '#E1F5EE' : '#888',
                      border: `0.5px solid ${pendingFilters.visa === opt.value ? '#085041' : 'rgba(0,0,0,0.1)'}`,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Work preference filter */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', letterSpacing: '0.06em', marginBottom: '8px' }}>WORK PREFERENCE</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { value: '', label: 'Any' },
                  { value: 'Remote', label: 'Remote' },
                  { value: 'Hybrid', label: 'Hybrid' },
                  { value: 'In-office', label: 'In-office' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setPendingFilters(p => ({ ...p, workPref: opt.value }))}
                    style={{
                      padding: '6px 14px', borderRadius: '20px', fontSize: '12px',
                      fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
                      background: pendingFilters.workPref === opt.value ? '#085041' : '#f9f8f5',
                      color: pendingFilters.workPref === opt.value ? '#E1F5EE' : '#888',
                      border: `0.5px solid ${pendingFilters.workPref === opt.value ? '#085041' : 'rgba(0,0,0,0.1)'}`,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Relocation filter */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', letterSpacing: '0.06em', marginBottom: '8px' }}>OPEN TO RELOCATE</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { value: '', label: 'Any' },
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setPendingFilters(p => ({ ...p, relocation: opt.value }))}
                    style={{
                      padding: '6px 14px', borderRadius: '20px', fontSize: '12px',
                      fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
                      background: pendingFilters.relocation === opt.value ? '#085041' : '#f9f8f5',
                      color: pendingFilters.relocation === opt.value ? '#E1F5EE' : '#888',
                      border: `0.5px solid ${pendingFilters.relocation === opt.value ? '#085041' : 'rgba(0,0,0,0.1)'}`,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Student vs Graduate filter */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', letterSpacing: '0.06em', marginBottom: '8px' }}>EDUCATION STATUS</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { value: '', label: 'Any' },
                  { value: 'graduate', label: 'Graduate' },
                  { value: 'student', label: 'Student' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setPendingFilters(p => ({ ...p, educationStatus: opt.value }))}
                    style={{
                      padding: '6px 14px', borderRadius: '20px', fontSize: '12px',
                      fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
                      background: pendingFilters.educationStatus === opt.value ? '#085041' : '#f9f8f5',
                      color: pendingFilters.educationStatus === opt.value ? '#E1F5EE' : '#888',
                      border: `0.5px solid ${pendingFilters.educationStatus === opt.value ? '#085041' : 'rgba(0,0,0,0.1)'}`,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Location filter */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', letterSpacing: '0.06em', marginBottom: '8px' }}>LOCATION</div>
              <input
                value={pendingFilters.location}
                onChange={e => setPendingFilters(p => ({ ...p, location: e.target.value }))}
                placeholder="e.g. New York, San Francisco..."
                style={{
                  width: '100%', borderRadius: '8px', border: '0.5px solid rgba(0,0,0,0.2)',
                  padding: '10px 12px', fontFamily: 'DM Sans, sans-serif', fontSize: '13px',
                  color: '#111', outline: 'none', background: '#fff',
                }}
              />
            </div>

            {/* Apply button */}
            <button
              onClick={() => { setFilters({ ...pendingFilters }); setShowFilters(false) }}
              style={{
                width: '100%', padding: '13px', borderRadius: '8px',
                background: '#085041', color: '#E1F5EE', border: 'none',
                fontFamily: 'DM Sans, sans-serif', fontSize: '14px',
                fontWeight: '500', cursor: 'pointer',
              }}
            >
              Apply filters
            </button>
          </div>
        </>
      )}

      {/* Anonymity Toggle */}
      <div style={{
        margin: '10px 16px',
        background: '#FAEEDA', border: '0.5px solid #FAC775',
        borderRadius: '10px', padding: '10px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: '12px', color: '#633806', fontWeight: '500' }}>Anonymity mode</div>
          <div style={{ fontSize: '11px', color: '#BA7517', marginTop: '1px' }}>
            {anonOn
              ? `Showing as "${insiderProfile?.role_level || 'Senior'} @ Top Tier Tech"`
              : 'Showing your real name and company'}
          </div>
        </div>
        <button
          onClick={toggleAnon}
          style={{
            width: '36px', height: '20px', borderRadius: '10px',
            background: anonOn ? '#1D9E75' : '#D3D1C7',
            position: 'relative', cursor: 'pointer', border: 'none', flexShrink: 0,
            transition: 'background 0.2s',
          }}
        >
          <span style={{
            position: 'absolute', width: '16px', height: '16px',
            borderRadius: '50%', background: 'white',
            top: '2px', left: anonOn ? '18px' : '2px',
            transition: 'left 0.2s',
          }} />
        </button>
      </div>

      {/* Active Referrals Tracker */}
      {activeReferrals.length > 0 && (
        <Card>
          <div style={{ padding: '14px 16px 8px' }}>
            <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', letterSpacing: '0.06em', marginBottom: '10px' }}>
              ACTIVE REFERRALS
            </div>
            {activeReferrals.map(match => {
              const progress = stageProgress[match.stage] || 0
              return (
                <div key={match.id} style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '12px', color: '#111', marginBottom: '4px' }}>
                    {match.seeker?.full_name || 'Seeker'} · {match.seeker?.tag_line || ''}
                  </div>
                  <div style={{ height: '6px', background: '#F1EFE8', borderRadius: '20px', overflow: 'hidden', marginBottom: '4px' }}>
                    <div style={{ height: '100%', width: `${(progress / 5) * 100}%`, background: '#1D9E75', borderRadius: '20px' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {stages.map((s, i) => (
                      <span key={s} style={{
                        fontSize: '10px',
                        color: i < progress ? '#0F6E56' : '#888',
                        fontWeight: i < progress ? '500' : '400',
                      }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Talent Feed Header */}
      <div style={{ padding: '14px 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '17px', fontWeight: '500', color: '#111' }}>
          Talent feed
        </div>
        <div style={{ fontSize: '12px', color: '#888' }}>
          {seekers.length} seekers
        </div>
      </div>

      {/* Talent Cards */}
      {seekers.length === 0 ? (
        <div style={{ padding: '40px 16px', textAlign: 'center', color: '#888', fontSize: '14px' }}>
          No seekers in the feed yet. Check back soon!
        </div>
      ) : (
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredSeekers.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#888', fontSize: '14px' }}>
              No seekers match your filters.{' '}
              <button
                onClick={() => setFilters({ visa: '', workPref: '', relocation: '', location: '', educationStatus: '' })}
                style={{ color: '#085041', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', fontWeight: '500' }}
              >
                Clear filters
              </button>
            </div>
          ) : null}
          {filteredSeekers.map((seeker, idx) => {
            const user = seeker.user
            const badges = seeker.badges || []
            const avColor = avatarColors[idx % avatarColors.length]
            const initials = user?.full_name
              ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
              : '??'

            return (
              <div key={seeker.id} style={{
                background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)',
                borderRadius: '12px', padding: '14px 16px',
              }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '500', fontSize: '13px', flexShrink: 0,
                    overflow: 'hidden',
                    ...avColor,
                  }}>
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : initials}
                  </div>
                  <div>
                    <div style={{ fontWeight: '500', fontSize: '14px', color: '#111' }}>
                      {user?.full_name || 'Anonymous'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888', marginTop: '1px' }}>
                      {user?.tag_line || ''}
                    </div>
                  </div>
                </div>

                {/* Impact / Summary */}
                {seeker.summary && (
                  <div style={{
                    fontSize: '12px', background: '#E1F5EE', color: '#085041',
                    borderRadius: '6px', padding: '5px 10px',
                    marginBottom: '10px', lineHeight: '1.4',
                  }}>
                    {seeker.summary}
                  </div>
                )}

                {/* Job prefs */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {seeker.current_location && (
                    <span style={{ fontSize: '11px', background: '#F1EFE8', color: '#2C2C2A', padding: '3px 8px', borderRadius: '20px' }}>
                      📍 {seeker.current_location}
                    </span>
                  )}
                  {seeker.visa_status && (
                    <span style={{ fontSize: '11px', background: '#F1EFE8', color: '#2C2C2A', padding: '3px 8px', borderRadius: '20px' }}>
                      {seeker.visa_status.includes('Not required') ? '✓ No visa needed' : '⚠ Visa required'}
                    </span>
                  )}
                  {seeker.work_preference && (
                    <span style={{ fontSize: '11px', background: '#F1EFE8', color: '#2C2C2A', padding: '3px 8px', borderRadius: '20px' }}>
                      {seeker.work_preference}
                    </span>
                  )}
                </div>

                {/* Dynamic badges */}
                {(() => {
                  const dynamicBadges = buildSeekerFeedBadges({
                    badges: seeker.badges || [],
                    seekerProfile: seeker,
                    education: seeker.education,
                    employment: seeker.employment || [],
                    featuredEducation: seeker.featured_education || null,
                  })
                  return dynamicBadges.length > 0 ? (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      {dynamicBadges.map((badge, i) => (
                        <Badge key={i} label={badge.label} color={badge.color} />
                      ))}
                    </div>
                  ) : null
                })()}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleOfferReferral(user?.id, user?.full_name)}
                    style={{
                      flex: 1, padding: '9px', borderRadius: '8px',
                      background: '#085041', color: '#E1F5EE',
                      border: 'none', fontFamily: 'DM Sans, sans-serif',
                      fontSize: '13px', fontWeight: '500', cursor: 'pointer',
                    }}
                  >
                    Offer referral
                  </button>
                  <button style={{
                    padding: '9px 14px', borderRadius: '8px',
                    background: 'transparent', color: '#888',
                    border: '0.5px solid rgba(0,0,0,0.12)',
                    fontFamily: 'DM Sans, sans-serif', fontSize: '13px', cursor: 'pointer',
                  }}>
                    Pass
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div style={{ height: '16px' }} />
    </div>
  )
}