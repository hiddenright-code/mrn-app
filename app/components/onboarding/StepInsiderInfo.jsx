import { useState } from 'react'

export default function StepInsiderInfo({ data, onChange, onNext, onBack }) {
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!data.company.trim()) e.company = 'Please enter your company name.'
    if (!data.roleLevel.trim()) e.roleLevel = 'Please select your role level.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleNext() {
    if (validate()) onNext()
  }

  const inputStyle = {
    width: '100%', borderRadius: '8px',
    border: '0.5px solid rgba(0,0,0,0.2)',
    padding: '11px 14px', marginBottom: '6px',
    fontFamily: 'DM Sans, sans-serif', fontSize: '14px',
    color: '#111', outline: 'none', background: '#fff',
  }

  const selectStyle = {
    ...inputStyle,
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23888'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
    paddingRight: '32px', cursor: 'pointer',
  }

  const labelStyle = {
    fontSize: '11px', fontWeight: '500', color: '#888',
    letterSpacing: '0.04em', display: 'block', marginBottom: '6px',
  }

  const errorStyle = { fontSize: '12px', color: '#A32D2D', marginBottom: '10px' }

  const roleLevels = [
    'Intern', 'Entry Level', 'Associate', 'Mid Level',
    'Senior', 'Staff', 'Principal', 'Lead',
    'Manager', 'Senior Manager', 'Director',
    'Senior Director', 'VP', 'SVP', 'C-Suite / Executive',
  ]

  const departments = [
    'Engineering', 'Product', 'Design', 'Data Science',
    'Marketing', 'Sales', 'Finance', 'HR / People Ops',
    'Legal', 'Operations', 'Research', 'Customer Success',
    'Business Development', 'Other',
  ]

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', fontWeight: '500', color: '#111', marginBottom: '8px' }}>
          Your insider details
        </div>
        <div style={{ fontSize: '14px', color: '#888', lineHeight: '1.6' }}>
          This helps seekers understand who you are and whether you can refer them.
        </div>
      </div>

      <label style={labelStyle}>COMPANY</label>
      <input
        value={data.company}
        onChange={e => onChange('company', e.target.value)}
        placeholder="e.g. Google"
        style={inputStyle}
      />
      {errors.company && <div style={errorStyle}>{errors.company}</div>}

      <label style={{ ...labelStyle, marginTop: '8px' }}>ROLE LEVEL</label>
      <select
        value={data.roleLevel}
        onChange={e => onChange('roleLevel', e.target.value)}
        style={selectStyle}
      >
        <option value="">Select your level...</option>
        {roleLevels.map(r => <option key={r} value={r}>{r}</option>)}
      </select>
      {errors.roleLevel && <div style={errorStyle}>{errors.roleLevel}</div>}

      <label style={{ ...labelStyle, marginTop: '8px' }}>DEPARTMENT</label>
      <select
        value={data.department}
        onChange={e => onChange('department', e.target.value)}
        style={selectStyle}
      >
        <option value="">Select your department...</option>
        {departments.map(d => <option key={d} value={d}>{d}</option>)}
      </select>

      <label style={{ ...labelStyle, marginTop: '16px' }}>ANONYMITY PREFERENCE</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
        {[
          { val: true,  label: 'Keep me anonymous',    sub: 'Seekers see "Senior Engineer @ Top Tier Tech"' },
          { val: false, label: 'Show my real identity', sub: 'Seekers see your real name and company'        },
        ].map(opt => (
          <div
            key={String(opt.val)}
            onClick={() => onChange('anonymityOn', opt.val)}
            style={{
              padding: '12px 14px', borderRadius: '8px', cursor: 'pointer',
              background: data.anonymityOn === opt.val ? '#085041' : '#f9f8f5',
              color: data.anonymityOn === opt.val ? '#E1F5EE' : '#111',
              border: `0.5px solid ${data.anonymityOn === opt.val ? '#085041' : 'rgba(0,0,0,0.08)'}`,
              display: 'flex', alignItems: 'center', gap: '10px',
            }}
          >
            <span style={{
              width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
              border: `2px solid ${data.anonymityOn === opt.val ? '#E1F5EE' : '#ccc'}`,
              background: data.anonymityOn === opt.val ? '#E1F5EE' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {data.anonymityOn === opt.val && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#085041' }} />}
            </span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '500' }}>{opt.label}</div>
              <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '2px' }}>{opt.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={onBack} style={{ padding: '12px 20px', borderRadius: '8px', background: 'transparent', color: '#888', border: '0.5px solid rgba(0,0,0,0.15)', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', cursor: 'pointer' }}>
          Back
        </button>
        <button onClick={handleNext} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#085041', color: '#E1F5EE', border: 'none', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
          Continue →
        </button>
      </div>
    </div>
  )
}