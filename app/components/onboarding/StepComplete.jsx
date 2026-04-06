export default function StepComplete({ role }) {
  return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{
        width: '72px', height: '72px', borderRadius: '50%',
        background: '#E1F5EE', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '32px', margin: '0 auto 20px',
      }}>
        ✓
      </div>

      <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '24px', fontWeight: '500', color: '#111', marginBottom: '12px' }}>
        Ahlan wa sahlan!
      </div>

      <div style={{ fontSize: '14px', color: '#888', lineHeight: '1.7', marginBottom: '32px' }}>
        {role === 'insider'
          ? 'Your insider profile is ready. Start browsing talent and make your first referral.'
          : role === 'seeker'
          ? 'Your seeker profile is ready. Start finding insiders at your dream companies.'
          : 'Your profile is ready. You can refer others and find referrals for yourself.'}
      </div>

      <div style={{
        background: '#E1F5EE', borderRadius: '10px',
        padding: '14px 16px', marginBottom: '28px', textAlign: 'left',
      }}>
        <div style={{ fontSize: '12px', fontWeight: '500', color: '#085041', letterSpacing: '0.04em', marginBottom: '8px' }}>
          NEXT STEPS
        </div>
        {role === 'insider' ? (
          <>
            <StepItem text="Complete your profile to build trust" />
            <StepItem text="Add your referral links to the vault" />
            <StepItem text="Browse the talent feed and make your first offer" />
          </>
        ) : role === 'seeker' ? (
          <>
            <StepItem text="Complete your profile with employment history" />
            <StepItem text="Set your job preferences and target cities" />
            <StepItem text="Browse companies and pitch your first insider" />
          </>
        ) : (
          <>
            <StepItem text="Complete your full profile" />
            <StepItem text="Add your referral links as an insider" />
            <StepItem text="Browse companies and pitch insiders too" />
          </>
        )}
      </div>

      <button
        onClick={() => window.location.href = '/'}
        style={{
          width: '100%', padding: '14px',
          borderRadius: '8px', background: '#085041',
          color: '#E1F5EE', border: 'none',
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '14px', fontWeight: '500', cursor: 'pointer',
        }}
      >
        Go to MRN →
      </button>
    </div>
  )
}

function StepItem({ text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
      <span style={{ color: '#1D9E75', flexShrink: 0, marginTop: '1px' }}>✓</span>
      <span style={{ fontSize: '13px', color: '#085041' }}>{text}</span>
    </div>
  )
}