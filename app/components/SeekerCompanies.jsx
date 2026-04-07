'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Badge from './ui/Badge'

export default function SeekerCompanies({ onPitch }) {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function loadCompanies() {
      const [{ data: companiesData, error }, { data: insiderData }] = await Promise.all([
        supabase.from('companies').select('*').order('name'),
        supabase.from('insider_profiles')
          .select('company, user_id, avatar_url:user_id(avatar_url)')
          .eq('open_to_referring', true)
      ])

      if (error) { setLoading(false); return }

      // Build a map of company name → list of insiders
      const insidersByCompany = {}
      for (const insider of insiderData || []) {
        const key = insider.company
        if (!insidersByCompany[key]) insidersByCompany[key] = []
        insidersByCompany[key].push(insider)
      }

      setCompanies((companiesData || []).map(c => ({
        ...c,
        insiders: insidersByCompany[c.name] || [],
      })))
      setLoading(false)
    }
    loadCompanies()
  }, [])

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const logoStyles = {
    Google:     { background: '#E8F0FE', color: '#1a73e8' },
    Salesforce: { background: '#E1F5EE', color: '#085041' },
    Amazon:     { background: '#FEF3E2', color: '#E37400' },
    Stripe:     { background: '#E6F4EA', color: '#1e8e3e' },
    Anthropic:  { background: '#EEEDFE', color: '#7F77DD' },
    Microsoft:  { background: '#E8F0FE', color: '#0078d4' },
    Apple:      { background: '#F1EFE8', color: '#2C2C2A' },
    Meta:       { background: '#E8F0FE', color: '#1877F2' },
    Netflix:    { background: '#FCEBEB', color: '#E50914' },
    Uber:       { background: '#F1EFE8', color: '#2C2C2A' },
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#888', fontFamily: 'DM Sans, sans-serif' }}>
        Loading companies...
      </div>
    )
  }

  return (
    <div>
      <div style={{ padding: '12px 16px 0', fontSize: '13px', color: '#888' }}>
        Find an insider at your target company
      </div>

      {/* Search */}
      <div style={{
        margin: '10px 16px',
        display: 'flex', alignItems: 'center', gap: '8px',
        background: '#fff', border: '0.5px solid rgba(0,0,0,0.12)',
        borderRadius: '10px', padding: '10px 14px',
      }}>
        <span style={{ fontSize: '14px', color: '#aaa' }}>⌕</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search companies..."
          style={{ border: 'none', background: 'transparent', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', color: '#111', outline: 'none', flex: 1 }}
        />
      </div>

      {/* Company list */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888', fontSize: '14px' }}>
            No companies found matching "{search}"
          </div>
        ) : (
          filtered.map(company => {
            const logoStyle = logoStyles[company.name] || { background: '#F1EFE8', color: '#2C2C2A' }
            const initials = company.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

            return (
              <div
                key={company.id}
                onClick={() => onPitch(company.name)}
                style={{
                  background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)',
                  borderRadius: '12px', padding: '14px 16px', cursor: 'pointer',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '600', fontSize: '13px', flexShrink: 0,
                    ...logoStyle,
                  }}>
                    {initials}
                  </div>
                  <div>
                    <div style={{ fontWeight: '500', fontSize: '14px', color: '#111' }}>{company.name}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                      {company.departments ? company.departments.join(' · ') : ''}
                    </div>
                  </div>
                </div>

                {/* Real insider count */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '10px' }}>
                  {company.insiders.length === 0 ? (
                    <span style={{ fontSize: '12px', color: '#aaa' }}>No insiders yet</span>
                  ) : (
                    <>
                      <div style={{ display: 'flex' }}>
                        {company.insiders.slice(0, 3).map((insider, i) => (
                          <div key={insider.user_id} style={{
                            width: '22px', height: '22px', borderRadius: '50%',
                            border: '1.5px solid #fff',
                            background: ['#E1F5EE', '#FAEEDA', '#EEEDFE'][i % 3],
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '9px', marginLeft: i === 0 ? '0' : '-5px',
                            overflow: 'hidden', flexShrink: 0,
                          }}>
                            {insider.avatar_url ? (
                              <img src={insider.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : '🔒'}
                          </div>
                        ))}
                      </div>
                      <span style={{ fontSize: '12px', color: '#085041', fontWeight: '500' }}>
                        {company.insiders.length === 1
                          ? '1 insider available'
                          : `${company.insiders.length} insiders available`}
                      </span>
                    </>
                  )}
                </div>

                {/* Badges */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {company.is_halal_friendly && (
                    <Badge label="✓ Halal-Friendly Workplace" color="teal" />
                  )}
                  {company.has_muslim_erg && (
                    <Badge label="ERG: Muslim Network" color="amber" />
                  )}
                  {company.has_prayer_rooms && (
                    <Badge label="Prayer rooms" color="purple" />
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
      <div style={{ height: '16px' }} />
    </div>
  )
}