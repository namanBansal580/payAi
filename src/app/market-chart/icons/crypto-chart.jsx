"use client"

import { useState, useEffect, useMemo } from "react"
import { Area, AreaChart, Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingDown, TrendingUp, ZoomIn, ZoomOut } from "lucide-react"
import { AreaChartIcon, LineChartIcon, CandleChartIcon } from "./chart-icons"
import { ChartBackground } from "./chart-background"

// Define coin options with images
const coinOptions = [
  {
    id: "hedera-hashgraph",
    name: "Hedera",
    symbol: "hbar",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdL5G5_I3piGe6bR4qXPD8yOE2RY8qReRt1A&s",
  },
  {
    id: "lukso-token",
    name: "LUKSO",
    symbol: "LYX",
    image: "https://pbs.twimg.com/profile_images/1866711035387789313/mpF2QNlQ_400x400.jpg",
  },
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  },
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  },
  {
    id: "binancecoin",
    name: "BNB",
    symbol: "BNB",
    image: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  },
  {
    id: "solana",
    name: "Solana",
    symbol: "SOL",
    image: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  },
 
]

// Time period options
const timePeriods = [
  { value: "1", label: "24h" },
  { value: "7", label: "7d" },
  { value: "30", label: "30d" },
  { value: "90", label: "90d" },
  { value: "180", label: "180d" },
  { value: "365", label: "1y" },
  { value: "max", label: "Max" },
]

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const price = payload[0].value
    const timestamp = new Date(label).toLocaleString()
    const isPositive = payload[0].payload.isPositive

    return (
      <div className="bg-black/80 backdrop-blur-sm p-3 rounded-lg border border-blue-500/30 shadow-lg">
        <p className="text-gray-300 text-xs">{timestamp}</p>
        <p className={`text-lg font-bold ${isPositive ? "text-green-400" : "text-red-400"}`}>${price.toFixed(2)}</p>
        <div className="flex items-center mt-1 text-xs">
          {isPositive ? (
            <TrendingUp className="h-3 w-3 text-green-400 mr-1" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-400 mr-1" />
          )}
          <span className={isPositive ? "text-green-400" : "text-red-400"}>
            {isPositive ? "+" : "-"}${Math.abs(payload[0].payload.change || 0).toFixed(2)}
          </span>
        </div>
      </div>
    )
  }
  return null
}

// Custom Card Component
const Card = ({ className, children }) => {
  return <div className={`rounded-lg shadow-md overflow-hidden ${className}`}>{children}</div>
}

// Custom Card Header Component
const CardHeader = ({ className, children }) => {
  return <div className={`p-4 ${className}`}>{children}</div>
}

// Custom Card Title Component
const CardTitle = ({ className, children }) => {
  return <h3 className={`text-xl font-semibold ${className}`}>{children}</h3>
}

// Custom Card Content Component
const CardContent = ({ className, children }) => {
  return <div className={`p-4 pt-0 ${className}`}>{children}</div>
}

