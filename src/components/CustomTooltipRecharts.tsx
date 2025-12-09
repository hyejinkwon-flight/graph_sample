import { CSSProperties } from 'react'

interface CustomTooltipRechartsProps {
  active?: boolean
  payload?: any[]
  label?: string
}

export function CustomTooltipRecharts({ active, payload, label }: CustomTooltipRechartsProps) {
  if (!active || !payload || !payload.length) return null

  const tooltipStyle: CSSProperties = {
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
      <div style={titleStyle}>{label}</div>
      <div>
        {payload.map((entry, index) => {
          const value = entry.value
          const dataIndex = entry.payload.dataIndex
          const allData = entry.payload.allData

          let displayText = `${entry.name}: $${value.toLocaleString()}`

          // Calculate change from previous month
          if (dataIndex > 0 && allData && allData[entry.dataKey]) {
            const previousValue = allData[entry.dataKey][dataIndex - 1]
            const change = value - previousValue
            const percentage = ((change / previousValue) * 100).toFixed(1)

            if (change > 0) {
              displayText += ` ▲ +$${change.toLocaleString()} (+${percentage}%)`
            } else if (change < 0) {
              displayText += ` ▼ -$${Math.abs(change).toLocaleString()} (${percentage}%)`
            }
          }

          return (
            <div key={index} style={itemStyle}>
              <span style={colorBoxStyle(entry.color)} />
              <span style={textStyle}>{displayText}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
