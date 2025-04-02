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
import { Users, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from 'lucide-react'
import Web3Service from "../transfer/web3-service"
import { useChainId } from "wagmi"
export default function Transactiongraph({ groupPayments }) {
  const web3Service=new Web3Service(useChainId());
  const curr_symbol=web3Service.curr_symbol

  const [activeView, setActiveView] = useState("weekly")
  const [graphType, setGraphType] = useState("area")

  // Process group payment data for graphs
  const graphData = useMemo(() => {
    if (!groupPayments?.length) {
      // Generate sample data if no group payments
      return generateSampleData(activeView)
    }

    // Group payments by date and status
    const groupedData = {}

    groupPayments.forEach((payment) => {
      const numAmount = Number.parseFloat(payment.amount.split(" ")[0])

      if (!groupedData[payment.date]) {
        groupedData[payment.date] = {
          date: payment.date,
          created: 0,
          completed: 0,
          pending: 0,
          total: 0,
          participants: 0,
        }
      }

      if (payment.status === "created") {
        groupedData[payment.date].created += numAmount
      } else if (payment.status === "completed") {
        groupedData[payment.date].completed += numAmount
      } else if (payment.status === "pending") {
        groupedData[payment.date].pending += numAmount
      }

      groupedData[payment.date].total += numAmount
      groupedData[payment.date].participants += payment.participants || 0
    })

    // Convert to array and sort by date
    return Object.values(groupedData).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [groupPayments, activeView])

  // Calculate totals for summary
  const totals = useMemo(() => {
    const result = {
      created: 0,
      completed: 0,
      pending: 0,
      total: 0,
      participants: 0,
      avgPerParticipant: 0,
    }

    graphData.forEach((day) => {
      result.created += day.created
      result.completed += day.completed
      result.pending += day.pending
      result.participants += day.participants
    })

    result.total = result.created + result.completed + result.pending
    result.avgPerParticipant = result.participants > 0 ? result.total / result.participants : 0

    return result
  }, [graphData])

  // Pie chart data
  const pieData = useMemo(() => {
    return [
      { name: "Created", value: totals.created, color: "#3b82f6" },
      { name: "Completed", value: totals.completed, color: "#10b981" },
      { name: "Pending", value: totals.pending, color: "#f59e0b" },
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
          <h2 className="text-xl font-semibold">Group Payments Analytics</h2>
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
            title="Total Created"
            value={totals.created.toFixed(2)}
            trend={7.8}
            icon={<ArrowUpRight className="h-5 w-5" />}
            color="blue"
            curr_symbol={curr_symbol}
          />
          <SummaryCard
            title="Total Completed"
            value={totals.completed.toFixed(2)}
            trend={12.3}
            icon={<TrendingUp className="h-5 w-5" />}
            color="green"
            
            curr_symbol={curr_symbol}
            
          />
          <SummaryCard
            title="Total Pending"
            value={totals.pending.toFixed(2)}
            trend={-3.5}
            icon={<ArrowDownRight className="h-5 w-5" />}
            color="yellow"
            curr_symbol={curr_symbol}
          />
          <SummaryCard
            title="Avg Per Participant"
            value={totals.avgPerParticipant.toFixed(2)}
            trend={2.1}
            icon={<Users className="h-5 w-5" />}
            color="purple"
            curr_symbol={curr_symbol}
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 bg-gray-800/50 rounded-xl p-4 border border-gray-700 h-[350px]"
          >
            <h3 className="text-lg font-medium mb-4">Group Payment History</h3>
            <ResponsiveContainer width="100%" height="90%">
              {graphType === "area" ? (
                <AreaChart data={graphData}>
                  <defs>
                    <linearGradient id="createdGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
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
                    dataKey="created"
                    stackId="1"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#createdGradient)"
                    animationDuration={1500}
                    name="Created"
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stackId="1"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#completedGradient)"
                    animationDuration={1500}
                    name="Completed"
                  />
                  <Area
                    type="monotone"
                    dataKey="pending"
                    stackId="1"
                    stroke="#f59e0b"
                    fillOpacity={1}
                    fill="url(#pendingGradient)"
                    animationDuration={1500}
                    name="Pending"
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
                  <Bar dataKey="created" fill="#3b82f6" animationDuration={1500} name="Created" radius={[4, 4, 0, 0]} />
                  <Bar
                    dataKey="completed"
                    fill="#10b981"
                    animationDuration={1500}
                    name="Completed"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar dataKey="pending" fill="#f59e0b" animationDuration={1500} name="Pending" radius={[4, 4, 0, 0]} />
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
                    dataKey="created"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                    animationDuration={1500}
                    name="Created"
                  />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                    animationDuration={1500}
                    name="Completed"
                  />
                  <Line
                    type="monotone"
                    dataKey="pending"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                    animationDuration={1500}
                    name="Pending"
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 h-[350px]"
          >
            <h3 className="text-lg font-medium mb-4">Payment Status Distribution</h3>
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
                  formatter={(value) => [`${value.toFixed(2)} {curr_symbol}`, null]}
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
function SummaryCard({ title, value, trend, icon, color ,curr_symbol}) {
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
      purple: {
        bg: "bg-purple-500/20",
        text: "text-purple-400",
        border: "border-purple-500/30",
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
        <p className="text-xl font-bold">{value} {curr_symbol}</p>
        <div className={`text-sm ${trend > 0 ? "text-green-400" : "text-red-400"} flex items-center`}>
          {trend > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
          {Math.abs(trend)}%
        </div>
      </div>
    </div>
  )
}

// Generate sample data if no group payments
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
    const created = Math.random() * 2 + 0.5
    const completed = Math.random() * 1.5 + 0.3
    const pending = Math.random() * 1 + 0.2
    const participants = Math.floor(Math.random() * 8) + 2 // Between 2-10 participants

    data.push({
      date: dateStr,
      created,
      completed,
      pending,
      total: created + completed + pending,
      participants,
    })
  }

  return data
}