// Custom Select Component
const CustomSelect = ({ value, onChange, options, placeholder, className }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        className="flex items-center justify-between w-full px-3 py-2 text-sm bg-blue-950/50 border border-blue-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        {options.find((option) => option.value === value)?.label || placeholder}
        <svg
          className="w-4 h-4 ml-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-blue-950 border border-blue-500/30 rounded-md shadow-lg">
          <ul className="py-1 overflow-auto max-h-60">
            {options.map((option) => (
              <li
                key={option.value}
                className="px-3 py-2 text-sm hover:bg-blue-800 cursor-pointer"
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// Custom Coin Select Component
const CoinSelect = ({ value, onChange, className }) => {
  const [isOpen, setIsOpen] = useState(false)
  const selectedCoin = coinOptions.find((coin) => coin.id === value) || coinOptions[0]

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        className="flex items-center justify-between w-full px-3 py-2 text-sm bg-blue-950/50 border border-blue-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <img
            src={selectedCoin.image || "/placeholder.svg?height=20&width=20"}
            alt={selectedCoin.name}
            className="w-5 h-5 mr-2"
          />
          <span>{selectedCoin.name}</span>
          <span className="ml-1 text-blue-300 text-xs">({selectedCoin.symbol})</span>
        </div>
        <svg
          className="w-4 h-4 ml-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-blue-950 border border-blue-500/30 rounded-md shadow-lg">
          <ul className="py-1 overflow-auto max-h-60">
            {coinOptions.map((coin) => (
              <li
                key={coin.id}
                className="px-3 py-2 text-sm hover:bg-blue-800 cursor-pointer"
                onClick={() => {
                  onChange(coin.id)
                  setIsOpen(false)
                }}
              >
                <div className="flex items-center">
                  <img
                    src={coin.image || "/placeholder.svg?height=20&width=20"}
                    alt={coin.name}
                    className="w-5 h-5 mr-2"
                  />
                  <span>{coin.name}</span>
                  <span className="ml-1 text-blue-300 text-xs">({coin.symbol})</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// Custom Button Component
const Button = ({ onClick, className, children }) => {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    >
      {children}
    </button>
  )
}

// Custom Slider Component
const Slider = ({ value, min, max, step, onChange }) => {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number.parseInt(e.target.value))}
      className="w-full h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer"
    />
  )
}

// Terms and Conditions Component
const TermsAndConditions = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-blue-950 border border-blue-500/30 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Terms and Conditions</h2>

          <div className="text-gray-300 space-y-4 text-sm">
            <p>
              This cryptocurrency chart application ("App") is provided for informational purposes only. By using this
              App, you agree to the following terms and conditions:
            </p>

            <h3 className="text-white font-semibold">1. Data Accuracy</h3>
            <p>
              The cryptocurrency price data displayed in this App is sourced from CoinGecko API. While we strive to
              ensure the accuracy of the information, we make no representations or warranties about the accuracy,
              reliability, completeness, or timeliness of any information.
            </p>

            <h3 className="text-white font-semibold">2. Not Financial Advice</h3>
            <p>
              The information provided by this App does not constitute financial advice, investment advice, trading
              advice, or any other sort of advice. You should not make any investment decision based solely on the
              information provided by this App.
            </p>

            <h3 className="text-white font-semibold">3. API Usage Limitations</h3>
            <p>
              This App uses the CoinGecko API which has rate limits. If you experience issues with data loading, it may
              be due to these rate limits being exceeded. Please wait and try again later.
            </p>

            <h3 className="text-white font-semibold">4. No Liability</h3>
            <p>
              In no event shall the creators, developers, or providers of this App be liable for any damages arising out
              of or in connection with the use or inability to use this App or the information provided.
            </p>

            <h3 className="text-white font-semibold">5. Third-Party Services</h3>
            <p>
              This App relies on third-party services such as CoinGecko. We are not responsible for any changes,
              interruptions, or discontinuation of these services.
            </p>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2">
              I Understand
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Custom Candle Chart Component
const CandleChart = ({ data }) => {
  // Calculate OHLC data from price points
  const candleData = useMemo(() => {
    if (!data || data.length < 2) return []

    const timeframe = 24 // 24 data points per candle
    const candles = []

    for (let i = 0; i < data.length; i += timeframe) {
      const slice = data.slice(i, i + timeframe)
      if (slice.length > 0) {
        const prices = slice.map((d) => d.price)
        candles.push({
          timestamp: slice[0].timestamp,
          open: prices[0],
          high: Math.max(...prices),
          low: Math.min(...prices),
          close: prices[prices.length - 1],
          isPositive: prices[prices.length - 1] >= prices[0],
        })
      }
    }

    return candles
  }, [data])

  return (
    <div className="relative h-full w-full">
      <svg width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="none">
        {candleData.map((candle, i) => {
          const x = (i / candleData.length) * 800
          const width = (800 / candleData.length) * 0.8

          // Scale prices to view height
          const maxPrice = Math.max(...candleData.map((d) => d.high))
          const minPrice = Math.min(...candleData.map((d) => d.low))
          const scale = (price) => 400 - ((price - minPrice) / (maxPrice - minPrice)) * 400

          const color = candle.isPositive ? "#22c55e" : "#ef4444"

          return (
            <g key={i}>
              {/* Wick */}
              <line
                x1={x + width / 2}
                y1={scale(candle.high)}
                x2={x + width / 2}
                y2={scale(candle.low)}
                stroke={color}
                strokeWidth="1"
              />
              {/* Body */}
              <rect
                x={x}
                y={scale(Math.max(candle.open, candle.close))}
                width={width}
                height={Math.abs(scale(candle.open) - scale(candle.close))}
                fill={color}
                fillOpacity="0.8"
              />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default function CryptoChart() {
  const [selectedCoin, setSelectedCoin] = useState(coinOptions[0].id)
  const [days, setDays] = useState("365")
  const [chartData, setChartData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [showTerms, setShowTerms] = useState(false)
  const [chartType, setChartType] = useState("area")

  // Get the selected coin details
  const selectedCoinDetails = useMemo(() => {
    return coinOptions.find((coin) => coin.id === selectedCoin) || coinOptions[0]
  }, [selectedCoin])

  // Fetch data from CoinGecko API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const url = `https://api.coingecko.com/api/v3/coins/${selectedCoin}/market_chart?vs_currency=usd&days=${days}&x_cg_demo_api_key=CG-hqMGzd5r3hMZFU7A9EZ1Mkcw`
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`)
        }

        const data = await response.json()

        // Process the data for the chart
        if (data && data.prices && data.prices.length > 0) {
          let previousPrice = data.prices[0][1]

          const processedData = data.prices.map((item, index) => {
            const timestamp = item[0]
            const price = item[1]
            const isPositive = price >= previousPrice
            const change = price - previousPrice

            // Create a data point
            const dataPoint = {
              timestamp,
              date: new Date(timestamp),
              price,
              isPositive,
              change,
              // Add a segment identifier for coloring
              segment: index === 0 ? 0 : isPositive ? 1 : -1,
            }

            previousPrice = price
            return dataPoint
          })

          // Apply zoom level to limit the number of data points
          const dataLength = processedData.length
          const zoomedDataLength = Math.floor(dataLength * (zoomLevel / 100))
          const zoomedData = processedData.slice(dataLength - zoomedDataLength)

          setChartData(zoomedData)
        } else {
          throw new Error("No price data available")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [selectedCoin, days, zoomLevel])

  // Format date for X-axis
  const formatXAxis = (timestamp) => {
    const date = new Date(timestamp)

    if (days === "1") {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (days === "7" || days === "30") {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  // Handle zoom in/out
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 10, 100))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 10, 10))
  }

  // Render price and change indicator
  const renderPriceIndicator = () => {
    if (isLoading || chartData.length === 0) return null

    const latestData = chartData[chartData.length - 1]

    return (
      <div className="flex items-center mt-1">
        <span className="text-2xl font-bold text-white">${latestData.price.toFixed(2)}</span>
        <span className={`ml-2 text-sm flex items-center ${latestData.isPositive ? "text-green-400" : "text-red-400"}`}>
          {latestData.isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
          {latestData.isPositive ? "+" : "-"}${Math.abs(latestData.change || 0).toFixed(2)}
        </span>
      </div>
    )
  }

  return (
    <div className="relative">
      <ChartBackground />

      <div className="relative bg-black/40 backdrop-blur-md border border-blue-500/20 rounded-lg shadow-xl">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden mr-3 bg-blue-900/50 p-1">
                <img
                  src={selectedCoinDetails.image || "/placeholder.svg?height=40&width=40"}
                  alt={selectedCoinDetails.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <CardTitle className="text-white flex items-center">
                  {selectedCoinDetails.name}
                  <span className="text-blue-300 ml-2 text-sm">{selectedCoinDetails.symbol}</span>
                </CardTitle>
                {renderPriceIndicator()}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <CoinSelect value={selectedCoin} onChange={setSelectedCoin} className="w-full sm:w-[180px]" />

              <CustomSelect
                value={days}
                onChange={setDays}
                options={timePeriods}
                placeholder="Time period"
                className="w-full sm:w-[120px]"
              />
            </div>
          </div>
        </CardHeader>

        <div className="p-4">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setChartType("area")}
                  className={`p-2 rounded-lg transition-colors ${
                    chartType === "area" ? "bg-blue-600" : "bg-blue-950/50 hover:bg-blue-900/50"
                  }`}
                >
                  <AreaChartIcon />
                </button>
                <button
                  onClick={() => setChartType("line")}
                  className={`p-2 rounded-lg transition-colors ${
                    chartType === "line" ? "bg-blue-600" : "bg-blue-950/50 hover:bg-blue-900/50"
                  }`}
                >
                  <LineChartIcon />
                </button>
                <button
                  onClick={() => setChartType("candle")}
                  className={`p-2 rounded-lg transition-colors ${
                    chartType === "candle" ? "bg-blue-600" : "bg-blue-950/50 hover:bg-blue-900/50"
                  }`}
                >
                  <CandleChartIcon />
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleZoomOut}
                  className="h-8 w-8 bg-blue-950/50 border border-blue-500/30 hover:bg-blue-800 flex items-center justify-center p-0"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <div className="w-24 px-2">
                  <Slider value={zoomLevel} min={10} max={100} step={10} onChange={setZoomLevel} />
                </div>
                <Button
                  onClick={handleZoomIn}
                  className="h-8 w-8 bg-blue-950/50 border border-blue-500/30 hover:bg-blue-800 flex items-center justify-center p-0"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="h-[400px] w-full">
              {isLoading ? (
                <div className="h-full w-full flex items-center justify-center">
                  <div className="animate-pulse text-blue-400">Loading chart data...</div>
                </div>
              ) : error ? (
                <div className="h-full w-full flex items-center justify-center">
                  <div className="text-red-400">{error}</div>
                </div>
              ) : (
                <div className="relative h-full">
                  {chartType === "area" && (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorPriceUp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="rgba(34, 197, 94, 0.6)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="rgba(34, 197, 94, 0.01)" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorPriceDown" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="rgba(239, 68, 68, 0.6)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="rgba(239, 68, 68, 0.01)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e3a8a" vertical={false} />
                        <XAxis
                          dataKey="timestamp"
                          tickFormatter={formatXAxis}
                          tick={{ fill: "#94a3b8" }}
                          axisLine={{ stroke: "#1e3a8a" }}
                          tickLine={{ stroke: "#1e3a8a" }}
                        />
                        <YAxis
                          domain={["auto", "auto"]}
                          tick={{ fill: "#94a3b8" }}
                          axisLine={{ stroke: "#1e3a8a" }}
                          tickLine={{ stroke: "#1e3a8a" }}
                          tickFormatter={(value) => `$${value.toFixed(2)}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        {/* Render separate areas for up and down segments */}
                        <Area
                          type="monotone"
                          dataKey="price"
                          stroke="#22c55e"
                          fill="url(#colorPriceUp)"
                          fillOpacity={1}
                          strokeWidth={2}
                          connectNulls
                          activeDot={{ r: 6, fill: "#fff", stroke: "#22c55e" }}
                          isAnimationActive={true}
                          animationDuration={500}
                          name="Price (Up)"
                          // Only show this area for upward price movements
                          data={chartData.map((point) => (point.isPositive ? point : { ...point, price: null }))}
                        />
                        <Area
                          type="monotone"
                          dataKey="price"
                          stroke="#ef4444"
                          fill="url(#colorPriceDown)"
                          fillOpacity={1}
                          strokeWidth={2}
                          connectNulls
                          activeDot={{ r: 6, fill: "#fff", stroke: "#ef4444" }}
                          isAnimationActive={true}
                          animationDuration={500}
                          name="Price (Down)"
                          // Only show this area for downward price movements
                          data={chartData.map((point) => (!point.isPositive ? point : { ...point, price: null }))}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}

                  {chartType === "line" && (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e3a8a" vertical={false} />
                        <XAxis
                          dataKey="timestamp"
                          tickFormatter={formatXAxis}
                          tick={{ fill: "#94a3b8" }}
                          axisLine={{ stroke: "#1e3a8a" }}
                          tickLine={{ stroke: "#1e3a8a" }}
                        />
                        <YAxis
                          domain={["auto", "auto"]}
                          tick={{ fill: "#94a3b8" }}
                          axisLine={{ stroke: "#1e3a8a" }}
                          tickLine={{ stroke: "#1e3a8a" }}
                          tickFormatter={(value) => `$${value.toFixed(2)}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 6, fill: "#fff", stroke: "#3b82f6" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}

                  {chartType === "candle" && <CandleChart data={chartData} />}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="bg-blue-950/30 border-blue-500/20">
              <CardContent className="p-4">
                <div className="text-sm text-blue-300 mb-1">Market Cap</div>
                <div className="text-xl font-bold text-white">$1.2B</div>
              </CardContent>
            </Card>
            <Card className="bg-blue-950/30 border-blue-500/20">
              <CardContent className="p-4">
                <div className="text-sm text-blue-300 mb-1">24h Volume</div>
                <div className="text-xl font-bold text-white">$45.8M</div>
              </CardContent>
            </Card>
            <Card className="bg-blue-950/30 border-blue-500/20">
              <CardContent className="p-4">
                <div className="text-sm text-blue-300 mb-1">Circulating Supply</div>
                <div className="text-xl font-bold text-white">16.5M</div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 p-6 bg-blue-950/30 rounded-lg border border-blue-500/20">
            <h3 className="text-lg font-semibold text-white mb-4">Terms and Conditions</h3>

            <div className="space-y-4 text-sm text-gray-300">
              <div>
                <h4 className="font-medium text-white mb-2">Data Accuracy</h4>
                <p>
                  Price data is sourced from CoinGecko API. While we strive for accuracy, we cannot guarantee the
                  precision of displayed information.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-white mb-2">Not Financial Advice</h4>
                <p>
                  Information provided is for informational purposes only and should not be considered financial advice.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-white mb-2">API Limitations</h4>
                <p>
                  This service uses the CoinGecko API which has rate limits. Data updates may be delayed during periods
                  of high traffic.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-white mb-2">Disclaimer</h4>
                <p>
                  Cryptocurrency investments are volatile and high-risk. Never invest more than you can afford to lose.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TermsAndConditions isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  )
}