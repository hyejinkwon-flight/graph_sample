import { CSSProperties } from 'react'

interface TooltipData {
  title: string
  items: {
    label: string
    value: string
    color: string
  }[]
}

interface CustomTooltipProps {
  data: TooltipData | null
  position: { x: number; y: number }
  visible: boolean
}

export function CustomTooltip({ data, position, visible }: CustomTooltipProps) {
  if (!visible || !data) return null

  const tooltipStyle: CSSProperties = {
    position: 'absolute',
    left: `${position.x}px`,
    top: `${position.y}px`,
    transform: 'translate(-50%, -120%)',
    background: 'linear-gradient(135deg, rgba(124, 252, 0, 0.95) 0%, rgba(34, 139, 34, 0.95) 100%)',
    backgroundImage: 'url(https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=500&auto=format&fit=crop&q=60)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundBlendMode: 'overlay',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    minWidth: '200px',
    pointerEvents: 'none',
    zIndex: 1000,
    opacity: visible ? 1 : 0,
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
  }

  const titleStyle: CSSProperties = {
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '12px',
    color: '#ffffff',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
  }

  const itemStyle: CSSProperties = {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    padding: '8px',
    marginBottom: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }

  const colorBoxStyle = (color: string): CSSProperties => ({
    backgroundColor: color,
    border: `2px solid ${color}`,
    borderRadius: '4px',
    width: '16px',
    height: '16px',
    flexShrink: 0,
  })

  const textStyle: CSSProperties = {
    fontSize: '13px',
    color: '#ffffff',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
  }

  return (
    <div style={tooltipStyle}>
      <div style={titleStyle}>{data.title}</div>
      <div>
        {data.items.map((item, index) => (
          <div key={index} style={itemStyle}>
            <span style={colorBoxStyle(item.color)} />
            <span style={textStyle}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
