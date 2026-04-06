import { useState } from 'react'

export default function StepBasicInfo({ data, onChange, onNext, onBack }) {
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!data.fullName.trim()) e.fullName = 'Please enter your full name.'
    if (!data.tagLine.trim()) e.tagLine = 'Please enter a title or tagline.'
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

  const labelStyle = {
    fontSize: '11px', fontWeight: '500', color: '#888',
    letterSpacing: '0.04em', display: 'block', marginBottom: '6px',
  }

  const errorStyle = {
    fontSize: '12px', color: '#A32D2D', marginBottom: '10px',
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', fontWeight: '500', color: '#111', marginBottom: '8px' }}>
          Tell us about yourself
        </div>
        <div style={{ fontSize: '14px', color: '#888', lineHeight: '1.6' }}>
          This is what others will see on your profile.
        </div>
      </div>

      <label style={labelStyle}>FULL NAME</label>
      <input
        value={data.fullName}
        onChange={e => onChange('fullName', e.target.value)}
        placeholder="e.g. Sara Khan"
        style={inputStyle}
      />
      {errors.fullName && <div style={errorStyle}>{errors.fullName}</div>}

      <label style={{ ...labelStyle, marginTop: '8px' }}>TITLE / TAGLINE</label>
      <input
        value={data.tagLine}
        onChange={e => onChange('tagLine', e.target.value)}
        placeholder="e.g. Product Manager · Growth & Monetization"
        style={inputStyle}
      />
      {errors.tagLine && <div style={errorStyle}>{errors.tagLine}</div>}

      <label style={{ ...labelStyle, marginTop: '8px' }}>
        LINKEDIN URL
        <span style={{ color: '#1D9E75', marginLeft: '6px', fontSize: '10px', fontWeight: '400' }}>
          → Earns Community Verified badge
        </span>
      </label>
      <input
        value={data.linkedinUrl}
        onChange={e => onChange('linkedinUrl', e.target.value)}
        placeholder="https://linkedin.com/in/your-profile"
        style={inputStyle}
      />
      <div style={{ fontSize: '12px', color: '#888', marginBottom: '20px' }}>
        Adding your LinkedIn URL verifies your identity and earns you the Community Verified badge.
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={onBack}
          style={{
            padding: '12px 20px', borderRadius: '8px',
            background: 'transparent', color: '#888',
            border: '0.5px solid rgba(0,0,0,0.15)',
            fontFamily: 'DM Sans, sans-serif', fontSize: '14px', cursor: 'pointer',
          }}
        >
          Back
        </button>
        <button
          onClick={handleNext}
          style={{
            flex: 1, padding: '12px',
            borderRadius: '8px', background: '#085041',
            color: '#E1F5EE', border: 'none',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px', fontWeight: '500', cursor: 'pointer',
          }}
        >
          Continue →
        </button>
      </div>
    </div>
  )
}