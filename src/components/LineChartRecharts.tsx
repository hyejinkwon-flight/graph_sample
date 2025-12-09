import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { CustomTooltipRecharts } from './CustomTooltipRecharts'

export function LineChartRecharts() {
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

  const data = months.map((month, index) => ({
    month,
    sales2024: sales2024Data[index],
    sales2023: sales2023Data[index],
    dataIndex: index,
    allData: { sales2024: sales2024Data, sales2023: sales2023Data }
  }))

  // Fixed width for scrollable chart (60px per data point)
  const chartWidth = data.length * 60 // 60 months * 60px = 3600px

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#fff' }}>
        Recharts - Fixed Y-axis, Scrollable X-axis
      </h3>

      <div
        style={{
          maxWidth: '1200px',
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
            // background: '#242424',
            paddingRight: '10px',
            borderRadius: '8px 0 0 8px',
          }}
        >
          

          {/* Y-axis chart - only showing Y-axis */}
          <LineChart
            width={140}
            height={450}
            data={[
              { value: 0 },
              { value: 10 },
              { value: 20 },
              { value: 30 },
              { value: 40 },
              { value: 50 },
              { value: 60 },
              { value: 70 },
              { value: 80 },
              { value: 90 },
              { value: 100 }
            ]}
            margin={{ top: 5, right: 0, left: 50, bottom: 80 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              // stroke="rgba(255, 255, 255, 0.2)"
              horizontal={false}
              vertical={false}
            />
            <YAxis
              dataKey="value"
              stroke="#888"
              style={{ fontSize: '12px', fill: '#888' }}
              domain={[0, 100]}
              ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
              width={80}
              tickLine={{ stroke: '#888', strokeWidth: 1 }}
              axisLine={{ stroke: '#888', strokeWidth: 1 }}
              tickFormatter={(value) => `${value}`}
              label={{
                value: 'Sales ($)',
                angle: -90,
                position: 'insideLeft',
                style: { fill: '#aaa', fontSize: '12px', fontWeight: 'bold' }
              }}
            />
          </LineChart>
        </div>

        {/* Scrollable chart area */}
        <div
          className="recharts-scroll-container"
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
          <LineChart
            width={chartWidth}
            height={530}
            data={data}
            margin={{ top: 5, right: 1, left: 0, bottom: 80 }}
            style={{ display: 'block' }}
          >
            <CartesianGrid
              // strokeDasharray="3 3"
              // stroke="rgba(255, 255, 255, 0.1)"
              horizontal={false}
              vertical={false}
            />
            <XAxis
              dataKey="month"
              stroke="#888"
              style={{ fontSize: '11px' }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              stroke="#888"
              style={{ fontSize: '11px' }}
              domain={[0, 100]}
              ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
              tickLine={{ stroke: '#888' }}
              axisLine={{ stroke: '#888' }}
              hide={true}
            />
            <Tooltip content={<CustomTooltipRecharts />} />
            <Line
              type="monotone"
              dataKey="sales2024"
              name="Sales 2024"
              stroke="rgb(75, 192, 192)"
              strokeWidth={2}
              dot={{ fill: 'rgb(75, 192, 192)', strokeWidth: 2, r: 4, stroke: '#fff' }}
              activeDot={{ r: 6 }}
              animationDuration={2000}
              animationEasing="ease-in-out"
            />
            <Line
              type="monotone"
              dataKey="sales2023"
              name="Sales 2023"
              stroke="rgb(255, 99, 132)"
              strokeWidth={2}
              dot={{ fill: 'rgb(255, 99, 132)', strokeWidth: 2, r: 4, stroke: '#fff' }}
              activeDot={{ r: 6 }}
              animationDuration={2000}
              animationEasing="ease-in-out"
            />
          </LineChart>
        </div>
      </div>
    </div>
  )
}
