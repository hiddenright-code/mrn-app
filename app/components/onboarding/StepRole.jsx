export default function StepRole({ onSelect }) {
  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', fontWeight: '500', color: '#111', marginBottom: '8px' }}>
          How are you joining MRN?
        </div>
        <div style={{ fontSize: '14px', color: '#888', lineHeight: '1.6' }}>
          You can always switch between roles later.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Insider */}
        <div
          onClick={() => onSelect('insider')}
          style={{
            background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)',
            borderRadius: '12px', padding: '20px',
            cursor: 'pointer', transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#085041'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
              ◈
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '500', color: '#111', marginBottom: '4px' }}>
                I am an Insider
              </div>
              <div style={{ fontSize: '13px', color: '#888', lineHeight: '1.5' }}>
                I work at a company and want to refer talented Muslim professionals from my network.
              </div>
            </div>
          </div>
        </div>

        {/* Seeker */}
        <div
          onClick={() => onSelect('seeker')}
          style={{
            background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)',
            borderRadius: '12px', padding: '20px',
            cursor: 'pointer', transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#085041'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#FAEEDA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
              ⊙
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '500', color: '#111', marginBottom: '4px' }}>
                I am a Seeker
              </div>
              <div style={{ fontSize: '13px', color: '#888', lineHeight: '1.5' }}>
                I am looking for a referral at a company and want to connect with Muslim professionals who can vouch for me.
              </div>
            </div>
          </div>
        </div>

        {/* Both */}
        <div
          onClick={() => onSelect('both')}
          style={{
            background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)',
            borderRadius: '12px', padding: '20px',
            cursor: 'pointer', transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#085041'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
              ⟳
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '500', color: '#111', marginBottom: '4px' }}>
                Both
              </div>
              <div style={{ fontSize: '13px', color: '#888', lineHeight: '1.5' }}>
                I want to refer others and also find referrals for myself.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}