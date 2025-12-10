import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine, Label, LabelList, ResponsiveContainer } from 'recharts'
import { useEffect, useState, useRef } from 'react'

export function LineChartRecharts() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

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
        const duplicatedData = [...processedData, ...processedData]

        // Find minimum price and mark it
        if (duplicatedData.length > 0) {
          const minPriceValue = Math.min(...duplicatedData.map(d => d.price).filter(p => p > 0))
          duplicatedData.forEach(item => {
            item.isMinPrice = item.price === minPriceValue
          })
        }

        setData(duplicatedData)
        setLoading(false)

        // Disable animation after initial load
        setTimeout(() => {
          setIsInitialLoad(false)
        }, 2500)
      })
      .catch(error => {
        console.error('Error fetching data:', error)
        setLoading(false)
        setIsInitialLoad(false)
      })

  }, []) // Empty dependency array to run once

  // Scroll to minimum price after data is loaded and chart is rendered
  useEffect(() => {
    if (!loading && data.length > 0 && scrollContainerRef.current) {
      const minPriceIndex = data.findIndex(d => d.isMinPrice)

      if (minPriceIndex !== -1) {
        // Wait for chart to render
        setTimeout(() => {
          const scrollContainer = scrollContainerRef.current
          if (scrollContainer) {
            const pointWidth = window.innerWidth < 768 ? 40 : 20
            const scrollPosition = minPriceIndex * pointWidth - (scrollContainer.clientWidth / 2) + (pointWidth / 2)

            // Smooth scroll to minimum price position
            scrollContainer.scrollTo({
              left: Math.max(0, scrollPosition),
              behavior: 'smooth'
            })
          }
        }, 2500) // Wait for animation to complete
      }
    }
  }, [loading, data])

  // Process API response data based on FlightCalendarWindowResponse model
  const processApiData = (responseData: any) => {
    // Define special days with labels
    const specialDays: Record<string, string> = {
      '12-25': '크리스마스',
      '01-29': '설날',
      '03-01': '삼일절',
      '05-01': '근로자의 날',
      '05-05': '어린이날',
      '08-15': '광복절',
      '10-03': '개천절',
      '10-09': '한글날',
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
      const year = dateObj.getFullYear().toString().slice(2)
      const month = String(dateObj.getMonth() + 1).padStart(2, '0')
      const day = dateObj.getDate().toString().padStart(2, '0')
      const dateKey = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

      const returnDateString = item.returnDate || ''
      const returnDateObj = new Date(returnDateString)
      const returnYear = returnDateObj.getFullYear().toString().slice(2)
      const returnMonth = String(returnDateObj.getMonth() + 1).padStart(2, '0')
      const returnDay = returnDateObj.getDate().toString().padStart(2, '0')

      // Use totalPrice from FlightWindowInfo model (왕복 총 가격)
      const price = item.totalPrice || 0

      return {
        date: `${month}월 ${day}일`,
        departureDate: `${year}.${month}.${day}`,
        returnDate: `${returnYear}.${returnMonth}.${returnDay}`,
        price: price,
        label: specialDays[dateKey] || null,
        isSpecial: !!specialDays[dateKey],
        originalDate: dateString,
        airline: item.airline,
        originalReturnDate: item.returnDate
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

  // Custom label component for special dates and minimum price
  const renderCustomLabel = (props: any) => {
    const { x, y, index } = props
    const point = data[index]
    const isMobile = window.innerWidth < 768

    if (point?.label) {
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

    if (point?.isMinPrice) {
      return (
        <text
          x={x}
          y={y + (isMobile ? 20 : 25)}
          fill="#f44336"
          fontSize={isMobile ? '10px' : '12px'}
          fontWeight="bold"
          textAnchor="middle"
        >
          <tspan x={x} dy="0">{point.price.toLocaleString()}</tspan>
          <tspan x={x} dy="1.2em">최저가</tspan>
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
          {minPrice > 0 ? minPrice.toLocaleString() : '로딩중...'}원~ {'>'}
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
            width: isMobile ? '45px' : '45px',
            flexShrink: 0,
            position: 'sticky',
            left: 0,
            zIndex: 10,
            background: '#fff',
            // paddingRight: '10px',
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
                width={isMobile ? 25 : 35}
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
          ref={scrollContainerRef}
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
          <div style={{ width: `${chartWidth}px`, height: '100%', minHeight: 'clamp(300px, 50vh, 400px)', position: 'relative' }}>
            {/* Vertical line for selected or minimum price */}
            {(() => {
              const displayIndex = selectedIndex !== null ? selectedIndex : data.findIndex(d => d.isMinPrice)
              if (displayIndex === -1) return null

              // Calculate exact position considering chart margins
              const leftMargin = 0
              const rightMargin = isMobile ? 10 : 30
              const plotAreaWidth = chartWidth - leftMargin - rightMargin
              const spacing = plotAreaWidth / (data.length - 1)
              const xPosition = leftMargin + spacing * displayIndex

              const topMargin = isMobile ? 30 : 50
              const bottomMargin = isMobile ? 50 : 80

              const selectedData = data[displayIndex] ?
                data[displayIndex] : data.find(d => d.isMinPrice)

              return (
                <>
                  <div
                    className="vertical-reference-line"
                    style={{
                      position: 'absolute',
                      left: `${xPosition}px`,
                      top: `${topMargin}px`,
                      bottom: `${bottomMargin}px`,
                      width: '1px',
                      backgroundColor: '#f44336',
                      pointerEvents: 'none',
                      zIndex: 5
                    }}
                  />
                  {/* Fixed tooltip at top center of guideline */}
                  {selectedData && (
                    <div
                      style={{
                        position: 'absolute',
                        left: `${xPosition}px`,
                        top: `${topMargin - 10}px`,
                        transform: 'translate(-50%, 0)',
                        background: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: isMobile ? '6px' : '8px',
                        padding: isMobile ? '8px 12px' : '12px 16px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                        pointerEvents: 'none',
                        zIndex: 10,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <div style={{ fontSize: isMobile ? '11px' : '13px', fontWeight: '600', marginBottom: isMobile ? '4px' : '8px', color: '#333' }}>
                        {selectedData.departureDate} - {selectedData.returnDate}
                      </div>
                      <div style={{ fontSize: isMobile ? '14px' : '18px', fontWeight: 'bold', color: '#2196F3' }}>
                        {selectedData.price.toLocaleString()}원 부터 
                      </div>
                    </div>
                  )}
                </>
              )
            })()}

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
                          onClick={() => setSelectedIndex(index)}
                          style={{ cursor: 'pointer' }}
                        />
                      )
                    }

                    if (point?.isMinPrice) {
                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={window.innerWidth < 768 ? 4 : 5}
                          fill="#000"
                          stroke="#fff"
                          strokeWidth={window.innerWidth < 768 ? 1.5 : 2}
                          onClick={() => setSelectedIndex(index)}
                          style={{ cursor: 'pointer' }}
                        />
                      )
                    }

                    return null
                  }}
                  activeDot={(props) => {
                    const { cx, cy, index } = props
                    const point = data[index]

                    if (point?.isMinPrice) {
                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={window.innerWidth < 768 ? 5 : 6}
                          fill="#000"
                          stroke="#fff"
                          strokeWidth={2}
                          onClick={() => setSelectedIndex(index)}
                          style={{ cursor: 'pointer' }}
                        />
                      )
                    }

                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={window.innerWidth < 768 ? 5 : 6}
                        fill="#2196F3"
                        stroke="#fff"
                        strokeWidth={2}
                        onClick={() => setSelectedIndex(index)}
                        style={{ cursor: 'pointer' }}
                      />
                    )
                  }}
                  onClick={(e: any) => {
                    if (e && e.index !== undefined) {
                      setSelectedIndex(e.index)
                    }
                  }}
                  isAnimationActive={isInitialLoad}
                  animationDuration={2000}
                  animationEasing="ease-in-out"
                >
                  <LabelList content={renderCustomLabel} />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
