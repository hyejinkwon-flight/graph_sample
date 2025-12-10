import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Label, LabelList, ResponsiveContainer } from 'recharts'
import { CustomTooltipRecharts } from './CustomTooltipRecharts'
import { useEffect, useState } from 'react'

export function LineChartRecharts() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    fetch('https://api3.test01-myrealtrip.com/flight/api/price/calendar/window', {
      method: 'POST',
      body: JSON.stringify({
        "airlines": [
          "All"
        ],
        "departureDate": "2025-12-16",
        "from": "ICN",
        "international": true,
        "period": 5,
        "to": "NRT",
        "transfer": 0
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(responseData => {
        // Process API data
        const processedData = processApiData(responseData)
        setData([...processedData, ...processedData])
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching data:', error)
        setLoading(false)
      })

  }, []) // Empty dependency array to run once

  // Process API response data based on FlightCalendarWindowResponse model
  const processApiData = (responseData: any) => {
    // Define special days with labels
    const specialDays: Record<string, string> = {
      '12-25': '크리스마스',
      '01-29': '설날',
      '05-05': '어린이날'
    }

    // Extract flightWindowInfoResults array from FlightCalendarWindowResponse
    const rawData = responseData?.flightWindowInfoResults

    // If rawData is not an array, return empty array
    if (!Array.isArray(rawData)) {
      console.warn('flightWindowInfoResults is not an array:', rawData)
      return []
    }

    return rawData.map((item: any) => {
      // Use departureDate from FlightWindowInfo model
      const dateString = item.departureDate || ''
      const dateObj = new Date(dateString)
      const month = dateObj.getMonth() + 1
      const day = dateObj.getDate()
      const dateKey = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

      // Use totalPrice from FlightWindowInfo model (왕복 총 가격)
      const price = item.totalPrice || 0

      return {
        date: `${month}월 ${day}일`,
        price: price,
        label: specialDays[dateKey] || null,
        isSpecial: !!specialDays[dateKey],
        originalDate: dateString,
        airline: item.airline,
        returnDate: item.returnDate
      }
    }).filter((item: any) => item.price > 0) // Filter out invalid prices
  }

  // Calculate stats
  const prices = data.map(d => d.price).filter(p => p && !isNaN(p))
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0
  const avgPrice = prices.length > 0 ? Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length) : 0

  // Find date range dynamically from data
  let startDateStr = '26.03.03'
  let endDateStr = '26.03.08'

  if (data.length > 0 && data[0].originalDate) {
    const firstDate = new Date(data[0].originalDate)
    const lastDate = new Date(data[data.length - 1].originalDate)

    startDateStr = `${String(firstDate.getFullYear()).slice(2)}.${String(firstDate.getMonth() + 1).padStart(2, '0')}.${String(firstDate.getDate()).padStart(2, '0')}`
    endDateStr = `${String(lastDate.getFullYear()).slice(2)}.${String(lastDate.getMonth() + 1).padStart(2, '0')}.${String(lastDate.getDate()).padStart(2, '0')}`
  }

  // Fixed width for scrollable chart (adjust based on screen size)
  const isMobile = window.innerWidth < 768
  const pointWidth = isMobile ? 40 : 20 // More space per point on mobile for better readability
  const minWidth = isMobile ? window.innerWidth * 2.5 : 800 // 모바일에서는 화면 너비의 2.5배
  const chartWidth = Math.max(data.length * pointWidth, minWidth)

  // Calculate Y-axis domain based on actual data
  const yAxisMax = maxPrice > 0 ? Math.ceil(maxPrice / 100000) * 100000 + 100000 : 600000
  const yAxisStep = Math.ceil(yAxisMax / 4 / 100000) * 100000
  const yAxisTicks = [0, yAxisStep, yAxisStep * 2, yAxisStep * 3, yAxisMax]

  // Calculate X-axis interval based on data length and screen size
  const xAxisInterval = isMobile
    ? (data.length > 20 ? Math.floor(data.length / 7) : Math.max(Math.floor(data.length / 5), 0))
    : (data.length > 30 ? Math.floor(data.length / 10) : Math.max(Math.floor(data.length / 7), 0))

  // Custom label component for special dates
  const renderCustomLabel = (props: any) => {
    const { x, y, index } = props
    const point = data[index]

    if (point?.label) {
      const isMobile = window.innerWidth < 768
      return (
        <text
          x={x}
          y={y - (isMobile ? 10 : 15)}
          fill="#2196F3"
          fontSize={isMobile ? '10px' : '12px'}
          fontWeight="bold"
          textAnchor="middle"
        >
          {point.label}
        </text>
      )
    }
    return null
  }

  return (
    <div style={{ width: '396px', height: '100vh', padding: 'clamp(5px, 2vw, 10px) clamp(10px, 3vw, 20px)'}}>
      {/* Date Range and Price Card */}
      <div
        style={{
          maxWidth: '100%',
          margin: '0 0 clamp(10px, 2vh, 20px) 0',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: 'clamp(12px, 2vh, 16px) clamp(14px, 3vw, 20px)',
        }}
      >
        <div style={{ fontSize: 'clamp(12px, 3vw, 16px)', color: '#666', marginBottom: '4px' }}>
          {startDateStr} - {endDateStr}
        </div>
        <div style={{ fontSize: 'clamp(18px, 5vw, 28px)', fontWeight: 'bold', color: '#2196F3' }}>
          {maxPrice > 0 ? maxPrice.toLocaleString() : '로딩중...'}원~ {'>'}
        </div>
      </div>

      <div
        style={{
          width: '100%',
          height: 'calc(100% - clamp(80px, 15vh, 120px))',
          display: 'flex',
          flexDirection: 'row',
          position: 'relative',
          gap: 'clamp(5px, 1vw, 10px)',
        }}
      >
        {/* Fixed Y-axis area */}
        <div
          style={{
            width: isMobile ? '70px' : '90px',
            flexShrink: 0,
            position: 'sticky',
            left: 0,
            zIndex: 10,
            background: '#fff',
            paddingRight: '10px',
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={yAxisTicks.map(value => ({ value }))}
              margin={{
                top: isMobile ? 30 : 50,
                right: 0,
                left: 20,
                bottom: isMobile ? 50 : 80
              }}
              style={{ outline: 'none' }}
            >
              <XAxis
                height={isMobile ? 50 : 80}
                tick={false}
                axisLine={false}
              />
              <YAxis
                dataKey="value"
                stroke="transparent"
                style={{ fontSize: isMobile ? '11px' : '13px', fill: '#888', fontWeight: '400' }}
                domain={[0, yAxisMax]}
                ticks={yAxisTicks}
                width={isMobile ? 50 : 70}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value / 10000}만`}
                orientation="left"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Scrollable chart area */}
        <div
          className="recharts-scroll-container"
          style={{
            flex: 1,
            height: '100%',
            overflowX: 'auto',
            overflowY: 'hidden',
            cursor: 'grab',
            userSelect: 'none',
            position: 'relative',
            WebkitOverflowScrolling: 'touch', // iOS smooth scrolling
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
          onTouchStart={(e) => {
            const element = e.currentTarget
            let isDown = true
            const startX = e.touches[0].pageX
            const scrollLeft = element.scrollLeft

            const handleTouchMove = (moveEvent: TouchEvent) => {
              if (!isDown) return
              const x = moveEvent.touches[0].pageX
              const walk = (startX - x) * 1.5
              element.scrollLeft = scrollLeft + walk
            }

            const handleTouchEnd = () => {
              isDown = false
              document.removeEventListener('touchmove', handleTouchMove)
              document.removeEventListener('touchend', handleTouchEnd)
            }

            document.addEventListener('touchmove', handleTouchMove, { passive: true })
            document.addEventListener('touchend', handleTouchEnd)
          }}
        >
          <div style={{ width: `${chartWidth}px`, height: '100%', minHeight: 'clamp(300px, 50vh, 400px)' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: window.innerWidth < 768 ? 30 : 50,
                  right: window.innerWidth < 768 ? 10 : 30,
                  left: 0,
                  bottom: window.innerWidth < 768 ? 50 : 80
                }}
                style={{ outline: 'none' }}
              >
                <CartesianGrid
                  strokeDasharray="0"
                  stroke="rgba(200, 200, 200, 0.3)"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="#888"
                  style={{ fontSize: 'clamp(8px, 2vw, 11px)' }}
                  interval={xAxisInterval}
                  angle={0}
                  textAnchor="middle"
                  height={window.innerWidth < 768 ? 50 : 80}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888"
                  style={{ fontSize: 'clamp(8px, 2vw, 11px)' }}
                  domain={[0, yAxisMax]}
                  ticks={yAxisTicks}
                  tickLine={false}
                  axisLine={false}
                  hide={true}
                />

                {/* Average price reference line */}
                {avgPrice > 0 && (
                  <ReferenceLine
                    y={avgPrice}
                    stroke="#999"
                    strokeDasharray="5 5"
                    strokeWidth={1}
                  >
                    <Label
                      value="평균가"
                      position="left"
                      fill="#666"
                      fontSize={window.innerWidth < 768 ? 10 : 12}
                      offset={10}
                    />
                  </ReferenceLine>
                )}

                {/* Vertical reference line for special date (Christmas if exists) */}
                {data.some(d => d.date === '12월 25일') && (
                  <ReferenceLine
                    x="12월 25일"
                    stroke="#000"
                    strokeWidth={window.innerWidth < 768 ? 1.5 : 2}
                  />
                )}

                <Tooltip content={<CustomTooltipRecharts />} cursor={false}/>

                <Line
                  type="monotone"
                  dataKey="price"
                  name="항공권 가격"
                  stroke="#2196F3"
                  strokeWidth={window.innerWidth < 768 ? 1.5 : 2}
                  dot={(props) => {
                    const { cx, cy, index } = props
                    const point = data[index]
                    if (point?.isSpecial) {
                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={window.innerWidth < 768 ? 4 : 5}
                          fill="#2196F3"
                          stroke="#fff"
                          strokeWidth={window.innerWidth < 768 ? 1.5 : 2}
                        />
                      )
                    }
                    return null
                  }}
                  activeDot={{ r: window.innerWidth < 768 ? 5 : 6 }}
                  animationDuration={2000}
                  animationEasing="ease-in-out"
                >
                  <LabelList content={renderCustomLabel} />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Minimum price label
          {minPrice > 0 && (
            <div
              style={{
                position: 'absolute',
                bottom: window.innerWidth < 768 ? '50px' : '80px',
                left: '50%',
                transform: 'translateX(-50%)',
                color: '#f44336',
                fontSize: 'clamp(11px, 3vw, 14px)',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
              }}
            >
              최저가 {minPrice.toLocaleString()}
            </div>
          )} */}
        </div>
      </div>
    </div>
  )
}
