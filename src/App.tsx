import { useState } from 'react'
import './App.css'
// import { LineChart } from './components/LineChart'
import { LineChartRecharts } from './components/LineChartRecharts'
// import { LineChartJS } from './components/LineChartJS'

function App() {
  const [count, setCount] = useState<number>(0)

  return (
    <>
      <div>
        <h1>Vite + React + Charts Comparison</h1>
      </div>

      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>

      <div className="charts-wrapper">
        {/* <div className="chart-container">
          <h2 className="chart-title">Chart.js Implementation</h2>
          <LineChart />
        </div> */}

        <div className="chart-container">
          <h2 className="chart-title">Recharts Implementation</h2>
          <LineChartRecharts />
        </div>
{/* 
        <div className="chart-container">
          <h2 className="chart-title">React-ChartJS-2 Implementation</h2>
          <LineChartJS />
        </div> */}
      </div>
    </>
  )
}

export default App
