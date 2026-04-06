export default function RoleToggle({ role, setRole }) {
  return (
    <div style={{
      display: 'flex',
      gap: '6px',
      padding: '10px 16px',
      background: '#ffffff',
      borderBottom: '0.5px solid rgba(0,0,0,0.1)',
    }}>
      {['insider', 'seeker'].map((r) => (
        <button
          key={r}
          onClick={() => setRole(r)}
          style={{
            flex: 1,
            padding: '8px 0',
            borderRadius: '8px',
            border: '0.5px solid rgba(0,0,0,0.12)',
            background: role === r ? '#085041' : 'transparent',
            color: role === r ? '#E1F5EE' : '#888',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.15s',
            textTransform: 'capitalize',
          }}
        >
          {r}
        </button>
      ))}
    </div>
  )
}