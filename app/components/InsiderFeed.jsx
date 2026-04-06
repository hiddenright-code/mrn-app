'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Badge from './ui/Badge'
import Card from './ui/Card'

export default function InsiderFeed() {
  const [insiderProfile, setInsiderProfile] = useState(null)
  const [seekers, setSeekers] = useState([])
  const [loading, setLoading] = useState(true)
  const [anonOn, setAnonOn] = useState(true)
  const [activeReferrals, setActiveReferrals] = useState([])

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

      setSeekers(seekerProfiles || [])
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
          {seekers.map((seeker, idx) => {
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

                {/* Badges */}
                {badges.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    {badges.map(b => (
                      <Badge
                        key={b.badge_type}
                        label={b.badge_type === 'community_verified' ? 'Community Verified' : b.badge_type === 'portfolio_linked' ? 'Portfolio Linked' : b.badge_type}
                        color={b.badge_type === 'community_verified' ? 'teal' : b.badge_type === 'portfolio_linked' ? 'amber' : 'gray'}
                      />
                    ))}
                  </div>
                )}

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