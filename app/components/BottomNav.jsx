export default function BottomNav({ role, page, setPage, pitchCount = 0, unreadCount = 0 }) {
  const navConfig = {
    insider: [
      { id: 'feed',    icon: '◈', label: 'Feed'    },
      { id: 'pitches', icon: '📩', label: 'Pitches', badge: pitchCount },
      { id: 'matches', icon: '⟳', label: 'Matches', badge: unreadCount },
      { id: 'profile', icon: '○', label: 'Profile' },
    ],
    seeker: [
      { id: 'companies', icon: '⊙', label: 'Companies' },
      { id: 'matches',   icon: '⟳', label: 'Matches', badge: unreadCount },
      { id: 'profile',   icon: '○', label: 'Profile'   },
    ],
  }

  const items = navConfig[role] || navConfig.seeker

  return (
    <div style={{
      background: '#ffffff',
      borderTop: '0.5px solid rgba(0,0,0,0.1)',
      display: 'flex',
      padding: '8px 0 16px',
      flexShrink: 0,
    }}>
      {items.map((item) => {
        const isActive = page === item.id
        return (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              cursor: 'pointer',
              padding: '6px 0',
              background: 'none',
              border: 'none',
              fontFamily: 'DM Sans, sans-serif',
              position: 'relative',
            }}
          >
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <span style={{
                fontSize: '16px',
                color: isActive ? '#0F6E56' : '#aaa',
              }}>
                {item.icon}
              </span>
              {item.badge > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-6px',
                  background: '#E24B4A',
                  color: '#fff',
                  fontSize: '9px',
                  fontWeight: '500',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid #fff',
                }}>
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </div>
            <span style={{
              fontSize: '10px',
              color: isActive ? '#0F6E56' : '#aaa',
              letterSpacing: '0.04em',
            }}>
              {item.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}