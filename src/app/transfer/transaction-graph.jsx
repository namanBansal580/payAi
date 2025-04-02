"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from "lucide-react"
import Web3Service from "./web3-service"

// Types

const web3Service=new Web3Service(296);
export default function TransactionGraph({ transactions }) {
  const [activeView, setActiveView] = useState("weekly")
  const [graphType, setGraphType] = useState("area")
  // Process transaction data for graphs
  const graphData = useMemo(() => {
    if (!transactions.length) {
      // Generate sample data if no transactions
      return generateSampleData(activeView)
    }

    // Group transactions by date and type
    const groupedData = {}

    transactions.forEach((tx) => {
      const numAmount = Number.parseFloat(tx.amount.split(" ")[0])

      if (!groupedData[tx.date]) {
        groupedData[tx.date] = {
          date: tx.date,
          sent: 0,
          received: 0,
          refund: 0,
          total: 0,
        }
      }

      if (tx.type === "send") {
        groupedData[tx.date].sent += numAmount
      } else if (tx.type === "receive") {
        groupedData[tx.date].received += numAmount
      } else if (tx.type === "refund") {
        groupedData[tx.date].refund += numAmount
      }

      groupedData[tx.date].total += numAmount
    })

    // Convert to array and sort by date
    return Object.values(groupedData).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [transactions, activeView])

  // Calculate totals for summary
  const totals = useMemo(() => {
    const result = {
      sent: 0,
      received: 0,
      refund: 0,
      net: 0,
    }

    graphData.forEach((day) => {
      result.sent += day.sent
      result.received += day.received
      result.refund += day.refund
    })

    result.net = result.received - result.sent - result.refund

    return result
  }, [graphData])

  // Pie chart data
  const pieData = useMemo(() => {
    return [
      { name: "Sent", value: totals.sent, color: "#3b82f6" },
      { name: "Received", value: totals.received, color: "#10b981" },
      { name: "Refund", value: totals.refund, color: "#f59e0b" },
    ].filter((item) => item.value > 0)
  }, [totals])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  return (
    <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-800 p-6 mt-8">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Transaction Analytics</h2>
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-800/50 rounded-lg p-1">
              {(["area", "bar", "line"] ).map((type) => (
                <button
                  key={type}
                  onClick={() => setGraphType(type)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    graphType === type ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex bg-gray-800/50 rounded-lg p-1">
              {(["daily", "weekly", "monthly"] ).map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveView(view)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    activeView === view ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SummaryCard
            title="Total Sent"
            value={totals.sent.toFixed(2)}
            trend={-5.2}
            icon={<ArrowUpRight className="h-5 w-5" />}
            color="blue"
          />
          <SummaryCard
            title="Total Received"
            value={totals.received.toFixed(2)}
            trend={8.7}
            icon={<ArrowDownRight className="h-5 w-5" />}
            color="green"
          />
          <SummaryCard
            title="Total Refunds"
            value={totals.refund.toFixed(2)}
            trend={-2.3}
            icon={<ArrowUpRight className="h-5 w-5" />}
            color="yellow"
          />
          <SummaryCard
            title="Net Balance"
            value={totals.net.toFixed(2)}
            trend={totals.net > 0 ? 4.5 : -4.5}
            icon={totals.net > 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
            color={totals.net > 0 ? "green" : "red"}
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 bg-gray-800/50 rounded-xl p-4 border border-gray-700 h-[350px]"
          >
            <h3 className="text-lg font-medium mb-4">Transaction History</h3>
            <ResponsiveContainer width="100%" height="90%">
              {graphType === "area" ? (
                <AreaChart data={graphData}>
                  <defs>
                    <linearGradient id="sentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="receivedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="refundGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#6b7280" tick={{ fill: "#9ca3af" }} tickLine={false} />
                  <YAxis stroke="#6b7280" tick={{ fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      borderColor: "#374151",
                      borderRadius: "0.5rem",
                      color: "#f9fafb",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sent"
                    stackId="1"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#sentGradient)"
                    animationDuration={1500}
                    name="Sent"
                  />
                  <Area
                    type="monotone"
                    dataKey="received"
                    stackId="1"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#receivedGradient)"
                    animationDuration={1500}
                    name="Received"
                  />
                  <Area
                    type="monotone"
                    dataKey="refund"
                    stackId="1"
                    stroke="#f59e0b"
                    fillOpacity={1}
                    fill="url(#refundGradient)"
                    animationDuration={1500}
                    name="Refund"
                  />
                </AreaChart>
              ) : graphType === "bar" ? (
                <BarChart data={graphData}>
                  <XAxis dataKey="date" stroke="#6b7280" tick={{ fill: "#9ca3af" }} tickLine={false} />
                  <YAxis stroke="#6b7280" tick={{ fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      borderColor: "#374151",
                      borderRadius: "0.5rem",
                      color: "#f9fafb",
                    }}
                  />
                  <Bar dataKey="sent" fill="#3b82f6" animationDuration={1500} name="Sent" radius={[4, 4, 0, 0]} />
                  <Bar
                    dataKey="received"
                    fill="#10b981"
                    animationDuration={1500}
                    name="Received"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar dataKey="refund" fill="#f59e0b" animationDuration={1500} name="Refund" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart data={graphData}>
                  <XAxis dataKey="date" stroke="#6b7280" tick={{ fill: "#9ca3af" }} tickLine={false} />
                  <YAxis stroke="#6b7280" tick={{ fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      borderColor: "#374151",
                      borderRadius: "0.5rem",
                      color: "#f9fafb",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sent"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                    animationDuration={1500}
                    name="Sent"
                  />
                  <Line
                    type="monotone"
                    dataKey="received"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                    animationDuration={1500}
                    name="Received"
                  />
                  <Line
                    type="monotone"
                    dataKey="refund"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                    animationDuration={1500}
                    name="Refund"
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 h-[350px]"
          >
            <h3 className="text-lg font-medium mb-4">Transaction Distribution</h3>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={pieData.length ? pieData : [{ name: "No Data", value: 1, color: "#6b7280" }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1500}
                  animationBegin={300}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    borderColor: "#374151",
                    borderRadius: "0.5rem",
                    color: "#f9fafb",
                  }}
                  formatter={(value) => [`${value.toFixed(2)} ETH`, null]}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

// Summary card component
function SummaryCard({ title, value, trend, icon, color }) {
  const getColorClasses = (color) => {
    const classes = {
      blue: {
        bg: "bg-blue-500/20",
        text: "text-blue-400",
        border: "border-blue-500/30",
      },
      green: {
        bg: "bg-green-500/20",
        text: "text-green-400",
        border: "border-green-500/30",
      },
      yellow: {
        bg: "bg-yellow-500/20",
        text: "text-yellow-400",
        border: "border-yellow-500/30",
      },
      red: {
        bg: "bg-red-500/20",
        text: "text-red-400",
        border: "border-red-500/30",
      },
    }
    return classes[color] || classes.blue
  }

  const colorClasses = getColorClasses(color)

  return (
    <div className={`rounded-xl p-4 border ${colorClasses.border} ${colorClasses.bg}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-400">{title}</p>
        <div className={colorClasses.text}>{icon}</div>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-xl font-bold">{value} {web3Service.curr_symbol}</p>
        <div className={`text-sm ${trend > 0 ? "text-green-400" : "text-red-400"} flex items-center`}>
          {trend > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
          {Math.abs(trend)}%
        </div>
      </div>
    </div>
  )
}

// Generate sample data if no transactions
function generateSampleData(view) {
  const data = []
  const now = new Date()

  let days = 7
  if (view === "daily") days = 7
  if (view === "weekly") days = 12
  if (view === "monthly") days = 30

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    const dateStr = date.toISOString().split("T")[0]

    // Generate random values with some patterns
    const sent = Math.random() * 2 + 0.5
    const received = Math.random() * 3 + 1
    const refund = Math.random() * 0.5

    data.push({
      date: dateStr,
      sent,
      received,
      refund,
      total: sent + received + refund,
    })
  }

  return data
}

