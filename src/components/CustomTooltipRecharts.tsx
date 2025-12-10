import { CSSProperties } from 'react'

interface CustomTooltipRechartsProps {
  active?: boolean
  payload?: any[]
  label?: string
}

export function CustomTooltipRecharts({ active, payload, label }: CustomTooltipRechartsProps) {
  if (!active || !payload || !payload.length) return null

  const isMobile = window.innerWidth < 768

  const tooltipStyle: CSSProperties = {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: isMobile ? '6px' : '8px',
    padding: isMobile ? '8px 12px' : '12px 16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    border: '1px solid rgba(0, 0, 0, 0.1)',
  }

  const titleStyle: CSSProperties = {
    fontSize: isMobile ? '11px' : '13px',
    fontWeight: '600',
    marginBottom: isMobile ? '4px' : '8px',
    color: '#333',
  }

  const priceStyle: CSSProperties = {
    fontSize: isMobile ? '14px' : '18px',
    fontWeight: 'bold',
    color: '#2196F3',
  }

  return (
    <div style={tooltipStyle}>
      <div style={titleStyle}>{label}</div>
      <div style={priceStyle}>
        {payload[0].value.toLocaleString()}원
      </div>
    </div>
  )
}
