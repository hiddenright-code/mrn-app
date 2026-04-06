import { useState } from 'react'

export default function StepSeekerInfo({ data, onChange, onNext, onBack }) {
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!data.isMuslim) e.isMuslim = 'You must identify as Muslim to join as a seeker.'
    if (!data.currentLocation) e.currentLocation = 'Please enter your current location.'
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
    marginTop: '14px',
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
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', fontWeight: '500', color: '#111', marginBottom: '8px' }}>
          A few more details
        </div>
        <div style={{ fontSize: '14px', color: '#888', lineHeight: '1.6' }}>
          MRN is a community for Muslim professionals. We ask all seekers to self-identify.
        </div>
      </div>

      {/* Muslim identification */}
      <div style={{
        background: '#E1F5EE', border: '0.5px solid #9FE1CB',
        borderRadius: '10px', padding: '14px 16px', marginBottom: '8px',
      }}>
        <div style={{ fontSize: '13px', color: '#085041', lineHeight: '1.6', marginBottom: '12px' }}>
          MRN is built for the Muslim professional community. As a seeker, we ask you to confirm that you identify as Muslim. This is self-reported and based on the honor system.
        </div>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={data.isMuslim || false}
            onChange={e => onChange('isMuslim', e.target.checked)}
            style={{ marginTop: '2px', flexShrink: 0, width: '16px', height: '16px' }}
          />
          <span style={{ fontSize: '13px', color: '#085041', fontWeight: '500' }}>
            I identify as Muslim and am joining MRN as a member of this community.
          </span>
        </label>
        {errors.isMuslim && (
          <div style={{ fontSize: '12px', color: '#A32D2D', marginTop: '8px' }}>{errors.isMuslim}</div>
        )}
      </div>

      {/* Current status */}
      <label style={labelStyle}>CURRENT STATUS</label>
      {['Actively seeking referrals', 'Open to opportunities', 'Just browsing for now'].map(opt => (
        <div key={opt} onClick={() => onChange('seekingStatus', opt)} style={optionStyle(data.seekingStatus === opt)}>
          <RadioDot selected={data.seekingStatus === opt} />{opt}
        </div>
      ))}

      {/* Current Location */}
      <label style={labelStyle}>CURRENT LOCATION</label>
      <input
        value={data.currentLocation || ''}
        onChange={e => onChange('currentLocation', e.target.value)}
        placeholder="e.g. New York, NY"
        style={inputStyle}
      />
      {errors.currentLocation && (
        <div style={{ fontSize: '12px', color: '#A32D2D', marginBottom: '8px' }}>{errors.currentLocation}</div>
      )}

      {/* Open to relocate */}
      <label style={labelStyle}>OPEN TO RELOCATE</label>
      {['Yes — within US', 'Yes — open to relocate globally', 'Not open to relocating'].map(opt => (
        <div key={opt} onClick={() => onChange('relocatePreference', opt)} style={optionStyle(data.relocatePreference === opt)}>
          <RadioDot selected={data.relocatePreference === opt} />{opt}
        </div>
      ))}

      {/* Work preference */}
      <label style={labelStyle}>WORK PREFERENCE</label>
      {['Remote', 'Hybrid', 'In-office'].map(opt => (
        <div key={opt} onClick={() => onChange('workPreference', opt)} style={optionStyle(data.workPreference === opt)}>
          <RadioDot selected={data.workPreference === opt} />{opt}
        </div>
      ))}

      {/* Visa sponsorship */}
      <label style={labelStyle}>VISA SPONSORSHIP</label>
      {[
        'Not required — US citizen',
        'Not required — Green card / PR',
        'Required — H1B transfer',
        'Required — OPT / STEM OPT',
        'Required — Need full sponsorship',
      ].map(opt => (
        <div key={opt} onClick={() => onChange('visaStatus', opt)} style={optionStyle(data.visaStatus === opt)}>
          <RadioDot selected={data.visaStatus === opt} />{opt}
        </div>
      ))}

      {/* Summary */}
      <label style={labelStyle}>
        SHORT BIO / SUMMARY
        <span style={{ color: '#888', fontWeight: '400', marginLeft: '4px' }}>(optional)</span>
      </label>
      <textarea
        value={data.summary || ''}
        onChange={e => onChange('summary', e.target.value)}
        placeholder="e.g. Growth PM with 6 years experience..."
        rows={3}
        style={{ ...inputStyle, resize: 'vertical', marginBottom: '20px' }}
      />

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