"use client"

import { useState, useEffect } from "react"
import {
  PiggyBank,
  Plus,
  Target,
  Check,
  X,
  Info,
  AlertCircle,
  Coins,
  ArrowDown,
  History,
  RefreshCw,
  Wallet,
  Shield,
} from "lucide-react"
import Web3Service from "../transfer/web3-service"
import AuroraBackground from "./AruoraBackGround"
import "./app.css"
import { useChainId } from "wagmi"
// Add custom animations to the tailwind.config.ts file instead of inline styles
// These are already defined in our tailwind.config.ts

export default function SavingPots() {
  const [pots, setPots] = useState([])
  const [events, setEvents] = useState([])
  const [activeTab, setActiveTab] = useState("my-pots")
  const [showNewPotForm, setShowNewPotForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [potAmount, setPotAmount] = useState("")
  const [potInfo, setPotInfo] = useState("")
  const [selectedPotId, setSelectedPotId] = useState(null)
  const [showConfirmWithdraw, setShowConfirmWithdraw] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: "", type: "" })
  const [account, setAccount] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [balance, setBalance] = useState("0")
  const web3Service=new Web3Service(useChainId());
  // Fetch data from blockchain
  const fetchData = async () => {
    setIsLoading(true)
    try {
      // Get pots
      const potsData =await web3Service.listPots();
      // Filter out pots with 0 amount (withdrawn pots)
      console.log("Pots Data is:::::",potsData);
      let arr=[];
      for (let i = 0; i < potsData.length; i++) {
        const element = potsData[i];
        if(element.amount!='0'){
          arr.push(element)
        }
      }
      setPots(arr);

      // Get events
      const eventsData = await web3Service.listEvents()
      setEvents(eventsData)
    } catch (error) {
      console.error("Error fetching data:", error)
      showNotification("Failed to load data from blockchain", "error")
    } finally {
      setIsLoading(false)
    }
  }
  const chainId=useChainId();
  // Initialize web3 and fetch account data on page load
  useEffect(() => {
   
    const initializeWeb3 = async () => {
      try {
        // Check if account is already connected
        const userAccount = await web3Service.getAccount()

        if (userAccount) {
          const userBalance = await web3Service.getBalance()

          setAccount(userAccount)
          setBalance(userBalance.toString())
          setIsConnected(true)

          // Load data
          await fetchData()
        } else {
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Error initializing web3:", error)
        setIsLoading(false)
      }
    }

    initializeWeb3()

    // Listen for account changes
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          window.location.reload()
        } else {
          setIsConnected(false)
          setAccount("")
          setPots([])
          setEvents([])
        }
      })
    }

    return () => {
      if (typeof window !== "undefined" && window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged")
      }
    }
  }, [])

  // Create a new pot
  const handleCreatePot = async (e) => {
    e.preventDefault()

    if (!isConnected) {
      showNotification("Please connect your wallet first", "error")
      return
    }

    // Validation
    if (!potAmount || !potInfo) {
      showNotification("Please fill in all fields", "error")
      return
    }

    setIsLoading(true)
    try {
      await web3Service.createPot(potAmount, potInfo)

      showNotification("Transaction submitted. Waiting for confirmation...", "info")

      await fetchData()

      const newBalance = await web3Service.getBalance()
      setBalance(newBalance.toString())

      setShowNewPotForm(false)
      setPotAmount("")
      setPotInfo("")
      showNotification("Savings pot created successfully!", "success")
    } catch (error) {
      console.error("Error creating pot:", error)
      showNotification(error.message || "Failed to create savings pot", "error")
    } finally {
      setIsLoading(false)
    }
  }

  // Withdraw from a pot
  const handleWithdraw = async () => {
    if (!isConnected) {
      showNotification("Please connect your wallet first", "error")
      return
    }

    if (!selectedPotId) return

    setIsLoading(true)
    try {
      // Call contract method
      await web3Service.withdrawPot(selectedPotId)

      showNotification("Transaction submitted. Waiting for confirmation...", "info")

      // Refresh data after a short delay to allow the blockchain to update
      setTimeout(async () => {
        await fetchData()

        // Update balance
        const newBalance = await web3Service.getBalance()
        setBalance(newBalance.toString())

        setShowConfirmWithdraw(false)
        setSelectedPotId(null)
        showNotification("Funds withdrawn successfully!", "success")
        setIsLoading(false)
      }, 2000)
    } catch (error) {
      console.error("Error withdrawing from pot:", error)
      showNotification(error.message || "Failed to withdraw funds", "error")
      setIsLoading(false)
    }
  }

  // Connect wallet
  const connectWallet = async () => {
    try {
      const account = await web3Service.getAccount()
      if (account) {
        setAccount(account)
        setIsConnected(true)
        const balance = await web3Service.getBalance()
        setBalance(balance.toString())
        await fetchData()
        showNotification("Wallet connected successfully!", "success")
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
      showNotification("Failed to connect wallet", "error")
    }
  }

  // Show notification
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type })
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" })
    }, 5000)
  }

  // Calculate total saved
  const totalSaved = pots.reduce((sum, pot) => sum + Number.parseFloat(pot.amount), 0)

  // Filter events related to pots
  const potEvents = events.filter((event) => event.event_type === "SAVE" || event.event_type === "RECEIVE")

  return (
    <>
      <AuroraBackground />
      <div className="min-h-screen pt-24 text-white overflow-x-hidden transition-all duration-300 ease-in-out relative z-10">
        {/* Main content */}
        <main className="container mx-auto px-4 pt-8 pb-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold h-16 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 ">
              Secure Crypto Savings
            </h1>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              Create and manage savings goals with blockchain security. Perfect for vacations, gifts, or emergency
              funds.
            </p>
          </div>

          {!isConnected && !isLoading && (
            <div className="text-center py-20 bg-[#0f1123]/50 border border-[#1a1c3a] rounded-lg mb-12 backdrop-blur-sm">
              <Wallet className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">Connect Your Wallet</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                Connect your Ethereum wallet to view your savings pots and create new ones.
              </p>
              <button
                onClick={connectWallet}
                className="aurora-button flex items-center gap-2 mx-auto"
              >
                <Wallet className="h-5 w-5" />
                Connect Wallet
              </button>
            </div>
          )}

          {isConnected && (
            <>
              {/* Stats Cards */}
              <div className="stat-grid mb-12 flex gap-48">
                <div className="stat-card">
                  <div className="flex items-start">
                    <div className="bg-blue-900/30 p-2 rounded-lg mr-3">
                      <PiggyBank className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Total Saved</p>
                      <p className="text-2xl font-bold aurora-glow-text">{totalSaved.toFixed(4)} </p>
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="flex items-start">
                    <div className="bg-green-900/30 p-2 rounded-lg mr-3">
                      <Target className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Active Pots</p>
                      <p className="text-2xl font-bold aurora-glow-text">{pots.length}</p>
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="flex items-start">
                    <div className="bg-yellow-900/30 p-2 rounded-lg mr-3">
                      <History className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Transactions</p>
                      <p className="text-2xl font-bold aurora-glow-text">{potEvents.length}</p>
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="flex items-start">
                    <div className="bg-purple-900/30 p-2 rounded-lg mr-3">
                      <Shield className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Smart Contract</p>
                      <p className="text-2xl font-bold aurora-glow-text">Active</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4 mb-12 mt-9">
                <button
                  className="aurora-button flex items-center gap-2"
                  onClick={() => setShowNewPotForm(true)}
                >
                  <Plus className="h-5 w-5" />
                  Create New Pot
                </button>
                <button
                  className="border border-blue-600 text-blue-400 hover:bg-blue-900/20 px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                  onClick={() => setActiveTab("history")}
                >
                  <History className="h-5 w-5" />
                  View History
                </button>
              </div>
            </>
          )}

          {/* Notification */}
          {notification.show && (
            <div
              className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 animate-fadeIn ${
                notification.type === "success"
                  ? "bg-green-900/90 border border-green-700"
                  : notification.type === "error"
                    ? "bg-red-900/90 border border-red-700"
                    : "bg-blue-900/90 border border-blue-700"
              }`}
            >
              {notification.type === "success" ? (
                <Check className="h-5 w-5 text-green-400" />
              ) : notification.type === "error" ? (
                <AlertCircle className="h-5 w-5 text-red-400" />
              ) : (
                <Info className="h-5 w-5 text-blue-400" />
              )}
              <p>{notification.message}</p>
              <button
                onClick={() => setNotification({ ...notification, show: false })}
                className="ml-2 text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* New Pot Form */}
          {showNewPotForm && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-40 transition-opacity duration-300 ease-in-out animate-fadeIn">
              <div className="bg-[#0f1123] border border-[#1a1c3a] rounded-lg p-8 max-w-md w-full mx-4 backdrop-blur-sm transition-all duration-300 ease-in-out animate-scaleIn">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <PiggyBank className="h-5 w-5 text-blue-400" />
                    Create New Savings Pot
                  </h2>
                  <button className="text-gray-400 hover:text-white" onClick={() => setShowNewPotForm(false)}>
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleCreatePot}>
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Pot Description</label>
                      <div className="relative">
                        <Info className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <input
                          type="text"
                          placeholder="What are you saving for?"
                          className="w-full bg-[#161830] border border-[#1a1c3a] rounded-lg py-2 px-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                          value={potInfo}
                          onChange={(e) => setPotInfo(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Amount </label>
                      <div className="relative">
                        <Coins className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <input
                          type="number"
                          step="0.0001"
                          placeholder="0.00"
                          className="w-full bg-[#161830] border border-[#1a1c3a] rounded-lg py-2 px-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                          value={potAmount}
                          onChange={(e) => setPotAmount(e.target.value)}
                        />
                        <div className="absolute right-3 top-2.5 text-sm text-gray-400"></div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        className="w-full aurora-button flex items-center justify-center gap-2"
                        disabled={isLoading}
                      >
                        {isLoading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <PiggyBank className="h-5 w-5" />}
                        {isLoading ? "Processing..." : "Create Savings Pot"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Confirm Withdraw Modal */}
          {showConfirmWithdraw && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-40 transition-opacity duration-300 ease-in-out animate-fadeIn">
              <div className="bg-[#0f1123] border border-[#1a1c3a] rounded-lg p-8 max-w-md w-full mx-4 backdrop-blur-sm transition-all duration-300 ease-in-out animate-scaleIn">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                    Confirm Withdrawal
                  </h2>
                  <button className="text-gray-400 hover:text-white" onClick={() => setShowConfirmWithdraw(false)}>
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-6 ">
                  <p className="text-gray-300">
                    Are you sure you want to withdraw funds from this savings pot? This action cannot be undone.
                  </p>

                  <div className="bg-[#161830] border border-[#1a1c3a] rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <PiggyBank className="h-5 w-5 text-blue-400" />
                        <span>{pots.find((pot) => pot.transaction_id === selectedPotId)?.info}</span>
                      </div>
                      <div className="font-bold">
                        {pots.find((pot) => pot.transaction_id === selectedPotId)?.amount} ETH
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => setShowConfirmWithdraw(false)}
                      className="w-1/2 border border-gray-600 text-gray-300 hover:bg-gray-800 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                      disabled={isLoading}
                    >
                      <X className="h-5 w-5" />
                      Cancel
                    </button>
                    <button
                      onClick={handleWithdraw}
                      className="w-1/2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                      disabled={isLoading}
                    >
                      {isLoading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <ArrowDown className="h-5 w-5" />}
                      {isLoading ? "Processing..." : "Withdraw"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isConnected && (
            <>
              {/* Tabs */}
              <div className="mb-8 ">
                <div className="flex space-x-2 bg-[#161830] border border-[#1a1c3a] p-1 rounded-lg ">
                  <button
                    onClick={() => setActiveTab("my-pots")}
                    className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all duration-300 ease-in-out ${
                      activeTab === "my-pots"
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                        : "text-gray-400 hover:text-white hover:bg-[#1a1c3a]"
                    }`}
                  >
                    <PiggyBank className="h-4 w-4" />
                    My Savings Pots
                  </button>
                  <button
                    onClick={() => setActiveTab("history")}
                    className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all duration-300 ease-in-out ${
                      activeTab === "history"
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                        : "text-gray-400 hover:text-white hover:bg-[#1a1c3a]"
                    }`}
                  >
                    <History className="h-4 w-4" />
                    Transaction History
                  </button>
                </div>
              </div>

              {/* Content based on active tab */}
              {activeTab === "my-pots" && (
                <div className="tab-content animate-fadeIn">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                      <RefreshCw className="h-8 w-8 text-blue-400 animate-spin" />
                    </div>
                  ) : pots.length === 0 ? (
                    <div className="text-center py-20 bg-[#0f1123]/50 border border-[#1a1c3a] rounded-lg backdrop-blur-sm">
                      <PiggyBank className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-400 mb-2">No Savings Pots Yet</h3>
                      <p className="text-gray-500 max-w-md mx-auto mb-6">
                        Create your first savings pot to start securely saving your crypto assets.
                      </p>
                      <button
                        className="aurora-button flex items-center gap-2 mx-auto"
                        onClick={() => setShowNewPotForm(true)}
                      >
                        <Plus className="h-5 w-5" />
                        Create New Pot
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {pots.map((pot) => (
                        <div
                          key={pot.transaction_id}
                          className="stat-card !p-0 overflow-hidden  backdrop-blur-3xl rounded-xl"
                        >
                          <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                          <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <h3 className="text-lg font-bold">{pot.info}</h3>
                              <div className="bg-blue-900/30 p-1.5 rounded-lg">
                                <PiggyBank className="h-4 w-4 text-blue-400" />
                              </div>
                            </div>

                            <div className="mb-6">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-400">Amount</span>
                                <span>{pot.amount} ETH</span>
                              </div>
                              <div className="w-full bg-[#161830] h-2 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                                  style={{ width: "100%" }}
                                ></div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                              <div>
                                <p className="text-gray-400">Transaction ID</p>
                                <p className="font-medium">{pot.transaction_id}</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Status</p>
                                <p className="font-medium flex items-center gap-1">
                                  <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                                  Active
                                </p>
                              </div>
                            </div>

                            <button
                              className="w-full aurora-button flex items-center justify-center gap-2"
                              onClick={() => {
                                setSelectedPotId(pot.transaction_id)
                                setShowConfirmWithdraw(true)
                              }}
                            >
                              <ArrowDown className="h-4 w-4" />
                              Withdraw Funds
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "history" && (
                <div className="tab-content animate-fadeIn">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                      <RefreshCw className="h-8 w-8 text-blue-400 animate-spin" />
                    </div>
                  ) : potEvents.length === 0 ? (
                    <div className="text-center py-20 bg-[#0f1123]/50 border border-[#1a1c3a] rounded-lg backdrop-blur-sm">
                      <History className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-400 mb-2">No Transaction History</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        Your pot transaction history will appear here once you start creating and using savings pots.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-[#0f1123]/80 border border-[#1a1c3a] rounded-lg overflow-hidden backdrop-blur-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-[#1a1c3a]">
                              <th className="text-left p-4 text-gray-400 font-medium">Transaction ID</th>
                              <th className="text-left p-4 text-gray-400 font-medium">Type</th>
                              <th className="text-left p-4 text-gray-400 font-medium">Amount</th>
                              <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {potEvents.map((event) => (
                              <tr key={event.transaction_id} className="border-b border-[#1a1c3a] hover:bg-[#161830]">
                                <td className="p-4">{event.transaction_id}</td>
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    {event.event_type === "SAVE" ? (
                                      <>
                                        <PiggyBank className="h-4 w-4 text-blue-400" />
                                        <span>Deposit to Pot</span>
                                      </>
                                    ) : (
                                      <>
                                        <ArrowDown className="h-4 w-4 text-green-400" />
                                        <span>Withdraw from Pot</span>
                                      </>
                                    )}
                                  </div>
                                </td>
                                <td className="p-4">{event.amount} ETH</td>
                                <td className="p-4">
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-900/30 text-green-400 text-xs">
                                    <Check className="h-3 w-3" />
                                    Confirmed
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  )
}
