export default function Card({ children, style = {}, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#ffffff',
        border: '0.5px solid rgba(0,0,0,0.1)',
        borderRadius: '12px',
        margin: '0 16px 12px',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  )
}