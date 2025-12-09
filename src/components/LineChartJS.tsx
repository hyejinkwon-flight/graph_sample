import { useRef, useState, useMemo, useCallback } from 'react'
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
} from 'chart.js'
import type { ChartOptions } from 'chart.js'
import { CustomTooltip } from './CustomTooltip'

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
  const chartRef = useRef<ChartJS<'line'>>(null)
  const [tooltipData, setTooltipData] = useState<{
    title: string
    items: { label: string; value: string; color: string }[]
  } | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [tooltipVisible, setTooltipVisible] = useState(false)

  // 샘플 데이터 생성 (60개월 치) - 한 번만 생성
  const chartData = useMemo(() => {
    const generateData = (baseValue: number, variance: number) => {
      return Array.from({ length: 60 }, (_, i) => {
        const trend = i * 0.5
        const random = (Math.random() - 0.5) * variance
        return Math.max(0, Math.round(baseValue + trend + random))
      })
    }

    // 월별 라벨 생성 (5년치)
    const labels = Array.from({ length: 60 }, (_, i) => {
      const year = 2020 + Math.floor(i / 12)
      const month = (i % 12) + 1
      return `${year}-${String(month).padStart(2, '0')}`
    })

    return {
      labels,
      datasets: [
        {
          label: 'Dataset 1',
          data: generateData(50, 20),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: 'Dataset 2',
          data: generateData(40, 15),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    }
  }, [])

  // Y축 전용 차트 데이터 (빈 데이터)
  const yAxisData = useMemo(() => ({
    labels: [''],
    datasets: [
      {
        data: [],
      },
    ],
  }), [])

  // Custom tooltip handler - useRef로 안정적인 참조 유지
  const tooltipHandler = useRef((context: any) => {})

  tooltipHandler.current = (context: any) => {
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
        const dataset = tooltip.dataPoints[i].dataset
        const value = tooltip.dataPoints[i].parsed.y

        return {
          label: dataset.label || '',
          value: `${dataset.label}: ${value}`,
          color: colors.backgroundColor as string,
        }
      })

      setTooltipData({
        title: titleLines[0] || '',
        items,
      })

      const scrollContainer = document.querySelector('.chartjs-scroll-container') as HTMLElement
      const scrollLeft = scrollContainer?.scrollLeft || 0

      const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas
      setTooltipPosition({
        x: positionX + tooltip.caretX - scrollLeft + 100,
        y: positionY + tooltip.caretY,
      })
      setTooltipVisible(true)
    }
  }

  // Y축 전용 차트 옵션 (고정)
  const yAxisOptions: ChartOptions<'line'> = useMemo(() => ({
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
          text: 'Value',
          color: '#aaa',
          font: {
            size: 12,
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
  }), [])

  // 메인 차트 옵션 (스크롤 가능)
  const mainOptions: ChartOptions<'line'> = useMemo(() => ({
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
        mode: 'index',
        intersect: false,
        external: (context) => tooltipHandler.current(context),
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#888',
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 11,
          },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      y: {
        display: false, // Y축 숨김
        min: 0,
        max: 100,
        ticks: {
          stepSize: 10,
        },
      },
    },
  }), [])

  // 스크롤 가능한 차트 너비 계산
  const chartWidth = chartData.labels.length * 60 // 각 데이터 포인트당 60px

  return (
    <div style={{ width: '100%', padding: '20px' }}>
      <h2 style={{ color: '#fff', textAlign: 'center', marginBottom: '20px' }}>
        React-ChartJS-2 Line Chart
      </h2>

      {/* 범례 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '30px',
            height: '3px',
            background: 'rgb(75, 192, 192)'
          }} />
          <span style={{ color: '#888', fontSize: '13px' }}>Dataset 1</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '30px',
            height: '3px',
            background: 'rgb(255, 99, 132)'
          }} />
          <span style={{ color: '#888', fontSize: '13px' }}>Dataset 2</span>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          maxWidth: '1200px',
          margin: '0 auto',
          background: '#1a1a1a',
          borderRadius: '8px',
          padding: '20px',
        }}
      >
        {/* 고정된 Y축 영역 */}
        <div
          style={{
            position: 'sticky',
            left: 0,
            zIndex: 10,
            background: '#1a1a1a',
            paddingRight: '10px',
          }}
        >
          <div style={{ width: '100px', height: '500px' }}>
            <Line data={yAxisData} options={yAxisOptions} width={80} height={500} />
          </div>
        </div>

        {/* 스크롤 가능한 차트 영역 */}
        <div
          className="chartjs-scroll-container"
          style={{
            flex: 1,
            height: '500px',
            overflowX: 'auto',
            overflowY: 'hidden',
            position: 'relative',
          }}
        >
          <div style={{ width: `${chartWidth}px`, height: '500px' }}>
            <Line ref={chartRef} data={chartData} options={mainOptions} width={chartWidth} height={500} />
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px', color: '#888', fontSize: '14px' }}>
        스크롤하여 더 많은 데이터를 확인하세요
      </div>

      <CustomTooltip
        data={tooltipData}
        position={tooltipPosition}
        visible={tooltipVisible}
      />
    </div>
  )
}
