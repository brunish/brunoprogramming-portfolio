export default function Avatar({ name, color, size = 32 }) {
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: 6,
      background: color + '22',
      border: `1.5px solid ${color}55`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.36,
      fontWeight: 700,
      color,
      flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}
