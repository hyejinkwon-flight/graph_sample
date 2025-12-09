import { useState, useRef } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js'
import { CustomTooltip } from './CustomTooltip'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export function LineChartJS() {
  const [tooltipData, setTooltipData] = useState<{
    title: string
    items: { label: string; value: string; color: string; borderColor: string }[]
  } | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const chartRef = useRef<ChartJS>(null)

  // Generate 5 years of data (60 months)
  const generateMonthlyData = (baseValue: number, variance: number, trend: number) => {
    const data = []
    for (let i = 0; i < 60; i++) {
      const trendValue = i * trend
      const randomVariance = (Math.random() - 0.5) * variance
      data.push(Math.max(20, Math.round(baseValue + trendValue + randomVariance)))
    }
    return data
  }

  const sales2024Data = generateMonthlyData(45, 15, 0.3)
  const sales2023Data = generateMonthlyData(35, 12, 0.25)

  // Generate 60 months labels
  const months = []
  const years = [2020, 2021, 2022, 2023, 2024]
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  for (const year of years) {
    for (const month of monthNames) {
      months.push(`${month} ${year}`)
    }
  }

  const data = {
    labels: months,
    datasets: [
      {
        label: 'Sales 2024',
        data: sales2024Data,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(75, 192, 192)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Sales 2023',
        data: sales2023Data,
        fill: false,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(255, 99, 132)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  }

  // Fixed width for scrollable chart (60px per data point)
  const chartWidth = months.length * 60 // 60 months * 60px = 3600px

  // Options for fixed Y-axis chart
  const yAxisOptions: ChartOptions<'line'> = {
    responsive: false,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 10,
          color: '#888',
          font: {
            size: 11,
          },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        title: {
          display: true,
          text: 'Sales ($)',
          color: '#aaa',
          font: {
            size: 11,
          },
        },
      },
    },
    elements: {
      line: {
        borderWidth: 0,
      },
      point: {
        radius: 0,
      },
    },
    animation: false,
  }

  // Options for scrollable main chart
  const mainOptions: ChartOptions<'line'> = {
    responsive: false,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: false,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || ''
            const value = context.parsed.y
            if (value === null) return label
            return `${label}: $${value.toLocaleString()}`
          },
        },
        external: (context) => {
          const { chart, tooltip } = context

          if (tooltip.opacity === 0) {
            setTooltipVisible(false)
            return
          }

          if (tooltip.body) {
            const titleLines = tooltip.title || []
            const bodyLines = tooltip.body.map((b: any) => b.lines)

            const items = bodyLines.map((body: string[], i: number) => {
              const colors = tooltip.labelColors[i]
              const dataIndex = tooltip.dataPoints[i].dataIndex
              const dataset = tooltip.dataPoints[i].dataset
              const currentValue = tooltip.dataPoints[i].parsed.y

              let valueText = body.join(', ')

              // Add change information
              if (dataIndex > 0 && currentValue !== null) {
                const previousValue = dataset.data[dataIndex - 1] as number
                const change = currentValue - previousValue
                const percentage = ((change / previousValue) * 100).toFixed(1)

                if (change > 0) {
                  valueText += ` ▲ +$${change.toLocaleString()} (+${percentage}%)`
                } else if (change < 0) {
                  valueText += ` ▼ -$${Math.abs(change).toLocaleString()} (${percentage}%)`
                }
              }

              return {
                label: dataset.label || '',
                value: valueText,
                color: colors.backgroundColor as string,
                borderColor: colors.borderColor as string,
              }
            })

            setTooltipData({
              title: titleLines[0] || '',
              items,
            })

            const scrollContainer = document.querySelector('.chartjs-scroll-container-new') as HTMLElement
            const scrollLeft = scrollContainer?.scrollLeft || 0

            const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas
            setTooltipPosition({
              x: positionX + tooltip.caretX - scrollLeft + 140,
              y: positionY + tooltip.caretY,
            })
            setTooltipVisible(true)
          }
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#888',
          font: {
            size: 11,
          },
          maxRotation: 45,
          minRotation: 45,
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      y: {
        display: false,
        min: 0,
        max: 100,
        ticks: {
          stepSize: 10,
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart',
    },
    transitions: {
      active: {
        animation: {
          duration: 400
        }
      }
    }
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#fff' }}>
        React-ChartJS-2 Implementation (Drag to scroll)
      </h3>

      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          display: 'flex',
          position: 'relative',
        }}
      >
        {/* Fixed Y-axis area with legend */}
        <div
          style={{
            position: 'sticky',
            left: 0,
            zIndex: 10,
            // background: 'rgba(36, 36, 36, 0.98)',
            paddingRight: '10px',
            borderRadius: '8px 0 0 8px',
          }}
        >
          {/* Legend */}
          <div style={{
            padding: '10px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '5px'
          }}>
            <div style={{
              color: '#aaa',
              fontSize: '10px',
              fontWeight: 'bold',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Legend
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '20px',
                  height: '3px',
                  background: 'rgb(75, 192, 192)',
                  borderRadius: '2px'
                }} />
                <span style={{ color: '#888', fontSize: '11px' }}>2024</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '20px',
                  height: '3px',
                  background: 'rgb(255, 99, 132)',
                  borderRadius: '2px'
                }} />
                <span style={{ color: '#888', fontSize: '11px' }}>2023</span>
              </div>
            </div>
          </div>

          {/* Y-axis chart */}
          <div style={{ width: '140px', height: '450px' }}>
            <Line data={data} options={yAxisOptions} width={140} height={450} />
          </div>
        </div>

        {/* Scrollable chart area */}
        <div
          className="chartjs-scroll-container-new"
          style={{
            flex: 1,
            height: '550px',
            overflowX: 'auto',
            overflowY: 'hidden',
            cursor: 'grab',
            userSelect: 'none',
          }}
          onMouseDown={(e) => {
            const element = e.currentTarget
            element.style.cursor = 'grabbing'
            let isDown = true
            const startX = e.pageX - element.offsetLeft
            const scrollLeft = element.scrollLeft

            const handleMouseMove = (moveEvent: MouseEvent) => {
              if (!isDown) return
              moveEvent.preventDefault()
              const x = moveEvent.pageX - element.offsetLeft
              const walk = (x - startX) * 2
              element.scrollLeft = scrollLeft - walk
            }

            const handleMouseUp = () => {
              isDown = false
              element.style.cursor = 'grab'
              document.removeEventListener('mousemove', handleMouseMove)
              document.removeEventListener('mouseup', handleMouseUp)
            }

            const handleMouseLeave = () => {
              isDown = false
              element.style.cursor = 'grab'
              document.removeEventListener('mousemove', handleMouseMove)
              document.removeEventListener('mouseup', handleMouseUp)
            }

            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
            document.addEventListener('mouseleave', handleMouseLeave)
          }}
        >
          <div style={{ width: `${chartWidth}px`, height: '550px', paddingTop: '105px' }}>
            <Line ref={chartRef} data={data} options={mainOptions} width={chartWidth} height={445} />
          </div>
        </div>
      </div>

      <CustomTooltip
        data={tooltipData}
        position={tooltipPosition}
        visible={tooltipVisible}
      />
    </div>
  )
}
