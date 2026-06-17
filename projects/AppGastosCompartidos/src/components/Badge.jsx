export default function Badge({ children, color = '#b8ff57' }) {
  return (
    <span style={{
      background: color + '18',
      color,
      border: `1px solid ${color}44`,
      borderRadius: 4,
      padding: '2px 7px',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.04em',
    }}>
      {children}
    </span>
  )
}
