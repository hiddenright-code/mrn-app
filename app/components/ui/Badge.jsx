export default function Badge({ label, color = 'teal' }) {
  const styles = {
    teal:   { background: '#E1F5EE', color: '#085041' },
    amber:  { background: '#FAEEDA', color: '#633806' },
    purple: { background: '#EEEDFE', color: '#3C3489' },
    gray:   { background: '#F1EFE8', color: '#2C2C2A' },
    blue:   { background: '#E8F0FE', color: '#1a73e8' },
    green:  { background: '#E6F4EA', color: '#1e8e3e' },
    orange: { background: '#FEF3E2', color: '#E37400' },
  }

  const style = styles[color] || styles.teal

  return (
    <span style={{
      ...style,
      fontSize: '11px',
      padding: '3px 8px',
      borderRadius: '20px',
      fontWeight: '500',
      display: 'inline-block',
    }}>
      {label}
    </span>
  )
}