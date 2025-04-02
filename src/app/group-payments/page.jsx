"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import GroupPaymentsGraph from "./transactiongraph"
import web3Service from "../transfer/web3-service"
import {
  Users,
  Plus,
  Trash2,
  Send,
  Wallet,
  ChevronDown,
  Globe2,
  Sparkles,
  LayoutGrid,
  ListPlus,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Search,
  MoreHorizontal,
  ArrowUpRight,
  Calendar,
  Tag,
} from "lucide-react"
import Web3Service from "../transfer/web3-service"
import { useChainId } from "wagmi"

export default function GroupPayments() {
  const web3Service=new Web3Service(useChainId());
  // Web3Service
  const curr_symbol=web3Service.curr_symbol
  console.log("My Curr Symbol is::::"+curr_symbol);
  
  const [recipients, setRecipients] = useState([{ id: 1, address: "", amount: "", token: "" }])
  const [selectedToken, setSelectedToken] = useState("")
  const [showTokenDropdown, setShowTokenDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [account, setAccount] = useState("")
  const [balance, setBalance] = useState("0")
  const [transactionHash, setTransactionHash] = useState("")
  const [transactions, setTransactions] = useState([])
  const dropdownRef = useRef(null)


  const [transactionFilter, setTransactionFilter] = useState("all") 
  const [searchQuery, setSearchQuery] = useState("")


  const tokens = [
    {
      id: "eth",
      name: "Ethereum",
      symbol: "ETH",
      icon: "https://cdn-icons-png.flaticon.com/512/6001/6001368.png",
      color: "#627EEA",
    },
    {
      id: "usdt",
      name: "Tether",
      symbol: "USDT",
      icon: "https://cdn-icons-png.flaticon.com/512/6001/6001566.png",
      color: "#26A17B",
    },
    {
      id: "usdc",
      name: "USD Coin",
      symbol: "USDC",
      icon: "https://cdn-icons-png.flaticon.com/512/14446/14446285.png",
      color: "#2775CA",
    },
    {
      id: "bnb",
      name: "Binance Coin",
      symbol: "BNB",
      icon: "https://cdn-icons-png.flaticon.com/256/12533/12533892.png",
      color: "#F3BA2F",
    },
    {
      id: "sol",
      name: "Solana",
      symbol: "SOL",
      icon: "https://cdn-icons-png.flaticon.com/512/6001/6001527.png",
      color: "#14F195",
    },
  ]
  const features = [
    {
      icon: <Users className="h-5 w-5" />,
      title: "Batch Transfers",
      description: "Send to multiple addresses in one transaction",
    },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      title: "Secure Payments",
      description: "Multi-signature approval for large transfers",
    },
    {
      icon: <LayoutGrid className="h-5 w-5" />,
      title: "Payment Grid",
      description: "Organize recipients in an easy-to-manage format",
    },
  ]

  // Initialize web3 and get account info
  useEffect(() => {
    loadTransactionHistory();
  }, []);
  useEffect(() => {
    const initializeWeb3 = async () => {
      try {
        const userAccount = await web3Service.getAccount()
        setAccount(userAccount)

        if (userAccount) {
          const userBalance = await web3Service.getBalance()
          setBalance(userBalance)

          await loadTransactionHistory()
        }
      } catch (error) {
        console.error("Error initializing web3:", error)
        setError("Failed to connect to wallet. Please make sure MetaMask is installed and unlocked.")
      }
    }

    initializeWeb3()
  }, [])
const loadTransactionHistory = async () => {
  try {
    const events = await web3Service.listEvents();

    const formattedTransactions = events
      .filter(event => event.event_type && event.event_type.startsWith("GP"))
      .map(event => ({
        id: event.transaction_id || "N/A",
        title: `Group Payment ${transactions.length + 1}`,
        type: event.event_type?.toLowerCase() || "unknown",
        amount: `${event.amount || 0} ETH`,
        status: "completed",
        to: event.to || event.recipient || "Unknown",  // Extract recipient
        from: event.from || event.sender || "Unknown", // Extract sender
        date: new Date().toISOString().split("T")[0],
        time: new Date().toTimeString().split(" ")[0]?.substring(0, 5) || "00:00",
        hash: event.transaction_hash || "",
      }));

    setTransactions(formattedTransactions);
    
  } catch (error) {
    console.error("Error loading transaction history:", error);
  }
};
useEffect(() => {
  console.log("Updated Transactions:", transactions);
}, [transactions]);


  
  

  const addRecipient = () => {
    setRecipients([...recipients, { id: recipients.length + 1, address: "", amount: "", token: selectedToken }])
  }

  const removeRecipient = (id) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((r) => r.id !== id))
    }
  }

  const updateRecipient = (id, field, value) => {
    setRecipients(recipients.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError("")

    try {
      // Validate inputs
      const invalidRecipients = recipients.filter((r) => !r.address || !r.amount || Number.parseFloat(r.amount) <= 0)
      if (invalidRecipients.length > 0) {
        throw new Error("Please provide valid addresses and amounts for all recipients")
      }

      // Prepare data for contract call
      const addresses = recipients.map((r) => r.address)
      const amounts = recipients.map((r) => r.amount)

      // Execute the group payment
      console.log();
      
      const result = await web3Service.groupPayments(addresses, amounts)

      // Create a new transaction record
      const newTransaction = {
        id: `tx${transactions.length + 1}`,
        title: `Group Payment ${transactions.length + 1}`,
        amount: `${totalAmount.toFixed(4)} ${curr_symbol}`,
        date: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD format
        status: "created",
        participants: recipients.length,
        recipients: recipients.map((r) => ({
          address: r.address,
          amount: `${r.amount} ${{curr_symbol}}`,
        })),
        token: selectedToken,
        hash: result.transactionHash,
      }

      // Add to transactions history
      setTransactions([newTransaction, ...transactions])

      setSuccess(true)
      setTransactionHash(result.transactionHash)

      // Reset form
      setRecipients([{ id: 1, address: "", amount: "", token: "" }])

      // Update balance after transaction
      const userBalance = await web3Service.getBalance()
      setBalance(userBalance)

      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error("Error executing group payment:", err)
      setError(err.message || "Failed to execute group payment")
    } finally {
      setLoading(false)
    }
  }

  const getSelectedToken = () => tokens.find((t) => t.id === selectedToken)

  const getTokenById = (id) => tokens.find((t) => t.id === id) || tokens[0]

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowTokenDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Calculate total amount
  const totalAmount = recipients.reduce((sum, r) => sum + (Number.parseFloat(r.amount) || 0), 0)

  // Filter transactions based on filter and search
  const filteredTransactions = transactions.filter((tx) => {
    // Filter by status
    if (transactionFilter !== "all" && tx.status !== transactionFilter) {
      return false
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        tx.title.toLowerCase().includes(query) ||
        tx.hash.toLowerCase().includes(query) ||
        tx.recipients.some((r) => r.address.toLowerCase().includes(query))
      )
    }

    return true
  })

  return (
    <div className="min-h-screen bg-black text-white pt-14 relative overflow-hidden">
      {/* Background SVGs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-[40vw] w-[1400px] h-[1200px] opacity-70">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/10001-wJDNvR3BxRjKDUMGqePNheyCNprAJr.svg"
            alt="Background pattern"
            width={920}
            height={800}
            className="object-contain"
          />
        </div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] opacity-20"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r opacity-90 from-white via-white to-white/50">
            Make Group Payments Easier
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Send cryptocurrency to multiple recipients in a single transaction. Streamline your payments with our
            advanced batch transfer system.
          </p>
        </motion.div>

        {/* Wallet Connection Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 flex justify-center"
        >
          {account ? (
            <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Connected: {account.substring(0, 6)}...{account.substring(account.length - 4)}
              <span className="ml-2 text-gray-400">|</span>
              <span className="text-gray-300">{balance} ${curr_symbol}</span>
            </div>
          ) : (
            <button
              onClick={async () => {
                try {
                  const userAccount = await web3Service.getAccount()
                  setAccount(userAccount)

                  if (userAccount) {
                    const userBalance = await web3Service.getBalance()
                    setBalance(userBalance)
                  }
                } catch (err) {
                  console.error("Error connecting wallet:", err)
                  setError("Failed to connect wallet")
                }
              }}
              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </button>
          )}
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-gray-900/50 backdrop-blur-md rounded-xl p-6 border border-gray-800"
            >
              <div className="bg-blue-500/20 p-3 rounded-lg w-fit mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Payment Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-gray-800 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <ListPlus className="h-6 w-6 text-blue-400" />
              Recipients List
            </h2>
            <button
              onClick={addRecipient}
              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Recipient
            </button>
          </div>

          {/* Token Selection */}
          <div className="mb-6">
            <label className="text-sm text-gray-400 block mb-2">Select Token for All Recipients</label>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowTokenDropdown(!showTokenDropdown)}
                className="w-full md:w-auto bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white flex items-center justify-between"
              >
                {selectedToken ? (
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full mr-2" style={{ backgroundColor: getSelectedToken()?.color }}>
                      <Image
                        src={getSelectedToken()?.icon || "/placeholder.svg"}
                        alt={getSelectedToken()?.name}
                        width={24}
                        height={24}
                      />
                    </div>
                    {getSelectedToken()?.name} ({getSelectedToken()?.symbol})
                  </div>
                ) : (
                  <span className="text-gray-400">Select token</span>
                )}
                <ChevronDown className="h-4 w-4 ml-2 text-gray-400" />
              </button>

              <AnimatePresence>
                {showTokenDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-20 mt-1 w-full md:w-[300px] bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden"
                  >
                    {tokens.map((token) => (
                      <div
                        key={token.id}
                        onClick={() => {
                          setSelectedToken(token.id)
                          setShowTokenDropdown(false)
                        }}
                        className="flex items-center px-4 py-3 hover:bg-gray-700 cursor-pointer"
                      >
                        <div className="w-6 h-6 rounded-full mr-2" style={{ backgroundColor: token.color }}>
                          <Image src={token.icon || "/placeholder.svg"} alt={token.name} width={24} height={24} />
                        </div>
                        <div>
                          <div className="font-medium">{token.name}</div>
                          <div className="text-sm text-gray-400">{token.symbol}</div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Recipients List */}
          <div className="space-y-4">
            <AnimatePresence>
              {recipients.map((recipient, index) => (
                <motion.div
                  key={recipient.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col md:flex-row gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                >
                  <div className="flex-1">
                    <label className="text-sm text-gray-400 block mb-2">Recipient Address {index + 1}</label>
                    <input
                      type="text"
                      value={recipient.address}
                      onChange={(e) => updateRecipient(recipient.id, "address", e.target.value)}
                      placeholder="Enter wallet address"
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div className="w-full md:w-48">
                    <label className="text-sm text-gray-400 block mb-2">Amount</label>
                    <input
                      type="number"
                      value={recipient.amount}
                      onChange={(e) => updateRecipient(recipient.id, "amount", e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => removeRecipient(recipient.id)}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Transaction Summary */}
          <div className="mt-6 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-medium mb-3">Transaction Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Recipients</span>
                <span>{recipients.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Amount</span>
                <span>{totalAmount.toFixed(4)} {curr_symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Network Fee (est.)</span>
                <span>~0.001 {curr_symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total</span>
                <span className="font-medium">{(totalAmount + 0.001).toFixed(4)} {curr_symbol}</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-5 w-5" />
                Group payment sent successfully!
              </div>
              {transactionHash && (
                <div className="text-sm">
                  Transaction Hash: {transactionHash.substring(0, 10)}...
                  {transactionHash.substring(transactionHash.length - 8)}
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-6">
            <button
              onClick={handleSubmit}
              disabled={
                loading || success || !selectedToken || !account || recipients.some((r) => !r.address || !r.amount)
              }
              className={`
                w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
                text-white px-8 py-3 rounded-lg flex items-center justify-center gap-2 transition-all
                ${loading || success || !selectedToken || !account || recipients.some((r) => !r.address || !r.amount) ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  Success!
                </>
              ) : !account ? (
                <>
                  <Wallet className="h-5 w-5" />
                  Connect Wallet
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Send Group Payment
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Recent Transactions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-gray-800 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Clock className="h-6 w-6 text-purple-400" />
              Recent Group Payments
            </h2>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white w-full md:w-[200px]"
                />
              </div>

              <div className="flex bg-gray-800/50 rounded-lg p-1">
                {["all", "pending", "completed", "created"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTransactionFilter(filter)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      transactionFilter === filter ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filteredTransactions.length > 0 ? (
            <div className="space-y-4">
              <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-sm text-gray-400">
                <div className="col-span-3">Title</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Participants</div>
            
              </div>

              <AnimatePresence>
                {filteredTransactions.map((tx) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden"
                  >
                    <div className="grid grid-cols-12 gap-4 p-4 items-center">
                      <div className="col-span-12 md:col-span-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full" style={{ backgroundColor: getTokenById(tx.token).color }}>
                          <Image
                            src={getTokenById(tx.token).icon || "/placeholder.svg"}
                            alt={getTokenById(tx.token).name}
                            width={32}
                            height={32}
                          />
                        </div>
                        <div>
                          <div className="font-medium">{tx.title}</div>
                       
                        </div>
                      </div>
                      <div className="col-span-6 md:col-span-2 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400 hidden md:block" />
                        <span className="text-sm">{tx.date}</span>
                      </div>
                      <div className="col-span-6 md:col-span-2 font-medium">{tx.amount}</div>
                      <div className="col-span-6 md:col-span-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            tx.status === "completed"
                              ? "bg-green-500/20 text-green-400"
                              : tx.status === "pending"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                        </span>
                      </div>
                      <div className="col-span-6 md:col-span-2 flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                     
                        <span>{tx.type?.startsWith("gp") ? tx.type.charAt(2) : tx.participants}</span>


                      </div>
                 
                    </div>

                
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-800/50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">No transactions found</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                {searchQuery
                  ? "No transactions match your search criteria. Try a different search term."
                  : transactionFilter !== "all"
                    ? `No ${transactionFilter} transactions found. Try a different filter.`
                    : "You haven't made any group payments yet. Create your first group payment above."}
              </p>
            </div>
          )}
        </motion.div>

        {/* Analytics Graph */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <GroupPaymentsGraph groupPayments={transactions} />
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
        >
          <div className="bg-gray-900/50 backdrop-blur-md rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-4">
              <div className="bg-green-500/20 p-3 rounded-lg">
                <Globe2 className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">50+</div>
                <div className="text-gray-400">Supported Networks</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-md rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-4">
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <Wallet className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">1M+</div>
                <div className="text-gray-400">Total Transactions</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-md rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Sparkles className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">$500M+</div>
                <div className="text-gray-400">Total Volume</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

